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
2	query	Gerente de Produccion	2020-06-19 07:34:00.019756+00	\N
5	testt	test	2020-06-19 20:09:04.394359+00	\N
6	Testts-update	Test	2020-06-19 20:11:34.616881+00	\N
1	Admin	Administrador	2020-06-19 07:34:00.019756+00	\N
7	Admin sole	Administrador	2020-06-23 21:39:40.495268+00	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth."user" (id, username, password, names, surnames, created_date, modificated_date, id_role) FROM stdin;
2	USER TEST 1	TEST	TEST	1	2020-03-09 16:14:59.665753+00	\N	1
7	asdasdas@hotmail.com	test4	Anthony	Dsadsada	2020-06-21 05:06:59.036615+00	\N	2
9	test@test.com	testleon	Anthony	Leon 	2020-06-23 21:40:27.191727+00	\N	7
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
1	Web	2020-03-09 16:09:34.867461+00	\N
2	Movil	2020-03-19 15:15:08.143407+00	\N
\.


--
-- Data for Name: object; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.object (id, name, created_date, modificated_date, id_object_type, display_name) FROM stdin;
4	crear_elemento	2020-03-19 16:36:10.245773+00	\N	1	CREAR ELEMENTO
7	crear_actividad	2020-03-19 20:09:26.87339+00	\N	1	CREAR ACTIVIDAD
8	crear_elemento_masivo	2020-03-19 20:09:26.87339+00	\N	1	CREAR ELEMENTO MASIVO
9	asignar_actividad	2020-03-19 20:09:26.87339+00	\N	1	ASIGNAR ACTIVIDAD
10	avance_obra	2020-03-19 20:09:26.87339+00	\N	1	AVANCE DE OBRA
11	documentos	2020-03-19 20:09:26.87339+00	\N	1	DOCUMENTOS
12	inspeccion	2020-03-19 20:09:26.87339+00	\N	1	INSPECCION
13	personal_obra	2020-03-19 20:09:26.87339+00	\N	1	PERSONAL EN OBRA
14	registro_fotografico	2020-03-19 20:09:26.87339+00	\N	1	REGISTRO FOTOGRAFICO
15	crear_cargo	2020-03-19 20:09:26.87339+00	\N	1	CREAR CARGO\n
16	crear_cliente	2020-03-19 20:09:26.87339+00	\N	1	CREAR CLIENTE
17	crear_contratista	2020-03-19 20:09:26.87339+00	\N	1	CREAR CONTRATISTA
18	crear_emergencia	2020-03-19 20:09:26.87339+00	\N	1	CREAR EMERGENCIA
19	crear_estado\n	2020-03-19 20:09:26.87339+00	\N	1	CREAR ESTADO
20	crear_personal	2020-03-19 20:09:26.87339+00	\N	1	CREAR PERSONAL
21	crear_preguntas	2020-03-19 20:09:26.87339+00	\N	1	CREAR PREGUNTAS
22	crear_tipo_elementos	2020-03-19 20:09:26.87339+00	\N	1	CREAR TIPO ELEMENTO
30	TEST	2020-06-18 21:34:37.213467+00	2020-06-18 21:34:50.956799+00	2	Test
2	consultarNotificacion	2020-03-09 16:10:11.043754+00	2020-06-23 15:31:49.871613+00	1	Consultar notificación
32	forecastVentas	2020-06-23 21:27:47.728153+00	\N	1	Forecast ventas
33	capacidadPlanta	2020-06-23 21:28:46.810833+00	\N	1	Capacidad de plantas
34	registrarNotificacion	2020-06-23 21:29:26.87272+00	\N	1	Registrar notificacion
35	margenVentas	2020-06-23 21:30:05.65051+00	\N	1	Margen de ventas
36	planificacion	2020-06-23 21:30:33.210602+00	\N	1	Planificación
37	ingresoMasivo	2020-06-23 21:30:55.554834+00	\N	1	Ingreso masivo
38	sincronizacion	2020-06-23 21:31:37.748526+00	\N	1	Sincronización de datos
39	controlUsuario	2020-06-24 19:39:03.467214+00	\N	1	Control de usuario
\.


