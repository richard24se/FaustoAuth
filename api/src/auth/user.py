#DB LAYER
from model.config import SQLALCH_AUTH

from model.models import User, Rol, Permission, PermissionType, Object, ObjectType, RolPermission
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError, get_fields_sqlalch, get_columns_sqlalch, get_prefix_fields_sqlalch
import logging

@tryWrapper
@sqlalchWrapper
def createUser(s,data):
    duplicate_username = s.query(User).filter_by(username=data.get('username')).one_or_none()
    if duplicate_username:
        raise ControllerError("Ya existe usuario: '"+data.get('username')+"'")
    new_user = User(**data)
    s.add(new_user)
    s.commit()
    return "Se creó satisfactoriamente!"

@tryWrapper
@sqlalchWrapper
def updateUser(s, id, data):
    if id is None:
        raise ControllerError("Envíe el id!")
    duplicate_username = s.query(User).filter(User.username==data.get('username'), User.id!=id).one_or_none()
    if duplicate_username:
        raise ControllerError("Ya existe usuario: '"+data.get('username')+"'")
    s.query(User).filter_by(id=id).update(data)
    s.commit()       
    return "Se actualizó satisfactoriamente!"    

@tryWrapper
@sqlalchWrapper
def deleteUser(s, id):
        state = s.query(User).filter(User.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Se eliminó satisfactoriamente!"
        else: 
            return "El registro ya estaba eliminado!"

@tryWrapper
@sqlalchWrapper
def getUser(s,id):    
    user = s.query(User).filter(User.id==id).first()        
    if user:
        logging.debug("SQLALCH user: "+str(quick_format_sqlalch(user)))
        user_dict = quick_format_sqlalch(user)
        return "Se encontró el usuario!", user_dict
    else: 
        raise ControllerError("No existe el usuario!")

@tryWrapper
@sqlalchWrapper
def getUserName(s,username):
    logging.debug(str(username))
    user_fields= get_prefix_fields_sqlalch(['id','username'], User, 'user_')    
    rol_fields= get_prefix_fields_sqlalch(['id','name'], Rol, 'rol_')
    user = (s.query(*user_fields, *rol_fields)
            .join(User,(User.id_rol==Rol.id))
            .filter(User.username==username).one_or_none())
    if user:
        user_dict = quick_format_sqlalch(user)       
        rol_permission_fields= get_prefix_fields_sqlalch(['id'], RolPermission, 'rol_permission_')
        permission_fields= get_prefix_fields_sqlalch(['id'], Permission, 'permission_')
        permission_type_fields= get_prefix_fields_sqlalch(['id','name'], PermissionType, 'permission_type_')
        object_fields= get_prefix_fields_sqlalch(['id','name'], Object, 'object_')
        object_type_fields= get_prefix_fields_sqlalch(['id','name'], ObjectType, 'object_type_')
        permission = (s.query(*rol_permission_fields, *permission_fields, *permission_type_fields, *object_fields, *object_type_fields)
                .join(Permission,(Permission.id==RolPermission.id_permission))
                .join(PermissionType,(PermissionType.id==Permission.id_permission_type))
                .join(Object,(Object.id==Permission.id_object))
                .join(ObjectType,(ObjectType.id==Object.id_object_type))
                .filter(RolPermission.id_rol==user.rol_id).all())        
        
        if permission:
            user_dict['permission']= [quick_format_sqlalch(i) for i in permission]

        logging.debug(str(user_dict))
        return "Se encontró usuario!", user_dict
    else: 
        raise ControllerError("No existe usuario!")

@tryWrapper
@sqlalchWrapper
def validateUser(s, username, password):
    logging.debug(str(username))    
    user = s.query(User).filter(User.username== username).first()        
    if not user:
        raise ControllerError("No existe username!")
    elif user.password != password:
        user_dict = quick_format_sqlalch(user)
        raise ControllerError("Contraseña Incorrecta!")
    else:
        return user

@tryWrapper
@sqlalchWrapper
def getUsers(s):
    user = s.query(User).all()
    if user:
        logging.debug("SQLALCH user: "+str(user))
        user_dict = [ quick_format_sqlalch(i) for i in user]
        return "Se encontró el usuario!", user_dict
    else: 
        raise ControllerError("No existen usuarios!", [])