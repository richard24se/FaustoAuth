# fastapi/tests/integration/test_object.py
"""Integration tests for Object router endpoints."""
import pytest
from auth.model.models import Object, ObjectType
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.fixture
async def test_object_type(db_session: AsyncSession):
    """Create a test object type."""
    obj_type = ObjectType(name="test_obj_type_for_object")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)
    return obj_type.id  # Return ID to avoid greenlet issues


@pytest.mark.asyncio
async def test_create_object(
    authenticated_client: AsyncClient, db_session: AsyncSession, test_object_type, test_tenant
):
    """Test creating a new object."""
    response = await authenticated_client.post(
        "/object/",
        json={"name": "test_object", "object_type_id": test_object_type, "tenant_id": test_tenant},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == "test_object"


@pytest.mark.asyncio
async def test_create_object_duplicate(
    authenticated_client: AsyncClient, db_session: AsyncSession, test_object_type, test_tenant
):
    """Test creating a duplicate object."""
    obj = Object(name="dup_object", object_type_id=test_object_type, tenant_id=test_tenant)
    db_session.add(obj)
    await db_session.commit()
    await db_session.refresh(obj)

    response = await authenticated_client.post(
        "/object/",
        json={"name": "dup_object", "object_type_id": test_object_type, "tenant_id": test_tenant},
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["message"]


@pytest.mark.asyncio
async def test_list_objects(authenticated_client: AsyncClient, db_session: AsyncSession, test_object_type, test_tenant):
    """Test listing all objects."""
    obj = Object(name="list_test_object", object_type_id=test_object_type, tenant_id=test_tenant)
    db_session.add(obj)
    await db_session.commit()
    await db_session.refresh(obj)

    response = await authenticated_client.get("/object/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_read_object(authenticated_client: AsyncClient, db_session: AsyncSession, test_object_type, test_tenant):
    """Test reading a single object."""
    obj = Object(name="read_test_object", object_type_id=test_object_type, tenant_id=test_tenant)
    db_session.add(obj)
    await db_session.commit()
    await db_session.refresh(obj)
    obj_id = obj.id

    response = await authenticated_client.get(f"/object/{obj_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == obj_id


@pytest.mark.asyncio
async def test_read_object_not_found(authenticated_client: AsyncClient):
    """Test reading a non-existent object."""
    response = await authenticated_client.get("/object/99999")
    response = await authenticated_client.get("/object/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_object(
    authenticated_client: AsyncClient, db_session: AsyncSession, test_object_type, test_tenant
):
    """Test updating an object."""
    obj = Object(name="update_test_object", object_type_id=test_object_type, tenant_id=test_tenant)
    db_session.add(obj)
    await db_session.commit()
    await db_session.refresh(obj)
    obj_id = obj.id

    response = await authenticated_client.put(
        f"/object/{obj_id}",
        json={"name": "updated_object_name"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["name"] == "updated_object_name"


@pytest.mark.asyncio
async def test_update_object_not_found(authenticated_client: AsyncClient):
    """Test updating a non-existent object."""
    response = await authenticated_client.put(
        "/object/99999",
        json={"name": "updated"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_object(
    authenticated_client: AsyncClient, db_session: AsyncSession, test_object_type, test_tenant
):
    """Test deleting an object."""
    obj = Object(name="delete_test_object", object_type_id=test_object_type, tenant_id=test_tenant)
    db_session.add(obj)
    await db_session.commit()
    await db_session.refresh(obj)
    obj_id = obj.id

    response = await authenticated_client.delete(f"/object/{obj_id}")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_object_not_found(authenticated_client: AsyncClient):
    """Test deleting a non-existent object."""
    response = await authenticated_client.delete("/object/99999")
    assert response.status_code == 404
