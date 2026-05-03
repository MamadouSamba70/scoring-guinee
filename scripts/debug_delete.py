import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import AsyncSessionLocal as SessionLocal
from app.services.client_service import ClientService

async def debug_delete(client_id):
    async with SessionLocal() as db:
        try:
            print(f"Tentative de suppression du client {client_id}...")
            success = await ClientService.delete(db, client_id)
            print(f"Rsultat: {'Succs' if success else 'Client non trouv'}")
        except Exception as e:
            print(f"ERREUR CAPTURE: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        asyncio.run(debug_delete(int(sys.argv[1])))
    else:
        print("Usage: python debug_delete.py <client_id>")
