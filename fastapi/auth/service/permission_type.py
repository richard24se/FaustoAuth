import logging
from typing import Any, List

from auth.model.models import PermissionType
from auth.model.pydantic import PermissionTypeCreate, PermissionTypeUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from fastapi import Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession


class PermissionTypeService:
    """Permission Type Service"""

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def create_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: PermissionTypeCreate
    ) -> dict:
        """Creates a new permission type."""
        result = await s.execute(
            select(PermissionType).filter(PermissionType.name == data.name)
        )
        existing = result.scalars().first()
        if existing:
            raise ControllerError(f"The permission type '{data.name}' already exists.")

        new_perm_type = PermissionType(**data.model_dump())
        s.add(new_perm_type)
        await s.flush()
        await s.refresh(new_perm_type)
        logging.info("Successfully created permission type '%s'.", new_perm_type.name)
        return {"msg": "Saved successful!", "data": to_dict(new_perm_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def update_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH),
        *,
        permission_type_id: int,
        data: PermissionTypeUpdate,
    ) -> dict:
        """Updates an existing permission type."""
        if not permission_type_id:
            raise ControllerError("Permission type ID must be provided.")

        result = await s.execute(
            select(PermissionType).filter(PermissionType.id == permission_type_id)
        )
        perm_type = result.scalars().first()
        if not perm_type:
            raise ControllerError("Permission type not found.", status_code=404)

        if data.name and data.name != perm_type.name:
            result = await s.execute(
                select(PermissionType).filter(
                    PermissionType.name == data.name,
                    PermissionType.id != permission_type_id,
                )
            )
            existing = result.scalars().first()
            if existing:
                raise ControllerError(
                    f"The permission type '{data.name}' already exists."
                )

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(perm_type, key, value)

        s.add(perm_type)
        await s.flush()
        await s.refresh(perm_type)

        logging.info(
            "Successfully updated permission type with ID %d.", permission_type_id
        )
        return {"msg": "Update successful!", "data": to_dict(perm_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def delete_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_type_id: int
    ) -> dict:
        """Deletes a permission type."""
        result = await s.execute(
            select(PermissionType).filter(PermissionType.id == permission_type_id)
        )
        perm_type = result.scalars().first()
        if not perm_type:
            raise ControllerError(
                "Permission type not found, it may have already been deleted.",
                status_code=404
            )
        
        perm_type_dict = to_dict(perm_type)
        await s.delete(perm_type)
        logging.info(
            "Successfully deleted permission type with ID %d.", permission_type_id
        )
        return {"msg": "Deleted successful!", "data": perm_type_dict}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_type_id: int
    ) -> dict[str, Any]:
        """Retrieves a single permission type by its ID."""
        result = await s.execute(
            select(PermissionType).filter(PermissionType.id == permission_type_id)
        )
        perm_type = result.scalars().first()
        if not perm_type:
            raise ControllerError("Permission type not found.", status_code=404)

        logging.debug("Found permission type with ID %d.", permission_type_id)
        return {"msg": "Found", "data": to_dict(perm_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_permission_types(
        s: AsyncSession = Depends(SQLALCH_AUTH),
    ) -> List[dict[str, Any]]:
        """Retrieves all permission types."""
        result = await s.execute(select(PermissionType).order_by(desc(PermissionType.id)))
        perm_types = result.scalars().all()
        if not perm_types:
            raise ControllerError("No permission types found.", [])

        logging.debug("Retrieved %d permission types.", len(perm_types))
        return {"msg": "Found", "data": to_dict(perm_types)}
