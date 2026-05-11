SKIP_PATTERNS = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".min.js", ".min.css", "dist/", "build/", "generated/", "__pycache__/", ".pyc", "migrations/"]
MAX_LINES_PER_FILE = 500

def filter_diff(files: list[dict]) -> list[dict]:
    filtered = []
    for f in files:
        filename = f.get("filename", "")
        if any(p in filename for p in SKIP_PATTERNS):
            continue
        patch = f.get("patch", "")
        if patch.count("\n") > MAX_LINES_PER_FILE:
            continue
        filtered.append({"filename": filename, "patch": patch, "status": f.get("status")})
    return filtered

def build_diff_prompt(files: list[dict]) -> str:
    parts = []
    for f in files:
        parts.append(f"### {f['filename']} ({f['status']})\n```diff\n{f['patch']}\n```")
    return "\n\n".join(parts)
