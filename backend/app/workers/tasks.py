import asyncio
import redis as sync_redis
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.models import Repo, PullRequest, Review
from app.services.github import GitHubClient
from app.services.diff_filter import filter_diff, build_diff_prompt
from app.services.llm import analyze_diff
from app.services.formatter import format_review_comment
from sqlalchemy import select

redis_client = sync_redis.from_url(settings.REDIS_URL)

@celery_app.task(bind=True, max_retries=3)
def analyze_pull_request(self, payload: dict):
    asyncio.run(_analyze(payload))

async def _analyze(payload: dict):
    repo_owner, repo_name = payload["repo_owner"], payload["repo_name"]
    pr_number, commit_sha = payload["pr_number"], payload["commit_sha"]

    idempotency_key = f"review:{repo_owner}/{repo_name}:{commit_sha}"
    if redis_client.exists(idempotency_key):
        print(f"[skip] Already reviewed {commit_sha}")
        return
    redis_client.setex(idempotency_key, 86400, "1")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Repo).where(Repo.owner == repo_owner, Repo.name == repo_name))
        repo = result.scalar_one_or_none()
        if not repo:
            print(f"[error] Repo {repo_owner}/{repo_name} not registered")
            return

        pr_result = await db.execute(select(PullRequest).where(PullRequest.repo_id == repo.id, PullRequest.pr_number == pr_number))
        pr = pr_result.scalar_one_or_none()
        if not pr:
            pr = PullRequest(repo_id=repo.id, pr_number=pr_number, commit_sha=commit_sha, title=payload["pr_title"], author=payload["pr_author"])
            db.add(pr)
            await db.flush()

        gh = GitHubClient(repo.github_token)
        raw_files = await gh.get_pr_files(repo_owner, repo_name, pr_number)
        filtered = filter_diff(raw_files)
        if not filtered:
            return

        diff_text = build_diff_prompt(filtered)
        findings, tokens_used = await analyze_diff(diff_text)

        db.add(Review(pr_id=pr.id, findings=findings, model="gpt-4o-mini", tokens_used=tokens_used))
        await db.commit()

        comment = format_review_comment(findings, payload["pr_title"], tokens_used)
        await gh.post_pr_comment(repo_owner, repo_name, pr_number, comment)
        print(f"[done] PR #{pr_number} — {len(findings)} findings, {tokens_used} tokens")