--
-- Data for Name: permission_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.permission_type (id, name, created_date, modificated_date) FROM stdin;
1	Crear	2020-03-09 16:10:51.525856+00	\N
2	Modificar 	2020-03-19 15:16:31.90481+00	\N
3	Eiminar	2020-03-19 16:38:56.749364+00	\N
4	Reporte	2020-03-19 20:16:46.408496+00	\N
5	Control total	2020-06-23 21:34:31.197202+00	\N
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.permission (id, name, created_date, modificated_date, id_permission_type, id_object) FROM stdin;
2	Crear Proyecto	2020-03-09 16:12:03.931409+00	\N	1	2
3	Modificar Proyecto	2020-03-19 16:38:31.069915+00	\N	2	2
4	Eliminar Proyecto	2020-03-19 20:43:51.706697+00	\N	3	2
5	Reporte Proyecto	2020-03-19 20:43:51.706697+00	\N	4	2
6	Crear Elemento	2020-03-19 20:43:51.706697+00	\N	1	4
7	Modificar Elemento	2020-03-19 20:43:51.706697+00	\N	2	4
8	Eliminar Elemento	2020-03-19 20:43:51.706697+00	\N	3	4
9	Reporte Elemento	2020-03-19 20:43:51.706697+00	\N	4	4
10	Crear Actividad	2020-03-19 20:43:51.706697+00	\N	1	7
11	Modificar Actividad	2020-03-19 20:43:51.706697+00	\N	2	7
12	Eliminar Actividad	2020-03-19 20:43:51.706697+00	\N	3	7
13	Reporte Actividad	2020-03-19 20:43:51.706697+00	\N	4	7
14	Crear Elemento Masvio	2020-03-19 20:43:51.706697+00	\N	1	8
15	Modificar Elemento Masivo	2020-03-19 20:43:51.706697+00	\N	2	8
16	Eliminar Elemento Masivo	2020-03-19 20:43:51.706697+00	\N	3	8
17	Reporte Elemento Masivo	2020-03-19 20:43:51.706697+00	\N	4	8
18	Crear Asignar Actividad	2020-03-19 20:43:51.706697+00	\N	1	9
19	Modificar Asignar Actividad	2020-03-19 20:43:51.706697+00	\N	2	9
20	Eliminar Asignar Actividad	2020-03-19 20:43:51.706697+00	\N	3	9
21	Reporte Asignar Actividad	2020-03-19 20:43:51.706697+00	\N	4	9
22	Crear Avance Obra	2020-03-19 20:43:51.706697+00	\N	1	10
23	Modificar Avance Obra	2020-03-19 20:43:51.706697+00	\N	2	10
24	Eliminar Avance Obra	2020-03-19 20:43:51.706697+00	\N	3	10
25	Reportar Avance Obra	2020-03-19 20:43:51.706697+00	\N	4	10
26	Crear Documentos	2020-03-19 20:43:51.706697+00	\N	1	11
27	Modificar Documentos	2020-03-19 20:43:51.706697+00	\N	2	11
28	Eliminar Documentos	2020-03-19 20:43:51.706697+00	\N	3	11
29	Reporte Documentos	2020-03-19 20:43:51.706697+00	\N	4	11
30	Crear Inspeccion	2020-03-19 20:43:51.706697+00	\N	1	12
31	Eliminar Inspeccion\n	2020-03-19 20:43:51.706697+00	\N	2	12
32	Modificar Inspeccion	2020-03-19 20:43:51.706697+00	\N	3	12
33	Reporte Inspeccion	2020-03-19 20:43:51.706697+00	\N	4	12
34	Crear Personal Obra	2020-03-19 20:43:51.706697+00	\N	1	13
35	Modificar Personal Obra	2020-03-19 20:43:51.706697+00	\N	2	13
36	Eliminar Personal Obra	2020-03-19 20:43:51.706697+00	\N	3	13
37	Reporte Personal Obra	2020-03-19 20:43:51.706697+00	\N	4	13
38	Crear Registro Fotografico	2020-03-19 20:43:51.706697+00	\N	1	14
39	Modificar Registro Fotografico	2020-03-19 20:43:51.706697+00	\N	2	14
40	Eliminar Registro Fotografico	2020-03-19 20:43:51.706697+00	\N	3	14
41	Modificar Registro Fotografico	2020-03-19 20:43:51.706697+00	\N	4	14
42	Crear Cargo	2020-03-19 20:43:51.706697+00	\N	1	15
43	Modificar Cargo	2020-03-19 20:43:51.706697+00	\N	2	15
44	Eliminar Cargo	2020-03-19 20:43:51.706697+00	\N	3	15
45	Reporte Cargo	2020-03-19 20:43:51.706697+00	\N	4	15
46	Crear Cliente	2020-03-19 20:43:51.706697+00	\N	1	16
47	Modificar Cliente	2020-03-19 20:43:51.706697+00	\N	2	16
48	Eliminar Cliente	2020-03-19 20:43:51.706697+00	\N	3	16
49	Reporte Cliente	2020-03-19 20:43:51.706697+00	\N	4	16
50	Crear Contratista	2020-03-19 20:43:51.706697+00	\N	1	17
51	Modificar Contratista	2020-03-19 20:43:51.706697+00	\N	2	17
52	Eliminar Contratista	2020-03-19 20:43:51.706697+00	\N	3	17
53	Reporte Contratista	2020-03-19 20:43:51.706697+00	\N	4	17
54	Crear Emergencia	2020-03-19 20:43:51.706697+00	\N	1	18
55	Modificar Emergencia	2020-03-19 20:43:51.706697+00	\N	2	18
56	Eliminar Emergencia	2020-03-19 20:43:51.706697+00	\N	3	18
57	Reporte Emergencia	2020-03-19 20:43:51.706697+00	\N	4	18
58	Crear Estado 	2020-03-19 20:43:51.706697+00	\N	1	19
59	Modificar Estado	2020-03-19 20:43:51.706697+00	\N	2	19
60	Eliminar Estado	2020-03-19 20:43:51.706697+00	\N	3	19
61	Reporte Estado	2020-03-19 20:43:51.706697+00	\N	4	19
62	Crear Personal	2020-03-19 20:43:51.706697+00	\N	1	20
63	Modificar Personal	2020-03-19 20:43:51.706697+00	\N	2	20
64	Eliminar Personal	2020-03-19 20:43:51.706697+00	\N	3	20
65	Reporte Personal	2020-03-19 20:43:51.706697+00	\N	4	20
66	Crear Preguntas	2020-03-19 20:43:51.706697+00	\N	1	21
67	Modificar Preguntas	2020-03-19 20:43:51.706697+00	\N	2	21
68	Eliminar Preguntas	2020-03-19 20:43:51.706697+00	\N	3	21
69	Reporte Preguntas	2020-03-19 20:43:51.706697+00	\N	4	21
70	Crear Tipo Elemento	2020-03-19 20:43:51.706697+00	\N	1	22
71	Modificar Tipo Elemento	2020-03-19 20:43:51.706697+00	\N	2	22
72	Eliminar Tipo Elemento	2020-03-19 20:43:51.706697+00	\N	3	22
73	Reporte Tipo Elemento	2020-03-19 20:43:51.706697+00	\N	4	22
76	Reporte Crear proyecto	2020-06-16 18:21:22.879429+00	\N	4	2
77	Reporte Crear elemento	2020-06-16 18:21:22.935268+00	\N	4	4
78	Crear Crear proyecto	2020-06-16 19:16:42.860273+00	\N	1	2
79	Crear Crear elemento	2020-06-16 19:16:42.917909+00	\N	1	4
80	Crear Avance de obra	2020-06-16 19:20:32.016003+00	\N	1	10
81	Crear Crear tipo elemento	2020-06-16 19:20:32.083707+00	\N	1	22
84	Testt	2020-06-19 06:33:08.944577+00	2020-06-19 06:33:18.74281+00	1	30
85	Ingreso masivo	2020-06-23 21:35:01.380048+00	\N	5	37
86	Sincronizacion de datos	2020-06-23 21:35:27.354536+00	\N	5	38
87	Planificacion	2020-06-23 21:36:18.00789+00	\N	5	36
88	Margen de ventas	2020-06-23 21:36:48.637779+00	\N	5	35
89	Forecast de ventas	2020-06-23 21:37:27.169644+00	\N	5	32
90	Registrar notificacion	2020-06-23 21:37:48.221657+00	\N	5	34
91	Control de usuario	2020-06-24 19:40:33.627179+00	\N	5	39
\.


--
-- Data for Name: role_permission; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.role_permission (id, created_date, id_permission, id_role) FROM stdin;
1	2020-06-19 20:11:34.631014+00	60	6
2	2020-06-19 20:11:34.654954+00	14	6
3	2020-06-19 20:11:34.67006+00	16	6
5	2020-06-19 22:29:35.51688+00	2	1
6	2020-06-23 21:39:40.516065+00	85	7
7	2020-06-23 21:39:40.544868+00	86	7
8	2020-06-23 21:39:40.56001+00	90	7
9	2020-06-23 21:39:40.573097+00	89	7
10	2020-06-23 21:39:40.587197+00	88	7
11	2020-06-23 21:39:40.599516+00	87	7
12	2020-06-24 19:40:52.49043+00	91	7
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

SELECT pg_catalog.setval('auth.object_id_seq', 39, true);


--
-- Name: object_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.object_type_id_seq', 2, true);


--
-- Name: permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_id_seq', 91, true);


--
-- Name: permission_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_type_id_seq', 5, true);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.role_id_seq', 7, true);


--
-- Name: role_permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.role_permission_id_seq', 12, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.user_id_seq', 9, true);


--
-- PostgreSQL database dump complete
--

