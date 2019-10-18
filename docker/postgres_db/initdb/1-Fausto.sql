-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler  version: 0.9.1
-- PostgreSQL version: 10.0
-- Project Site: pgmodeler.io
-- Model Author: ---


-- Database creation must be done outside a multicommand file.
-- These commands were put in this file only as a convenience.
-- -- object: "Fausto" | type: DATABASE --
-- -- DROP DATABASE IF EXISTS "Fausto";
-- CREATE DATABASE "Fausto";
-- -- ddl-end --
-- 

-- object: auth | type: SCHEMA --
-- DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA auth;
-- ddl-end --
ALTER SCHEMA auth OWNER TO postgres;
-- ddl-end --

SET search_path TO pg_catalog,public,auth;
-- ddl-end --

-- object: auth."User" | type: TABLE --
-- DROP TABLE IF EXISTS auth."User" CASCADE;
CREATE TABLE auth."User"(
	id smallint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	username text,
	password text,
	names text,
	surnames text,
	CONSTRAINT "User_pk" PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE auth."User" OWNER TO postgres;
-- ddl-end --

-- object: auth."Rol" | type: TABLE --
-- DROP TABLE IF EXISTS auth."Rol" CASCADE;
CREATE TABLE auth."Rol"(
	id smallint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	name text,
	CONSTRAINT rol_pk PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE auth."Rol" OWNER TO postgres;
-- ddl-end --


