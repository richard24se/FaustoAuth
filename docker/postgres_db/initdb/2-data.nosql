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
-- Data for Name: audit_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.audit_type (id, name, created_date, modificated_date) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.role (id, name, display_name, created_date, modificated_date) FROM stdin;
1	Admin	Administrator	2020-06-25 01:53:25.471654+00	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth."user" (id, username, password, names, surnames, created_date, modificated_date, id_role) FROM stdin;
2	admin@faustoauth.app	$admin	FaustoAuth	Administrator	2020-06-25 02:14:50.36715+00	\N	1
\.


--
-- Data for Name: audit; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.audit (id, data, created_date, modificated_date, input, id_user, id_audit_type) FROM stdin;
\.


--
-- Data for Name: object_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.object_type (id, name, created_date, modificated_date) FROM stdin;
1	web	2020-06-25 01:45:36.695837+00	\N
\.


--
-- Data for Name: object; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.object (id, name, created_date, modificated_date, id_object_type, display_name) FROM stdin;
1	userControl	2020-06-25 01:49:55.673365+00	\N	1	User control
\.


--
-- Data for Name: permission_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.permission_type (id, name, created_date, modificated_date) FROM stdin;
1	total control	2020-06-25 01:43:28.679511+00	\N
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.permission (id, name, created_date, modificated_date, id_permission_type, id_object) FROM stdin;
1	User Manager	2020-06-25 01:52:21.867896+00	\N	1	1
\.


--
-- Data for Name: role_permission; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.role_permission (id, created_date, id_permission, id_role) FROM stdin;
1	2020-06-25 01:53:52.809224+00	1	1
\.


--
-- Name: audit_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.audit_id_seq', 1, false);


--
-- Name: audit_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.audit_type_id_seq', 1, false);


--
-- Name: object_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.object_id_seq', 1, true);


--
-- Name: object_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.object_type_id_seq', 1, true);


--
-- Name: permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_id_seq', 1, true);


--
-- Name: permission_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_type_id_seq', 1, true);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.role_id_seq', 1, true);


--
-- Name: role_permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.role_permission_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.user_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

