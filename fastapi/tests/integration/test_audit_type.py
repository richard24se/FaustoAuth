# fastapi/tests/integration/test_audit_type.py
"""Integration tests for AuditType router endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from auth.model.models import AuditType


@pytest.mark.asyncio
async def test_create_audit_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test creating a new audit type."""
    response = await authenticated_client.post(
        "/audit_type/",
        json={"name": "new_audit_type"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == "new_audit_type"


@pytest.mark.asyncio
async def test_create_audit_type_duplicate(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test creating a duplicate audit type."""
    audit_type = AuditType(name="dup_audit_type")
    db_session.add(audit_type)
    await db_session.commit()
    await db_session.refresh(audit_type)

    response = await authenticated_client.post(
        "/audit_type/",
        json={"name": "dup_audit_type"},
    )
    assert response.status_code == 400
    assert response.status_code == 400
    assert "already exists" in response.json()["message"]


@pytest.mark.asyncio
async def test_list_audit_types(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test listing all audit types."""
    audit_type = AuditType(name="list_audit_type")
    db_session.add(audit_type)
    await db_session.commit()
    await db_session.refresh(audit_type)

    response = await authenticated_client.get("/audit_type/")
    assert response.status_code == 200
    data = response.json()
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_read_audit_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test reading a single audit type."""
    audit_type = AuditType(name="read_audit_type")
    db_session.add(audit_type)
    await db_session.commit()
    await db_session.refresh(audit_type)
    audit_type_id = audit_type.id  # Capture ID before accessing again

    response = await authenticated_client.get(f"/audit_type/{audit_type_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == audit_type_id


@pytest.mark.asyncio
async def test_read_audit_type_not_found(authenticated_client: AsyncClient):
    """Test reading a non-existent audit type."""
    response = await authenticated_client.get("/audit_type/99999")
    # Service returns HTTPException with status 404 for not found
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_audit_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test updating an audit type."""
    audit_type = AuditType(name="update_audit_type")
    db_session.add(audit_type)
    await db_session.commit()
    await db_session.refresh(audit_type)
    audit_type_id = audit_type.id

    response = await authenticated_client.put(
        f"/audit_type/{audit_type_id}",
        json={"name": "updated_audit_type"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["name"] == "updated_audit_type"


@pytest.mark.asyncio
async def test_update_audit_type_not_found(authenticated_client: AsyncClient):
    """Test updating a non-existent audit type."""
    response = await authenticated_client.put(
        "/audit_type/99999",
        json={"name": "updated"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_audit_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test deleting an audit type."""
    audit_type = AuditType(name="delete_audit_type")
    db_session.add(audit_type)
    await db_session.commit()
    await db_session.refresh(audit_type)
    audit_type_id = audit_type.id

    response = await authenticated_client.delete(f"/audit_type/{audit_type_id}")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_audit_type_not_found(authenticated_client: AsyncClient):
    """Test deleting a non-existent audit type."""
    response = await authenticated_client.delete("/audit_type/99999")
    assert response.status_code == 404
