import logging
from typing import Any, List

from auth.model.models import Object, Permission, RolePermission
from fausto import ControllerError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


class RolePermissionService:
    """Role Permission Service"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_role_permission(
        self, *, role_id: int
    ) -> List[dict[str, Any]]:
        """Retrieves all permissions for a given role, grouped by the object they apply to.

        Args:
            role_id: The ID of the role to retrieve permissions for.

        Returns:
            A list of objects, each containing the object details and its permissions.

        Raises:
            ControllerError: If no permissions are found or a database error occurs.
        """
        """
        PREVIOUS VERSION (for reference):
        Changed to selectinload because joinedload causing Cartesian product issues with multiple collections
        and selectinload is more predictable for SaaS multi-tenant performance. Also explicit serialization avoiding
        leaking sensitive fields like tenant_id.

        async def get_role_permission(
            self, *, role_id: int
        ) -> List[dict[str, Any]]:
            try:
                result = await self.session.execute(
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
                        perm.object = await self.session.get(Object, perm.id_object)

                    obj_dict = to_dict(perm.object)
                    obj_id = obj_dict["id"]

                    if obj_id not in objects_with_permissions:
                        objects_with_permissions[obj_id].update(obj_dict)

                    perm_dict = to_dict(perm)
                    # Remove SQLAlchemy objects that cause serialization errors
                    perm_dict.pop("object", None)
                    perm_dict.pop("permission_type", None)
                    perm_dict.pop("role_permissions", None)
                    
                    objects_with_permissions[obj_id]["permissions"].append(perm_dict)

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
        """
        try:
            result = await self.session.execute(
                select(Permission)
                .join(RolePermission, RolePermission.id_permission == Permission.id)
                .options(
                    selectinload(Permission.object).selectinload(Object.object_type),
                    selectinload(Permission.object).selectinload(Object.tenant),
                    selectinload(Permission.permission_type),
                )
                .filter(RolePermission.id_role == role_id)
            )
            permissions = result.scalars().all()

            if not permissions:
                logging.warning("No permissions found for role ID %d.", role_id)
                return []

            objects_with_permissions: dict[int, dict[str, Any]] = {}

            for perm in permissions:
                obj = perm.object
                if not obj:
                    logging.error("Permission ID %d has no associated object.", perm.id)
                    continue  # Skip orphaned permissions instead of crashing

                obj_id = obj.id
                if obj_id not in objects_with_permissions:
                    objects_with_permissions[obj_id] = {
                        "id": obj.id,
                        "name": obj.name,
                        "display_name": obj.display_name,
                        "created_date": obj.created_date.isoformat() if obj.created_date else None,
                        "modificated_date": obj.modificated_date.isoformat() if obj.modificated_date else None,
                        "permissions": [],
                    }
                
                objects_with_permissions[obj_id]["permissions"].append({
                    "id": perm.id,
                    "name": perm.name,
                    "id_object": perm.id_object,
                    "id_permission_type": perm.id_permission_type,
                    # Omit tenant_id from response for security
                    "created_date": perm.created_date.isoformat() if perm.created_date else None,
                    "modificated_date": perm.modificated_date.isoformat() if perm.modificated_date else None,
                })

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
            logging.exception("Error retrieving permissions for role ID %d.", role_id)
            raise ControllerError(str(e))
