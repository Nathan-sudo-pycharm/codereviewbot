import json
import openai
from app.core.config import settings

# This is the instruction we send to the model before the diff.
# We force it to return ONLY a JSON array — no explanations, no markdown.
# This is called "structured output" — critical for reliability in production AI systems.
SYSTEM_PROMPT = """You are an expert code reviewer. Analyze the provided diff and return ONLY a valid JSON array.
Each item must have: {"file": string, "line": number|null, "severity": "critical"|"major"|"minor"|"suggestion", "issue": string, "suggestion": string}
Return [] if no issues found. No markdown, no explanation — raw JSON only."""


async def analyze_diff(diff_text: str) -> tuple[list[dict], int]:
    """
    Sends the filtered diff to NVIDIA NIM (Mistral) and returns:
    - findings: list of structured code review issues
    - tokens_used: total tokens consumed (stored in DB for cost tracking)

    We use the openai SDK here because NVIDIA NIM is OpenAI-API-compatible —
    just swap the base_url. No need for a separate SDK.
    """

    # Point the OpenAI SDK to NVIDIA's API instead of OpenAI.
    # api_key comes from .env as OPENAI_API_KEY — we reuse the same config key.
    client = openai.AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url="https://integrate.api.nvidia.com/v1",
    )

    response = await client.chat.completions.create(
        # mistral-medium-3.5-128b: free on NVIDIA NIM, 128k context window —
        # perfect for large diffs without hitting token limits.
        model="mistralai/mistral-medium-3.5-128b",

        # Low temperature = more deterministic, consistent JSON output.
        # High temperature would make it creative — bad for structured data.
        temperature=0.2,

        messages=[
            # System message sets the rules: JSON only, specific schema.
            {"role": "system", "content": SYSTEM_PROMPT},
            # User message is the actual diff content to review.
            {"role": "user", "content": f"Review this diff:\n\n{diff_text}"},
        ],

        # Cap at 2000 tokens for the response — enough for detailed reviews
        # without burning through free tier limits.
        max_tokens=2000,
    )

    # Extract the raw text response from the model.
    raw = response.choices[0].message.content

    # Track total tokens used (prompt + completion).
    # We store this in the DB so we can analyze cost over time.
    tokens = response.usage.total_tokens

    # Some models wrap their JSON in markdown code fences like ```json ... ```
    # even when told not to. This strips them defensively.
    raw = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    try:
        parsed = json.loads(raw)

        # The model should return a plain array, but sometimes wraps it in an object.
        # We handle both: {"findings": [...]} or {"issues": [...]} or just [...]
        findings = (
            parsed
            if isinstance(parsed, list)
            else parsed.get("findings", parsed.get("issues", []))
        )
    except json.JSONDecodeError:
        # If parsing fails entirely, return empty — don't crash the worker.
        # The review will be stored as empty findings rather than losing the job.
        findings = []

    return findings, tokens