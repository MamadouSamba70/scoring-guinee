import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.getcwd()))

from app.db.session import AsyncSessionLocal
from app.models.models import Client, User
from app.schemas.schemas import ClientResponse
from sqlalchemy import select

async def debug():
    async with AsyncSessionLocal() as db:
        query = select(Client, User.full_name.label("agent_name")).outerjoin(User, Client.agent_id == User.id)
        result = await db.execute(query)
        rows = result.all()
        
        for client, agent_name in rows:
            client.agent_name = agent_name
            try:
                ClientResponse.model_validate(client)
                print(f"OK: {client.nom_complet}")
            except Exception as e:
                print(f"FAIL: {client.nom_complet}")
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug())
