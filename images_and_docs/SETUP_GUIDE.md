# 🛠️ CodeReviewBot — Setup Guide

> Step by step instructions to run CodeReviewBot on your own machine (Windows).

---

## What you'll need

Before starting, make sure you have:
- [ ] A GitHub account
- [ ] A GitHub repository you want to connect the bot to
- [ ] A free NVIDIA account (for the AI API key)
- [ ] About 20-30 minutes

---

## Step 1 — Install Docker Desktop

Docker runs all the services (database, backend, bot) together without you needing to install anything else.

1. Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Download **Docker Desktop for Windows**
3. Run the installer and follow the steps
4. Restart your computer when prompted
5. Open Docker Desktop and wait until you see **"Engine running"** in the bottom left

---

## Step 2 — Install Git

1. Go to [git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and install Git for Windows
3. Open a terminal (PowerShell) and verify:
```bash
git --version
```

---

## Step 3 — Clone the project

Open PowerShell and run:

```bash
git clone https://github.com/Nathan-sudo-pycharm/codereviewbot.git
cd codereviewbot
```

---

## Step 4 — Get your NVIDIA API key (free)

The bot uses Mistral AI via NVIDIA NIM — it's free to use.

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up for a free account
3. Click on any model → click **"Get API Key"**
4. Copy the key — it starts with `nvapi-`

---

## Step 5 — Get your GitHub Personal Access Token

This lets the bot read your PR diffs and post comments.

1. Go to **GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name like `codereviewbot`
4. Set expiration to `90 days`
5. Tick ✅ `repo` (full repo access)
6. Click **Generate token**
7. Copy it immediately — GitHub only shows it once! It starts with `ghp_`

---

## Step 6 — Create your `.env` file

Inside the `codereviewbot/backend/` folder, create a file called `.env` and paste this:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/codereviewbot
REDIS_URL=redis://redis:6379/0
GITHUB_WEBHOOK_SECRET=pick_any_secret_string_here
OPENAI_API_KEY=nvapi-your_nvidia_key_here
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
```

Replace:
- `pick_any_secret_string_here` → any random string you choose (e.g. `mysecret123`)
- `nvapi-your_nvidia_key_here` → your NVIDIA API key from Step 4

---

## Step 7 — Start the project

In PowerShell, from the `codereviewbot` folder:

```bash
docker compose up --build
```

This will download and start all services. First time takes 3-5 minutes.

You should see logs from `api-1`, `worker-1`, `db-1`, `redis-1`, `frontend-1`.

---

## Step 8 — Create the database tables

Open a **new** PowerShell window and run:

```bash
cd codereviewbot
docker compose exec api python -c "
import asyncio
from app.core.database import Base, engine
from app.models import models

async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Tables created!')

asyncio.run(create())
"
```

You should see `Tables created!`

---

## Step 9 — Install and set up ngrok

ngrok gives your local bot a public URL so GitHub can send webhooks to it.

1. Go to [ngrok.com](https://ngrok.com) and sign up for a free account
2. Download ngrok from the Microsoft Store or [ngrok.com/download](https://ngrok.com/download)
3. Get your auth token from [dashboard.ngrok.com](https://dashboard.ngrok.com)
4. Run in PowerShell:
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```
5. Start ngrok:
```bash
ngrok http 8080
```
6. Copy the `Forwarding` URL — it looks like `https://abc123.ngrok-free.dev`

---

## Step 10 — Register your repo with the bot

In PowerShell, run this (replace the values with yours):

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8080/repos" -ContentType "application/json" -Body '{"owner": "YOUR_GITHUB_USERNAME", "name": "YOUR_REPO_NAME", "github_token": "ghp_your_token_here"}'
```

You should get back:
```json
{"id": 1, "repo": "your-username/your-repo"}
```

---

## Step 11 — Set up the GitHub webhook

1. Go to your GitHub repo → **Settings → Webhooks → Add webhook**
2. Fill in:
   - **Payload URL:** `https://your-ngrok-url.ngrok-free.dev/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** the same string you used in `GITHUB_WEBHOOK_SECRET` in your `.env`
   - **Events:** Select **"Let me select individual events"** → tick **Pull requests** only
3. Click **Add webhook**

---

## Step 12 — Test it!

1. Create a new branch in your repo:
```bash
git checkout -b test/bot-trigger
echo "def hello(): print('world')" > test.py
git add .
git commit -m "test: trigger bot"
git push origin test/bot-trigger
```

2. Go to GitHub and open a Pull Request from `test/bot-trigger` into `main`

3. Wait 10-30 seconds — the bot should post a review comment on your PR automatically!

---

## Step 13 — View the dashboard

Open your browser and go to:
```
http://localhost:3000
```

You'll see all your registered repos, reviews, and findings.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker compose up` fails | Make sure Docker Desktop is running |
| Webhook shows 401 | Check `GITHUB_WEBHOOK_SECRET` matches in `.env` and GitHub |
| Webhook shows 502 | ngrok URL changed — update the GitHub webhook URL |
| Bot doesn't comment | Check `docker compose logs worker` for errors |
| Tables don't exist error | Re-run Step 8 |
| Port already in use | Run `docker compose down` then `docker compose up` |

---

## Stopping the bot

```bash
docker compose down
```

This cleanly stops all containers. Your data is saved in the database volume.

---

## Starting again next time

```bash
cd codereviewbot
docker compose up
ngrok http 8080
```

Note: ngrok gives a new URL each time on the free plan — remember to update your GitHub webhook URL!
