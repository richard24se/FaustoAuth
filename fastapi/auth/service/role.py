from config.databases import SQLALCH_AUTH

from auth.model.models import Role, RolePermission, Permission
from fausto.sqlalch import  sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalch_wrapper
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
import logging

from sqlalchemy import desc

from datetime import datetime
import datetime as dt

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def create_role(s,data):
    duplicate_role = s.query(Role).filter_by(name=data.get('name')).one_or_none()
    permissions = data.get("permissions")
    if duplicate_role:
        raise ControllerError("the role already exists: '"+data.get('name')+"'")
    data.pop('permissions')
    new_role = Role(**data)
    s.add(new_role)
    s.commit()

    s.refresh(new_role)
    role_created= new_role
    logging.debug(new_role)
    logging.debug(role_created)
    for id_permission in permissions:
        role_permission_format ={}
        role_permission_format['id_role']= role_created.id
        role_permission_format['id_permission']= id_permission
        new_role_permission = RolePermission(**role_permission_format)
        s.add(new_role_permission)
        s.commit()

    return "Saved successful!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def update_role(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    duplicate_role = s.query(Role).filter(Role.name==data.get('name'), Role.id!=id).one_or_none()
    if duplicate_role:
        raise ControllerError("the role already exists: '"+data.get('name')+"'")
    
    #permission received
    permissions_received = data.get("permissions")
    data.pop('permissions')
    data['modificated_date'] = datetime.utcnow()
    s.query(Role).filter_by(id=id).update(data)
    s.commit()

    #get permissions of db
    permission_db = (s.query(Permission).join(RolePermission, RolePermission.id_permission == Permission.id)
                                        .filter(RolePermission.id_role == id).all())
    list_permission_db = [i.id for i in permission_db]
    logging.debug(list_permission_db)

    for p in list_permission_db:
        if not p in permissions_received:
            logging.debug("SQLALCH state: "+str(p))
            s.query(RolePermission).filter(RolePermission.id_role == id,RolePermission.id_permission == p).delete()
            s.commit()
    
    for lp in permissions_received:
        if not lp in list_permission_db:
            role_permission_format ={}
            role_permission_format['id_role']= id
            role_permission_format['id_permission']= lp
            new_role_permission = RolePermission(**role_permission_format)
            s.add(new_role_permission)
            s.commit()
    
    return "Update successful!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def delete_role(s, id):
    role_permission= s.query(RolePermission).filter(RolePermission.id_role == id).delete()
    logging.debug("SQLALCH state:  "+str(role_permission))
    s.commit()
    state = s.query(Role).filter(Role.id==id).delete()
    logging.debug("SQLALCH state: "+str(state))
    s.commit()
    if state:
        return "Deleted successful!"
    else: 
        return "The record has already been deleted!"

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_role(s,id):
    role = s.query(Role).filter(Role.id==id).first()
    if role:
        logging.debug("SQLALCH Role: "+str(quick_format_sqlalch(role)))
        role_dict = quick_format_sqlalch(role)
        return "Role was found!", role_dict
    else: 
        raise ControllerError("Role not found!")

@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_roles(s):
    roles = s.query(Role).order_by(desc(Role.id)).all()
    if roles:
        logging.debug("SQLALCH user: "+str(roles))
        roles_dict = [ quick_format_sqlalch(i) for i in roles]
        return "Roles were found!", roles_dict
    else: 
        raise ControllerError("No Roles found!")