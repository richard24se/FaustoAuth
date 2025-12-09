import logging
from functools import wraps
import inspect # Import inspect
from typing import Any, Callable, Optional, TypeVar

from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

F = TypeVar("F", bound=Callable[..., Any])


class Response(BaseModel):
    """Standard API response model."""

    msg: str
    error: bool = False
    data: Optional[Any] = None


def _unpack_tuple_response(response: tuple) -> dict[str, Any]:
    """Unpacks a tuple response into a dictionary."""
    msg = ""
    data = None
    error = False
    for item in response:
        if isinstance(item, bool):
            error = item
        elif isinstance(item, (dict, list)) or item is None:
            data = item
        elif isinstance(item, str):
            msg = item
    return {"msg": msg, "error": error, "data": data}


def fapi_wrapper(_func: F | None = None, *, status_code: int = 500):
    """
    A decorator for FastAPI endpoints that standardizes responses and error handling,
    with support for both synchronous and asynchronous functions.

    It wraps the function's return value in a standardized dictionary format.
    - If the function returns a tuple, it's unpacked into {msg, data, error}.
    - If it returns a string, it's wrapped as {msg, error=False, data=None}.
    - If it returns a dictionary, it's used as is.

    If the resulting dictionary has 'error': True, it raises an HTTPException.
    """

    def decorator(func: F) -> Callable[..., Any]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> dict[str, Any]: # Make wrapper async
            if inspect.iscoroutinefunction(func):
                response = await func(*args, **kwargs) # Await async functions
            else:
                response = func(*args, **kwargs) # Call sync functions directly

            logging.debug("Original response from service: %s", response)

            if isinstance(response, tuple):
                response_dict = _unpack_tuple_response(response)
            elif isinstance(response, str):
                response_dict = {"msg": response, "error": False, "data": None}
            elif isinstance(response, dict):
                response_dict = response
            else:
                # This case is not expected based on current service implementations,
                # but we handle it defensively.
                response_dict = {
                    "msg": "Unhandled response type from service",
                    "error": True,
                    "data": str(response),
                }

            if response_dict.get("error"):
                code = response_dict.get("status_code", status_code)
                raise HTTPException(status_code=int(code), detail=response_dict)

            response_dict.setdefault("error", False)
            return response_dict

        return wrapper

    if _func is None:
        return decorator
    return decorator(_func)


fapi_get_bearer_token = OAuth2PasswordBearer(tokenUrl="token")
