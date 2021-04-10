# coding: utf-8
from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, SmallInteger, String, Text, text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class AuditType(Base):
    __tablename__ = 'audit_type'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    name = Column(String(50))
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))


class ObjectType(Base):
    __tablename__ = 'object_type'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    name = Column(String(50))
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))


class PermissionType(Base):
    __tablename__ = 'permission_type'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    name = Column(String(50))
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))


class Role(Base):
    __tablename__ = 'role'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    name = Column(Text)
    display_name = Column(String(50))
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))


class Object(Base):
    __tablename__ = 'object'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    name = Column(Text)
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))
    id_object_type = Column(ForeignKey('auth.object_type.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)
    display_name = Column(Text)

    object_type = relationship('ObjectType')


class User(Base):
    __tablename__ = 'user'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    username = Column(Text)
    password = Column(Text)
    names = Column(Text)
    surnames = Column(Text)
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))
    id_role = Column(ForeignKey('auth.role.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)

    role = relationship('Role')


class Audit(Base):
    __tablename__ = 'audit'
    __table_args__ = {'schema': 'auth'}

    id = Column(BigInteger, primary_key=True)
    data = Column(Text)
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))
    input = Column(Text)
    id_user = Column(ForeignKey('auth.user.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)
    id_audit_type = Column(ForeignKey('auth.audit_type.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)

    audit_type = relationship('AuditType')
    user = relationship('User')


class Permission(Base):
    __tablename__ = 'permission'
    __table_args__ = {'schema': 'auth'}

    id = Column(BigInteger, primary_key=True)
    name = Column(String(50))
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    modificated_date = Column(DateTime(True))
    id_permission_type = Column(ForeignKey('auth.permission_type.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)
    id_object = Column(ForeignKey('auth.object.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)

    object = relationship('Object')
    permission_type = relationship('PermissionType')


class RolePermission(Base):
    __tablename__ = 'role_permission'
    __table_args__ = {'schema': 'auth'}

    id = Column(BigInteger, primary_key=True)
    created_date = Column(DateTime(True), server_default=text("CURRENT_TIMESTAMP"))
    id_permission = Column(ForeignKey('auth.permission.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)
    id_role = Column(ForeignKey('auth.role.id', ondelete='RESTRICT', onupdate='CASCADE', match='FULL'), nullable=False)

    permission = relationship('Permission')
    role = relationship('Role')
