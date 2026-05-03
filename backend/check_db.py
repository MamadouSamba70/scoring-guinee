import asyncio
from sqlalchemy import select, func
from app.db.session import AsyncSessionLocal
from app.models.models import ScoreHistory, Client

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(func.count(ScoreHistory.id)))
        count = res.scalar()
        print(f"Nombre d'entrées dans l'historique : {count}")
        
        if count > 0:
            res = await db.execute(select(ScoreHistory).limit(5))
            scores = res.scalars().all()
            for s in scores:
                print(f"ID: {s.id}, Client ID: {s.client_id}, Score: {s.score}")

if __name__ == "__main__":
    asyncio.run(check())
