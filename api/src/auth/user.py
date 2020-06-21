#DB LAYER
from model.config import SQLALCH_AUTH

from model.models import User, Role, Permission, PermissionType, Object, ObjectType, RolePermission
from fausto.utils import tryWrapper, sqlaPurge, format_dict_sqlalch, quick_format_sqlalch, sqlalchWrapper, ControllerError, get_fields_sqlalch, get_columns_sqlalch, get_prefix_fields_sqlalch
import logging

@tryWrapper
@sqlalchWrapper
def create_user(s,data):
    duplicate_username = s.query(User).filter_by(username=data.get('username')).one_or_none()
    if duplicate_username:
        raise ControllerError("the username already exists: '"+data.get('username')+"'")
    new_user = User(**data)
    s.add(new_user)
    s.commit()
    return "Saved successful!"

@tryWrapper
@sqlalchWrapper
def update_user(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    duplicate_username = s.query(User).filter(User.username==data.get('username'), User.id!=id).one_or_none()
    if duplicate_username:
        raise ControllerError("the username already exists: '"+data.get('username')+"'")
    s.query(User).filter_by(id=id).update(data)
    s.commit()
    return "Update successful!"

@tryWrapper
@sqlalchWrapper
def delete_user(s, id):
        state = s.query(User).filter(User.id==id).delete()
        logging.debug("SQLALCH state: "+str(state))
        s.commit()
        if state:
            return "Deleted successful!"
        else: 
            return "The record has already been deleted!"

@tryWrapper
@sqlalchWrapper
def get_user(s,id):
    user = s.query(User).filter(User.id==id).first()
    if user:
        logging.debug("SQLALCH user: "+str(quick_format_sqlalch(user)))
        user_dict = quick_format_sqlalch(user)
        return "User was found!", user_dict
    else: 
        raise ControllerError("User not found!")

@tryWrapper
@sqlalchWrapper
def get_user_name(s,username):
    logging.debug(str(username))
    user_fields= get_prefix_fields_sqlalch(['id','username'], User, 'user_')    
    role_fields= get_prefix_fields_sqlalch(['id','name'], Role, 'rol_')
    user = (s.query(*user_fields, *role_fields)
            .join(User,(User.id_rol==Role.id))
            .filter(User.username==username).one_or_none())
    if user:
        user_dict = quick_format_sqlalch(user)       
        role_permission_fields= get_prefix_fields_sqlalch(['id'], RolePermission, 'rol_permission_')
        permission_fields= get_prefix_fields_sqlalch(['id'], Permission, 'permission_')
        permission_type_fields= get_prefix_fields_sqlalch(['id','name'], PermissionType, 'permission_type_')
        object_fields= get_prefix_fields_sqlalch(['id','name'], Object, 'object_')
        object_type_fields= get_prefix_fields_sqlalch(['id','name'], ObjectType, 'object_type_')
        permission = (s.query(*role_permission_fields, *permission_fields, *permission_type_fields, *object_fields, *object_type_fields)
                .join(Permission,(Permission.id==RolePermission.id_permission))
                .join(PermissionType,(PermissionType.id==Permission.id_permission_type))
                .join(Object,(Object.id==Permission.id_object))
                .join(ObjectType,(ObjectType.id==Object.id_object_type))
                .filter(RolePermission.id_rol==user.rol_id).all())        
        
        if permission:
            user_dict['permission']= [quick_format_sqlalch(i) for i in permission]

        logging.debug(str(user_dict))
        return "User was found!", user_dict
    else: 
        raise ControllerError("User not found!")

@tryWrapper
@sqlalchWrapper
def validate_user(s, username, password):
    logging.debug(str(username))
    user = s.query(User).filter(User.username== username).first()
    if not user:
        raise ControllerError("User doesn't exist!")
    elif user.password != password:
        raise ControllerError("Incorrect password!")
    else:
        return user

@tryWrapper
@sqlalchWrapper
def get_users(s):
    users = s.query(User).all()
    if users:
        logging.debug("SQLALCH user: "+str(users))
        users_dict = [ quick_format_sqlalch(i) for i in users]
        return "Users were found!", users_dict
    else: 
        raise ControllerError("No users found!", [])