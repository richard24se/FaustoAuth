import logging
from logging.config import dictConfig
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from config.databases import SQLALCH_AUTH
# importante rutas
from auth.controller import (router_auth, router_user,
                             router_role, router_role_permission,
                             router_permission, router_permission_type,
                             router_object, router_object_type,
                             router_audit, router_audit_type)

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
app = FastAPI(title="API Fausto Auth with FastAPI",
              description="This is a very fancy project, with auto docs for the API and everything",
              version="0.7",
              openapi_tags=tags_metadata)

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
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# mejorando httpexception
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    content = None
    if isinstance(exc.detail, str):
        content = {'msg': exc.detail}
    else:
        content = exc.detail
    return JSONResponse(content=content, status_code=exc.status_code)

# events
@app.on_event("startup")
async def startup():
    logging.debug("starting microservice...")
    logging.debug(SQLALCH_AUTH)


@app.on_event("shutdown")
async def shutdown():
    logging.debug("turning off microservice...")


@app.get("/")
async def root():
    logging.debug("This is a root path")
    return {"message": "Hello World"}


DEBUG = True

FORMAT = '[%(asctime)s] %(levelname)s in %(module)s:%(filename)s on %(lineno)d %(message)s' if DEBUG == True else '[%(asctime)s] %(levelname)s in %(module)s:%(filename)s %(message)s'

dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {'default': {
        'format': FORMAT,
    }},
    'handlers': {'default': {
        'class': 'logging.StreamHandler',
        'formatter': 'default'
    }},
    'root': {
        'level': 'DEBUG' if DEBUG == True else 'INFO',
        'handlers': ['default']
    }
})
