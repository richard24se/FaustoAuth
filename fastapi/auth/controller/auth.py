

import logging
from fastapi import APIRouter, Depends
from fastapi import Body
from pydantic import BaseModel
from typing import Optional, Any, Union

from auth.handlers import JWTBearer
from fausto.fapi import Response, fapi_get_bearer_token
from auth.service.auth import validate_user, revoke_user, check_blacklist_user, refresh_user


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    # dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


class Credential(BaseModel):
    username: str
    password: str


@router.get("/token", response_model=Response, dependencies=[Depends(JWTBearer())])
async def validate_token(token: str = Depends(fapi_get_bearer_token)):
    check_blacklist_user(token)
    return {'msg': "Token is valid", 'error': False}


@router.post("/token/refresh", response_model=Response, dependencies=[Depends(JWTBearer())])
async def refresh_token(token: str = Depends(fapi_get_bearer_token)):
    return refresh_user(token)


@router.post("/login", response_model=Response,)
async def login(credential: Credential, refresh_token: bool = False):
    user_validade = validate_user(**credential.__dict__, refresh_token=refresh_token)
    respuesta = Response(**user_validade)
    return respuesta


@router.delete("/logout", response_model=Response, dependencies=[Depends(JWTBearer())])
async def logout(token: str = Depends(fapi_get_bearer_token)):
    check_blacklist_user(token)
    return revoke_user(token)

# @router.get("/grupos_postulantes", response_model=Response)
# async def read_obtener_grupo_etapas(fecha: str):
#     data = obtener_grupo_etapas(fecha)
#     respuesta = Response(**data)
#     return respuesta

# @router.get("/postulantes", response_model=Response)
# async def read_obtener_postulantes(grupo_postulante_id: str = None, etapa_id: int= None):
#     data = obtener_postulantes(grupo_postulante_id, etapa_id)
#     respuesta = Response(**data)
#     return respuesta

# @router.post("/")
# async def insert_item(etapa: Etapa, test_id: Optional[int] = None,  body=Body(...)):
#     return body

router_auth = router


# class Auth(Resource):

#     def get(self):
#         ret = verify_token(self)
#         logging.debug(ret)
#         if ret:
#             return {"msg": "Token is valid!", "valid": ret}
#         else:
#             return {"msg": "Token is invalid!", "valid": ret}

#     def post(self):
#         logging.info(request)
#         # VERIFY DATA
#         if request.data:
#             logging.debug("Has data: "+str(request.data))
#             logging.debug("Has JSON data")
#             username = request.json.get('username', None)
#             password = request.json.get('password', None)
#             option = request.json.get('option', None)
#         else:
#             logging.debug("Hasn't JSON data")
#             return {"msg": "Please provide JSON"}

#         if option == 'login':
#             user_validade = validate_user(username, password)
#             logging.debug(str(user_validade))
#             if user_validade.get('error'):
#                 return user_validade
#             access_token = create_access_token(identity=username)
#             refresh_token = create_refresh_token(identity=username)

#             ret = {
#                 'access_token': access_token,
#                 'refresh_token': refresh_token,
#                 'error': False
#             }
#             # save to cache
#             access_jti = get_jti(encoded_token=access_token)
#             refresh_jti = get_jti(encoded_token=refresh_token)
#             revoked_store.set(access_jti, 'false', ACCESS_EXPIRES * 1.2)
#             revoked_store.set(refresh_jti, 'false', REFRESH_EXPIRES * 1.2)
#             cache_token_keys = revoked_store.keys()
#             cache_token_value = revoked_store.mget(cache_token_keys)

#             logging.debug("Cache keys: "+str(cache_token_keys))
#             logging.debug("Cache values: "+str(cache_token_value))
#             logging.debug("Cache keys/values: " +
#                           str(dict(zip(cache_token_keys, cache_token_value))))
#             logging.debug("Response success login: "+str(ret))
#             return ret
#         elif option == 'refresh':
#             return refresh_token(self)
#         else:
#             return {"msg": "Please provide valid option!"}
#     @jwt_required
#     def delete(self):
#         logging.info(request)
#         # VERIFY DATA
#         if request.data:
#             logging.debug("Has data: "+str(request.data))
#             logging.debug("Has JSON data")
#             option = request.json.get('option', None)
#         else:
#             logging.debug("Hasn't JSON data")
#             return {"msg": "Please provide JSON"}
#         if option == 'access':
#             return revoke_access_token(self)
#         elif option == 'refresh':
#             return revoke__refresh_token(self)
#         else:
#             return {"msg": "Please provide valid option!"}
