from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/codereviewbot"
    REDIS_URL: str = "redis://redis:6379/0"
    GITHUB_WEBHOOK_SECRET: str = ""
    OPENAI_API_KEY: str = ""
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/1"

    class Config:
        env_file = ".env"

settings = Settings()
