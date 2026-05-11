SEVERITY_EMOJI = {"critical": "🔴", "major": "🟠", "minor": "🟡", "suggestion": "💡"}

def format_review_comment(findings: list[dict], pr_title: str, tokens_used: int) -> str:
    if not findings:
        return "## 🤖 CodeReviewBot\n\n✅ No issues found. Looks good!"
    lines = [f"## 🤖 CodeReviewBot — Review for: *{pr_title}*\n"]
    by_severity = {}
    for f in findings:
        sev = f.get("severity", "suggestion")
        by_severity.setdefault(sev, []).append(f)
    for sev in ["critical", "major", "minor", "suggestion"]:
        items = by_severity.get(sev, [])
        if not items:
            continue
        lines.append(f"### {SEVERITY_EMOJI[sev]} {sev.capitalize()} ({len(items)})\n")
        for item in items:
            file_ref = f"`{item['file']}`" + (f" line {item['line']}" if item.get("line") else "")
            lines.append(f"**{file_ref}**\n> {item['issue']}\n💬 {item['suggestion']}\n")
    lines.append(f"---\n*Analyzed with `gpt-4o-mini` · {tokens_used} tokens used*")
    return "\n".join(lines)
