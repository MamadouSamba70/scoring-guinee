#!/usr/bin/env python3
"""
Script de seed : crée le premier compte administrateur.
Usage : python scripts/seed_admin.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import AsyncSessionLocal, engine, Base
from app.services.user_service import UserService
from app.schemas.schemas import UserCreate


async def seed():
    print("=== Initialisation de la base de données ===")

    # Création des tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Tables créées")

    async with AsyncSessionLocal() as db:
        # Vérification si admin existe déjà
        existing = await UserService.get_by_email(db, "admin@scoring-guinee.gn")
        if existing:
            print("[OK] Compte admin déjà existant")
            return

        # Création admin
        admin = await UserService.create(db, UserCreate(
            email="admin@scoring-guinee.gn",
            password="Admin2024!",
            full_name="Administrateur Système",
            role="admin",
            institution="Système",
        ))
        await db.commit()
        print(f"[OK] Admin créé : {admin.email}")

        # Création d'un agent de test
        agent = await UserService.create(db, UserCreate(
            email="agent@crg-guinee.gn",
            password="Agent2024!",
            full_name="Agent CRG Conakry",
            role="agent",
            institution="Crédit Rural de Guinée",
        ))
        await db.commit()
        print(f"[OK] Agent créé : {agent.email}")

    print("\n=== Comptes créés avec succès ===")
    print("Admin : admin@scoring-guinee.gn / Admin2024!")
    print("Agent : agent@crg-guinee.gn / Agent2024!")
    print("\n⚠️  Changez les mots de passe en production !")


if __name__ == "__main__":
    asyncio.run(seed())
