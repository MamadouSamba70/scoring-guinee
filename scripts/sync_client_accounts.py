import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import AsyncSessionLocal
from app.models.models import Client, User, UserRole
from app.core.security import hash_password
from sqlalchemy import select

async def sync_clients():
    async with AsyncSessionLocal() as db:
        # 1. Récupérer tous les clients
        result = await db.execute(select(Client))
        clients = result.scalars().all()
        
        for client in clients:
            # Vérifier si un compte existe déjà
            existing = await db.execute(select(User).where(User.telephone == client.telephone))
            if not existing.scalar_one_or_none():
                print(f"Création du compte pour {client.nom_complet}...")
                user = User(
                    telephone=client.telephone,
                    hashed_password=hash_password("Client2024!"),
                    full_name=client.nom_complet,
                    role=UserRole.client,
                    institution="Client Portail",
                    client_id=client.id
                )
                db.add(user)
        
        await db.commit()
        print("Synchronisation terminée.")

if __name__ == "__main__":
    asyncio.run(sync_clients())
