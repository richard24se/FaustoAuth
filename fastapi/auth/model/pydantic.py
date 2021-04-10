from pydantic_sqlalchemy import sqlalchemy_to_pydantic
from pydantic import BaseModel
from typing import Optional, Any, Union, List
# models
from .models import User, Role, Permission, PermissionType, Object, ObjectType, Audit, AuditType

COMMON_EXCLUDED = {'id', 'created_date', 'modificated_date'}

PydanticUser = sqlalchemy_to_pydantic(User, exclude=COMMON_EXCLUDED)
PydanticRoleBase = sqlalchemy_to_pydantic(Role, exclude=COMMON_EXCLUDED)
class PydanticRole(PydanticRoleBase):
    permissions: List[int]


PydanticPermission = sqlalchemy_to_pydantic(
    Permission, exclude=COMMON_EXCLUDED)
PydanticPermissionType = sqlalchemy_to_pydantic(
    PermissionType, exclude=COMMON_EXCLUDED)
PydanticObject = sqlalchemy_to_pydantic(Object, exclude=COMMON_EXCLUDED)
PydanticObjectType = sqlalchemy_to_pydantic(
    ObjectType, exclude=COMMON_EXCLUDED)
PydanticAudit = sqlalchemy_to_pydantic(
    Audit, exclude=COMMON_EXCLUDED)
PydanticAuditType = sqlalchemy_to_pydantic(
    AuditType, exclude=COMMON_EXCLUDED)
