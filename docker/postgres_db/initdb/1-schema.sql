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
-- Name: auditing; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.auditing (
    id bigint NOT NULL,
    data text,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone,
    input text,
    id_user smallint NOT NULL,
    id_auditing_type smallint NOT NULL
);


ALTER TABLE auth.auditing OWNER TO postgres;

--
-- Name: auditing_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.auditing ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.auditing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auditing_type; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.auditing_type (
    id smallint NOT NULL,
    name character varying(50),
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone
);


ALTER TABLE auth.auditing_type OWNER TO postgres;

--
-- Name: auditing_type_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.auditing_type ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.auditing_type_id_seq
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
    id_object_type smallint NOT NULL
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
    id smallint NOT NULL,
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
-- Name: rol; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.rol (
    id smallint NOT NULL,
    name text,
    display_name character varying(50),
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modificated_date timestamp with time zone
);


ALTER TABLE auth.rol OWNER TO postgres;

--
-- Name: rol_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.rol ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.rol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol_permission; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.rol_permission (
    id bigint NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    id_rol smallint,
    id_permission smallint
);


ALTER TABLE auth.rol_permission OWNER TO postgres;

--
-- Name: rol_permission_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.rol_permission ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.rol_permission_id_seq
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
    id_rol smallint NOT NULL
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
-- Name: auditing auditing_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.auditing
    ADD CONSTRAINT auditing_pk PRIMARY KEY (id);


--
-- Name: auditing_type auditing_types_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.auditing_type
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
-- Name: rol_permission rol_permission_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.rol_permission
    ADD CONSTRAINT rol_permission_pk PRIMARY KEY (id);


--
-- Name: rol rol_pk; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.rol
    ADD CONSTRAINT rol_pk PRIMARY KEY (id);


--
-- Name: user user_uq; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth."user"
    ADD CONSTRAINT user_uq UNIQUE (id_rol);


--
-- Name: auditing auditing_type_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.auditing
    ADD CONSTRAINT auditing_type_fk FOREIGN KEY (id_auditing_type) REFERENCES auth.auditing_type(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: rol_permission permission_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.rol_permission
    ADD CONSTRAINT permission_fk FOREIGN KEY (id_permission) REFERENCES auth.permission(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: permission permission_type_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.permission
    ADD CONSTRAINT permission_type_fk FOREIGN KEY (id_permission_type) REFERENCES auth.permission_type(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user rol_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth."user"
    ADD CONSTRAINT rol_fk FOREIGN KEY (id_rol) REFERENCES auth.rol(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rol_permission rol_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.rol_permission
    ADD CONSTRAINT rol_fk FOREIGN KEY (id_rol) REFERENCES auth.rol(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: auditing user_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.auditing
    ADD CONSTRAINT user_fk FOREIGN KEY (id_user) REFERENCES auth."user"(id) MATCH FULL ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

