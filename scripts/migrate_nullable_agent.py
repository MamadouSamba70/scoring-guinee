import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import engine
from sqlalchemy import text

async def migrate():
    async with engine.begin() as conn:
        print("Mise  jour de la structure de la base de données...")
        try:
            # Rendre agent_id nullable dans clients
            await conn.execute(text("ALTER TABLE clients ALTER COLUMN agent_id DROP NOT NULL"))
            # Rendre agent_id nullable dans score_histories
            await conn.execute(text("ALTER TABLE score_histories ALTER COLUMN agent_id DROP NOT NULL"))
            print("Migration réussie !")
        except Exception as e:
            print(f"Erreur lors de la migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
