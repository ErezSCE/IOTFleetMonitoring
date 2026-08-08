"""Async SQLAlchemy database setup for Telemetry Service.

Provides engine, sessionmaker, and declarative base.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings

# Create async engine using DSN from settings. Supports PostgreSQL and SQLite (aiosqlite).
engine = create_async_engine(settings.db_dsn, echo=False, future=True)

# Session factory
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

# Base class for ORM models
Base = declarative_base()
