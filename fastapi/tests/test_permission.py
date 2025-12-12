import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from auth.model.models import Permission, Object, PermissionType, ObjectType

@pytest.mark.asyncio
async def test_create_permission(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test creating a new permission."""
    # Create dependencies
    obj_type = ObjectType(name="test_obj_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)

    obj = Object(name="test_object", id_object_type=obj_type.id, tenant_id=test_tenant)
    perm_type = PermissionType(name="test_type")
    db_session.add(obj)
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(obj)
    await db_session.refresh(perm_type)

    response = await authenticated_client.post(
        "/permission/",
        json={
            "name": "new_permission",
            "id_object": obj.id,
            "id_permission_type": perm_type.id,
            "tenant_id": test_tenant
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == "new_permission"

    # Verify in DB
    result = await db_session.execute(select(Permission).filter_by(name="new_permission"))
    perm = result.scalars().first()
    assert perm is not None


@pytest.mark.asyncio
async def test_create_permission_duplicate(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test creating a duplicate permission."""
    # Create dependencies
    obj_type = ObjectType(name="dup_obj_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)

    obj = Object(name="dup_object", id_object_type=obj_type.id, tenant_id=test_tenant)
    perm_type = PermissionType(name="dup_type")
    db_session.add(obj)
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(obj)
    await db_session.refresh(perm_type)

    # Capture IDs before they expire after next commit
    obj_id = obj.id
    perm_type_id = perm_type.id

    # Create first permission
    perm = Permission(name="dup_permission", id_object=obj_id, id_permission_type=perm_type_id, tenant_id=test_tenant)
    db_session.add(perm)
    await db_session.commit()

    response = await authenticated_client.post(
        "/permission/",
        json={
            "name": "dup_permission",
            "id_object": obj_id,
            "id_permission_type": perm_type_id,
            "tenant_id": test_tenant
        },
    )
    assert response.status_code == 400
    assert response.json()["message"] == "The permission 'dup_permission' already exists."


@pytest.mark.asyncio
async def test_list_permissions(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test listing all permissions."""
    # Create a permission
    obj_type = ObjectType(name="list_obj_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)

    obj = Object(name="list_object", id_object_type=obj_type.id, tenant_id=test_tenant)
    perm_type = PermissionType(name="list_type")
    db_session.add(obj)
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(obj)
    await db_session.refresh(perm_type)
    
    perm = Permission(name="list_permission", id_object=obj.id, id_permission_type=perm_type.id, tenant_id=test_tenant)
    db_session.add(perm)
    await db_session.commit()

    response = await authenticated_client.get("/permission/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_read_permission(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test reading a single permission."""
    # Create a permission
    obj_type = ObjectType(name="read_obj_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)

    obj = Object(name="read_object", id_object_type=obj_type.id, tenant_id=test_tenant)
    perm_type = PermissionType(name="read_type")
    db_session.add(obj)
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(obj)
    await db_session.refresh(perm_type)
    
    perm = Permission(name="read_permission", id_object=obj.id, id_permission_type=perm_type.id, tenant_id=test_tenant)
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)

    response = await authenticated_client.get(f"/permission/{perm.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == perm.id
    assert data["data"]["name"] == "read_permission"


@pytest.mark.asyncio
async def test_read_permission_not_found(authenticated_client: AsyncClient):
    """Test reading a non-existent permission."""
    response = await authenticated_client.get("/permission/99999")
    assert response.status_code == 404
    assert response.json()["message"] == "Permission not found."


@pytest.mark.asyncio
async def test_update_permission(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test updating a permission."""
    # Create a permission
    obj_type = ObjectType(name="update_obj_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)

    obj = Object(name="update_object", id_object_type=obj_type.id, tenant_id=test_tenant)
    perm_type = PermissionType(name="update_type")
    db_session.add(obj)
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(obj)
    await db_session.refresh(perm_type)
    
    perm = Permission(name="update_permission", id_object=obj.id, id_permission_type=perm_type.id, tenant_id=test_tenant)
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)

    response = await authenticated_client.put(
        f"/permission/{perm.id}",
        json={"name": "updated_permission"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["name"] == "updated_permission"


@pytest.mark.asyncio
async def test_update_permission_not_found(authenticated_client: AsyncClient):
    """Test updating a non-existent permission."""
    response = await authenticated_client.put(
        "/permission/99999",
        json={"name": "updated_permission"},
    )
    assert response.status_code == 404
    assert response.json()["message"] == "Permission not found."


@pytest.mark.asyncio
async def test_delete_permission(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test deleting a permission."""
    # Create a permission
    obj_type = ObjectType(name="delete_obj_type")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)

    obj = Object(name="delete_object", id_object_type=obj_type.id, tenant_id=test_tenant)
    perm_type = PermissionType(name="delete_type")
    db_session.add(obj)
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(obj)
    await db_session.refresh(perm_type)
    
    perm = Permission(name="delete_permission", id_object=obj.id, id_permission_type=perm_type.id, tenant_id=test_tenant)
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)

    response = await authenticated_client.delete(f"/permission/{perm.id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Deleted successful!"

    # Verify deletion
    response = await authenticated_client.get(f"/permission/{perm.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_permission_not_found(authenticated_client: AsyncClient):
    """Test deleting a non-existent permission."""
    response = await authenticated_client.delete("/permission/99999")
    assert response.status_code == 404
    assert response.json()["message"] == "Permission not found."
