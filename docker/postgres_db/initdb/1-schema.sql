--
-- PostgreSQL database dump
--

-- Dumped from database version 10.11 (Debian 10.11-1.pgdg90+1)
-- Dumped by pg_dump version 10.11 (Debian 10.11-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: audit; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.audit (
    id bigint NOT NULL,
    data text,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone,
    input text,
    id_user smallint NOT NULL,
    id_audit_type smallint NOT NULL
);


ALTER TABLE auth.audit OWNER TO postgres;

--
-- Name: audit_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.audit ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_type; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.audit_type (
    id smallint NOT NULL,
    name character varying(50),
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone
);


ALTER TABLE auth.audit_type OWNER TO postgres;

--
-- Name: audit_type_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.audit_type ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.audit_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: object; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.object (
    id smallint NOT NULL,
    name text,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone,
    id_object_type smallint NOT NULL,
    display_name text
);


ALTER TABLE auth.object OWNER TO postgres;

--
-- Name: object_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.object ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.object_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: object_type; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.object_type (
    id smallint NOT NULL,
    name character varying(50),
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone
);


ALTER TABLE auth.object_type OWNER TO postgres;

--
-- Name: object_type_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.object_type ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.object_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permission; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.permission (
    id bigint NOT NULL,
    name character varying(50),
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone,
    id_permission_type smallint NOT NULL,
    id_object smallint NOT NULL
);


ALTER TABLE auth.permission OWNER TO postgres;

--
-- Name: permission_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.permission ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permission_type; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.permission_type (
    id smallint NOT NULL,
    name character varying(50),
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone
);


ALTER TABLE auth.permission_type OWNER TO postgres;

--
-- Name: permission_type_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.permission_type ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.permission_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.role (
    id smallint NOT NULL,
    name text,
    display_name character varying(50),
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone
);


ALTER TABLE auth.role OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.role ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permission; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.role_permission (
    id bigint NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    id_permission bigint NOT NULL,
    id_role smallint NOT NULL
);


ALTER TABLE auth.role_permission OWNER TO postgres;

--
-- Name: role_permission_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.role_permission ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.role_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth."user" (
    id smallint NOT NULL,
    username text,
    password text,
    names text,
    surnames text,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone,
    id_role smallint NOT NULL
);


ALTER TABLE auth."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth."user" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user User_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth."user"
    ADD CONSTRAINT "User_pk" PRIMARY KEY (id);


--
-- Name: audit auditing_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.audit
    ADD CONSTRAINT auditing_pk PRIMARY KEY (id);


--
-- Name: audit_type auditing_types_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.audit_type
    ADD CONSTRAINT auditing_types_pk PRIMARY KEY (id);


--
-- Name: object_type object_type_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.object_type
    ADD CONSTRAINT object_type_pk PRIMARY KEY (id);


--
-- Name: object objects_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.object
    ADD CONSTRAINT objects_pk PRIMARY KEY (id);


--
-- Name: permission permissions_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.permission
    ADD CONSTRAINT permissions_pk PRIMARY KEY (id);


--
-- Name: permission_type permissions_types_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.permission_type
    ADD CONSTRAINT permissions_types_pk PRIMARY KEY (id);


--
-- Name: role_permission rol_permission_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.role_permission
    ADD CONSTRAINT rol_permission_pk PRIMARY KEY (id);


--
-- Name: role rol_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.role
    ADD CONSTRAINT rol_pk PRIMARY KEY (id);


--
-- Name: audit audit_type_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.audit
    ADD CONSTRAINT audit_type_fk FOREIGN KEY (id_audit_type) REFERENCES auth.audit_type(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: permission object_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.permission
    ADD CONSTRAINT object_fk FOREIGN KEY (id_object) REFERENCES auth.object(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: object object_type_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.object
    ADD CONSTRAINT object_type_fk FOREIGN KEY (id_object_type) REFERENCES auth.object_type(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permission permission_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.role_permission
    ADD CONSTRAINT permission_fk FOREIGN KEY (id_permission) REFERENCES auth.permission(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: permission permission_type_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.permission
    ADD CONSTRAINT permission_type_fk FOREIGN KEY (id_permission_type) REFERENCES auth.permission_type(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permission role_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.role_permission
    ADD CONSTRAINT role_fk FOREIGN KEY (id_role) REFERENCES auth.role(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user role_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth."user"
    ADD CONSTRAINT role_fk FOREIGN KEY (id_role) REFERENCES auth.role(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit user_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.audit
    ADD CONSTRAINT user_fk FOREIGN KEY (id_user) REFERENCES auth."user"(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

