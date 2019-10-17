# coding: utf-8
from sqlalchemy import Column, SmallInteger, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class Rol(Base):
    __tablename__ = 'Rol'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    name = Column(Text)


class User(Base):
    __tablename__ = 'User'
    __table_args__ = {'schema': 'auth'}

    id = Column(SmallInteger, primary_key=True)
    username = Column(Text)
    password = Column(Text)
    names = Column(Text)
    surnames = Column(Text)
