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