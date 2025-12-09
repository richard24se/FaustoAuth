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
                # message = "Invalid token or expired token."
                raise HTTPException(
                    status_code=403,
                    detail={"message": self.verify_jwt(credentials.credentials).get("message")},
                )
                # return {"failure": True}
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> dict:
        payload: dict = {}
        try:
            is_token_valid: bool = False
            message = None
            payload = decode_auth_token(jwtoken)
            if not isinstance(payload, str):
                is_token_valid = True
                message = "token válido"
            else:
                is_token_valid = False
                message = payload
            payload = {"error": not is_token_valid, "message": message}
        except Exception as err:
            logging.exception(err)
            payload = {"error": True, "message": str(err)}

        return payload
