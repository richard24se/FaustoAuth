# fastapi/tests/conftest.py
import asyncio
import sys
from pathlib import Path
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from sqlalchemy import Integer
from unittest.mock import AsyncMock, patch
from functools import wraps # Import wraps

# Add the project root to the sys.path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from run import app # Import the FastAPI app instance
from config.databases import get_async_db as get_app_async_db, async_token_store as app_async_token_store
from auth.model.models import Base, User, Role
from config.security import pwd_context
from fausto.sqlalch import to_dict # Import to_dict


# --- Test Database Setup (Session-scoped) ---
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="session")
async def test_engine_fixture():
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="session")
async def TestingSessionLocal_fixture(test_engine_fixture):
    return async_sessionmaker(autocommit=False, autoflush=False, bind=test_engine_fixture)


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine_fixture, TestingSessionLocal_fixture):
    """
    Provides a test database session.
    Each test will get its own independent database session.
    """
    # Temporarily remove schema from table objects for SQLite in-memory testing
    original_schemas = {}
    for table in Base.metadata.tables.values():
        if table.schema:
            original_schemas[table.name] = table.schema
            table.schema = None

    # Temporarily modify id column types and autoincrement for Role and User
    original_role_id_type = Role.__table__.c.id.type
    original_role_id_autoincrement = Role.__table__.c.id.autoincrement
    original_user_id_type = User.__table__.c.id.type
    original_user_id_autoincrement = User.__table__.c.id.autoincrement

    Role.__table__.c.id.type = Integer()
    Role.__table__.c.id.autoincrement = True
    User.__table__.c.id.type = Integer()
    User.__table__.c.id.autoincrement = True

    async with test_engine_fixture.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session = TestingSessionLocal_fixture()
    try:
        yield session
    finally:
        await session.close()
        async with test_engine_fixture.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        
        # Restore original schemas
        for table in Base.metadata.tables.values():
            if table.name in original_schemas:
                table.schema = original_schemas[table.name]
        
        # Restore original id column types and autoincrement for Role and User
        Role.__table__.c.id.type = original_role_id_type
        Role.__table__.c.id.autoincrement = original_role_id_autoincrement
        User.__table__.c.id.type = original_user_id_type
        User.__table__.c.id.autoincrement = original_user_id_autoincrement


@pytest.fixture(name="mock_redis")
def mock_redis_fixture():
    """
    Provides a mock for the async_token_store (Redis client).
    """
    return AsyncMock()


@pytest_asyncio.fixture(name="test_client")
async def test_client_fixture(db_session: AsyncSession, mock_redis: AsyncMock, test_engine_fixture, TestingSessionLocal_fixture):
    """
    Provides a FastAPI AsyncClient.
    """
    # Override the get_async_db dependency to use the test session
    app.dependency_overrides[get_app_async_db] = lambda: db_session
    
    # Aggressively patch async_engine and AsyncSessionFactory
    with patch('config.databases.async_engine', new=test_engine_fixture), \
         patch('config.databases.AsyncSessionFactory', new=TestingSessionLocal_fixture):
        # Patch async_token_store in modules where it's used
        with patch('auth.service.auth.async_token_store', new=mock_redis), \
             patch('fausto.redis.async_token_store', new=mock_redis):
            # Patch async_sqlalch_wrapper to convert ORM objects to dicts
            with patch('fausto.sqlalch.async_sqlalch_wrapper', new=lambda f: wraps(f)(lambda *args, **kwargs: to_dict(f(*args, **kwargs)))):
                            # Patch async_sqlalch_wrapper to convert ORM objects to dicts
                            with patch('fausto.sqlalch.async_sqlalch_wrapper', new=lambda f: wraps(f)(lambda *args, **kwargs: to_dict(f(*args, **kwargs)))):
                                async with AsyncClient(app=app, base_url="http://test") as client:
                                    yield client    app.dependency_overrides.clear() # Clear overrides after the test


@pytest_asyncio.fixture
async def test_role(db_session: AsyncSession):
    """
    Fixture to create a test role.
    """
    role = Role(id=None, name="test_role", display_name="Test Role") # Pass id=None for auto-increment
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    return role.id # Return ID directly


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession, test_role: int): # test_role is now an int
    """
    Fixture to create a test user for authentication tests.
    """
    hashed_password = pwd_context.hash("testpassword")
    user = User(
        id=None, # Pass id=None for auto-increment
        username="testuser",
        password=hashed_password,
        names="Test",
        surnames="User",
        id_role=test_role, # Use test_role_id directly
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user.id # Return ID directly
