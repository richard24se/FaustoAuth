# DB LAYER
from config.databases import SQLALCH_AUTH

from auth.model.models import User, Role, Permission, PermissionType, Object, ObjectType, RolePermission
from fausto.sqlalch import sqlaPurge, format_dict_sqlalch, quick_format_sqlalch,  get_fields_sqlalch, get_columns_sqlalch, get_prefix_fields_sqlalch
from fausto.sqlalch import sqlalch_wrapper, qf_sqlalch, remove_fields_sqlalch
from fausto import ControllerError
from fausto.fapi import fapi_wrapper
from fausto.jwt import encode_auth_token, encode_refresh_auth_token, decode_auth_token
from fausto.redis import redis_create_key
from config.databases import token_store, async_token_store
from config.settings import ACCESS_EXPIRES
from datetime import timedelta
import logging

from sqlalchemy import desc

from datetime import datetime
import datetime as dt


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def create_user(s, data):
    duplicate_username = s.query(User).filter_by(
        username=data.get('username')).one_or_none()
    if duplicate_username:
        raise ControllerError(
            "the username already exists: '"+data.get('username')+"'")
    new_user = User(**data)
    s.add(new_user)
    s.commit()
    return "Saved successful!"


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def update_user(s, id, data):
    if id is None:
        raise ControllerError("Send id!")
    super_user = s.query(User).filter(User.id == id).first()
    if super_user.username == "admin@faustoauth.app":
        raise ControllerError("Cannot update super-user")
    duplicate_username = s.query(User).filter(
        User.username == data.get('username'), User.id != id).one_or_none()
    if duplicate_username:
        raise ControllerError(
            "the username already exists: '"+data.get('username')+"'")
    data['modificated_date'] = datetime.utcnow()
    s.query(User).filter_by(id=id).update(data)
    s.commit()
    user = s.query(User).filter_by(id=id).one_or_none()
    user = qf_sqlalch(user)
    user = remove_fields_sqlalch(user, ['password'])
    return "Update successful!", user


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def delete_user(s, id):
    super_user = s.query(User).filter(User.id == id).first()
    if super_user and super_user.username == "admin@faustoauth.app":
        raise ControllerError("Cannot delete super-user")
    state = s.query(User).filter(User.id == id).delete()
    logging.debug("SQLALCH state: "+str(state))
    s.commit()
    if state:
        return "Deleted successful!"
    else:
        raise ControllerError("The record has already been deleted!")


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_user(s, id):
    user = s.query(User).filter(User.id == id).first()
    if user:
        logging.debug("SQLALCH user: "+str(quick_format_sqlalch(user)))
        user_dict = quick_format_sqlalch(user)
        return "User was found!", user_dict
    else:
        raise ControllerError("User not found!")


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_user_name(s, username):
    logging.debug(str(username))
    user_fields = get_prefix_fields_sqlalch(['id', 'username'], User, 'user_')
    role_fields = get_prefix_fields_sqlalch(['id', 'name'], Role, 'role_')
    user = (s.query(*user_fields, *role_fields)
            .join(User, (User.id_role == Role.id))
            .filter(User.username == username).one_or_none())
    if user:
        user_dict = quick_format_sqlalch(user)
        role_permission_fields = get_prefix_fields_sqlalch(
            ['id'], RolePermission, 'rol_permission_')
        permission_fields = get_prefix_fields_sqlalch(
            ['id'], Permission, 'permission_')
        permission_type_fields = get_prefix_fields_sqlalch(
            ['id', 'name'], PermissionType, 'permission_type_')
        object_fields = get_prefix_fields_sqlalch(
            ['id', 'name'], Object, 'object_')
        object_type_fields = get_prefix_fields_sqlalch(
            ['id', 'name'], ObjectType, 'object_type_')
        permission = (s.query(*role_permission_fields, *permission_fields, *permission_type_fields, *object_fields, *object_type_fields)
                      .join(Permission, (Permission.id == RolePermission.id_permission))
                      .join(PermissionType, (PermissionType.id == Permission.id_permission_type))
                      .join(Object, (Object.id == Permission.id_object))
                      .join(ObjectType, (ObjectType.id == Object.id_object_type))
                      .filter(RolePermission.id_role == user.role_id).all())

        if permission:
            user_dict['permission'] = [
                quick_format_sqlalch(i) for i in permission]

        logging.debug(str(user_dict))
        return "User was found!", user_dict
    else:
        raise ControllerError("User not found!")


@fapi_wrapper
@sqlalch_wrapper(sqlalch=SQLALCH_AUTH)
def get_users(s):
    users = s.query(User).order_by(desc(User.id)).all()
    if users:
        logging.debug("SQLALCH user: "+str(users))
        users_dict = [quick_format_sqlalch(i) for i in users]
        return "Users were found!", users_dict
    else:
        raise ControllerError("No users found!", [])
