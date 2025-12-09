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
    async def create_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: PermissionTypeCreate | dict[str, Any]
    ) -> dict[str, Any]:
        """Creates a new permission type."""
        try:
            if isinstance(data, dict):
                obj_data = data
                name = obj_data.get("name")
            else:
                obj_data = data.model_dump()
                name = data.name

            result = await s.execute(
                select(PermissionType).filter(PermissionType.name == name)
            )
            existing = result.scalars().first()
            if existing:
                raise ControllerError(f"The permission type '{name}' already exists.")

            new_perm_type = PermissionType(**obj_data)
            s.add(new_perm_type)
            await s.commit()
            await s.refresh(new_perm_type)
            logging.info("Successfully created permission type '%s'.", new_perm_type.name)
            return to_dict(new_perm_type)
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def update_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH),
        *,
        permission_type_id: int,
        data: PermissionTypeUpdate | dict[str, Any],
    ) -> dict[str, Any]:
        """Updates an existing permission type."""
        try:
            if not permission_type_id:
                raise ControllerError("Permission type ID must be provided.")

            result = await s.execute(
                select(PermissionType).filter(PermissionType.id == permission_type_id)
            )
            perm_type = result.scalars().first()
            if not perm_type:
                raise ControllerError("Permission type not found.", status_code=404)

            if isinstance(data, dict):
                update_data = data
                name = update_data.get("name")
            else:
                update_data = data.model_dump(exclude_unset=True)
                name = data.name

            if name and name != perm_type.name:
                result = await s.execute(
                    select(PermissionType).filter(
                        PermissionType.name == name,
                        PermissionType.id != permission_type_id,
                    )
                )
                existing = result.scalars().first()
                if existing:
                    raise ControllerError(
                        f"The permission type '{name}' already exists."
                    )

            for key, value in update_data.items():
                setattr(perm_type, key, value)

            s.add(perm_type)
            await s.commit()
            await s.refresh(perm_type)

            logging.info(
                "Successfully updated permission type with ID %d.", permission_type_id
            )
            return to_dict(perm_type)
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def delete_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_type_id: int
    ) -> dict[str, Any]:
        """Deletes a permission type."""
        try:
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
            await s.commit()
            logging.info(
                "Successfully deleted permission type with ID %d.", permission_type_id
            )
            return perm_type_dict
        except ControllerError:
            await s.rollback()
            raise
        except Exception as e:
            await s.rollback()
            raise ControllerError(str(e))

    @staticmethod
    async def get_permission_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, permission_type_id: int
    ) -> dict[str, Any]:
        """Retrieves a single permission type by its ID."""
        try:
            result = await s.execute(
                select(PermissionType).filter(PermissionType.id == permission_type_id)
            )
            perm_type = result.scalars().first()
            if not perm_type:
                raise ControllerError("Permission type not found.", status_code=404)

            logging.debug("Found permission type with ID %d.", permission_type_id)
            return to_dict(perm_type)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    @staticmethod
    async def get_permission_types(
        s: AsyncSession = Depends(SQLALCH_AUTH),
    ) -> List[dict[str, Any]]:
        """Retrieves all permission types."""
        try:
            result = await s.execute(select(PermissionType).order_by(desc(PermissionType.id)))
            perm_types = result.scalars().all()
            if not perm_types:
                raise ControllerError("No permission types found.", [], status_code=404)

            logging.debug("Retrieved %d permission types.", len(perm_types))
            return to_dict(perm_types)
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))
