import logging
from contextlib import asynccontextmanager
from logging.config import dictConfig

# importante rutas
from auth.controller import (
    router_audit,
    router_audit_type,
    router_auth,
    router_object,
    router_object_type,
    router_permission,
    router_permission_type,
    router_role,
    router_role_permission,
    router_user,
)
from config.databases import SQLALCH_AUTH
from config.settings import DEBUG
from starlette.exceptions import HTTPException as StarletteHTTPException

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

tags_metadata = [
    {
        "name": "user",
        "description": "Operations with users. The **login** logic doesn't here.",
    },
    # {
    #     "name": "items",
    #     "description": "Manage items. So _fancy_ they have their own docs.",
    #     "externalDocs": {
    #         "description": "Items external docs",
    #         "url": "https://fastapi.tiangolo.com/",
    #     },
    # },
]
# events


@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup
    logging.debug("starting microservice...")
    logging.debug(SQLALCH_AUTH)
    yield
    # on shutdown
    logging.debug("turning off microservice...")


app = FastAPI(
    title="API Fausto Auth with FastAPI",
    description="This is a very fancy project, with auto docs for the API and everything",
    version="0.7",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

app.include_router(router_auth)
app.include_router(router_user)
app.include_router(router_role)
app.include_router(router_role_permission)
app.include_router(router_permission)
app.include_router(router_permission_type)
app.include_router(router_object)
app.include_router(router_object_type)
app.include_router(router_audit)
app.include_router(router_audit_type)
# agregando cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# mejorando httpexception
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    content = None
    if isinstance(exc.detail, str):
        content = {"msg": exc.detail}
    else:
        content = exc.detail
    return JSONResponse(content=content, status_code=exc.status_code)


@app.get("/")
async def root():
    logging.debug("This is a root path")
    return {"message": "Hello World"}


FORMAT = (
    "[%(asctime)s] %(levelname)s in %(module)s:%(filename)s on %(lineno)d %(message)s"
    if isinstance(DEBUG, bool) and DEBUG
    else "[%(asctime)s] %(levelname)s in %(module)s:%(filename)s %(message)s"
)

dictConfig(
    {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": FORMAT,
            }
        },
        "handlers": {
            "default": {"class": "logging.StreamHandler", "formatter": "default"}
        },
        "root": {
            "level": "DEBUG" if DEBUG else "INFO",
            "handlers": ["default"],
        },
    }
)
