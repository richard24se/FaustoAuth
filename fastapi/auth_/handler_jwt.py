import logging

from utils.jwt import decode_auth_token

from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=403, detail="Invalid authentication scheme."
                )
            # if not self.verify_jwt(credentials.credentials):
            if self.verify_jwt(credentials.credentials).get("error") == True:
                # msg = "Invalid token or expired token."
                raise HTTPException(
                    status_code=403,
                    detail={"msg": self.verify_jwt(credentials.credentials).get("msg")},
                )
                # return {"failure": True}
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> dict:
        payload: dict = {}
        try:
            is_token_valid: bool = False
            msg = None
            payload = decode_auth_token(jwtoken)
            if not isinstance(payload, str):
                is_token_valid = True
                msg = "token válido"
            else:
                is_token_valid = False
                msg = payload
            payload = {"error": not is_token_valid, "msg": msg}
        except Exception as err:
            logging.exception(err)
            payload = {"error": True, "msg": str(err)}

        return payload
