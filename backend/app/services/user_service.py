from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime, timezone

from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password


class UserService:

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_phone(db: AsyncSession, phone: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.telephone == phone))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: UserCreate, client_id: Optional[int] = None) -> User:
        user = User(
            email=data.email,
            telephone=getattr(data, 'telephone', None),
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
            institution=data.institution,
            client_id=client_id
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate(db: AsyncSession, identifier: str, password: str) -> Optional[User]:
        # Tenter par email d'abord
        user = await UserService.get_by_email(db, identifier)
        # Si pas trouvé, tenter par téléphone
        if not user:
            user = await UserService.get_by_phone(db, identifier)
            
        if not user:
            return None
            
        if not verify_password(password, user.hashed_password):
            return None
            
        # Mettre à jour last_login
        user.last_login = datetime.now(timezone.utc)
        await db.flush()
        return user

    @staticmethod
    async def update(db: AsyncSession, user: User, data: UserUpdate) -> User:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def list_all(db: AsyncSession, skip: int = 0, limit: int = 50) -> List[User]:
        result = await db.execute(
            select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def count(db: AsyncSession) -> int:
        result = await db.execute(select(func.count(User.id)))
        return result.scalar_one()
