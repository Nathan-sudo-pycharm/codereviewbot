# 🤖 CodeReviewBot

> An AI-powered GitHub bot that automatically reviews your Pull Requests — catching bugs, security issues, and bad practices before they hit your main branch.

---

## What is this?

CodeReviewBot is a backend system that listens to your GitHub repository. Every time you open or update a Pull Request, it automatically:

1. Picks up the code changes
2. Sends them to an AI model for analysis
3. Posts a structured review comment directly on your PR — just like a human reviewer would

The review highlights issues by severity — **🔴 Critical**, **🟠 Major**, **🟡 Minor** and **💡 Suggestions** — with clear explanations and fixes for each one.

---

## Why was this built?

Code reviews are one of the most important parts of software development — but they're also time-consuming and easy to skip, especially in solo projects or small teams.

This project explores how AI can act as a **first-pass reviewer** — catching obvious issues instantly so human reviewers can focus on higher-level feedback.

It was also built as a learning project to explore:

- Event-driven backend architecture
- Async job processing with a task queue
- Structured LLM output and prompt engineering
- Real-world API integrations (GitHub + AI)

---

## Who is this for?

| Audience                    | How it helps                                                |
| --------------------------- | ----------------------------------------------------------- |
| **Solo developers**         | Get instant feedback on every PR, even without a team       |
| **Small teams**             | Catch issues before human review, save review time          |
| **Students**                | Learn what good code looks like through structured feedback |
| **Open source maintainers** | Auto-review contributor PRs at scale                        |

---

## How does it work?

```
You open a PR → GitHub sends a webhook → Bot fetches the diff
→ AI reviews the code → Bot posts a comment on your PR
```

Simple as that. No manual steps needed after setup.

---

## Tech Stack

| Layer                  | Technology                           |
| ---------------------- | ------------------------------------ |
| **Backend API**        | Python, FastAPI                      |
| **Async Processing**   | Celery, Redis                        |
| **Database**           | PostgreSQL, SQLAlchemy               |
| **AI Model**           | Mistral (via NVIDIA NIM — free tier) |
| **GitHub Integration** | GitHub Webhooks, GitHub REST API     |
| **Security**           | HMAC-SHA256 signature verification   |
| **Dashboard**          | Next.js, Tailwind CSS                |
| **Infrastructure**     | Docker, Docker Compose               |

---

## Demo

**Bot posting a review on a real PR:**

> 🔴 Critical — `bad_code.py` line 5 — Hardcoded password in plaintext
> Use environment variables or a secure secrets manager

> 🔴 Critical — `bad_code.py` line 10 — SQL injection vulnerability
> Use parameterized queries or an ORM

> 🟠 Major — `bad_code.py` line 18 — Inefficient nested loop O(n²)
> Optimize algorithm to reduce complexity

---

## Project Docs

- 📖 [Technical Documentation](images_and_docs/TECHNICAL_DOC.md) — Architecture, modules, engineering decisions
- 🛠️ [Setup Guide](images_and_docs/SETUP_GUIDE.md) — Step by step instructions to run this yourself

---

## Project Status

✅ Currently runs locally. Deployment guide and cloud setup instructions coming soon for those who want to host it.

---

_Built as a portfolio project demonstrating AI + backend engineering skills._
