# fastapi/tests/integration/test_object_type.py
"""Integration tests for ObjectType router endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from auth.model.models import ObjectType


@pytest.mark.asyncio
async def test_create_object_type_forbidden(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test creating a new object type as regular user (should fail)."""
    response = await authenticated_client.post(
        "/object_types/",
        json={"name": "new_object_type"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_object_types(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test listing all object types (read-only allowed)."""
    # Check if exists
    res = await db_session.execute(select(ObjectType).filter_by(name="list_test_type"))
    if not res.scalars().first():
        obj_type = ObjectType(name="list_test_type")
        db_session.add(obj_type)
        await db_session.commit()
        await db_session.refresh(obj_type)

    response = await authenticated_client.get("/object_types/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_read_object_type_not_found(authenticated_client: AsyncClient):
    """Test reading a non-existent object type."""
    response = await authenticated_client.get("/object_types/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_object_type_forbidden(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test updating an object type as regular user (should fail)."""
    obj_type = ObjectType(name="update_test_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)
    obj_type_id = obj_type.id

    response = await authenticated_client.put(
        f"/object_types/{obj_type_id}",
        json={"name": "updated_type_name"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_object_type_forbidden(authenticated_client: AsyncClient, db_session: AsyncSession):
    """Test deleting an object type as regular user (should fail)."""
    obj_type = ObjectType(name="delete_test_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)
    obj_type_id = obj_type.id

    response = await authenticated_client.delete(f"/object_types/{obj_type_id}")
    assert response.status_code == 403
