#LIBRARY LAYER
from flask import Flask, jsonify, request
from flask_restful import Api, Resource
from flask_cors import CORS
from datetime import timedelta
from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, get_jti,
    jwt_refresh_token_required, get_jwt_identity, jwt_required, get_raw_jwt
)
import logging
import jwt
import redis

#APP LIBRARY LAYER
from auth.user import createUser, updateUser, deleteUser, getUser, getUsers, getUserName, validateUser
from auth.rol import createRol, updateRol, deleteRol, getRol, getRols
from auth.permission import createPermission, updatePermission, deletePermission, getPermission, getPermissions
from auth.permission_type import createPermissionType, updatePermissionType, deletePermissionType, getPermissionType, getPermissionTypes
from auth.object import createObject, updateObject, deleteObject, getObject, getObjects
from auth.object_type import createObjectType, updateObjectType, deleteObjectType, getObjectType, getObjectTypes
from auth.auditing import createAuditing, updateAuditing, deleteAuditing, getAuditing, getAuditings
from auth.auditing_type import createAuditingType, updateAuditingType, deleteAuditingType, getAuditingType, getAuditingTypes

from fausto.utils import tryWrapper, jsonVerify, jsonWrapper

#DB LAYER
from model.config import SQLALCH_AUTH


#APP LAYER
APP = Flask(__name__)
APP.config.from_object(__name__)
CORS(APP) #EXPLICAR CON REACT
API = Api(APP)

blacklist = set()


#JWT LAYER
APP.config['JWT_SECRET_KEY'] = 'super-secret'
APP.config['JWT_BLACKLIST_ENABLED'] = True
APP.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
#JWT EXPIRES!
ACCESS_EXPIRES = timedelta(minutes=15)
REFRESH_EXPIRES = timedelta(days=1)
APP.config['JWT_ACCESS_TOKEN_EXPIRES'] = ACCESS_EXPIRES
APP.config['JWT_REFRESH_TOKEN_EXPIRES'] = REFRESH_EXPIRES
jwt = JWTManager(APP)



#LOGIC LAYER
class Init(Resource):
    def get(self):
        return {
            'init': 'flask',
            'msg': 'This is a Vorlage App'
        }
    def post(self):
        return {
            'init': 'flask',
            'msg': 'This is a Vorlage App'
        }

