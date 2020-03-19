from flask import Flask, jsonify, request
from flask_restful import Api, Resource
import logging

from fausto.utils import tryWrapper, jsonVerify, jsonWrapper
from flask_jwt_extended import get_jwt_identity

#APP LIBRARY LAYER
from auth.user import create_user, update_user, delete_user, get_user, get_users, get_user_name, validate_user
from auth.rol import create_rol, update_rol, delete_rol, get_rol, get_rols
from auth.permission import create_permission, update_permission, delete_permission, get_permission, get_permissions
from auth.permission_type import create_permission_type, update_permission_type, delete_permission_type, get_permission_type, get_permission_types
from auth.object import create_object, update_object, delete_object, get_object, get_objects
from auth.object_type import create_object_type, update_object_type, delete_object_type, get_object_type, get_object_types
from auth.auditing import create_auditing, update_auditing, delete_auditing, get_auditing, get_auditings
from auth.auditing_type import create_auditing_type, update_auditing_type, delete_auditing_type, get_auditing_type, get_auditing_types

class ApiUser(Resource):

    def get(self, id=None):
        if id:
            return get_user(id)
        else:
            return get_users()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_user(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_user(id, data)

    def delete(self, id):
        return delete_user(id)

class ApiRol(Resource):

    def get(self, id=None):
        if id:
            return get_rol(id)
        else:
            return get_rols()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_rol(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_rol(id, data)

    def delete(self, id):
        return delete_rol(id)

class ApiPermission(Resource):

    def get(self, id=None):
        user = request.args.to_dict().get('user')
        object = request.args.to_dict().get('object')
        if user and object:
            return get_permission(object, user)
        elif id and not user:
            return get_permission(id)
        else:
            return get_permissions()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_permission(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_permission(id, data)

    def delete(self, id):
        return delete_permission(id)

class ApiPermissionType(Resource):

    def get(self, id=None):
        if id:
            return get_permission_type(id)
        else:
            return get_permission_types()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_permission_type(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_permission_type(id, data)

    def delete(self, id):
        return delete_permission_type(id)

class ApiObject(Resource):

    def get(self, id=None):
        if id:
            return get_object(id)
        else:
            return get_objects()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_object(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_object(id, data)

    def delete(self, id):
        return delete_object(id)

class ApiObjectType(Resource):

    def get(self, id=None):
        if id:
            return get_object_type(id)
        else:
            return get_object_types()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_object_type(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_object_type(id, data)

    def delete(self, id):
        return delete_object_type(id)

class ApiAuditing(Resource):

    def get(self, id=None):
        if id:
            return get_auditing(id)
        else:
            return get_auditings()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_auditing(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_auditing(id, data)

    def delete(self, id):
        return delete_auditing(id)

class ApiAuditingType(Resource):

    def get(self, id=None):
        if id:
            return get_auditing_type(id)
        else:
            return get_auditing_types()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_auditing_type(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_auditing_type(id, data)

    def delete(self, id):
        return delete_auditing_type(id)