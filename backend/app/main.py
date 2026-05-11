from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import webhook, repos, reviews
from app.core.config import settings

app = FastAPI(title="CodeReviewBot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
app.include_router(repos.router, prefix="/repos", tags=["repos"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])

@app.get("/health")
def health():
    return {"status": "ok"}
