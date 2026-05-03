import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import engine
from sqlalchemy import text

async def update_enum():
    async with engine.begin() as conn:
        print("Mise à jour de l'enum userrole...")
        try:
            # PostgreSQL nécessite parfois de s'assurer qu'on n'est pas dans une transaction
            # Mais engine.begin() crée une transaction.
            # Pour ALTER TYPE ADD VALUE, PostgreSQL 12+ permet de le faire dans une transaction 
            # SAUF si l'enum est utilisé dans la même transaction.
            await conn.execute(text("ALTER TYPE userrole ADD VALUE 'client';"))
            print("Valeur 'client' ajoutée.")
        except Exception as e:
            print(f"Note: {e}")

if __name__ == "__main__":
    asyncio.run(update_enum())
