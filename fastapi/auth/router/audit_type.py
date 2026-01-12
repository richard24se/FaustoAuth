from auth.dependencies import AuthContext, get_auth_context
from auth.handlers import JWTBearer
from auth.model.pydantic import AuditTypeCreate, AuditTypeUpdate
from auth.service.audit_type import AuditTypeService
from config.databases import get_async_db
from fausto import ControllerError
from fausto.fapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, status

router = APIRouter(
    prefix="/audit_type",
    tags=["Audit Types"],
    dependencies=[Depends(JWTBearer())],
    responses={404: {"description": "Not found"}},
)


async def get_audit_type_service(
    s: AsyncSession = Depends(get_async_db),
) -> AuditTypeService:
    return AuditTypeService(s)


@router.get("/", response_model=Response, summary="List all audit types")
async def list_audit_types(
    service: AuditTypeService = Depends(get_audit_type_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a list of all audit types.

    Returns:
        Response: A response object containing a list of audit types.
    """
    audit_types = await service.get_multi()
    return Response(message="Found", data=audit_types)


@router.get("/{audit_type_id}", response_model=Response, summary="Get an audit type by ID")
async def read_audit_type(
    audit_type_id: int,
    service: AuditTypeService = Depends(get_audit_type_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a single audit type by its ID.

    Args:
        audit_type_id (int): The ID of the audit type to retrieve.

    Returns:
        Response: A response object containing the audit type data.
    """
    audit_type = await service.get(id=audit_type_id)
    if not audit_type:
        raise ControllerError("Audit type not found.", status_code=404)
        
    return Response(message="Found", data=audit_type)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new audit type",
)
async def creating_audit_type(
    audit_type: AuditTypeCreate,
    service: AuditTypeService = Depends(get_audit_type_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Create a new audit type.

    Args:
        audit_type (AuditTypeCreate): The audit type data to create.

    Returns:
        Response: A response object indicating success or failure.
    """
    if "super-god" not in auth.scopes:
        raise ControllerError("Not authorized to create audit types.", status_code=403)

    new_audit_type = await service.create(obj_in=audit_type)
    return Response(message="Saved successful!", data=new_audit_type)


@router.put("/{audit_type_id}", response_model=Response, summary="Update an audit type")
async def updating_audit_type(
    audit_type_id: int,
    audit_type: AuditTypeUpdate,
    service: AuditTypeService = Depends(get_audit_type_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Update an existing audit type by its ID.

    Args:
        audit_type_id (int): The ID of the audit type to update.
        audit_type (AuditTypeUpdate): The updated audit type data.

    Returns:
        Response: A response object indicating success or failure.
    """
    if "super-god" not in auth.scopes:
        raise ControllerError("Not authorized to update audit types.", status_code=403)

    updated_audit_type = await service.update(id=audit_type_id, obj_in=audit_type)
    return Response(message="Update successful!", data=updated_audit_type)


@router.delete(
    "/{audit_type_id}",
    response_model=Response,
    summary="Delete an audit type",
)
async def deleting_audit_type(
    audit_type_id: int,
    service: AuditTypeService = Depends(get_audit_type_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """Delete an audit type by its ID.

    Args:
        audit_type_id (int): The ID of the audit type to delete.

    Returns:
        Response: A response object indicating success or failure.
    """
    if "super-god" not in auth.scopes:
        raise ControllerError("Not authorized to delete audit types.", status_code=403)

    deleted_audit_type = await service.remove(id=audit_type_id)
    return Response(message="Deleted successful!", data=deleted_audit_type)


router_audit_type = router

