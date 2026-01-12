from .audit import router_audit
from .audit_type import router_audit_type
from .auth import router_auth
from .backup import router_backup
from .object import router_object
from .object_type import router_object_type
from .permission import router_permission
from .permission_type import router_permission_type
from .role import router_role
from .role_permission import router_role_permission
from .tenant import router_tenant
from .user import router_user

__all__ = [
    "router_audit",
    "router_audit_type",
    "router_auth",
    "router_object",
    "router_object_type",
    "router_permission",
    "router_permission_type",
    "router_role",
    "router_role_permission",
    "router_user",
    "router_tenant",
    "router_backup",
]
