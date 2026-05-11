from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Repo, PullRequest, Review

router = APIRouter()

class RepoCreate(BaseModel):
    owner: str
    name: str
    github_token: str

@router.post("")
async def register_repo(data: RepoCreate, db: AsyncSession = Depends(get_db)):
    repo = Repo(owner=data.owner, name=data.name, github_token=data.github_token)
    db.add(repo)
    await db.commit()
    await db.refresh(repo)
    return {"id": repo.id, "repo": f"{repo.owner}/{repo.name}"}

@router.get("")
async def list_repos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Repo))
    repos = result.scalars().all()
    return [{"id": r.id, "repo": f"{r.owner}/{r.name}", "created_at": r.created_at} for r in repos]

@router.get("/{repo_id}/stats")
async def repo_stats(repo_id: int, db: AsyncSession = Depends(get_db)):
    repo = await db.get(Repo, repo_id)
    if not repo:
        raise HTTPException(404, "Repo not found")
    pr_count = await db.scalar(select(func.count()).where(PullRequest.repo_id == repo_id))
    review_count = await db.scalar(
        select(func.count(Review.id)).join(PullRequest).where(PullRequest.repo_id == repo_id)
    )
    return {"repo": f"{repo.owner}/{repo.name}", "pr_count": pr_count, "review_count": review_count}