class ManageUser(Resource):

    def get(self, id=None):
        if id:
            return getUser(id)
        else:
            return getUsers()

    @jsonWrapper
    def post(self):
        data=request.json
        return createUser(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updateUser(id, data)

    def delete(self, id):
        return deleteUser(id)

class ApiRol(Resource):

    def get(self, id=None):
        if id:
            return getRol(id)
        else:
            return getRols()

    @jsonWrapper
    def post(self):
        data=request.json
        return createRol(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updateRol(id, data)

    def delete(self, id):
        return deleteRol(id)

class ApiPermission(Resource):

    def get(self, id=None):
        if id:
            return getPermission(id)
        else:
            return getPermissions()

    @jsonWrapper
    def post(self):
        data=request.json
        return createPermission(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updatePermission(id, data)

    def delete(self, id):
        return deletePermission(id)

class ApiPermissionType(Resource):

    def get(self, id=None):
        if id:
            return getPermissionType(id)
        else:
            return getPermissionTypes()

    @jsonWrapper
    def post(self):
        data=request.json
        return createPermissionType(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updatePermissionType(id, data)

    def delete(self, id):
        return deletePermissionType(id)

class ApiObject(Resource):

    def get(self, id=None):
        if id:
            return getObject(id)
        else:
            return getObjects()

    @jsonWrapper
    def post(self):
        data=request.json
        return createObject(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updateObject(id, data)

    def delete(self, id):
        return deleteObject(id)

class ApiObjectType(Resource):

    def get(self, id=None):
        if id:
            return getObjectType(id)
        else:
            return getObjectTypes()

    @jsonWrapper
    def post(self):
        data=request.json
        return createObjectType(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updateObjectType(id, data)

    def delete(self, id):
        return deleteObjectType(id)

class ApiAuditing(Resource):

    def get(self, id=None):
        if id:
            return getAuditing(id)
        else:
            return getAuditings()

    @jsonWrapper
    def post(self):
        data=request.json
        return createAuditing(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updateAuditing(id, data)

    def delete(self, id):
        return deleteAuditing(id)

class ApiAuditingType(Resource):

    def get(self, id=None):
        if id:
            return getAuditingType(id)
        else:
            return getAuditingTypes()

    @jsonWrapper
    def post(self):
        data=request.json
        return createAuditingType(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return updateAuditingType(id, data)

    def delete(self, id):
        return deleteAuditingType(id)

#REDIS LAYER
revoked_store = redis.StrictRedis(host='auth_cache', port=6379, db=0,decode_responses=True)


#JWT LAYER LOGIC 
@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    entry = revoked_store.get(jti)
    logging.debug("Token from cache: "+str(entry))
    if entry is None:
        return True
    return entry == 'true'

@jwt_refresh_token_required
def refresh(self):
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    access_jti = get_jti(encoded_token=access_token)
    revoked_store.set(access_jti, 'false', ACCESS_EXPIRES * 1.2)
    ret = {
        'access_token': access_token,
        'time': str(ACCESS_EXPIRES)
    }
    cache_token_keys = revoked_store.keys()
    cache_token_value = revoked_store.mget(cache_token_keys)
    logging.debug("Cache keys/values: "+str(dict(zip(cache_token_keys, cache_token_value))))
    return ret


@jwt_refresh_token_required
def revokeRefreshToken(self):
    jti = get_raw_jwt()['jti']
    revoked_store.set(jti, 'true', REFRESH_EXPIRES * 1.2)
    return {"msg": "Successfully logged out"}

@jwt_required
def revokeAccessToken(self):
    jti = get_raw_jwt()['jti']
    revoked_store.set(jti, 'true', REFRESH_EXPIRES * 1.2)
    return {"msg": "Successfully logged out"}

@jwt_required
def verifyToken(self):
    jti = get_raw_jwt()['jti']
    entry = revoked_store.get(jti)
    logging.debug("Token from cache: "+str(entry))
    if entry is None:
        return False
    elif entry == 'true':
        return False
    else:
        return True

class Auth(Resource):

    def get(self):
        ret = verifyToken(self)
        if ret:
            return {"msg": "Token is valid!", "valid": ret}
        else:
            return {"msg": "Token is invalid!", "valid": ret}
            
    def post(self):
        logging.info(request)
        #VERIFY DATA
        if request.data:
            logging.debug("Has data: "+str(request.data))
            logging.debug("Has JSON data")
            username = request.json.get('username', None)
            password = request.json.get('password', None)
            option = request.json.get('option', None)
        else:
            logging.debug("Hasn't JSON data")
            return { "msg": "Please provide JSON" }
        
        if option == 'login':
            user_validade=validateUser(username, password)
            logging.debug(str(user_validade))
            # if username != 'test':
            #     return { "msg": "Bad username or password" }, 500
            if user_validade.get('error'):
                return user_validade
            access_token = create_access_token(identity=username)
            refresh_token = create_refresh_token(identity=username)

            ret = {
            'access_token': access_token,
            'refresh_token': refresh_token
            }
            #save to cache
            access_jti = get_jti(encoded_token=access_token)
            refresh_jti = get_jti(encoded_token=refresh_token)
            revoked_store.set(access_jti, 'false', ACCESS_EXPIRES * 1.2)
            revoked_store.set(refresh_jti, 'false', REFRESH_EXPIRES * 1.2)
            cache_token_keys = revoked_store.keys()
            cache_token_value = revoked_store.mget(cache_token_keys)

            logging.debug("Cache keys: "+str(cache_token_keys))
            logging.debug("Cache values: "+str(cache_token_value))
            logging.debug("Cache keys/values: "+str(dict(zip(cache_token_keys, cache_token_value))))
            logging.debug("Response success login: "+str(ret))
            return ret
        elif option == 'refresh':
            return refresh(self)
        else:
            return { "msg": "Please provide valid option!" }

    def delete(self):
        logging.info(request)
        #VERIFY DATA
        if request.data:
            logging.debug("Has data: "+str(request.data))
            logging.debug("Has JSON data")
            option = request.json.get('option', None)
        else:
            logging.debug("Hasn't JSON data")
            return { "msg": "Please provide JSON" }
        if option == 'access':
            return revokeAccessToken(self)
        elif option == 'refresh':
            return revokeRefreshToken(self)
        else:
            return { "msg": "Please provide valid option!" }
        


class TestAuth(Resource):
    @jwt_required
    def get(self):
        logging.debug(str(self))
        return { 'username': str(get_jwt_identity()) }

class TestPermissionUser(Resource):
    @jwt_required
    def get(self):
        logging.debug(str(self))
        return getUserName(str(get_jwt_identity()))

#URL LAYER
API.add_resource(Init, '/')
API.add_resource(Auth, '/auth')
API.add_resource(TestAuth, '/test')
API.add_resource(ManageUser, '/user', '/user/<int:id>')
API.add_resource(ApiRol, '/rol', '/rol/<int:id>')
API.add_resource(ApiPermission, '/permission', '/permission/<int:id>')
API.add_resource(ApiPermissionType, '/permission_types', '/permission_types/<int:id>')
API.add_resource(ApiObject, '/object', '/object/<int:id>')
API.add_resource(ApiObjectType, '/object_types', '/object_types/<int:id>')
API.add_resource(ApiAuditing, '/auditing', '/auditing/<int:id>')
API.add_resource(ApiAuditingType, '/auditing_types', '/auditing_types/<int:id>')
API.add_resource(TestPermissionUser, '/permission_user', '/permission_user/<int:id>')


#DEBUG
from logging.config import dictConfig
DEBUG = True

FORMAT = '[%(asctime)s] %(levelname)s in %(module)s:%(filename)s on line ->%(lineno)d %(message)s' if DEBUG == True else '[%(asctime)s] %(levelname)s in %(module)s:%(filename)s %(message)s'

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': FORMAT,
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'loggers': {
        '': {  # root logger
            'level': 'DEBUG' if DEBUG == True else 'INFO',
            'handlers': ['wsgi'],
           # 'propagate': False
        },
        'sqlalchemy.engine': {
            'level': 'INFO' if DEBUG == True else 'ERROR',
            'handlers': ['wsgi'],
            'propagate': False
        }
    }
})


#SERVE LAYER
if __name__ == '__main__':
    APP.run(host='0.0.0.0', port=5000, debug=True, threaded=True)


