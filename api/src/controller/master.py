from flask import Flask, jsonify, request
from flask_restful import Api, Resource
import logging

from fausto.utils import tryWrapper, jsonVerify, jsonWrapper
from flask_jwt_extended import get_jwt_identity

#APP LIBRARY LAYER
from auth.user import create_user, update_user, delete_user, get_user, get_users, get_user_name, validate_user
from auth.role import create_role, update_role, delete_role, get_role, get_roles
from auth.role_permission import get_role_permission
from auth.permission import create_permission, update_permission, delete_permission, get_permission, get_permissions
from auth.permission_type import create_permission_type, update_permission_type, delete_permission_type, get_permission_type, get_permission_types
from auth.object import create_object, update_object, delete_object, get_object, get_objects, get_object_role
from auth.object_type import create_object_type, update_object_type, delete_object_type, get_object_type, get_object_types
from auth.audit import create_audit, update_audit, delete_audit, get_audit, get_audits
from auth.audit_type import create_audit_type, update_audit_type, delete_audit_type, get_audit_type, get_audit_types

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

class ApiRole(Resource):

    def get(self, id=None):
        if id:
            return get_role(id)
        else:
            return get_roles()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_role(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_role(id, data)

    def delete(self, id=None):
        return delete_role(id)

class ApiRolePermission(Resource):

    def get(self, id=None):
        role = request.args.to_dict().get('role')
        if role:
            return get_role_permission(role)
        else:
            return {'msg': "invalid option", 'error': True, 'data': []}

class ApiPermission(Resource):

    def get(self, id=None):
        user = request.args.to_dict().get('user')
        _object = request.args.to_dict().get('object')
        role = request.args.to_dict().get('role')

        if id and not user:
            return get_permission(id)
        else:
            return get_permissions(_object, user, role)

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
        role = request.args.to_dict().get('role')
        if role:
            return get_object_role(role)
        elif id:
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

class ApiAudit(Resource):

    def get(self, id=None):
        if id:
            return get_audit(id)
        else:
            return get_audits()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_audit(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_audit(id, data)

    def delete(self, id):
        return delete_audit(id)

class ApiAuditType(Resource):

    def get(self, id=None):
        if id:
            return get_audit_type(id)
        else:
            return get_audit_types()

    @jsonWrapper
    def post(self):
        data=request.json
        return create_audit_type(data)

    @jsonWrapper
    def put(self, id=None):
        data=request.json
        return update_audit_type(id, data)

    def delete(self, id):
        return delete_audit_type(id)