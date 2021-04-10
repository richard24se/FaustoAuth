from config.databases import SQLALCH_AUTH

from auth.model.models import RolePermission, Permission, Object
from fausto.sqlalch import sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalch_wrapper
from fausto import ControllerError
from fausto.fapi import fapi_wrapper

import logging

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_role_permission(s, role):
    objects = (s.query(Object).join(Permission, Permission.id_object == Object.id)
                                .join(RolePermission, RolePermission.id_permission == Permission.id)
                                .filter(RolePermission.id_role==role).all())
    permissions = s.query(Permission).join(RolePermission, RolePermission.id_permission == Permission.id).filter(RolePermission.id_role==role).all()
    if permissions and objects:
        logging.debug("SQLALCH Audit: "+str(permissions))
        permissions_dict = [ quick_format_sqlalch(i) for i in permissions]
        objects_dict = [ quick_format_sqlalch(i) for i in objects]
        data_role_permission=[]
        for o in objects_dict:
            _object = o
            permissions_list=[]
            for p in permissions_dict:
                _permission = p
                if _permission.get('id_object') == _object.get('id'):
                    permissions_list.append(_permission)
            _object['permissions'] = permissions_list
            data_role_permission.append(_object)

        return "Permissions were found!", data_role_permission
    else: 
        raise ControllerError("No Permissions found!", [])

