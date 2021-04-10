from config.databases import SQLALCH_AUTH

from auth.model.models import PermissionType
from fausto.sqlalch import  sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalch_wrapper
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
import logging

from sqlalchemy import desc

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def create_permission_type(s,data):
    duplicate_permission_type = s.query(PermissionType).filter_by(name=data.get('name')).one_or_none()
    if duplicate_permission_type:
        raise ControllerError("the permission type already exists: '"+data.get('name')+"'")
    new_data = PermissionType(**data)
    s.add(new_data)
    s.commit()
    return "Saved successful!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def update_permission_type(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    duplicate_permission_type = s.query(PermissionType).filter(PermissionType.name==data.get('name'), PermissionType.id!=id).one_or_none()
    if duplicate_permission_type:
        raise ControllerError("the permission type already exists: '"+data.get('name')+"'")
    s.query(PermissionType).filter_by(id=id).update(data)
    s.commit()
    return "Update successful!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def delete_permission_type(s, id):
        state = s.query(PermissionType).filter(PermissionType.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Deleted successful!"
        else: 
            return "The record has already been deleted!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_permission_type(s,id):    
    permission_type = s.query(PermissionType).filter(PermissionType.id==id).first()        
    if permission_type:
        logging.debug("SQLALCH PermissionType: "+str(quick_format_sqlalch(permission_type)))
        permission_type_dict = quick_format_sqlalch(permission_type)
        return "Permission type was found!", permission_type_dict
    else: 
        raise ControllerError("Permission type not found!")

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_permission_types(s):
    permission_types = s.query(PermissionType).order_by(desc(PermissionType.id)).all()
    if permission_types:
        logging.debug("SQLALCH user: "+str(permission_types))
        permission_types_dict = [ quick_format_sqlalch(i) for i in permission_types]
        return "Permission types were found!", permission_types_dict
    else: 
        raise ControllerError("No permission types found!", [])