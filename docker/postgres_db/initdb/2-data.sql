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
-- Data for Name: auditing_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.auditing_type (id, name, created_date, modificated_date) FROM stdin;
1	AUDITING_TYPE TEST 1	2020-03-09 16:13:33.063784+00	\N
\.


--
-- Data for Name: rol; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.rol (id, name, display_name, created_date, modificated_date) FROM stdin;
1	admin	Administrador	2020-03-09 16:12:55.648846+00	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth."user" (id, username, password, names, surnames, created_date, modificated_date, id_rol) FROM stdin;
2	USER TEST 1	TEST	TEST	1	2020-03-09 16:14:59.665753+00	\N	1
\.


--
-- Data for Name: auditing; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.auditing (id, data, created_date, modificated_date, input, id_user, id_auditing_type) FROM stdin;
1	DATA TEST 1	2020-03-09 16:15:35.47442+00	\N	INPUT TEST 1	2	1
\.


--
-- Data for Name: object_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.object_type (id, name, created_date, modificated_date) FROM stdin;
1	Web	2020-03-09 16:09:34.867461+00	\N
2	Movil	2020-03-19 15:15:08.143407+00	\N
\.


--
-- Data for Name: object; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.object (id, name, created_date, modificated_date, id_object_type) FROM stdin;
2	Crear Proyecto	2020-03-09 16:10:11.043754+00	\N	1
\.


--
-- Data for Name: permission_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.permission_type (id, name, created_date, modificated_date) FROM stdin;
1	Crear	2020-03-09 16:10:51.525856+00	\N
2	Consultar	2020-03-19 15:16:31.90481+00	\N
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.permission (id, name, created_date, modificated_date, id_permission_type, id_object) FROM stdin;
2	Create Proyecto	2020-03-09 16:12:03.931409+00	\N	1	2
\.


--
-- Data for Name: rol_permission; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.rol_permission (id, created_date, id_rol, id_permission) FROM stdin;
1	2020-03-10 16:54:51.233219+00	1	2
\.


--
-- Name: auditing_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.auditing_id_seq', 1, true);


--
-- Name: auditing_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.auditing_type_id_seq', 1, true);


--
-- Name: object_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.object_id_seq', 2, true);


--
-- Name: object_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.object_type_id_seq', 2, true);


--
-- Name: permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_id_seq', 2, true);


--
-- Name: permission_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_type_id_seq', 2, true);


--
-- Name: rol_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.rol_id_seq', 1, true);


--
-- Name: rol_permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.rol_permission_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.user_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

