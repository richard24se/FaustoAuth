# DB LAYER
import logging

from auth.model.models import User
from config.databases import SQLALCH_AUTH, token_store
from config.settings import ACCESS_EXPIRES
from fausto.fapi import fapi_wrapper
from fausto.jwt import decode_auth_token, encode_auth_token, encode_refresh_auth_token
from fausto.redis import redis_create_key
from fausto.sqlalch import qf_sqlalch, remove_fields_sqlalch, sqlalch_wrapper


@fapi_wrapper(status_code=401)
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def validate_user(s, username, password, refresh_token: bool = False):
    response = {"msg": "", "error": False, "data": None}
    logging.debug(str(username))
    user = s.query(User).filter(User.username == username).first()
    # pendiente agregar encriptado
    if not user:
        response["msg"] = "User doesn't exist!"
        response["error"] = True
    elif user.password != password:
        response["msg"] = "Incorrect password!"
        response["error"] = True
    else:
        # Creating token
        access_token = encode_auth_token(user.username)
        redis_create_key(key=access_token, value="false")
        response.update({"msg": "User OK", "data": {"access_token": access_token}})
        if refresh_token:
            refresh_token = encode_refresh_auth_token(user.username)
            response.get("data").update({"refresh_token": refresh_token})
        user_dict = dict(**qf_sqlalch(user))
        user_dict = remove_fields_sqlalch(
            user_dict, ["password", "created_date", "modificated_date"]
        )
        response.get("data").update(user_dict)
    return response


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def revoke_user(s, token):
    token_store.set(token, "true", ACCESS_EXPIRES * 1.2)
    response = {
        "msg": "User logout, token revoked succcessful",
        "error": False,
        "data": None,
    }
    return response


@fapi_wrapper(status_code=403)
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def check_blacklist_user(s, token):
    response = {"msg": "", "error": False, "data": None}
    entry = token_store.get(token)
    if entry == "true":
        response["msg"] = "This token was banned in blacklist"
        response["error"] = True
    elif entry is None:
        response["msg"] = "This token doesn't exists"
        response["error"] = True
    logging.debug(type(entry))
    logging.debug("Token from redis cache: " + str(entry))
    return response


@fapi_wrapper(status_code=403)
def refresh_user(token):
    payload = decode_auth_token(token=token)
    if payload.get("type") == "access" or token_store.get(token):
        return {"msg": "this is access token", "error": True}

    access_token = encode_refresh_auth_token(payload.get("username"))
    redis_create_key(access_token, "true")
    logging.debug(payload)
    return {
        "msg": "access token generate successful",
        "error": False,
        "data": {"access_token": access_token, "refresh_token": token},
    }
