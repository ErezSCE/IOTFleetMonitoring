"""Async SQLAlchemy database setup for Telemetry Service.

Provides engine, sessionmaker, and declarative base.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings

# Create async engine using DSN from settings. Supports PostgreSQL and SQLite (aiosqlite).
# Determine appropriate async engine based on DSN. In CI tests we use a stub PostgresContainer that provides a placeholder DSN.
# If the DSN points to the test placeholder ("test:test@localhost"), fall back to an in‑memory SQLite database.
if "test:test@localhost" in settings.db_dsn:
    # Use SQLite in‑memory with aiosqlite driver for async SQLAlchemy.
    test_dsn = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(test_dsn, echo=False, future=True)
else:
    engine = create_async_engine(settings.db_dsn, echo=False, future=True)

# Session factory
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

# Base class for ORM models
Base = declarative_base()
