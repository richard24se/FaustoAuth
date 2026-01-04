import logging

from fausto.context import tenant_context
from fausto.jwt import decode_auth_token
from starlette.middleware.base import BaseHTTPMiddleware

from fastapi import Request


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Reset context for each request
        token = tenant_context.set(None)

        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                jwt_token = auth_header.split(" ")[1]
                payload = decode_auth_token(jwt_token)
                if isinstance(payload, dict):
                    scopes = payload.get("scope", "").split()
                    tid = payload.get("tenant_id")

                    # If user has a tenant_id and is NOT a super-god, enforce the tenant_context
                    if tid and "super-god" not in scopes:
                        tenant_context.set(tid)

        except Exception as e:
            # Don't block request, just fail open (or closed depending on security model)
            # Here we fail open regarding tenant_context (it remains None),
            # so DB queries won't have auto-filter,
            # BUT subsequent dependencies (get_current_user) will still fail validation if token is bad.
            logging.debug(f"TenantMiddleware failed to parse token: {e}")

        response = await call_next(request)

        # Cleanup (not strictly necessary with ContextVar as they are task-local, but good practice)
        tenant_context.reset(token)

        return response
