"""Database and Redis connection configurations for the FastAPI application."""

# -*- coding: utf-8 -*-
import logging
from typing import AsyncGenerator

import redis.asyncio as aioredis
from config.settings import settings
from sqlalchemy.ext.asyncio import (  # Import async components
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# --- PostgreSQL Database Setup ---

# --- Database Setup ---

if settings.LITTLE_DATABASE:
    DATABASE_URL = f"sqlite+aiosqlite:///./{settings.SQLITE_DB_NAME}"
    # SQLite requires schema_translate_map to handle schema-qualified tables (e.g., auth.user -> user)
    engine_args = {
        "connect_args": {"check_same_thread": False},
        "execution_options": {"schema_translate_map": {"auth": None}},
    }
else:
    DATABASE_URL = (
        f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@"  # Use asyncpg driver
        f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    )
    engine_args = {
        "pool_size": 20,
        "max_overflow": 10,
        "pool_recycle": 3600,
    }


def log_db_configuration():
    """Logs the current database configuration."""
    if settings.LITTLE_DATABASE:
        logging.info(f"Using SQLite database (LITTLE_DATABASE=True) at {settings.SQLITE_DB_NAME}")
    else:
        logging.info(f"Using PostgreSQL database at {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")


# The engine is the core interface to the database.
async_engine = create_async_engine(  # Changed to create_async_engine
    DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL statements if in debug mode
    **engine_args,
)

# An async_sessionmaker factory to create new AsyncSession objects
AsyncSessionFactory = async_sessionmaker(  # Changed to async_sessionmaker
    async_engine, expire_on_commit=False  # Added expire_on_commit=False
)


# Dependency to get an AsyncSession
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Provides an asynchronous SQLAlchemy session.

    Yields:
        AsyncSession: An asynchronous SQLAlchemy session.
    """
    async with AsyncSessionFactory() as session:
        yield session


# For backward compatibility or specific synchronous needs, if any remain.
# However, the goal is to move everything to async.
# SQLALCH_AUTH will now be the async session dependency.
SQLALCH_AUTH = get_async_db


# --- Redis Cache Setup ---

# Asynchronous Redis connection pool.
async_redis_pool = aioredis.ConnectionPool.from_url(
    f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0", decode_responses=True
)

# Asynchronous Redis client for token storage.
async_token_store = aioredis.Redis(connection_pool=async_redis_pool)


async def get_async_redis_connection() -> aioredis.Redis:
    """Provides an asynchronous Redis connection from the connection pool.

    Returns:
        aioredis.Redis: An asynchronous Redis client instance.
    """
    return aioredis.Redis(connection_pool=async_redis_pool)
