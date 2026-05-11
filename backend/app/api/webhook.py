from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_github_signature
from app.core.config import settings
from app.core.database import get_db
from app.workers.tasks import analyze_pull_request
import json

router = APIRouter()

@router.post("/github")
async def github_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await verify_github_signature(request, settings.GITHUB_WEBHOOK_SECRET)
    event = request.headers.get("X-GitHub-Event")
    if event != "pull_request":
        return {"status": "ignored", "event": event}
    payload = json.loads(body)
    action = payload.get("action")
    if action not in ("opened", "synchronize"):
        return {"status": "ignored", "action": action}
    pr = payload["pull_request"]
    repo = payload["repository"]
    analyze_pull_request.delay({
        "repo_owner": repo["owner"]["login"],
        "repo_name": repo["name"],
        "pr_number": pr["number"],
        "commit_sha": pr["head"]["sha"],
        "pr_title": pr["title"],
        "pr_author": pr["user"]["login"],
    })
    return {"status": "queued"}
