# fastapi/fausto/sqlalch.py
# -*- coding: utf-8 -*-
import datetime as dt
import logging
import re
from decimal import Decimal
from functools import wraps
from typing import Any, Callable, Type, TypeVar

from fastapi import Depends # Import Depends
from sqlalchemy import desc, func, text # Import text for execute
from sqlalchemy import inspect as inspect_sqlalch
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
from sqlalchemy.orm import class_mapper, load_only

from . import ControllerError

F = TypeVar("F", bound=Callable[..., Any]) # Define TypeVar for Callable


def to_dict(obj: Any) -> dict[str, Any] | None:
    """Recursively converts a SQLAlchemy object (or a list of them) into a dictionary.

    Handles dates, datetimes, times, and decimals.

    Args:
        obj (Any): The SQLAlchemy object or list of objects to convert.

    Returns:
        dict[str, Any] | None: The dictionary representation of the object(s), or None if input is None.
    """
    if obj is None:
        return None

    if isinstance(obj, list):
        return [to_dict(item) for item in obj]

    data = {}
    if hasattr(obj, "_asdict"):  # For row-like objects from queries
        data = obj._asdict()
    elif hasattr(obj, "__dict__"):  # For standard SQLAlchemy models
        data = obj.__dict__.copy()
        data.pop("_sa_instance_state", None)
    else:
        return obj  # Not a convertible object

    for key, value in data.items():
        if isinstance(value, (dt.datetime, dt.date, dt.time)):
            data[key] = value.isoformat()
        elif isinstance(value, Decimal):
            data[key] = float(value)
    return data


# Alias for backward compatibility if needed, but direct use of to_dict is preferred.
qf_sqlalch = to_dict
quick_format_sqlalch = to_dict


def async_sqlalch_wrapper(func: F) -> Callable[..., Any]: # No longer takes sqlalch_scoped_session_factory
    """Decorator to manage SQLAlchemy session lifecycle and handle exceptions for async functions.

    It assumes the decorated function receives an AsyncSession via FastAPI's Depends.
    It handles commit, rollback, and closing (implicitly via Depends) and exception handling.

    Args:
        func (Callable): The asynchronous function to wrap.

    Returns:
        Callable: The wrapped asynchronous function.
    """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        # The session is expected to be passed as the first argument (s)
        # or via dependency injection in kwargs.
        # We assume it's already managed by FastAPI's Depends.
        session: AsyncSession | None = kwargs.get("s")
        if session is None and args:
            possible_session = args[0]
            if isinstance(possible_session, AsyncSession):
                session = possible_session
            elif hasattr(possible_session, "session") and isinstance(possible_session.session, AsyncSession):
                session = possible_session.session

        if not isinstance(session, AsyncSession):
            logging.error("async_sqlalch_wrapper: Session object is not AsyncSession or not found.")
            # Fallback or raise an error if session is not correctly injected
            raise TypeError("AsyncSession not correctly injected into wrapped function.")

        try:
            result = await func(*args, **kwargs)
            await session.commit() # Commit changes
            return result
        except IntegrityError as e:
            logging.exception("SQLAlchemy IntegrityError in %s", func.__name__)
            await session.rollback()
            return {
                "error": True,
                "message": "Data integrity conflict. A similar record may already exist.",
            }
        except OperationalError as e:
            logging.exception("SQLAlchemy OperationalError in %s", func.__name__)
            await session.rollback()
            return {"error": True, "message": f"Database connection error: {e}"}
        except SQLAlchemyError as e:
            logging.exception("SQLAlchemyError in %s", func.__name__)
            await session.rollback()
            return {"error": True, "message": f"A database error occurred: {e}"}
        except ControllerError as e:
            logging.debug("ControllerError in %s: %s", func.__name__, e)
            await session.rollback() # Rollback on ControllerError as well
            error_dict = {"error": True, "message": e.message if hasattr(e, "message") else str(e)}
            if hasattr(e, "data") and e.data:
                error_dict["data"] = e.data
            elif len(e.args) > 1:
                 error_dict["data"] = e.args[1]
            
            if hasattr(e, "status_code"):
                error_dict["status_code"] = e.status_code
            
            return error_dict
        except Exception as e:
            logging.exception("Unhandled exception in %s", func.__name__)
            await session.rollback()
            return {"error": True, "message": "An unexpected server error occurred."}
        finally:
            # Session closing is handled by FastAPI's Depends(get_async_db)
            pass

    return wrapper


