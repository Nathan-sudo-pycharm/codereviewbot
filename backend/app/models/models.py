from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Repo(Base):
    __tablename__ = "repos"
    id: Mapped[int] = mapped_column(primary_key=True)
    owner: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(100))
    github_token: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    pull_requests: Mapped[list["PullRequest"]] = relationship(back_populates="repo")

class PullRequest(Base):
    __tablename__ = "pull_requests"
    id: Mapped[int] = mapped_column(primary_key=True)
    repo_id: Mapped[int] = mapped_column(ForeignKey("repos.id"))
    pr_number: Mapped[int] = mapped_column(Integer)
    commit_sha: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(Text)
    author: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    repo: Mapped["Repo"] = relationship(back_populates="pull_requests")
    reviews: Mapped[list["Review"]] = relationship(back_populates="pull_request")

class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    pr_id: Mapped[int] = mapped_column(ForeignKey("pull_requests.id"))
    findings: Mapped[dict] = mapped_column(JSON)
    model: Mapped[str] = mapped_column(String(50))
    tokens_used: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    pull_request: Mapped["PullRequest"] = relationship(back_populates="reviews")
