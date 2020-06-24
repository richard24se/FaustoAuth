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
2	creator	Creador de Proyecto	2020-03-19 20:59:01.582256+00	\N
3	report	Generador de Reportes	2020-03-19 20:59:01.582256+00	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth."user" (id, username, password, names, surnames, created_date, modificated_date, id_rol) FROM stdin;
2	USER TEST 1	TEST	TEST	1	2020-03-09 16:14:59.665753+00	\N	1
5	test	test	TEST	1	2020-03-25 01:21:11.715958+00	\N	1
6	USER TEST 3	TEST	TEST	1	2020-03-25 01:21:11.715958+00	\N	1
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

COPY auth.object (id, name, created_date, modificated_date, id_object_type, display_name) FROM stdin;
2	crear_proyecto	2020-03-09 16:10:11.043754+00	\N	1	CREAR PROYECTO
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
\.


--
-- Data for Name: permission_type; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.permission_type (id, name, created_date, modificated_date) FROM stdin;
1	Crear	2020-03-09 16:10:51.525856+00	\N
2	Modificar 	2020-03-19 15:16:31.90481+00	\N
3	Eiminar	2020-03-19 16:38:56.749364+00	\N
4	Reporte	2020-03-19 20:16:46.408496+00	\N
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
\.


--
-- Data for Name: rol_permission; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.rol_permission (id, created_date, id_rol, id_permission) FROM stdin;
1	2020-03-10 16:54:51.233219+00	1	2
2	2020-03-19 16:40:34.345846+00	1	3
145	2020-03-19 21:17:31.904428+00	1	4
146	2020-03-19 21:17:31.904428+00	1	5
147	2020-03-19 21:17:31.904428+00	1	6
148	2020-03-19 21:17:31.904428+00	1	7
149	2020-03-19 21:17:31.904428+00	1	8
150	2020-03-19 21:17:31.904428+00	1	9
151	2020-03-19 21:17:31.904428+00	1	10
152	2020-03-19 21:17:31.904428+00	1	11
153	2020-03-19 21:17:31.904428+00	1	12
154	2020-03-19 21:17:31.904428+00	1	13
155	2020-03-19 21:17:31.904428+00	1	14
156	2020-03-19 21:17:31.904428+00	1	15
157	2020-03-19 21:17:31.904428+00	1	16
158	2020-03-19 21:17:31.904428+00	1	17
159	2020-03-19 21:17:31.904428+00	1	18
160	2020-03-19 21:17:31.904428+00	1	19
161	2020-03-19 21:17:31.904428+00	1	20
162	2020-03-19 21:17:31.904428+00	1	21
163	2020-03-19 21:17:31.904428+00	1	22
164	2020-03-19 21:17:31.904428+00	1	23
165	2020-03-19 21:17:31.904428+00	1	24
166	2020-03-19 21:17:31.904428+00	1	25
167	2020-03-19 21:17:31.904428+00	1	26
168	2020-03-19 21:17:31.904428+00	1	27
169	2020-03-19 21:17:31.904428+00	1	28
170	2020-03-19 21:17:31.904428+00	1	29
171	2020-03-19 21:17:31.904428+00	1	30
172	2020-03-19 21:17:31.904428+00	1	31
173	2020-03-19 21:17:31.904428+00	1	32
174	2020-03-19 21:17:31.904428+00	1	33
175	2020-03-19 21:17:31.904428+00	1	34
176	2020-03-19 21:17:31.904428+00	1	35
177	2020-03-19 21:17:31.904428+00	1	36
178	2020-03-19 21:17:31.904428+00	1	37
179	2020-03-19 21:17:31.904428+00	1	38
180	2020-03-19 21:17:31.904428+00	1	39
181	2020-03-19 21:17:31.904428+00	1	40
182	2020-03-19 21:17:31.904428+00	1	41
183	2020-03-19 21:17:31.904428+00	1	42
184	2020-03-19 21:17:31.904428+00	1	43
185	2020-03-19 21:17:31.904428+00	1	44
186	2020-03-19 21:17:31.904428+00	1	45
187	2020-03-19 21:17:31.904428+00	1	46
188	2020-03-19 21:17:31.904428+00	1	47
189	2020-03-19 21:17:31.904428+00	1	48
190	2020-03-19 21:17:31.904428+00	1	49
191	2020-03-19 21:17:31.904428+00	1	50
192	2020-03-19 21:17:31.904428+00	1	51
193	2020-03-19 21:17:31.904428+00	1	52
194	2020-03-19 21:17:31.904428+00	1	53
195	2020-03-19 21:17:31.904428+00	1	54
196	2020-03-19 21:17:31.904428+00	1	55
197	2020-03-19 21:17:31.904428+00	1	56
198	2020-03-19 21:17:31.904428+00	1	57
199	2020-03-19 21:17:31.904428+00	1	58
200	2020-03-19 21:17:31.904428+00	1	59
201	2020-03-19 21:17:31.904428+00	1	60
202	2020-03-19 21:17:31.904428+00	1	61
203	2020-03-19 21:17:31.904428+00	1	62
204	2020-03-19 21:17:31.904428+00	1	63
205	2020-03-19 21:17:31.904428+00	1	64
206	2020-03-19 21:17:31.904428+00	1	65
207	2020-03-19 21:17:31.904428+00	1	66
208	2020-03-19 21:17:31.904428+00	1	67
209	2020-03-19 21:17:31.904428+00	1	68
210	2020-03-19 21:17:31.904428+00	1	69
211	2020-03-19 21:17:31.904428+00	1	70
212	2020-03-19 21:17:31.904428+00	1	71
213	2020-03-19 21:17:31.904428+00	1	72
214	2020-03-19 21:17:31.904428+00	1	73
216	2020-03-19 21:17:31.904428+00	2	2
217	2020-03-19 21:17:31.904428+00	2	3
218	2020-03-19 21:17:31.904428+00	2	4
219	2020-03-19 21:17:31.904428+00	2	6
220	2020-03-19 21:17:31.904428+00	2	7
221	2020-03-19 21:17:31.904428+00	2	8
222	2020-03-19 21:17:31.904428+00	2	10
223	2020-03-19 21:17:31.904428+00	2	11
224	2020-03-19 21:17:31.904428+00	2	12
225	2020-03-19 21:17:31.904428+00	2	14
226	2020-03-19 21:17:31.904428+00	2	15
227	2020-03-19 21:17:31.904428+00	2	16
228	2020-03-19 21:17:31.904428+00	2	18
229	2020-03-19 21:17:31.904428+00	2	19
230	2020-03-19 21:17:31.904428+00	2	20
231	2020-03-19 21:23:26.261886+00	3	5
232	2020-03-19 21:23:26.261886+00	3	9
233	2020-03-19 21:23:26.261886+00	3	13
234	2020-03-19 21:23:26.261886+00	3	17
235	2020-03-19 21:23:26.261886+00	3	21
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

SELECT pg_catalog.setval('auth.object_id_seq', 22, true);


--
-- Name: object_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.object_type_id_seq', 2, true);


--
-- Name: permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_id_seq', 73, true);


--
-- Name: permission_type_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.permission_type_id_seq', 4, true);


--
-- Name: rol_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.rol_id_seq', 3, true);


--
-- Name: rol_permission_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.rol_permission_id_seq', 235, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.user_id_seq', 6, true);


--
-- PostgreSQL database dump complete
--

