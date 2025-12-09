import logging
from datetime import datetime, timezone
from typing import Any, List

from auth.model.models import Object, Permission, RolePermission
from auth.model.pydantic import ObjectCreate, ObjectUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from fastapi import Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession


class ObjectService:
    """Object Service"""

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def create_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: ObjectCreate
    ) -> dict:
        """Creates a new object."""
        result = await s.execute(select(Object).filter_by(name=data.name))
        existing_object = result.scalars().first()
        if existing_object:
            raise ControllerError(f"The object name '{data.name}' already exists.")

        new_obj = Object(**data.model_dump())
        s.add(new_obj)
        await s.flush()
        await s.refresh(new_obj)
        logging.info("Successfully created object '%s'.", data.name)
        return {"msg": "Saved successful!", "data": to_dict(new_obj)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def update_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int, data: ObjectUpdate
    ) -> dict:
        """Updates an existing object."""
        if not object_id:
            raise ControllerError("Object ID must be provided.")

        result = await s.execute(select(Object).filter_by(id=object_id))
        obj = result.scalars().first()
        if not obj:
            raise ControllerError("Object not found.", status_code=404)

        if data.name and data.name != obj.name:
            result = await s.execute(
                select(Object).filter(Object.name == data.name, Object.id != object_id)
            )
            existing_name = result.scalars().first()
            if existing_name:
                raise ControllerError(f"The object name '{data.name}' already exists.")

        update_data = data.model_dump(exclude_unset=True)
        update_data["modificated_date"] = datetime.now(timezone.utc)

        for key, value in update_data.items():
            setattr(obj, key, value)
        
        s.add(obj)
        await s.flush()
        await s.refresh(obj)
        
        logging.info("Successfully updated object with ID %d.", object_id)
        return {"msg": "Update successful!", "data": to_dict(obj)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def delete_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int
    ) -> dict:
        """Deletes an object."""
        result = await s.execute(select(Object).filter_by(id=object_id))
        obj = result.scalars().first()
        if not obj:
            raise ControllerError(
                "Object not found, it may have already been deleted.",
                status_code=404
            )
        obj_dict = to_dict(obj)
        await s.delete(obj)
        logging.info("Successfully deleted object with ID %d.", object_id)
        return {"msg": "Deleted successful!", "data": obj_dict}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_object(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_id: int
    ) -> dict[str, Any]:
        """Retrieves a single object by its ID."""
        result = await s.execute(select(Object).filter_by(id=object_id))
        obj = result.scalars().first()
        if not obj:
            raise ControllerError("Object not found.", status_code=404)

        return {"msg": "Found", "data": to_dict(obj)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_object_role(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, role_id: int
    ) -> List[dict[str, Any]]:
        """Retrieves all objects associated with a specific role."""
        result = await s.execute(
            select(Object)
            .join(Permission, Permission.id_object == Object.id)
            .join(RolePermission, RolePermission.id_permission == Permission.id)
            .filter(RolePermission.id_role == role_id)
            .distinct()
        )
        objects = result.scalars().all()

        if not objects:
            raise ControllerError("No objects found for this role.", [])

        return {"msg": "Found", "data": to_dict(objects)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_objects(
        s: AsyncSession = Depends(SQLALCH_AUTH),
    ) -> List[dict[str, Any]]:
        """Retrieves all objects, ordered by ID descending."""
        result = await s.execute(select(Object).order_by(desc(Object.id)))
        objects = result.scalars().all()
        if not objects:
            raise ControllerError("No objects found.", [])

        return {"msg": "Found", "data": to_dict(objects)}
