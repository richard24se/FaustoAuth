import logging
from typing import Any, List

from auth.model.models import ObjectType
from auth.model.pydantic import ObjectTypeCreate, ObjectTypeUpdate
from config.databases import SQLALCH_AUTH
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.sqlalch import async_sqlalch_wrapper, to_dict
from fastapi import Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession


class ObjectTypeService:
    """Object Type Service"""

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def create_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, data: ObjectTypeCreate
    ) -> dict:
        """Creates a new object type."""
        result = await s.execute(select(ObjectType).filter(ObjectType.name == data.name))
        existing = result.scalars().first()
        if existing:
            raise ControllerError(f"The object type '{data.name}' already exists.")

        new_obj_type = ObjectType(**data.model_dump())
        s.add(new_obj_type)
        await s.flush()
        await s.refresh(new_obj_type)
        logging.info("Successfully created object type '%s'.", new_obj_type.name)
        return {"msg": "Saved successful!", "data": to_dict(new_obj_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def update_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH),
        *,
        object_type_id: int,
        data: ObjectTypeUpdate,
    ) -> dict:
        """Updates an existing object type."""
        if not object_type_id:
            raise ControllerError("Object type ID must be provided.")

        result = await s.execute(
            select(ObjectType).filter(ObjectType.id == object_type_id)
        )
        obj_type = result.scalars().first()
        if not obj_type:
            raise ControllerError("Object type not found.", status_code=404)

        if data.name and data.name != obj_type.name:
            result = await s.execute(
                select(ObjectType).filter(
                    ObjectType.name == data.name, ObjectType.id != object_type_id
                )
            )
            existing = result.scalars().first()
            if existing:
                raise ControllerError(f"The object type '{data.name}' already exists.")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(obj_type, key, value)

        s.add(obj_type)
        await s.flush()
        await s.refresh(obj_type)

        logging.info("Successfully updated object type with ID %d.", object_type_id)
        return {"msg": "Update successful!", "data": to_dict(obj_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def delete_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_type_id: int
    ) -> dict:
        """Deletes an object type."""
        result = await s.execute(
            select(ObjectType).filter(ObjectType.id == object_type_id)
        )
        obj_type = result.scalars().first()
        if not obj_type:
            raise ControllerError(
                "Object type not found, it may have already been deleted.",
                status_code=404
            )

        obj_type_dict = to_dict(obj_type)
        await s.delete(obj_type)
        logging.info("Successfully deleted object type with ID %d.", object_type_id)
        return {"msg": "Deleted successful!", "data": obj_type_dict}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_object_type(
        s: AsyncSession = Depends(SQLALCH_AUTH), *, object_type_id: int
    ) -> dict[str, Any]:
        """Retrieves a single object type by its ID."""
        result = await s.execute(
            select(ObjectType).filter(ObjectType.id == object_type_id)
        )
        obj_type = result.scalars().first()
        if not obj_type:
            raise ControllerError("Object type not found.", status_code=404)

        logging.debug("Found object type with ID %d.", object_type_id)
        return {"msg": "Found", "data": to_dict(obj_type)}

    @staticmethod
    @fapi_wrapper
    @async_sqlalch_wrapper
    async def get_object_types(
        s: AsyncSession = Depends(SQLALCH_AUTH),
    ) -> List[dict[str, Any]]:
        """Retrieves all object types."""
        result = await s.execute(select(ObjectType).order_by(desc(ObjectType.id)))
        obj_types = result.scalars().all()
        if not obj_types:
            raise ControllerError("No object types found.", [])

        logging.debug("Retrieved %d object types.", len(obj_types))
        return {"msg": "Found", "data": to_dict(obj_types)}
