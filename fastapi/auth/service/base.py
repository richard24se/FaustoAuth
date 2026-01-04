import logging
from typing import Any, Generic, Type, TypeVar

from fausto import ControllerError
from fausto.context import tenant_context
from fausto.sqlalch import (
    get_filter_fields_multi_sqlalch,
    get_order_fields_multi_sqlalch,
    remove_fields_sqlalch,
    to_dict,
)
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.encoders import jsonable_encoder

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base class for CRUD operations.

    This class provides default methods for Create, Read, Update, and Delete operations
    on a given SQLAlchemy model.
    """

    def __init__(
        self,
        model: Type[ModelType],
        session: AsyncSession,
        exclude_fields: list[str] | None = None,
    ):
        """
        Initialize the CRUD object.

        Args:
            model (Type[ModelType]): The SQLAlchemy model class.
            session (AsyncSession): The SQLAlchemy async session.
            exclude_fields (list[str] | None, optional): List of fields to exclude from the response. Defaults to None.
        """
        self.model = model
        self.session = session
        self.exclude_fields = exclude_fields or []

    @property
    def current_tenant(self) -> int | None:
        """Returns the current tenant ID from the context variable, if set."""
        return tenant_context.get()

    def _apply_tenant_filter(self, query):
        """Applies tenant filter if context is set and model has tenant_id."""
        tid = self.current_tenant
        if tid and hasattr(self.model, "tenant_id"):
            return query.filter(self.model.tenant_id == tid)
        return query

    def _process_data(self, obj: Any) -> dict[str, Any]:
        """
        Convert the object to a dictionary and remove excluded fields.

        Args:
            obj (Any): The SQLAlchemy object.

        Returns:
            dict[str, Any]: The processed dictionary.
        """
        data = to_dict(obj)
        if self.exclude_fields:
            return remove_fields_sqlalch(data, self.exclude_fields)
        return data

    async def get(self, id: Any) -> dict[str, Any] | None:
        """
        Retrieve a single object by its ID.

        Args:
            id (Any): The primary key of the object.

        Returns:
            dict[str, Any] | None: The object as a dictionary, or None (raises 404).

        Raises:
            ControllerError: If the object is not found (404) or on generic error (500).
        """
        try:
            query = select(self.model).filter(self.model.id == id)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            obj = result.scalars().first()
            if not obj:
                raise ControllerError(f"{self.model.__name__} not found.", status_code=404)
            return self._process_data(obj)
        except ControllerError:
            raise
        except Exception as e:
            logging.error(f"Error getting {self.model.__name__} {id}: {e}")
            raise ControllerError(str(e))

    async def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] | None = None,
        order_by: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieve multiple objects with optional filtering and pagination.

        Args:
            skip (int): Number of records to skip. Defaults to 0.
            limit (int): Maximum number of records to return. Defaults to 100.
            filters (dict[str, Any] | None): Dictionary of filter criteria.
            order_by (list[str] | None): List of fields to order by.

        Returns:
            list[dict[str, Any]]: A list of objects as dictionaries.
        """
        try:
            query = select(self.model)
            query = self._apply_tenant_filter(query)

            if filters:
                query = query.filter(*get_filter_fields_multi_sqlalch(filters, self.model))

            if order_by:
                query = query.order_by(*get_order_fields_multi_sqlalch(order_by, self.model))

            query = query.offset(skip).limit(limit)
            result = await self.session.execute(query)
            objects = result.scalars().all()

            return [self._process_data(obj) for obj in objects]
        except Exception as e:
            logging.error(f"Error fetching multiple {self.model.__name__}: {e}")
            raise ControllerError(str(e))

    async def create(self, *, obj_in: CreateSchemaType | dict[str, Any]) -> dict[str, Any]:
        """
        Create a new object in the database.

        Args:
            obj_in (CreateSchemaType | dict[str, Any]): The data to create the object from.

        Returns:
            dict[str, Any]: The created object as a dictionary.
        """
        try:
            if isinstance(obj_in, dict):
                obj_in_data = obj_in
            else:
                obj_in_data = jsonable_encoder(obj_in)

            # Automatically assign tenant_id if available and not explicitly provided?
            # Or just rely on validation?
            # If tenant context is present, we should probably enforce it for creation too.
            # Force tenant_id to user's tenant if strictly scoped
            tid = self.current_tenant
            if tid and hasattr(self.model, "tenant_id"):
                obj_in_data["tenant_id"] = tid

            db_obj = self.model(**obj_in_data)
            self.session.add(db_obj)
            await self.session.commit()
            await self.session.refresh(db_obj)
            return self._process_data(db_obj)
        except Exception as e:
            logging.error(f"Error creating {self.model.__name__}: {e}")
            await self.session.rollback()
            raise ControllerError(str(e))

    async def update(
        self,
        *,
        id: Any,
        obj_in: UpdateSchemaType | dict[str, Any],
    ) -> dict[str, Any]:
        """
        Update an existing object.

        Args:
            id (Any): The ID of the object to update.
            obj_in (UpdateSchemaType | dict[str, Any]): The update data.

        Returns:
            dict[str, Any]: The updated object as a dictionary.

        Raises:
            ControllerError: If the object is not found (404).
        """
        try:
            # Enforce scoping on update
            query = select(self.model).filter(self.model.id == id)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
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
            return self._process_data(db_obj)
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            logging.error(f"Error updating {self.model.__name__} {id}: {e}")
            await self.session.rollback()
            raise ControllerError(str(e))

    async def get_multi_by_query(
        self,
        query: Any,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """
        Retrieve multiple objects using a custom composed query.
        Applies tenant filtering automatically.

        Args:
            query (Any): The SQLAlchemy select statement.
            skip (int): Number of records to skip. Defaults to 0.
            limit (int): Maximum number of records to return. Defaults to 100.

        Returns:
            list[dict[str, Any]]: A list of objects as dictionaries.
        """
        try:
            query = self._apply_tenant_filter(query)
            query = query.offset(skip).limit(limit)
            result = await self.session.execute(query)
            objects = result.scalars().all()
            return [self._process_data(obj) for obj in objects]
        except Exception as e:
            logging.error(f"Error fetching custom query for {self.model.__name__}: {e}")
            raise ControllerError(str(e))

    async def remove(self, *, id: int) -> dict[str, Any]:
        """
        Delete an object by its ID.

        Args:
            id (int): The ID of the object to delete.

        Returns:
            dict[str, Any]: The deleted object as a dictionary.

        Raises:
            ControllerError: If the object is not found (404).
        """
        try:
            # Enforce scoping on delete
            query = select(self.model).filter(self.model.id == id)
            query = self._apply_tenant_filter(query)
            result = await self.session.execute(query)
            obj = result.scalars().first()
            if not obj:
                raise ControllerError(
                    f"{self.model.__name__} not found, it may have already been deleted.", status_code=404
                )

            # Process data before delete to avoid accessing expired/deleted objects
            data = self._process_data(obj)
            await self.session.delete(obj)
            await self.session.commit()
            return data
        except ControllerError:
            await self.session.rollback()
            raise
        except Exception as e:
            logging.error(f"Error deleting {self.model.__name__} {id}: {e}")
            await self.session.rollback()
            raise ControllerError(str(e))
