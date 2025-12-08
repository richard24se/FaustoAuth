"""Security configurations for the FastAPI application.

This module centralizes the configuration for password hashing using Passlib.
"""

from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)