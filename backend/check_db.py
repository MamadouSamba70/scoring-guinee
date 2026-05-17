import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.getcwd()))

from app.db.session import AsyncSessionLocal
from app.models.models import Client, User
from sqlalchemy import select, func

async def check():
    async with AsyncSessionLocal() as db:
        client_count = await db.execute(select(func.count(Client.id)))
        user_count = await db.execute(select(func.count(User.id)))
        print(f"TOTAL_CLIENTS: {client_count.scalar_one()}")
        print(f"TOTAL_USERS: {user_count.scalar_one()}")
        
        clients = await db.execute(select(Client))
        for c in clients.scalars():
            print(f"Client: {c.nom_complet} (ID: {c.id}, Agent: {c.agent_id}, Status: {c.status}, Zone: {c.zone_geographique}, Activite: {c.type_activite})")

if __name__ == "__main__":
    asyncio.run(check())
