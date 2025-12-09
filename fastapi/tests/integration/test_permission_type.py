# fastapi/tests/integration/test_permission_type.py
"""Integration tests for PermissionType router endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from auth.model.models import PermissionType


@pytest.mark.asyncio
async def test_create_permission_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test creating a new permission type."""
    response = await authenticated_client.post(
        "/permission_types/",
        json={"name": "new_perm_type"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == "new_perm_type"


@pytest.mark.asyncio
async def test_create_permission_type_duplicate(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test creating a duplicate permission type."""
    perm_type = PermissionType(name="dup_perm_type")
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(perm_type)

    response = await authenticated_client.post(
        "/permission_types/",
        json={"name": "dup_perm_type"},
    )
    assert response.status_code == 400
    assert response.status_code == 400
    assert "already exists" in response.json()["message"]


@pytest.mark.asyncio
async def test_list_permission_types(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test listing all permission types."""
    perm_type = PermissionType(name="list_perm_type")
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(perm_type)

    response = await authenticated_client.get("/permission_types/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_read_permission_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test reading a single permission type."""
    perm_type = PermissionType(name="read_perm_type")
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(perm_type)
    perm_type_id = perm_type.id

    response = await authenticated_client.get(f"/permission_types/{perm_type_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == perm_type_id


@pytest.mark.asyncio
async def test_read_permission_type_not_found(authenticated_client: AsyncClient):
    """Test reading a non-existent permission type."""
    response = await authenticated_client.get("/permission_types/99999")
    response = await authenticated_client.get("/permission_types/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_permission_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test updating a permission type."""
    perm_type = PermissionType(name="update_perm_type")
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(perm_type)
    perm_type_id = perm_type.id

    response = await authenticated_client.put(
        f"/permission_types/{perm_type_id}",
        json={"name": "updated_perm_type"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["name"] == "updated_perm_type"


@pytest.mark.asyncio
async def test_update_permission_type_not_found(authenticated_client: AsyncClient):
    """Test updating a non-existent permission type."""
    response = await authenticated_client.put(
        "/permission_types/99999",
        json={"name": "updated"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_permission_type(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test deleting a permission type."""
    perm_type = PermissionType(name="delete_perm_type")
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(perm_type)
    perm_type_id = perm_type.id

    response = await authenticated_client.delete(f"/permission_types/{perm_type_id}")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_permission_type_not_found(authenticated_client: AsyncClient):
    """Test deleting a non-existent permission type."""
    response = await authenticated_client.delete("/permission_types/99999")
    assert response.status_code == 404
