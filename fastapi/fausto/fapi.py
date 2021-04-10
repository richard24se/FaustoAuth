from pydantic import BaseModel
from typing import Optional, Any, Union
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
import logging


class Response(BaseModel):
    msg: str
    error: bool
    data: Optional[Any]


def unpacking_tuple_response(response: tuple) -> dict:
    msg = ""
    data = None
    error = False
    for i in response:
        if isinstance(i, bool):
            error = i
        elif isinstance(i, dict) or isinstance(i, list) or not i:
            data = i
        elif isinstance(i, str):
            msg = i

    return {'msg': msg, 'error': error, 'data': data}


def unpacking_str_response(response: tuple) -> dict:
    return {'msg': response, 'error': False, 'data': None}


def fapi_wrapper(*args, **kwargs):
    # extract kwargs and set default values
    status_code = kwargs.get('status_code', 500)

    def decorator(function):
        def wrapper(*args, **kwargs):
            response = function(*args, **kwargs)
            logging.debug(response)
            if isinstance(response, tuple):
                response = unpacking_tuple_response(response)
            if isinstance(response, str):
                response = unpacking_str_response(response)
            if type(response) is dict and 'error' in response and response.get('error'):
                raise HTTPException(status_code=status_code,
                                    detail=dict(**response))
            if 'error' not in response:
                response.update({'error': False})
            return response
        return wrapper
    # verify if first argument es  function
    if len(args) == 1 and callable(args[0]):
        return decorator(args[0])
    else:
        return decorator


fapi_get_bearer_token = OAuth2PasswordBearer(tokenUrl="token")
