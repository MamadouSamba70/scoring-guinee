import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import engine, Base
from sqlalchemy import text

async def update_schema():
    async with engine.begin() as conn:
        print("Mise à jour du schéma...")
        # Ajout des colonnes si elles n'existent pas
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN telephone VARCHAR(20) UNIQUE;"))
        except Exception as e: print(f"Note: {e}")
        
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN client_id INTEGER REFERENCES clients(id);"))
        except Exception as e: print(f"Note: {e}")
        
        try:
            await conn.execute(text("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;"))
        except Exception as e: print(f"Note: {e}")
        
        print("Schéma mis à jour.")

if __name__ == "__main__":
    asyncio.run(update_schema())
