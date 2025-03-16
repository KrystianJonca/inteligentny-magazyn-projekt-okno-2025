from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserCreate
from app.models.user_db import User


class UserRepository:
    """Repository for user operations."""

    async def create(self, db: AsyncSession, user_data: UserCreate, hashed_password: str) -> User:
        """Create a new user."""
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        """Get a user by email."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_username(self, db: AsyncSession, username: str) -> User | None:
        """Get a user by username."""
        result = await db.execute(select(User).where(User.username == username))
        return result.scalars().first()

    async def get_by_id(self, db: AsyncSession, user_id: int) -> User | None:
        """Get a user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()
