import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from auth.model.models import Tenant

@pytest.mark.asyncio
async def test_create_tenant(super_god_client: AsyncClient, db_session: AsyncSession):
    """Test creating a new tenant."""
    response = await super_god_client.post(
        "/tenant/",
        json={"name": "test_tenant_new", "slug": "test-tenant-new"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == "test_tenant_new"
    assert data["data"]["slug"] == "test-tenant-new"

@pytest.mark.asyncio
async def test_list_tenants(super_god_client: AsyncClient, test_tenant: int):
    """Test listing all tenants."""
    response = await super_god_client.get("/tenant/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1
    # Check if our test_tenant is implied or we just check structural correctness
    ids = [t["id"] for t in data["data"]]
    assert test_tenant in ids

@pytest.mark.asyncio
async def test_get_tenant(super_god_client: AsyncClient, test_tenant: int):
    """Test getting a specific tenant."""
    response = await super_god_client.get(f"/tenant/{test_tenant}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == test_tenant

@pytest.mark.asyncio
async def test_update_tenant(super_god_client: AsyncClient, test_tenant: int):
    """Test updating a tenant."""
    response = await super_god_client.put(
        f"/tenant/{test_tenant}",
        json={"name": "updated_tenant_name"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["name"] == "updated_tenant_name"


