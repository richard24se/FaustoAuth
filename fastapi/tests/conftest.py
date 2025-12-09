# fastapi/tests/conftest.py
import asyncio
import sys
from pathlib import Path
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from sqlalchemy import Integer
from unittest.mock import AsyncMock, patch
from functools import wraps  # Import wraps

# @pytest.fixture(scope="session")
# def event_loop_policy():
#     """
#     Return an instance of the event loop policy to be used.
#     This resolves 'asyncio.get_event_loop_policy' deprecation warnings
#     by providing the policy directly to pytest-asyncio.
#     """
#     if sys.platform == "win32":
#         return asyncio.WindowsProactorEventLoopPolicy()
#     return asyncio.DefaultEventLoopPolicy()



# Add the project root to the sys.path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from fausto import ControllerError

from run import app  # Import the FastAPI app instance
from config.databases import get_async_db as get_app_async_db, async_token_store as app_async_token_store
from auth.model.models import Base, User, Role, ObjectType, PermissionType, Object, AuditType, Audit, Permission, RolePermission, Tenant
from config.security import pwd_context
from fausto.sqlalch import to_dict  # Import to_dict


# --- Test Database Setup (Session-scoped) ---
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_engine_fixture():
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
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

    # Store original id column types and autoincrement settings for all models
    # SQLite requires Integer with autoincrement=True for auto-generated primary keys
    models_to_modify = [Role, User, ObjectType, PermissionType, Object, AuditType, Audit, Permission, RolePermission, Tenant]
    original_id_settings = {}
    
    for model in models_to_modify:
        original_id_settings[model.__name__] = {
            'type': model.__table__.c.id.type,
            'autoincrement': model.__table__.c.id.autoincrement
        }
        model.__table__.c.id.type = Integer()
        model.__table__.c.id.autoincrement = True

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

        # Restore original id column types and autoincrement for all models
        for model in models_to_modify:
            model.__table__.c.id.type = original_id_settings[model.__name__]['type']
            model.__table__.c.id.autoincrement = original_id_settings[model.__name__]['autoincrement']


@pytest.fixture(name="mock_redis")
def mock_redis_fixture():
    """
    Provides a mock for the async_token_store (Redis client).
    """
    return AsyncMock()


@pytest_asyncio.fixture(name="test_client")
async def test_client_fixture(
    db_session: AsyncSession, mock_redis: AsyncMock, test_engine_fixture, TestingSessionLocal_fixture
):
    """
    Provides a FastAPI AsyncClient.
    """
    # Override the get_async_db dependency to use the test session
    app.dependency_overrides[get_app_async_db] = lambda: db_session

    # Define the wrapper function for async_sqlalch_wrapper
    def async_sqlalch_wrapper_mock(f):
        @wraps(f)
        async def wrapper(*args, **kwargs):
            try:
                result = await f(*args, **kwargs)
                return to_dict(result) if result else result
            except ControllerError as e:
                error_dict = {"error": True, "message": e.message if hasattr(e, "message") else str(e)}
                if hasattr(e, "data") and e.data:
                    error_dict["data"] = e.data
                elif len(e.args) > 1:
                    error_dict["data"] = e.args[1]
                
                if hasattr(e, "status_code"):
                    error_dict["status_code"] = e.status_code
                
                return error_dict

        return wrapper

    # Prevent app shutdown from disposing the engine prematurely
    # This ensures the engine remains active for db_session teardown (rollback/drop)
    # original_dispose = test_engine_fixture.dispose
    # test_engine_fixture.dispose = AsyncMock()

    # Apply all patches at once
    with (
        patch("config.databases.async_engine", new=test_engine_fixture),
        patch("config.databases.AsyncSessionFactory", new=TestingSessionLocal_fixture),
        patch("auth.service.auth.async_token_store", new=mock_redis),
        patch("fausto.redis.async_token_store", new=mock_redis),
        patch("fausto.sqlalch.async_sqlalch_wrapper", new=async_sqlalch_wrapper_mock),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            try:
                yield client
            finally:
                # Restore original dispose so test_engine_fixture can clean up
                # test_engine_fixture.dispose = original_dispose
                # Clear overrides after the test
                app.dependency_overrides.clear()


import uuid

@pytest_asyncio.fixture
async def test_tenant(db_session: AsyncSession):
    """
    Fixture to create a test tenant.
    """
    uid = uuid.uuid4().hex[:8]
    tenant = Tenant(id=None, name=f"Test Tenant {uid}", slug=f"test-tenant-{uid}", is_active=True)
    db_session.add(tenant)
    await db_session.commit()
    await db_session.refresh(tenant)
    return tenant.id


@pytest_asyncio.fixture
async def test_role(db_session: AsyncSession, test_tenant: int):
    """
    Fixture to create a test role.
    """
    role = Role(id=None, name="test_role", display_name="Test Role", tenant_id=test_tenant)  # Pass id=None for auto-increment
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    return role.id  # Return ID directly


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession, test_role: int, test_tenant: int):  # test_role is now an int
    """
    Fixture to create a test user for authentication tests.
    """
    hashed_password = pwd_context.hash("testpassword")
    user = User(
        id=None,  # Pass id=None for auto-increment
        username="testuser",
        password=hashed_password,
        names="Test",
        surnames="User",
        id_role=test_role,  # Use test_role_id directly
        tenant_id=test_tenant,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user.id  # Return ID directly


@pytest.fixture
def create_test_user_data():
    """
    Fixture providing a helper function to generate valid user data.
    """
    def _create_data(test_role_id: int, test_tenant_id: int = 1):
        uid = uuid.uuid4().hex[:8]
        return {
            "username": f"newuser_{uid}",
            "password": "newpassword",
            "names": "New",
            "surnames": "User",
            "id_role": test_role_id,
            "tenant_id": test_tenant_id
        }
    return _create_data


@pytest_asyncio.fixture
async def authenticated_client(test_client: AsyncClient, test_user: int, db_session: AsyncSession):
    """
    Fixture to provide an authenticated client.
    """
    # Seed AuditType for LOGIN (ID 1) to satisfy FK constraints and logic
    from auth.model.models import AuditType
    from sqlalchemy import select
    
    # Check if exists first (though in function scope usually empty)
    res = await db_session.execute(select(AuditType).filter_by(id=1))
    if not res.scalars().first():
        login_type = AuditType(id=1, name="LOGIN")
        db_session.add(login_type)
        await db_session.commit()
    
    # We need to fetch the user object from the database using the ID
    # This is a workaround because test_user fixture now returns an ID
    # and the login endpoint expects a username.
    # In a real scenario, the test_user fixture would return the full object.
    user_obj = await db_session.get(User, test_user)
    username = user_obj.username
    
    login_data = {"username": username, "password": "testpassword"}
    response = await test_client.post("/auth/login", json=login_data)
    
    # Assert successful login to avoid cryptic KeyErrors later
    assert response.status_code == 200, f"Fixture login failed with {response.status_code}: {response.text}"
    response_json = response.json()
    assert "data" in response_json, f"Login response missing 'data': {response_json}"
    assert "access_token" in response_json["data"], f"Login response missing 'access_token': {response_json}"
    
    access_token = response_json["data"]["access_token"]
    test_client.headers["Authorization"] = f"Bearer {access_token}"
    return test_client
