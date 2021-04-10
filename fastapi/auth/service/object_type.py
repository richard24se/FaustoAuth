from config.databases import SQLALCH_AUTH
from auth.model.models import ObjectType
from fausto.sqlalch import sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalch_wrapper, get_fields_sqlalch
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
import logging

from sqlalchemy import desc


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def create_object_type(s, data):
    duplicate_object_type = s.query(ObjectType).filter_by(
        name=data.get('name')).one_or_none()
    if duplicate_object_type:
        raise ControllerError(
            "the object type already exists: '"+data.get('name')+"'")
    new_data = ObjectType(**data)
    s.add(new_data)
    s.commit()
    return "Saved successful!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def update_object_type(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    duplicate_object_type = s.query(ObjectType).filter(
        ObjectType.name == data.get('name'), ObjectType.id != id).one_or_none()
    if duplicate_object_type:
        raise ControllerError(
            "the object type already exists: '"+data.get('name')+"'")
    s.query(ObjectType).filter_by(id=id).update(data)
    s.commit()
    return "Updated successful!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def delete_object_type(s, id):
    state = s.query(ObjectType).filter(ObjectType.id == id).delete()
    logging.debug("SQLALCH state: "+str(state))
    s.commit()
    if state:
        return "Deleted successful!"
    else:
        return "The record has already been deleted!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_object_type(s, id):
    object_type = s.query(ObjectType).filter(ObjectType.id == id).first()
    if object_type:
        logging.debug("SQLALCH ObjectType: " +
                      str(quick_format_sqlalch(object_type)))
        object_type_dict = quick_format_sqlalch(object_type)
        return "Object type was found!", object_type_dict
    else:
        raise ControllerError("Object type not found!")


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_object_types(s):
    object_types = s.query(ObjectType).order_by(desc(ObjectType.id)).all()
    if object_types:
        logging.debug("SQLALCH ObjectType: "+str(object_types))
        object_types_dict = [quick_format_sqlalch(i) for i in object_types]
        return "Object types were found!", object_types_dict
    else:
        raise ControllerError("No Object types found!", [])
