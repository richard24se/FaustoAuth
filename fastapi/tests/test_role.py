import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from auth.model.models import Role

@pytest.mark.asyncio
async def test_create_role(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test creating a new role."""
    response = await authenticated_client.post(
        "/role/",
        json={
            "name": "new_role", 
            "display_name": "New Role", 
            "permissions": [],
            "tenant_id": test_tenant
        },
    )
    assert response.status_code == 201, f"Failed with {response.status_code}: {response.text}"
    data = response.json()
    assert data["data"]["name"] == "new_role"
    assert data["data"]["display_name"] == "New Role"

    # Verify in DB
    result = await db_session.execute(select(Role).filter_by(name="new_role"))
    role = result.scalars().first()
    assert role is not None


@pytest.mark.asyncio
async def test_create_role_duplicate(authenticated_client: AsyncClient, test_role: int, test_tenant: int):
    """Test creating a duplicate role."""
    response = await authenticated_client.post(
        "/role/",
        json={
            "name": "test_role", 
            "display_name": "Duplicate Role", 
            "permissions": [],
            "tenant_id": test_tenant
        },
    )
    assert response.status_code == 400
    assert response.json()["message"] == "The role 'test_role' already exists."


@pytest.mark.asyncio
async def test_list_roles(authenticated_client: AsyncClient, test_role: int):
    """Test listing all roles."""
    response = await authenticated_client.get("/role/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1
    assert any(r["id"] == test_role for r in data["data"])


@pytest.mark.asyncio
async def test_read_role(authenticated_client: AsyncClient, test_role: int):
    """Test reading a single role."""
    response = await authenticated_client.get(f"/role/{test_role}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == test_role
    assert data["data"]["name"] == "test_role"


@pytest.mark.asyncio
async def test_read_role_not_found(authenticated_client: AsyncClient):
    """Test reading a non-existent role."""
    response = await authenticated_client.get("/role/99999")
    assert response.status_code == 404
    assert response.json()["message"] == "Role not found."


@pytest.mark.asyncio
async def test_update_role(authenticated_client: AsyncClient, test_role: int):
    """Test updating a role."""
    response = await authenticated_client.put(
        f"/role/{test_role}",
        json={"name": "updated_role", "display_name": "Updated Role"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["name"] == "updated_role"
    assert data["data"]["display_name"] == "Updated Role"


@pytest.mark.asyncio
async def test_update_role_not_found(authenticated_client: AsyncClient):
    """Test updating a non-existent role."""
    response = await authenticated_client.put(
        "/role/99999",
        json={"name": "updated_role"},
    )
    assert response.status_code == 404
    assert response.json()["message"] == "Role not found."


@pytest.mark.asyncio
async def test_delete_role(authenticated_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    """Test deleting a role."""
    # Create a role to delete
    role = Role(name="role_to_delete", display_name="Role To Delete", tenant_id=test_tenant)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    response = await authenticated_client.delete(f"/role/{role.id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Deleted successful!"

    # Verify deletion
    response = await authenticated_client.get(f"/role/{role.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_role_not_found(authenticated_client: AsyncClient):
    """Test deleting a non-existent role."""
    response = await authenticated_client.delete("/role/99999")
    assert response.status_code == 404
    assert response.json()["message"] == "Role not found."
