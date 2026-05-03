import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import engine
from sqlalchemy import text

async def update_schema():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE clients ADD COLUMN telephone_secondaire VARCHAR(20) UNIQUE;"))
            print("Colonne 'telephone_secondaire' ajoutée.")
        except Exception as e: print(f"Note: {e}")

if __name__ == "__main__":
    asyncio.run(update_schema())
