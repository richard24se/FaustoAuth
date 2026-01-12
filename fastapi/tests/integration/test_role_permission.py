import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from auth.model.models import Role, Permission, Object, ObjectType, PermissionType, RolePermission

@pytest.mark.asyncio
async def test_read_role_permission_not_found(
    super_god_client: AsyncClient, 
    db_session: AsyncSession, 
    test_tenant: int
):
    # Call Endpoint with non-existent role
    response = await super_god_client.get(
        "/role_permission/",
        params={"role_id": 99999}
    )

    # Validation
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Not found"
    assert data["data"] == []

@pytest.mark.asyncio
async def test_read_role_permission_empty_role(
    super_god_client: AsyncClient, 
    db_session: AsyncSession, 
    test_tenant: int
):
    # 1. Create a Role with no permissions
    role = Role(
        name="Empty Role",
        tenant_id=test_tenant
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    # 2. Call Endpoint
    response = await super_god_client.get(
        "/role_permission/",
        params={"role_id": role.id}
    )

    # 3. Validation
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Not found"
    assert data["data"] == []

@pytest.mark.asyncio
async def test_read_role_permission_success(
    super_god_client: AsyncClient, 
    db_session: AsyncSession, 
    test_tenant: int
):
    # 1. Create Data
    # Object Type
    obj_type = ObjectType(name="TestType")
    db_session.add(obj_type)
    await db_session.commit()
    await db_session.refresh(obj_type)
    obj_type_id = obj_type.id

    # Object
    obj = Object(
        name="TestObject", 
        display_name="Test Object", 
        id_object_type=obj_type_id, 
        tenant_id=test_tenant
    )
    db_session.add(obj)
    await db_session.commit()
    await db_session.refresh(obj)
    obj_id = obj.id

    # Permission Type
    perm_type = PermissionType(name="READ_TEST")
    db_session.add(perm_type)
    await db_session.commit()
    await db_session.refresh(perm_type)
    perm_type_id = perm_type.id

    # Permission
    perm = Permission(
        name="Read TestObject", 
        id_object=obj_id, 
        id_permission_type=perm_type_id, 
        tenant_id=test_tenant
    )
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)
    perm_id = perm.id

    # Role
    role = Role(
        name="Test Role",
        tenant_id=test_tenant
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    role_id = role.id

    # Role Permission
    role_perm = RolePermission(
        id_role=role_id,
        id_permission=perm_id
    )
    db_session.add(role_perm)
    await db_session.commit()

    # 2. Call Endpoint
    response = await super_god_client.get(
        "/role_permission/",
        params={"role_id": role_id}
    )

    # 3. Validation
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Found"
    assert len(data["data"]) == 1
    
    returned_obj = data["data"][0]
    assert returned_obj["id"] == obj_id
    assert returned_obj["name"] == "TestObject"
    assert len(returned_obj["permissions"]) == 1
    
    returned_perm = returned_obj["permissions"][0]
    assert returned_perm["id"] == perm_id
    assert returned_perm["name"] == "Read TestObject"
    assert returned_perm["id_permission_type"] == perm_type_id
