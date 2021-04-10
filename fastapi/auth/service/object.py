from config.databases import SQLALCH_AUTH

from auth.model.models import Permission, RolePermission, Role, User, Object
from fausto.sqlalch import  sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalch_wrapper, get_fields_sqlalch
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
import logging

from sqlalchemy import desc

from datetime import datetime
import datetime as dt

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def create_object(s,data):
    duplicate_object = s.query(Object).filter_by(name=data.get('name')).one_or_none()
    if duplicate_object:
        raise ControllerError("the object already exists: '"+data.get('name')+"'")
    new_data = Object(**data)
    s.add(new_data)
    s.commit()
    return "Saved successful!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def update_object(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    duplicate_object = s.query(Object).filter(Object.name==data.get('name'), Object.id!=id).one_or_none()
    if duplicate_object:
        raise ControllerError("the object already exists: '"+data.get('name')+"'")
    data['modificated_date'] = datetime.utcnow()
    s.query(Object).filter_by(id=id).update(data)
    s.commit()
    return "Updated successful!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def delete_object(s, id):
        state = s.query(Object).filter(Object.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Deleted successful!"
        else: 
            return "The record has already been deleted!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_object(s,id):
    _object = s.query(Object).filter(Object.id==id).first()
    if _object:
        logging.debug("SQLALCH Object:"+str(quick_format_sqlalch(_object)))
        object_dict = quick_format_sqlalch(_object)
        return "Object was found!", object_dict
    else: 
        raise ControllerError("Object not found")

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_object_role(s,role):
    objects = (s.query(Object).join(Permission, Permission.id_object == Object.id)
                                .join(RolePermission, RolePermission.id_permission == Permission.id)
                                .filter(RolePermission.id_role==role).all())
    if objects:
        logging.debug("SQLALCH Object: "+str(objects))
        objects_dict = [quick_format_sqlalch(i) for i in objects]
        return "Object was found!", objects_dict
    else: 
        raise ControllerError("No objects found")

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_objects(s):
    objects = s.query(Object).order_by(desc(Object.id)).all()
    if objects:
        logging.debug("SQLALCH Object: "+str(objects))
        objects_dict = [ quick_format_sqlalch(i) for i in objects]
        return "Objects were found!", objects_dict
    else: 
        raise ControllerError("No objects found!", [])