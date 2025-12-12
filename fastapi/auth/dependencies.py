from typing import List, Optional
from fastapi import Depends
from pydantic import BaseModel

from auth.handlers.jwt import JWTBearer
from fausto import ControllerError
from fausto.jwt import decode_auth_token

class AuthContext(BaseModel):
    scopes: List[str]
    tenant_id: Optional[int]
    user_id: Optional[int]

async def get_auth_context(token: str = Depends(JWTBearer(scopes=[]))) -> AuthContext:
    """
    Dependency that decodes the JWT and returns auth context (scopes, tenant_id).
    """
    payload = decode_auth_token(token)
    if isinstance(payload, str):
        raise ControllerError(payload, status_code=401)
    
    scopes = payload.get("scope", "").split()
    tenant_id = payload.get("tenant_id")
    user_id = payload.get("sub")  # sub is usually user_id

    return AuthContext(scopes=scopes, tenant_id=tenant_id, user_id=int(user_id) if user_id else None)
