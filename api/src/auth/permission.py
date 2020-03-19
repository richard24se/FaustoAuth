from model.config import SQLALCH_AUTH

from model.models import Permission, RolPermission, Rol, User
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError, get_fields_sqlalch
import logging

@tryWrapper
@sqlalchWrapper
def create_permission(s,data):
    duplicate_permission= s.query(Permission).filter_by(name= data.get('name')).one_or_none()
    if duplicate_permission:
        raise ControllerError("Ya existe permiso: '"+data.get('name')+"'")
    new_data= Permission(**data)
    s.add(new_data)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def update_permission(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    duplicate_permission= s.query(Permission).filter(Permission.name== data.get('name'), Permission.id!= id).one_or_none()
    if duplicate_permission:
        raise ControllerError("Ya existe permiso: '"+ data.get('name')+"'")
    s.query(Permission).filter_by(id= id).update(data)
    s.commit()
    return "Se actualizó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def delete_permission(s, id):
        state= s.query(Permission).filter(Permission.id== id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def get_permission(s, id, user):
    user_fields= get_fields_sqlalch(['id','username'], User)
    if user:
        permission= (s.query(Permission).join(RolPermission,RolPermission.id_permission== Permission.id)
                                    .join(Rol, Rol.id== RolPermission.id_rol)
                                    .join(User, User.id_rol== Rol.id)
                                    .filter(Permission.id == id, User.username== user).one_or_none())
    else:
        permission= s.query(Permission).filter(Permission.id== id).first()
    if permission:
        logging.debug("SQLALCH Permission: "+str(quick_format_sqlalch(permission)))
        rol_dict= quick_format_sqlalch(permission)
        if user:
            user = (s.query(*user_fields).filter(User.username== user).first())
            data_user= quick_format_sqlalch(user)
            data_user['permission']= rol_dict
            data_user['enabled']= True
            return "Permiso habilitado!" , data_user
        else:            
            return "Se encontró el permiso! ", rol_dict
    else:
        raise ControllerError("No existe el permiso")

@tryWrapper
@sqlalchWrapper
def get_permissions(s):
    permiso= s.query(Permission).all()
    if permiso:
        logging.debug("SQLALCH user: "+str(permiso))
        rol_dict= [ quick_format_sqlalch(i) for i in permiso]
        return "Se encontró permisos!", rol_dict
    else:
        raise ControllerError("No existen permisos!", [])