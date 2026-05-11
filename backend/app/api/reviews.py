from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Review, PullRequest

router = APIRouter()

@router.get("/{pr_id}")
async def get_reviews(pr_id: int, db: AsyncSession = Depends(get_db)):
    pr = await db.get(PullRequest, pr_id)
    if not pr:
        raise HTTPException(404, "PR not found")
    result = await db.execute(select(Review).where(Review.pr_id == pr_id).order_by(Review.created_at.desc()))
    reviews = result.scalars().all()
    return [{"id": r.id, "findings": r.findings, "model": r.model, "tokens_used": r.tokens_used, "created_at": r.created_at} for r in reviews]
