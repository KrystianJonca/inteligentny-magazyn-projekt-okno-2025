from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# Create the engine for Postgres
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
)

# Create a session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    class_=AsyncSession,
)


@asynccontextmanager
async def get_db_session_context() -> AsyncGenerator[AsyncSession]:
    """
    Provide a transactional scope around a series of operations.
    Use this with 'async with' when you need a database session outside of a FastAPI route.

    Example:
        async with get_db_session_context() as db:
            result = await db.execute(...)
    """
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except:
        await session.rollback()
        raise
    finally:
        await session.close()


async def get_db_session() -> AsyncGenerator[AsyncSession]:
    """
    FastAPI dependency for database sessions.
    Use this with FastAPI's Depends() in route functions.

    Example:
        @router.get("/")
        async def route(db: AsyncSession = Depends(get_db_session)):
            result = await db.execute(...)
    """
    async with get_db_session_context() as session:
        yield session
