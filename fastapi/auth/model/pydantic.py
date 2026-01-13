"""
Pydantic Models for API Data Transfer Objects.

This module defines Pydantic models used for request and response payloads
in the FastAPI application. These models are manually defined to provide
explicit control over data validation and serialization, separate from
the SQLAlchemy ORM models.
"""

from __future__ import annotations  # For forward references

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

# --- Base Models (common fields) ---


class TenantBase(BaseModel):
    name: str = Field(..., max_length=50)


class AuditTypeBase(BaseModel):
    name: str = Field(..., max_length=50)


class ObjectTypeBase(BaseModel):
    name: str = Field(..., max_length=50)


class PermissionTypeBase(BaseModel):
    name: str = Field(..., max_length=50)


class RoleBase(BaseModel):
    name: str
    display_name: Optional[str] = Field(None, max_length=50)
    tenant_id: int


class ObjectBase(BaseModel):
    name: str
    display_name: Optional[str] = None
    object_type_id: int
    tenant_id: int


class UserBase(BaseModel):
    username: str
    names: Optional[str] = None
    surnames: Optional[str] = None
    role_id: int
    tenant_id: int


class PermissionBase(BaseModel):
    name: str = Field(..., max_length=50)
    permission_type_id: int
    object_id: int
    tenant_id: int


class AuditBase(BaseModel):
    data: Optional[str] = None
    input: Optional[str] = None
    user_id: int
    audit_type_id: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: Optional[str] = None
    tenant_id: int


# --- Create Models (for POST requests) ---


class TenantCreate(TenantBase):
    pass


class AuditTypeCreate(AuditTypeBase):
    pass


class ObjectTypeCreate(ObjectTypeBase):
    pass


class PermissionTypeCreate(PermissionTypeBase):
    pass


class RoleCreate(RoleBase):
    permissions: List[int] = []


class ObjectCreate(ObjectBase):
    pass


class UserCreate(UserBase):
    password: str


class PermissionCreate(PermissionBase):
    pass


class AuditCreate(AuditBase):
    pass


# --- Update Models (for PUT/PATCH requests) ---


class TenantUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class AuditTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class ObjectTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class PermissionTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = Field(None, max_length=50)
    permissions: Optional[List[int]] = None


class ObjectUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    object_type_id: Optional[int] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    names: Optional[str] = None
    surnames: Optional[str] = None
    role_id: Optional[int] = None


class PermissionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    permission_type_id: Optional[int] = None
    object_id: Optional[int] = None


class AuditUpdate(BaseModel):
    data: Optional[str] = None
    input: Optional[str] = None
    user_id: Optional[int] = None
    audit_type_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: Optional[str] = None


# --- Output Models (for GET responses) ---
# These include 'id' and can represent nested relationships.


class TenantOut(TenantBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class AuditTypeOut(AuditTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)  # Enable ORM mode for SQLAlchemy compatibility


class ObjectTypeOut(ObjectTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PermissionTypeOut(PermissionTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class RoleOut(RoleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ObjectOut(ObjectBase):
    id: int
    object_type: Optional[ObjectTypeOut] = None  # Nested relationship

    model_config = ConfigDict(from_attributes=True)


class UserOut(UserBase):
    id: int
    role: Optional[RoleOut] = None  # Nested relationship

    model_config = ConfigDict(from_attributes=True)


class AuditOut(AuditBase):
    id: int
    user: Optional[UserOut] = None  # Nested relationship
    audit_type: Optional[AuditTypeOut] = None  # Nested relationship

    model_config = ConfigDict(from_attributes=True)


class PermissionOut(PermissionBase):
    id: int
    permission_type: Optional[PermissionTypeOut] = None  # Nested relationship
    object: Optional[ObjectOut] = None  # Nested relationship

    model_config = ConfigDict(from_attributes=True)


# --- Custom Pydantic Models for specific API interactions ---


class LoginCredentials(BaseModel):
    """Request model for the /login endpoint."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Response model for successful login."""

    access_token: str
    refresh_token: Optional[str] = None
    id: int
    username: str
    names: Optional[str] = None
    surnames: Optional[str] = None
    role_id: int
    tenant_id: int
    scopes: list[str]
