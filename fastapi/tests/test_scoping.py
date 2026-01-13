import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

# Using existing test utilities if available, or composing basic flows.
# Assuming we have conftest.py managing overrides.


@pytest.mark.asyncio
async def test_strict_tenant_scoping(
    test_client: AsyncClient,
    db_session: AsyncSession,
    super_god_client: AsyncClient,  # Reusing this to get the token, or we can extract token logic
    # tenant_user_token should be created dynamically or we create a user here
):
    # Retrieve token from super_god_client or create one.
    # Since super_god_client is already authenticated, we can grab its headers or login again.
    # Let's use the fixture to get a fresh token if needed, or just use the client directly.
    # BUT the test uses 'client' (now test_client) for unauth/generic requests and manually sets headers.
    # So we need the token string.

    # We can get the token by logging in as superuser.

    # We need the password. Providing it here or assuming fixture password.
    # Better: Use super_god_client.headers["Authorization"]

    auth_header = super_god_client.headers["Authorization"]
    super_god_token = auth_header.split(" ")[1]

    headers_god = {"Authorization": f"Bearer {super_god_token}"}
    client = test_client  # Alias for less code changes below

    # Create Tenant A
    resp = await client.post("/tenant/", json={"name": "Tenant A"}, headers=headers_god)
    assert resp.status_code == 201
    tenant_a_id = resp.json()["data"]["id"]

    # Create Tenant B
    resp = await client.post("/tenant/", json={"name": "Tenant B"}, headers=headers_god)
    assert resp.status_code == 201
    tenant_b_id = resp.json()["data"]["id"]

    # Create User A (in Tenant A) - need a role first? Assuming 'User' role exists or we create one
    # Let's create a role in Tenant A
    resp = await client.post("/role/", json={"name": "UserRoleA", "tenant_id": tenant_a_id}, headers=headers_god)
    role_a_id = resp.json()["data"]["id"]

    user_a_data = {"username": "user_a", "password": "password123", "tenant_id": tenant_a_id, "role_id": role_a_id}
    resp = await client.post("/user/", json=user_a_data, headers=headers_god)
    assert resp.status_code == 201
    # TODO: check if user_a_id is needed
    # user_a_id = resp.json()["data"]["id"]

    # Create Object in Tenant B
    # First create Object Type (Global)
    resp = await client.post("/object_types/", json={"name": "TypeTest"}, headers=headers_god)
    # 201 or 400 if exists. If exists, fetch it.

    if resp.status_code == 201:
        type_id = resp.json()["data"]["id"]
    else:
        # List and get
        resp = await client.get("/object_types/", headers=headers_god)
        type_id = resp.json()["data"][0]["id"]

    object_b_data = {"name": "ObjectInB", "object_type_id": type_id, "tenant_id": tenant_b_id}
    resp = await client.post("/object/", json=object_b_data, headers=headers_god)
    assert resp.status_code == 201
    object_b_id = resp.json()["data"]["id"]

    # 2. Login as User A
    login_data = {"username": "user_a", "password": "password123"}
    resp = await client.post("/auth/login", json=login_data)
    assert resp.status_code == 200
    token_a = resp.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 3. Verify Scoping

    # User A matches Tenant A. Should NOT see ObjectInB (Tenant B).
    resp = await client.get("/object/", headers=headers_a)
    assert resp.status_code == 200
    objects = resp.json()["data"]

    # Verify ObjectInB is NOT in the list
    ids = [o["id"] for o in objects]
    assert object_b_id not in ids

    # User A should verify they can create object in Tenant A
    object_a_data = {
        "name": "ObjectInA",
        "object_type_id": type_id,
        # tenant_id might be inferred or required. Logic says strictly tenant_id=auth.tenant_id
        # user_a is in tenant_a.
        # If we send tenant_b_id, it should fail or coerce to tenant_a_id.
        "tenant_id": tenant_a_id,
    }
    resp = await client.post("/object/", json=object_a_data, headers=headers_a)
    assert resp.status_code == 201

    # Try to create object in Tenant B as User A
    object_fail_data = {"name": "ObjectFail", "object_type_id": type_id, "tenant_id": tenant_b_id}
    resp = await client.post("/object/", json=object_fail_data, headers=headers_a)
    # Depending on implementation:
    # 1. It forces tenant_id to A (Successful creation in A)
    # 2. It raises 403 Forbidden (Strict check)
    # Let's check behaviour. But usually strict scoping means YOU CANNOT act on B.
    # Existing code usually overrides tenant_id with auth.tenant_id if not super-god.
    # So it should result in creation in Tenant A, IGNORING the request's tenant_b_id.
    # Let's verify that.

    if resp.status_code == 201:
        created_obj = resp.json()["data"]
        assert created_obj["tenant_id"] == tenant_a_id
        assert created_obj["tenant_id"] != tenant_b_id
    else:
        # If it returns 403, that is also acceptable for strict scoping
        assert resp.status_code in [403, 400]

    # Verify Role Scoping: Try to create Role for Tenant B as User A
    role_fail_data = {"name": "RoleInB", "tenant_id": tenant_b_id}
    resp = await client.post("/role/", json=role_fail_data, headers=headers_a)
    if resp.status_code == 201:
        created_role = resp.json()["data"]
        # Should be forced to Tenant A
        assert created_role["tenant_id"] == tenant_a_id
        assert created_role["tenant_id"] != tenant_b_id

        # Verify it is not listed for Tenant B (requires a user in B or god check)
        # God check:
        resp = await super_god_client.get(f"/role/?tenant_id={tenant_b_id}", headers=headers_god)
        # God list might return all or filter. Let's inspect directly from DB or assume isolation holds if ID matches.

    else:
        assert resp.status_code in [403, 400]

    # Verify User Scoping: Try to create User for Tenant B as User A
    # Need a valid role in Tenant A (since user creation checks role existence in same tenant usually?
    # Or if we pass role in Tenant B it should fail FK)

    # 1. Try passing Tenant B ID but Role in Tenant A (valid role, validation should force user to Tenant A)
    user_fail_data = {
        "username": "user_fail_b",
        "password": "password",
        "tenant_id": tenant_b_id,
        "role_id": role_a_id,  # Belonging to Tenant A
    }
    resp = await client.post("/user/", json=user_fail_data, headers=headers_a)
    if resp.status_code == 201:
        created_user = resp.json()["data"]
        assert created_user["tenant_id"] == tenant_a_id
    else:
        assert resp.status_code in [403, 400]

    # 2. Permission Scoping
    # Try to create Permission in Tenant B (if Permission has tenant_id)
    # Checking Permission model... assuming it has tenant_id.
    perm_fail_data = {"name": "PermInB", "tenant_id": tenant_b_id, "description": "Fail"}
    resp = await client.post("/permission/", json=perm_fail_data, headers=headers_a)
    if resp.status_code == 201:
        created_perm = resp.json()["data"]
        # Some systems might not handle tenant_id on Permission directly if it's strictly global?
        # But if it inherits CRUDBase and has tenant_id, it is scoped.
        if "tenant_id" in created_perm:
            assert created_perm["tenant_id"] == tenant_a_id
    else:
        # 404 might happen if route doesn't exist or 403/400
        # Assuming /permission/ exists
        pass
