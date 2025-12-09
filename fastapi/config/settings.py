# -*- coding: utf-8 -*-
from datetime import timedelta
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Utilizes Pydantic's BaseSettings for automatic validation and type casting.
    """

    # --- Application ---
    DEBUG: bool = False

    # --- Database (PostgreSQL) ---
    DB_NAME: str = "Fausto"
    DB_USER: str = "root"
    DB_PASSWORD: str = "faustoauthdb24$"
    # DB_HOST: str = "auth_db_postgres"
    DB_HOST: str = "localhost"
    # DB_PORT: int = 5432
    DB_PORT: int = 5464

    # --- Cache (Redis) ---
    REDIS_HOST: str = "localhost"
    # REDIS_HOST: str = "auth_cache"
    REDIS_PORT: int = 6379

    # --- JWT Authentication ---
    JWT_SECRET_KEY: str = "fausto_auth32adadasdsa"
    JWT_SYSTEM: str = "FaustoAuth"
    # Token expiration times in seconds
    JWT_TOKEN_EXPIRES: int = 2409  # ~40 minutes
    JWT_TOKEN_REFRESH_EXPIRES: int = 240900  # ~2.8 days

    @property
    def ACCESS_EXPIRES(self) -> timedelta:
        """Converts token expiration from seconds to a timedelta object.

        Returns:
            timedelta: The access token expiration as a timedelta object.
        """
        return timedelta(seconds=self.JWT_TOKEN_EXPIRES)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Make a single, importable instance of the settings
settings = Settings()