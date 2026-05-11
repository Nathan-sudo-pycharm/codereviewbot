import json
import openai
from app.core.config import settings

SYSTEM_PROMPT = """You are an expert code reviewer. Analyze the provided diff and return ONLY a valid JSON array.
Each item must have: {"file": string, "line": number|null, "severity": "critical"|"major"|"minor"|"suggestion", "issue": string, "suggestion": string}
Return [] if no issues found. No markdown, no explanation — raw JSON only."""

async def analyze_diff(diff_text: str) -> tuple[list[dict], int]:
    client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Review this diff:\n\n{diff_text}"},
        ],
        max_tokens=2000,
    )
    raw = response.choices[0].message.content
    tokens = response.usage.total_tokens
    try:
        parsed = json.loads(raw)
        findings = parsed if isinstance(parsed, list) else parsed.get("findings", parsed.get("issues", []))
    except json.JSONDecodeError:
        findings = []
    return findings, tokens
