from typing import Any, Generic, Type, TypeVar

from fausto import ControllerError
from fausto.sqlalch import (
    get_filter_fields_multi_sqlalch,
    get_order_fields_multi_sqlalch,
    remove_fields_sqlalch,
    to_dict,
)
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(
        self,
        model: Type[ModelType],
        session: AsyncSession,
        exclude_fields: list[str] | None = None,
    ):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).

        **Parameters**

        * `model`: A SQLAlchemy model class
        * `session`: The SQLAlchemy async session
        * `exclude_fields`: List of fields to exclude from the response (e.g. ["password"])
        """
        self.model = model
        self.session = session
        self.exclude_fields = exclude_fields or []

    def _process_data(self, obj: Any) -> dict[str, Any]:
        """Helper to convert to dict and remove excluded fields."""
        data = to_dict(obj)
        if self.exclude_fields:
            return remove_fields_sqlalch(data, self.exclude_fields)
        return data

    async def get(self, id: Any) -> dict[str, Any]:
        try:
            result = await self.session.execute(select(self.model).filter(self.model.id == id))
            obj = result.scalars().first()
            if not obj:
                raise ControllerError(f"{self.model.__name__} not found.", status_code=404)
            return {"msg": "Found", "data": self._process_data(obj)}
        except ControllerError:
            raise
        except Exception as e:
            raise ControllerError(str(e))

    async def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] | None = None,
        order_by: list[str] | None = None,
    ) -> dict[str, Any]:
        try:
            query = select(self.model)

            if filters:
                query = query.filter(
                    *get_filter_fields_multi_sqlalch(filters, self.model)
                )

            if order_by:
                query = query.order_by(
                    *get_order_fields_multi_sqlalch(order_by, self.model)
                )

            query = query.offset(skip).limit(limit)
            result = await self.session.execute(query)
            objects = result.scalars().all()

            return {
                "msg": "Found",
                "data": [self._process_data(obj) for obj in objects],
            }
        except Exception as e:
            raise ControllerError(str(e))

    async def create(self, *, obj_in: CreateSchemaType) -> dict[str, Any]:
        try:
            obj_in_data = jsonable_encoder(obj_in)
            db_obj = self.model(**obj_in_data)
            self.session.add(db_obj)
            await self.session.commit()
            await self.session.refresh(db_obj)
            return {"msg": "Saved successful!", "data": self._process_data(db_obj)}
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def update(
        self,
        *,
        id: Any,
        obj_in: UpdateSchemaType | dict[str, Any],
    ) -> dict[str, Any]:
        try:
            result = await self.session.execute(select(self.model).filter(self.model.id == id))
            db_obj = result.scalars().first()
            if not db_obj:
                raise ControllerError(f"{self.model.__name__} not found.", status_code=404)

            obj_data = jsonable_encoder(db_obj)
            if isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = obj_in.model_dump(exclude_unset=True)

            for field in obj_data:
                if field in update_data:
                    setattr(db_obj, field, update_data[field])

            self.session.add(db_obj)
            await self.session.commit()
            await self.session.refresh(db_obj)
            return {"msg": "Update successful!", "data": self._process_data(db_obj)}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))

    async def remove(self, *, id: int) -> dict[str, Any]:
        try:
            result = await self.session.execute(select(self.model).filter(self.model.id == id))
            obj = result.scalars().first()
            if not obj:
                 raise ControllerError(f"{self.model.__name__} not found, it may have already been deleted.", status_code=404)
            
            # Process data before delete to avoid accessing expired/deleted objects
            data = self._process_data(obj)
            await self.session.delete(obj)
            await self.session.commit()
            return {"msg": "Deleted successful!", "data": data}
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            await self.session.rollback()
            raise ControllerError(str(e))
