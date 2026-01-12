import io
import json
import zipfile

import pytest
from auth.model.models import Role
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_backup_export_import(super_god_client: AsyncClient, db_session: AsyncSession, test_tenant: int):
    # 1. Export Data
    response = await super_god_client.get("/backup/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"

    zip_content = response.read()
    assert len(zip_content) > 0

    # Verify ZIP structure
    with zipfile.ZipFile(io.BytesIO(zip_content)) as zf:
        file_list = zf.namelist()
        assert "tenant.json" in file_list
        assert "role.json" in file_list
        assert "user.json" in file_list

        # Read tenant data
        tenant_data = json.loads(zf.read("tenant.json"))
        assert len(tenant_data) >= 1
        assert any(t["id"] == test_tenant for t in tenant_data)

    # 2. Modify Data (Simulate data loss or change)
    # create a new role to see if it persists or restore works (merging)
    # new_role_id = 999
    # This part depends on restore strategy.
    # Current strategy is upsert. restoring the backup should NOT delete new data,
    # but SHOULD revert changed data if IDs match.

    # Let's modify an existing role's name
    stmt = select(Role).filter_by(id=1)
    result = await db_session.execute(stmt)
    role = result.scalars().first()
    original_name = role.name
    role.name = "Modified Name"
    await db_session.commit()

    # 3. Import Data (Restore)
    # Use the exported zip to restore
    files = {"file": ("backup.zip", zip_content, "application/zip")}
    response = await super_god_client.post("/backup/restore", files=files)
    assert response.status_code == 200
    assert response.json()["message"] == "System restored successfully."

    # 4. Verify Restoration
    await db_session.refresh(role)
    # Since we restored, the name should be back to original if upsert updated it.
    # Note: upsert in sqlite/postgres usually updates if ID matches.
    # We need to re-fetch to be sure
    stmt = select(Role).filter_by(id=1)
    result = await db_session.execute(stmt)
    restored_role = result.scalars().first()

    assert restored_role.name == original_name
