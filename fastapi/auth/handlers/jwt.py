import logging
from typing import Any

from fausto.jwt import decode_auth_token
from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


class JWTBearer(HTTPBearer):
    """
    A dependency class to handle JWT authentication in FastAPI.

    It extracts the bearer token from the Authorization header, verifies it,
    and raises appropriate HTTP exceptions for invalid or expired tokens.
    """

    def __init__(self, auto_error: bool = True, scopes: list[str] = None):
        """
        Initializes the JWTBearer dependency.

        :param auto_error: If True, automatically raises HTTPException on error.
        :param scopes: List of required scopes for this endpoint.
        """
        super().__init__(auto_error=auto_error)
        self.scopes = scopes or []

    async def __call__(self, request: Request) -> str:
        """
        Processes the request to validate the JWT.

        This method is called by FastAPI when the dependency is used.

        :param request: The incoming request.
        :return: The token string if valid.
        :raises HTTPException: If the token is missing, invalid, or expired.
        """
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)

        if not credentials:
            if self.auto_error:
                raise HTTPException(
                    status_code=403, detail="Invalid authorization code."
                )
            else:
                return None

        if credentials.scheme != "Bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=403, detail="Invalid authentication scheme."
                )
            else:
                return None

        token = credentials.credentials
        payload_or_error = self.verify_jwt(token)

        if "error" in payload_or_error and payload_or_error["error"]:
            if self.auto_error:
                raise HTTPException(status_code=403, detail=payload_or_error)
            else:
                return None

        return token

    def verify_jwt(self, jwtoken: str) -> dict[str, Any]:
        """
        Verifies the integrity and validity of a JWT.

        :param jwtoken: The token to verify.
        :return: A dictionary containing the payload or an error message.
        """
        decoded = decode_auth_token(jwtoken)

        if isinstance(decoded, str):
            # An error message string was returned from decode_auth_token
            logging.warning("JWT verification failed: %s", decoded)
            return {"error": True, "message": decoded}

        # Check for required scopes
        if self.scopes:
            token_scopes = decoded.get("scope", "").split()
            for required_scope in self.scopes:
                if required_scope not in token_scopes:
                    error_msg = f"Not enough permissions. Missing scope: {required_scope}"
                    logging.warning(error_msg)
                    return {"error": True, "message": error_msg}

        # Token is valid, payload was returned
        return {"error": False, "message": "Token is valid", "payload": decoded}