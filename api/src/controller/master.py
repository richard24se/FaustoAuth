from flask import Flask, jsonify, request
from flask_restful import Api, Resource
import logging

from fausto.utils import tryWrapper, jsonVerify, jsonWrapper   

#APP LIBRARY LAYER
from auth.user import createUser, updateUser, deleteUser, getUser, getUsers, getUserName, validateUser
from auth.rol import createRol, updateRol, deleteRol, getRol, getRols
from auth.permission import createPermission, updatePermission, deletePermission, getPermission, getPermissions
from auth.permission_type import createPermissionType, updatePermissionType, deletePermissionType, getPermissionType, getPermissionTypes
from auth.object import createObject, updateObject, deleteObject, getObject, getObjects
from auth.object_type import createObjectType, updateObjectType, deleteObjectType, getObjectType, getObjectTypes
from auth.auditing import createAuditing, updateAuditing, deleteAuditing, getAuditing, getAuditings
from auth.auditing_type import createAuditingType, updateAuditingType, deleteAuditingType, getAuditingType, getAuditingTypes

class ApiUser(Resource):

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