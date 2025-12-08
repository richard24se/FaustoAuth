import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Literal

import jwt
from config.settings import settings

TokenType = Literal["access", "refresh"]


def _create_token(
    identity: str, token_type: TokenType, expires_delta: timedelta
) -> str:
    """
    Helper function to create a JWT.

    :param identity: The identity of the user.
    :param token_type: The type of token (access or refresh).
    :param expires_delta: The lifespan of the token.
    :return: The encoded JWT.
    """
    try:
        payload = {
            "exp": datetime.now(timezone.utc) + expires_delta,
            "iat": datetime.now(timezone.utc),
            "username": encrypt_string(identity),  # For obfuscation
            "system": settings.JWT_SYSTEM,
            "identity": identity,  # The actual user identifier
            "type": token_type,
        }
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")
        logging.debug("Generated %s token for identity '%s'", token_type, identity)
        return token
    except Exception as e:
        logging.error("Error generating %s token: %s", token_type, e)
        raise


def encode_auth_token(identity: str) -> str:
    """
    Encodes an access token for a given identity.

    :param identity: The identity of the user.
    :return: The encoded access token.
    """
    expires = timedelta(seconds=settings.JWT_TOKEN_EXPIRES)
    return _create_token(identity, "access", expires)


def encode_refresh_auth_token(identity: str) -> str:
    """
    Encodes a refresh token for a given identity.

    :param identity: The identity of the user.
    :return: The encoded refresh token.
    """
    expires = timedelta(seconds=settings.JWT_TOKEN_REFRESH_EXPIRES)
    return _create_token(identity, "refresh", expires)


def decode_auth_token(token: str) -> dict | str:
    """
    Decodes a JWT.

    :param token: The token to decode.
    :return: The decoded payload as a dictionary, or an error string.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        logging.warning("Token has expired.")
        return "Token has expired, please log in again."
    except jwt.InvalidTokenError as e:
        logging.warning("Invalid token received: %s", e)
        return "Invalid token, please log in again."


def encrypt_string(text: str) -> str:
    """
    Hashes a string using SHA256.

    :param text: The string to hash.
    :return: The hex digest of the hash.
    """
    hash_object = hashlib.sha256(text.encode("utf-8"))
    return hash_object.hexdigest()
