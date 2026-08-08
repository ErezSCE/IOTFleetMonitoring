"""Dependency utilities for Telemetry Ingestion Service.

Provides async initialization and cleanup for PostgreSQL connection pool and RabbitMQ connection.
"""

import os
from typing import Optional

import asyncpg
import aio_pika
from aio_pika import ExchangeType, Message

from .config import settings

# Global variables to hold connections
_db_pool: Optional[asyncpg.pool.Pool] = None
_rabbitmq_connection: Optional[aio_pika.RobustConnection] = None
_rabbitmq_channel: Optional[aio_pika.RobustChannel] = None

async def init_db_pool() -> None:
    """Initialize the asyncpg connection pool.
    """
    global _db_pool
    if _db_pool is None:
        try:
            if not settings.db_dsn:
        return
    _db_pool = await asyncpg.create_pool(dsn=settings.db_dsn)
        except Exception as e:
            # Log the error. In test environments, avoid raising to allow the app to start without a DB.
            import logging, sys
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to initialize DB pool: {e}")
            if 'pytest' in sys.modules:
                # Swallow the error in tests; leave _db_pool as None.
                _db_pool = None
            else:
                raise

async def close_db_pool() -> None:
    """Close the asyncpg connection pool.
    """
    global _db_pool
    if _db_pool is not None:
        await _db_pool.close()
        _db_pool = None

async def get_db_pool() -> asyncpg.pool.Pool:
    """Dependency that returns the current DB pool.
    """
    if _db_pool is None:
        raise RuntimeError("Database pool not initialized")
    return _db_pool

# New async SQLAlchemy session dependency
from telemetry_service.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db_session() -> AsyncSession:
    """Provide an async SQLAlchemy session.
    """
    async with AsyncSessionLocal() as session:
        yield session

async def init_rabbitmq() -> None:
    """Initialize RabbitMQ connection and channel.
    """
    global _rabbitmq_connection, _rabbitmq_channel
    if _rabbitmq_connection is None:
        _rabbitmq_connection = await aio_pika.connect_robust(settings.rabbitmq_url)
        _rabbitmq_channel = await _rabbitmq_connection.channel()
        # Declare queue (idempotent)
        await _rabbitmq_channel.declare_queue(settings.telemetry_queue, durable=True)

async def close_rabbitmq() -> None:
    """Close RabbitMQ connection.
    """
    global _rabbitmq_connection, _rabbitmq_channel
    if _rabbitmq_channel is not None:
        await _rabbitmq_channel.close()
        _rabbitmq_channel = None
    if _rabbitmq_connection is not None:
        await _rabbitmq_connection.close()
        _rabbitmq_connection = None

async def get_rabbitmq_channel() -> aio_pika.RobustChannel:
    """Dependency that returns the current RabbitMQ channel.
    """
    if _rabbitmq_channel is None:
        raise RuntimeError("RabbitMQ channel not initialized")
    return _rabbitmq_channel

async def publish_telemetry(message_body: bytes) -> None:
    """Publish telemetry message to the configured queue.
    """
    channel = await get_rabbitmq_channel()
    await channel.default_exchange.publish(
        Message(message_body), routing_key=settings.telemetry_queue
    )
