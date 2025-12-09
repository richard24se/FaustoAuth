import logging
from collections import defaultdict
from typing import Any, List

from auth.model.models import Object, Permission, RolePermission
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


class RolePermissionService:
    """Role Permission Service"""

    @staticmethod
    async def get_role_permission(
        s: AsyncSession, *, role_id: int
    ) -> List[dict[str, Any]]:
        """Retrieves all permissions for a given role, grouped by the object they apply to."""
        try:
            result = await s.execute(
                select(Permission)
                .join(RolePermission, RolePermission.id_permission == Permission.id)
                .options(
                    joinedload(Permission.object), joinedload(Permission.permission_type)
                )
                .filter(RolePermission.id_role == role_id)
            )
            permissions = result.scalars().all()

            if not permissions:
                raise ControllerError("No permissions found for this role.", [], status_code=404)

            objects_with_permissions = defaultdict(lambda: {"permissions": []})
            for perm in permissions:
                if not perm.object:
                    perm.object = await s.get(Object, perm.id_object)

                obj_dict = to_dict(perm.object)
                obj_id = obj_dict["id"]

                if obj_id not in objects_with_permissions:
                    objects_with_permissions[obj_id].update(obj_dict)

                objects_with_permissions[obj_id]["permissions"].append(to_dict(perm))

            response_data = list(objects_with_permissions.values())

            logging.debug(
                "Found %d objects with permissions for role ID %d.",
                len(response_data),
                role_id,
            )
            return response_data
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))