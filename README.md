# 🤖 CodeReviewBot

An AI-powered code review bot that automatically reviews your Pull Requests on GitHub.

## What it does

Every time you open or update a Pull Request, CodeReviewBot:

1. Picks up the changes you made
2. Sends them to an AI model for review
3. Posts a structured review comment directly on your PR — just like a human reviewer would

The review highlights issues by severity (critical, major, minor) and gives concrete suggestions for each one.

## Tech Stack

- **Python / FastAPI** — backend API
- **Celery + Redis** — async job processing
- **PostgreSQL** — stores review history
- **NVIDIA NIM (Mistral)** — the AI model doing the code review
- **GitHub API** — reads your PRs and posts comments
- **Next.js** — simple dashboard
- **Docker** — runs everything together

## Project Status

🚧 Work in progress — being built in public.

## Author

Built as a portfolio project to demonstrate AI + backend engineering skills.
