import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import engine
from sqlalchemy import text

async def update_schema():
    # 1. Créer le type enum
    async with engine.begin() as conn:
        try:
            await conn.execute(text("CREATE TYPE clientstatus AS ENUM ('en_attente', 'valide', 'refuse');"))
            print("Type 'clientstatus' créé.")
        except Exception as e: print(f"Note (Type): {e}")
    
    # 2. Ajouter la colonne
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE clients ADD COLUMN status clientstatus DEFAULT 'en_attente' NOT NULL;"))
            print("Colonne 'status' ajoutée.")
        except Exception as e: print(f"Note (Col): {e}")

if __name__ == "__main__":
    asyncio.run(update_schema())
