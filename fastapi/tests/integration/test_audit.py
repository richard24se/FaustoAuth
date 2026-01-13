# fastapi/tests/integration/test_audit.py
"""Integration tests for Audit router endpoints."""
import pytest
from auth.model.models import Audit, AuditType, User
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.fixture
async def audit_type_id(db_session: AsyncSession):
    """Create a test audit type and return its ID."""
    audit_type = AuditType(name="test_audit_action")
    db_session.add(audit_type)
    db_session.add(audit_type)
    await db_session.commit()
    await db_session.refresh(audit_type)
    return audit_type.id


@pytest.fixture
async def user_id(db_session: AsyncSession, test_tenant: int):
    """Get the test user ID from the authenticated client fixture."""
    # The test_user is created by other fixtures, we need to get its ID
    from sqlalchemy import select

    result = await db_session.execute(select(User).limit(1))
    user = result.scalars().first()
    if user:
        return user.id
    # Create a test user if none exists
    from config.security import pwd_context

    user = User(name="audit_test_user", role_id=1, password=pwd_context.hash("test123"), tenant_id=test_tenant)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user.id


@pytest.mark.asyncio
async def test_create_audit(
    authenticated_client: AsyncClient, db_session: AsyncSession, audit_type_id, user_id, test_tenant
):
    """Test creating a new audit log."""
    response = await authenticated_client.post(
        "/audit/",
        json={
            "user_id": user_id,
            "audit_type_id": audit_type_id,
            "data": "Test audit data",
            "input": "Test audit input",
            "tenant_id": test_tenant,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["data"] == "Test audit data"


@pytest.mark.asyncio
async def test_list_audits(
    authenticated_client: AsyncClient, db_session: AsyncSession, audit_type_id, user_id, test_tenant
):
    """Test listing all audit logs."""
    audit = Audit(user_id=user_id, audit_type_id=audit_type_id, data="List test audit", tenant_id=test_tenant)
    db_session.add(audit)
    await db_session.commit()
    await db_session.refresh(audit)

    response = await authenticated_client.get("/audit/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_read_audit(
    authenticated_client: AsyncClient, db_session: AsyncSession, audit_type_id, user_id, test_tenant
):
    """Test reading a single audit log."""
    audit = Audit(user_id=user_id, audit_type_id=audit_type_id, data="Read test audit", tenant_id=test_tenant)
    db_session.add(audit)
    await db_session.commit()
    await db_session.refresh(audit)
    audit_id = audit.id

    response = await authenticated_client.get(f"/audit/{audit_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == audit_id


@pytest.mark.asyncio
async def test_read_audit_not_found(authenticated_client: AsyncClient):
    """Test reading a non-existent audit log."""
    response = await authenticated_client.get("/audit/99999")
    response = await authenticated_client.get("/audit/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_audit(
    authenticated_client: AsyncClient, db_session: AsyncSession, audit_type_id, user_id, test_tenant
):
    """Test deleting an audit log."""
    audit = Audit(user_id=user_id, audit_type_id=audit_type_id, data="Delete test audit", tenant_id=test_tenant)
    db_session.add(audit)
    await db_session.commit()
    await db_session.refresh(audit)
    audit_id = audit.id

    response = await authenticated_client.delete(f"/audit/{audit_id}")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_audit_not_found(authenticated_client: AsyncClient):
    """Test deleting a non-existent audit log."""
    response = await authenticated_client.delete("/audit/99999")
    response = await authenticated_client.delete("/audit/99999")
    assert response.status_code == 404
