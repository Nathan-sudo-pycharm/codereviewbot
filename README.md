# 🤖 CodeReviewBot

GitHub webhook-driven async code review bot: HMAC-verified webhook receiver, diff-filtered LLM analysis with structured JSON output and schema validation, idempotency via Redis, and automated PR comment posting via GitHub API.

## Stack
- **FastAPI** — webhook receiver + query API
- **Celery + Redis** — async job queue
- **PostgreSQL + SQLAlchemy** — review history storage
- **OpenAI gpt-4o-mini** — structured JSON code review
- **GitHub API** — diff fetching + PR comment posting
- **Next.js** — minimal dashboard

## Quick Start

```bash
# 1. Copy env
cp backend/.env.example backend/.env
# Edit backend/.env with your GITHUB_WEBHOOK_SECRET and OPENAI_API_KEY

# 2. Start everything
docker compose up --build

# 3. Run DB migrations
docker compose exec api alembic upgrade head

# 4. Register your repo
curl -X POST http://localhost:8000/repos \
  -H "Content-Type: application/json" \
  -d '{"owner": "yourname", "name": "your-repo", "github_token": "ghp_..."}'

# 5. Set up GitHub webhook
# URL: https://your-ngrok-url/webhook/github
# Secret: same as GITHUB_WEBHOOK_SECRET in .env
# Events: Pull requests
```

## Architecture

```
GitHub PR → POST /webhook/github (HMAC verified)
         → Celery task enqueued → 200 returned immediately
         → Worker: fetch diff → filter → LLM → store → post comment
```

## Day Plan
| Day | Goal |
|-----|------|
| 1 | GitHub Webhooks docs, HMAC verification ramp-up |
| 2 | Webhook receiver: HMAC + parse + enqueue ✅ |
| 3 | PostgreSQL schema + repo registration API ✅ |
| 4 | Celery worker: fetch diff via GitHub API ✅ |
| 5 | Diff filtering + structured LLM prompt ✅ |
| 6 | Parse LLM response + validate + store ✅ |
| 7 | Post PR comment via GitHub API ✅ |
| 8 | Idempotency keys + token tracking ✅ |
| 9 | Query API + Next.js dashboard |
| 10 | Docker Compose + CI + README + demo |
