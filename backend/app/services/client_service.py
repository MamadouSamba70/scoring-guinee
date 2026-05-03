from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional, List, Tuple
from app.models.models import Client, ScoreHistory
from app.schemas.schemas import ClientCreate, ClientUpdate


class ClientService:

    @staticmethod
    async def create(db: AsyncSession, data: ClientCreate, agent_id: int) -> Client:
        client = Client(**data.model_dump(), agent_id=agent_id)
        db.add(client)
        await db.flush()
        
        # Créer automatiquement le compte utilisateur pour le client (Optionnel et Sécurisé)
        from app.services.user_service import UserService
        from app.schemas.schemas import UserCreate, UserRoleSchema
        
        try:
            # Vérifier si un utilisateur avec ce téléphone existe déjà
            existing_user = await UserService.get_by_phone(db, client.telephone)
            if not existing_user:
                await UserService.create(db, UserCreate(
                    telephone=client.telephone,
                    password="Client2024!", # Mot de passe par défaut
                    full_name=client.nom_complet,
                    role=UserRoleSchema.client,
                    institution="Portail Client"
                ), client_id=client.id)
                print(f"Compte utilisateur créé pour le client {client.telephone}")
            else:
                # Si l'utilisateur existe, on le lie juste au client s'il ne l'est pas
                if not existing_user.client_id:
                    existing_user.client_id = client.id
                    await db.flush()
        except Exception as e:
            # On ne bloque pas la création du client si l'utilisateur échoue
            print(f"Note: Échec de création du compte utilisateur client (non bloquant): {e}")
        
        await db.refresh(client)
        return client

    @staticmethod
    async def get_by_id(db: AsyncSession, client_id: int) -> Optional[Client]:
        result = await db.execute(select(Client).where(Client.id == client_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_telephone(db: AsyncSession, telephone: str) -> Optional[Client]:
        result = await db.execute(select(Client).where(Client.telephone == telephone))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_paginated(
        db: AsyncSession,
        page: int = 1,
        per_page: int = 20,
        zone: Optional[str] = None,
        activite: Optional[str] = None,
        agent_id: Optional[int] = None,
    ) -> Tuple[List[dict], int]:
        from app.models.models import User
        query = select(Client, User.full_name.label("agent_name")).join(User, Client.agent_id == User.id)
        
        filters = []
        if zone:
            filters.append(Client.zone_geographique == zone)
        if activite:
            filters.append(Client.type_activite == activite)
        if agent_id:
            filters.append(Client.agent_id == agent_id)
        if filters:
            query = query.where(and_(*filters))

        # Total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Pagination
        query = query.order_by(Client.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await db.execute(query)
        rows = result.all()
        
        clients = []
        for client, agent_name in rows:
            client.agent_name = agent_name
            clients.append(client)

        return clients, total

    @staticmethod
    async def update(db: AsyncSession, client: Client, data: ClientUpdate) -> Client:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(client, field, value)
        await db.flush()
        await db.refresh(client)
        return client

    @staticmethod
    async def delete(db: AsyncSession, client_id: int) -> bool:
        from app.models.models import Client, User, ScoreHistory
        from sqlalchemy import delete, select

        # S'assurer que client_id est bien un entier (au cas où)
        try:
            if hasattr(client_id, 'id'):
                client_id = client_id.id
            client_id = int(client_id)
        except (ValueError, TypeError):
            return False

        # 1. Vérifier si le client existe
        res = await db.execute(select(Client).where(Client.id == client_id))
        client = res.scalar_one_or_none()
        if not client:
            return False

        try:
            # 2. Supprimer l'historique des scores associé
            await db.execute(delete(ScoreHistory).where(ScoreHistory.client_id == client_id))
            
            # 3. Supprimer l'utilisateur lié (compte client)
            await db.execute(delete(User).where(User.client_id == client_id))
            
            # 4. Enfin supprimer le client lui-même par SQL direct
            await db.execute(delete(Client).where(Client.id == client_id))
            
            await db.flush()
            return True
        except Exception as e:
            print(f"Erreur lors de la suppression du client {client_id}: {e}")
            raise e

    @staticmethod
    async def get_score_history(
        db: AsyncSession, client_id: int, limit: int = 10
    ) -> List[ScoreHistory]:
        result = await db.execute(
            select(ScoreHistory)
            .where(ScoreHistory.client_id == client_id)
            .order_by(ScoreHistory.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def get_stats_by_zone(db: AsyncSession) -> dict:
        result = await db.execute(
            select(Client.zone_geographique, func.count(Client.id))
            .group_by(Client.zone_geographique)
        )
        return {row[0]: row[1] for row in result.all()}

    @staticmethod
    async def get_stats_by_activite(db: AsyncSession) -> dict:
        result = await db.execute(
            select(Client.type_activite, func.count(Client.id))
            .group_by(Client.type_activite)
        )
        return {row[0]: row[1] for row in result.all()}