def get_columns_sqlalch(model: Type) -> list[str]:
    """Returns a list of column names for a given SQLAlchemy model.

    Args:
        model (Type): The SQLAlchemy model class.

    Returns:
        list[str]: A list of column names.
    """
    return model.__table__.columns.keys()


def get_primary_keys_sqlalch(model: Type) -> list[str]:
    """Returns a list of primary key column names for a given model.

    Args:
        model (Type): The SQLAlchemy model class.

    Returns:
        list[str]: A list of primary key column names.
    """
    return [key.name for key in inspect_sqlalch(model).primary_key]


def get_prefix_fields_sqlalch(cols: list[str], model: Type, prefix: str) -> list:
    """Gets a list of model columns with a string prefix for aliasing.

    Args:
        cols (list[str]): A list of column names.
        model (Type): The SQLAlchemy model class.
        prefix (str): The prefix string to add.

    Returns:
        list: A list of aliased model column objects.
    """
    return [getattr(model, k).label(f"{prefix}{k}") for k in cols]


def get_fields_sqlalch(cols: list[str], model: Type) -> list:
    """Gets a list of model column objects from a list of column names.

    Args:
        cols (list[str]): A list of column names.
        model (Type): The SQLAlchemy model class.

    Returns:
        list: A list of model column objects.
    """
    return [getattr(model, k) for k in cols]


def get_filter_fields_multi_sqlalch(dictionary_filter: dict[str, Any], model: Type) -> tuple:
    """Builds a tuple of SQLAlchemy filter conditions from a dictionary.

    Supports simple equality, list membership (in_), 'null', and range operators.

    Args:
        dictionary_filter (dict[str, Any]): A dictionary of filter criteria.
        model (Type): The SQLAlchemy model class.

    Returns:
        tuple: A tuple of SQLAlchemy filter conditions.
    """
    filters = []
    for key, value in dictionary_filter.items():
        if not hasattr(model, key):
            continue

        column = getattr(model, key)
        if isinstance(value, list):
            filters.append(column.in_(value))
        elif value == "null":
            filters.append(column.is_(None))
        elif isinstance(value, str):
            if "<>" in value:
                start, end = value.split("<>", 1)
                filters.append(column.between(start, end))
            elif value.startswith("<="):
                filters.append(column <= value.removeprefix("<="))
            elif value.startswith("<"):
                filters.append(column < value.removeprefix("<"))
            elif value.startswith(">="):
                filters.append(column >= value.removeprefix(">="))
            elif value.startswith(">"):
                filters.append(column > value.removeprefix(">"))
            else:
                filters.append(column == value)
        else:
            filters.append(column == value)
    logging.debug("Generated filters: %s", filters)
    return tuple(filters)


def get_order_fields_multi_sqlalch(list_order: list[str], model: Type) -> tuple:
    """Builds a tuple of SQLAlchemy order-by conditions from a list of strings.

    Args:
        list_order (list[str]): A list of strings specifying the order (e.g., ">column_name" for descending).
        model (Type): The SQLAlchemy model class.

    Returns:
        tuple: A tuple of SQLAlchemy order-by conditions.
    """
    orders = []
    for field_order in list_order:
        if field_order.startswith(">"):
            col_name = field_order.removeprefix(">")
            if hasattr(model, col_name):
                orders.append(desc(getattr(model, col_name)))
        else:
            col_name = field_order.removeprefix("<")
            if hasattr(model, col_name):
                orders.append(getattr(model, col_name))
    logging.debug("Generated orders: %s", orders)
    return tuple(orders)


def remove_fields_sqlalch(dictionary_object: dict[str, Any], fields_to_remove: list[str]) -> dict[str, Any]:
    """Returns a new dictionary with specified fields removed.

    Args:
        dictionary_object (dict[str, Any]): The input dictionary.
        fields_to_remove (list[str]): A list of field names to remove.

    Returns:
        dict[str, Any]: A new dictionary with the specified fields removed.
    """
    return {k: v for k, v in dictionary_object.items() if k not in fields_to_remove}


def remove_none_fields_sqlalch(dictionary_object: dict[str, Any]) -> dict[str, Any]:
    """Returns a new dictionary with all None-valued fields removed.

    Args:
        dictionary_object (dict[str, Any]): The input dictionary.

    Returns:
        dict[str, Any]: A new dictionary with None-valued fields removed.
    """
    return {k: v for k, v in dictionary_object.items() if v is not None}


def show_query(query):
    """Logs the compiled SQL statement of a SQLAlchemy query object.

    Args:
        query: The SQLAlchemy query object.
    """
    logging.debug("Compiled query: %s", str(query.statement.compile()))