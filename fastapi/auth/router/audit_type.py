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


@router.get("/", response_model=Response, summary="List all audit types")
async def list_audit_types(
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a list of all audit types.

    Returns:
        Response: A response object containing a list of audit types.
    """
    return await AuditTypeService.get_audit_types(s=s)


@router.get("/{audit_type_id}", response_model=Response, summary="Get an audit type by ID")
async def read_audit_type(
    audit_type_id: int,
    s: AsyncSession = Depends(get_async_db),
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve a single audit type by its ID.

    Args:
        audit_type_id (int): The ID of the audit type to retrieve.

    Returns:
        Response: A response object containing the audit type data.
    """
    return await AuditTypeService.get_audit_type(s=s, audit_type_id=audit_type_id)


@router.post(
    "/",
    response_model=Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new audit type",
)
async def creating_audit_type(
    audit_type: AuditTypeCreate,
    s: AsyncSession = Depends(get_async_db),
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

    return await AuditTypeService.create_audit_type(s=s, data=audit_type)


@router.put("/{audit_type_id}", response_model=Response, summary="Update an audit type")
async def updating_audit_type(
    audit_type_id: int,
    audit_type: AuditTypeUpdate,
    s: AsyncSession = Depends(get_async_db),
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

    return await AuditTypeService.update_audit_type(s=s, audit_type_id=audit_type_id, data=audit_type)


@router.delete(
    "/{audit_type_id}",
    response_model=Response,
    summary="Delete an audit type",
)
async def deleting_audit_type(
    audit_type_id: int,
    s: AsyncSession = Depends(get_async_db),
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

    return await AuditTypeService.delete_audit_type(s=s, audit_type_id=audit_type_id)


router_audit_type = router
