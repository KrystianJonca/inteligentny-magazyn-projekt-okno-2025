#!/usr/bin/env python
import asyncio
import logging
from datetime import datetime
from decimal import Decimal

import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db_session_context
from app.models.inventory import Inventory
from app.models.item import Item
from app.models.user_db import User
from app.models.warehouse import Warehouse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_users(session: AsyncSession) -> list[User]:
    """Create sample users."""
    logger.info("Creating users...")

    # Check if users already exist
    result = await session.execute(select(User))
    if result.scalars().first():
        logger.info("Users already exist, skipping creation")
        return []

    # Create sample users
    users = [
        User(
            email="user@example.com",
            username="user",
            hashed_password=bcrypt.hashpw(b"user123", bcrypt.gensalt()).decode(),
            created_at=datetime.now(),
            updated_at=datetime.now(),
        ),
    ]

    for user in users:
        session.add(user)

    await session.commit()
    logger.info(f"Created {len(users)} users")
    return users


async def create_warehouses(session: AsyncSession) -> list[Warehouse]:
    """Create sample warehouses."""
    logger.info("Creating warehouses...")

    # Check if warehouses already exist
    result = await session.execute(select(Warehouse))
    if result.scalars().first():
        logger.info("Warehouses already exist, skipping creation")
        return []

    # Create sample warehouses
    warehouses = [
        Warehouse(
            name="Main Warehouse",
            square_footage=50000.0,
            address="123 Main St, Anytown, USA",
            manager_name="John Smith",
            phone="555-123-4567",
            latitude=Decimal("40.7128"),
            longitude=Decimal("-74.0060"),
        ),
        Warehouse(
            name="East Coast Distribution Center",
            square_footage=75000.0,
            address="456 Commerce Ave, Boston, MA",
            manager_name="Sarah Johnson",
            phone="555-987-6543",
            latitude=Decimal("42.3601"),
            longitude=Decimal("-71.0589"),
        ),
        Warehouse(
            name="West Coast Fulfillment Center",
            square_footage=60000.0,
            address="789 Pacific Blvd, Los Angeles, CA",
            manager_name="Michael Chen",
            phone="555-456-7890",
            latitude=Decimal("34.0522"),
            longitude=Decimal("-118.2437"),
        ),
    ]

    for warehouse in warehouses:
        session.add(warehouse)

    await session.commit()
    logger.info(f"Created {len(warehouses)} warehouses")
    return warehouses


async def create_items(session: AsyncSession) -> list[Item]:
    """Create sample items."""
    logger.info("Creating items...")

    # Check if items already exist
    result = await session.execute(select(Item))
    if result.scalars().first():
        logger.info("Items already exist, skipping creation")
        return []

    # Create sample items
    items = [
        Item(
            name="Laptop",
            description="High-performance laptop with 16GB RAM",
            sku="TECH-001",
        ),
        Item(
            name="Smartphone",
            description="Latest model smartphone with 128GB storage",
            sku="TECH-002",
        ),
        Item(
            name="Desk Chair",
            description="Ergonomic office chair with lumbar support",
            sku="FURN-001",
        ),
        Item(
            name="Standing Desk",
            description="Adjustable height standing desk",
            sku="FURN-002",
        ),
        Item(
            name="Wireless Headphones",
            description="Noise-cancelling wireless headphones",
            sku="TECH-003",
        ),
    ]

    for item in items:
        session.add(item)

    await session.commit()
    logger.info(f"Created {len(items)} items")
    return items


async def create_inventory(
    session: AsyncSession, warehouses: list[Warehouse], items: list[Item]
) -> None:
    """Create sample inventory records."""
    logger.info("Creating inventory records...")

    # Check if inventory records already exist
    result = await session.execute(select(Inventory))
    if result.scalars().first():
        logger.info("Inventory records already exist, skipping creation")
        return

    # Refresh warehouses and items to get their IDs
    for warehouse in warehouses:
        await session.refresh(warehouse)

    for item in items:
        await session.refresh(item)

    # Create inventory records with different distributions across warehouses
    inventory_records = [
        # Main Warehouse inventory
        Inventory(warehouse_id=warehouses[0].warehouse_id, item_id=items[0].item_id, quantity=100),
        Inventory(warehouse_id=warehouses[0].warehouse_id, item_id=items[1].item_id, quantity=150),
        Inventory(warehouse_id=warehouses[0].warehouse_id, item_id=items[2].item_id, quantity=75),
        Inventory(warehouse_id=warehouses[0].warehouse_id, item_id=items[3].item_id, quantity=50),
        Inventory(warehouse_id=warehouses[0].warehouse_id, item_id=items[4].item_id, quantity=200),
        # East Coast Distribution Center inventory
        Inventory(warehouse_id=warehouses[1].warehouse_id, item_id=items[0].item_id, quantity=75),
        Inventory(warehouse_id=warehouses[1].warehouse_id, item_id=items[1].item_id, quantity=100),
        Inventory(warehouse_id=warehouses[1].warehouse_id, item_id=items[2].item_id, quantity=50),
        Inventory(warehouse_id=warehouses[1].warehouse_id, item_id=items[4].item_id, quantity=125),
        # West Coast Fulfillment Center inventory
        Inventory(warehouse_id=warehouses[2].warehouse_id, item_id=items[0].item_id, quantity=50),
        Inventory(warehouse_id=warehouses[2].warehouse_id, item_id=items[1].item_id, quantity=75),
        Inventory(warehouse_id=warehouses[2].warehouse_id, item_id=items[3].item_id, quantity=100),
        Inventory(warehouse_id=warehouses[2].warehouse_id, item_id=items[4].item_id, quantity=150),
    ]

    for inventory in inventory_records:
        session.add(inventory)

    await session.commit()
    logger.info(f"Created {len(inventory_records)} inventory records")


async def seed_database() -> None:
    """Seed the database with sample data."""
    logger.info("Starting database seeding...")

    async with get_db_session_context() as session:
        # Create sample data
        await create_users(session)
        warehouses = await create_warehouses(session)
        items = await create_items(session)

        # Only create inventory if we created warehouses and items
        if warehouses and items:
            await create_inventory(session, warehouses, items)

    logger.info("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
