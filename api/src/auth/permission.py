from model.config import SQLALCH_AUTH

from model.models import Permission, RolePermission, Role, User, Object
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError, get_fields_sqlalch
from sqlalchemy import func
import logging

from datetime import datetime
import datetime as dt
@tryWrapper
@sqlalchWrapper
def create_permission(s,data):
    duplicate_permission= s.query(Permission).filter_by(name= data.get('name')).one_or_none()
    if duplicate_permission:
        raise ControllerError("the permission already exists: '"+data.get('name')+"'")
    new_data= Permission(**data)
    s.add(new_data)
    s.commit()
    return "Saved successful!"

@tryWrapper
@sqlalchWrapper
def update_permission(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    duplicate_permission= s.query(Permission).filter(Permission.name== data.get('name'), Permission.id!= id).one_or_none()
    if duplicate_permission:
        raise ControllerError("the permission already exists: '"+ data.get('name')+"'")
    data['modificated_date']= datetime.utcnow()
    s.query(Permission).filter_by(id= id).update(data)
    s.commit()
    return "Update successful!"

@tryWrapper
@sqlalchWrapper
def delete_permission(s, id):
    state= s.query(Permission).filter(Permission.id== id).delete()
    logging.debug("SQLALCH state: "+str(state))
    s.commit()
    if state:
        return "Deleted successful!"
    else: 
        return "The record has already been deleted!"

@tryWrapper
@sqlalchWrapper
def get_permissions(s, _object, user, role):
    # se maneja la validacion por username (string) , se moficara mas adelante para tener una capa extra de seguridad
    # al validar por username, exite grado de vulnerabilidad de colocar usuario con perimosos de administrador 
    user_fields= get_fields_sqlalch(['id','username'], User)
    logging.debug(str(_object))
    logging.debug(str(user))
    if user:
        permission= (s.query(Permission).join(RolePermission,RolePermission.id_permission== Permission.id)
                                    .join(Object, Object.id== Permission.id_object)
                                    .join(Role, Role.id== RolePermission.id_role)
                                    .join(User, User.id_role== Role.id)
                                    .filter(Object.name== _object, User.username== user).all())
    elif role:
        permission = (s.query(Permission).join(RolePermission, RolePermission.id_permission == Permission.id)
                                            .filter(RolePermission.id_role==role).order_by(Permission.id).all())
    else:
        permission= s.query(Permission).order_by(Permission.id).all()
    if permission:  
        logging.debug("SQLALCH Permission: "+str(permission))
        permissions_dict= [quick_format_sqlalch(i) for i in permission]
        if user:
            user = (s.query(*user_fields).filter(User.username== user).first())
            data_user= quick_format_sqlalch(user)
            data_user['permission']= permissions_dict
            data_user['enabled']= True
            return "Permission enabled!" , data_user
        else:
            return "Permissions were found!", permissions_dict
    else:
        raise ControllerError("No Permissions found!", [])

@tryWrapper
@sqlalchWrapper
def get_permission(s, id):
    permission= s.query(Permission).filter_by(id=id).first()
    if permission:
        logging.debug("SQLALCH Audit: "+str(permission))
        permission_dict = quick_format_sqlalch(permission)
        return "Permission was found! ", permission_dict
    else:
        raise ControllerError("Permission not found")
