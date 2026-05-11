import httpx

GITHUB_API = "https://api.github.com"

class GitHubClient:
    def __init__(self, token: str):
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    async def get_pr_files(self, owner: str, repo: str, pr_number: int) -> list[dict]:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/pulls/{pr_number}/files", headers=self.headers)
            r.raise_for_status()
            return r.json()

    async def post_pr_comment(self, owner: str, repo: str, pr_number: int, body: str):
        async with httpx.AsyncClient() as client:
            r = await client.post(f"{GITHUB_API}/repos/{owner}/{repo}/issues/{pr_number}/comments", headers=self.headers, json={"body": body})
            r.raise_for_status()
            return r.json()
