import logging
from collections import defaultdict
from typing import Any, List

from auth.model.models import Object, Permission, RolePermission
from config.databases import get_async_db
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


@fapi_wrapper
@async_sqlalch_wrapper
async def get_role_permission(
    s: AsyncSession, *, role_id: int
) -> tuple[str, List[dict[str, Any]]]:
    """Retrieves all permissions for a given role, grouped by the object they apply to.

    Args:
        s (AsyncSession): The SQLAlchemy async session.
        role_id (int): The ID of the role.

    Returns:
        tuple[str, List[dict[str, Any]]]: A tuple containing a success message and a list of objects,
            each with a nested list of its associated permissions for the role.
    """
    # Fetch permissions with their related objects and permission types
    result = await s.execute(
        select(Permission)
        .join(RolePermission, RolePermission.id_permission == Permission.id)
        .options(joinedload(Permission.object), joinedload(Permission.permission_type))
        .filter(RolePermission.id_role == role_id)
    )
    permissions = result.scalars().all()

    if not permissions:
        raise ControllerError("No permissions found for this role.", [])

    # Group permissions by object in Python
    objects_with_permissions = defaultdict(lambda: {"permissions": []})
    for perm in permissions:
        # Ensure related object is loaded
        if not perm.object:
            # This should ideally be handled by joinedload, but as a fallback
            perm.object = await s.get(Object, perm.id_object)

        obj_dict = to_dict(perm.object)
        obj_id = obj_dict["id"]

        # If we haven't seen this object before, store its details
        if obj_id not in objects_with_permissions:
            objects_with_permissions[obj_id].update(obj_dict)

        # Add the permission to the object's permission list
        objects_with_permissions[obj_id]["permissions"].append(to_dict(perm))

    # Convert the defaultdict to a simple list of objects
    response_data = list(objects_with_permissions.values())

    logging.debug(
        "Found %d objects with permissions for role ID %d.", len(response_data), role_id
    )
    return "Permissions were found!", response_data