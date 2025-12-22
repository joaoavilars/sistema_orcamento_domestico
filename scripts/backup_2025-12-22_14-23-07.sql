--
-- PostgreSQL database dump
--

\restrict ztgrTE5ue11PN56YfIhJEBJIUcww28iUjR9jGZfOZnphxLfg0lqg1LaffgmdIF0

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.categorias (
    id bigint NOT NULL,
    nome character varying(100) NOT NULL,
    cor_hex character varying(7) DEFAULT '#000000'::character varying,
    familia_id bigint NOT NULL
);


ALTER TABLE public.categorias OWNER TO admin;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.categorias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categorias_id_seq OWNER TO admin;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: familias; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.familias (
    id bigint NOT NULL,
    nome character varying(100) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.familias OWNER TO admin;

--
-- Name: familias_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.familias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.familias_id_seq OWNER TO admin;

--
-- Name: familias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.familias_id_seq OWNED BY public.familias.id;


--
-- Name: transacao_recorrentes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.transacao_recorrentes (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    categoria_id bigint NOT NULL,
    nome character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    tipo character varying(10) NOT NULL,
    frequencia character varying(20) NOT NULL,
    dia_vencimento bigint NOT NULL,
    CONSTRAINT chk_transacao_recorrentes_tipo CHECK (((tipo)::text = ANY ((ARRAY['receita'::character varying, 'despesa'::character varying])::text[])))
);


ALTER TABLE public.transacao_recorrentes OWNER TO admin;

--
-- Name: transacao_recorrentes_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.transacao_recorrentes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transacao_recorrentes_id_seq OWNER TO admin;

--
-- Name: transacao_recorrentes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.transacao_recorrentes_id_seq OWNED BY public.transacao_recorrentes.id;


--
-- Name: transacoes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.transacoes (
    id bigint NOT NULL,
    categoria_id bigint NOT NULL,
    nome character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    tipo character varying(10) NOT NULL,
    status character varying(10) DEFAULT 'pendente'::character varying NOT NULL,
    data_transacao date NOT NULL,
    created_at timestamp with time zone,
    deleted_at timestamp with time zone,
    familia_id bigint NOT NULL,
    group_id character varying(36),
    usuario_id bigint,
    CONSTRAINT chk_transacoes_tipo CHECK (((tipo)::text = ANY ((ARRAY['receita'::character varying, 'despesa'::character varying])::text[])))
);


ALTER TABLE public.transacoes OWNER TO admin;

--
-- Name: transacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.transacoes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transacoes_id_seq OWNER TO admin;

--
-- Name: transacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.transacoes_id_seq OWNED BY public.transacoes.id;


--
-- Name: user_familias; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_familias (
    user_id bigint NOT NULL,
    familia_id bigint NOT NULL
);


ALTER TABLE public.user_familias OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text,
    familia_id bigint,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    email text NOT NULL,
    senha_hash text NOT NULL,
    role character varying(10) DEFAULT 'user'::character varying NOT NULL,
    familia_id bigint,
    created_at timestamp with time zone
);


ALTER TABLE public.usuarios OWNER TO admin;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO admin;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: familias id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.familias ALTER COLUMN id SET DEFAULT nextval('public.familias_id_seq'::regclass);


--
-- Name: transacao_recorrentes id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transacao_recorrentes ALTER COLUMN id SET DEFAULT nextval('public.transacao_recorrentes_id_seq'::regclass);


--
-- Name: transacoes id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transacoes ALTER COLUMN id SET DEFAULT nextval('public.transacoes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.categorias (id, nome, cor_hex, familia_id) FROM stdin;
1	Salario	#08b533	1
2	Flash João	#129810	1
3	Aluguel	#0dc200	1
4	Moradia	#8d653f	1
6	Educação	#df9743	1
8	Internet	#d7bf1d	1
9	Taxas bancárias	#808080	1
10	Assinaturas	#ff5900	1
12	Doações	#68cecf	1
14	Alimentação	#af31ab	1
16	Farmácia	#759575	1
17	Pets	#5b0085	1
18	Luz	#726a31	1
19	Cartão Banrisul	#6970d8	1
20	Cartão C6	#9c9696	1
21	Presentes	#8fe5ff	1
5	Telefonia	#4d88ff	1
7	Mercado	#e60000	1
13	Transporte	#b862fe	1
11	Cartões de Credito	#ff00dd	1
22	Rito de Hestia	#a5ff85	1
23	Pagamento de Serviços	#617208	1
24	Caixa mês seguinte	#4cc2a5	1
25	Caixa mês anterior	#129810	1
\.


--
-- Data for Name: familias; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.familias (id, nome, created_at, updated_at, deleted_at) FROM stdin;
1	Familia Avila	2025-11-13 11:14:55.98245+00	\N	\N
\.


--
-- Data for Name: transacao_recorrentes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.transacao_recorrentes (id, usuario_id, categoria_id, nome, valor, tipo, frequencia, dia_vencimento) FROM stdin;
\.


--
-- Data for Name: transacoes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.transacoes (id, categoria_id, nome, valor, tipo, status, data_transacao, created_at, deleted_at, familia_id, group_id, usuario_id) FROM stdin;
1	1	salario Anna 2025-11	2308.99	receita	recebido	2025-11-01	2025-11-13 22:07:58.281102+00	\N	1	\N	\N
2	1	Salario Joao 2025-11	3727.58	receita	recebido	2025-11-05	2025-11-13 22:08:29.189574+00	\N	1	\N	\N
3	2	Flash 2025-11	1665.00	receita	recebido	2025-11-01	2025-11-13 22:08:51.795196+00	\N	1	\N	\N
4	3	aluguel guapuruvu 2025-11	640.00	receita	recebido	2025-11-12	2025-11-13 22:09:22.393921+00	\N	1	\N	\N
5	4	AP 2025-11	1069.94	despesa	pago	2025-11-10	2025-11-13 22:09:50.60169+00	\N	1	\N	\N
6	5	celular anntonio	41.85	despesa	pago	2025-11-06	2025-11-13 22:11:01.009387+00	\N	1	\N	\N
7	5	celular joao	41.85	despesa	pago	2025-11-06	2025-11-13 22:11:22.631652+00	\N	1	\N	\N
8	5	celular anna	41.85	despesa	pago	2025-11-06	2025-11-13 22:11:38.442081+00	\N	1	\N	\N
9	4	condominio benjamin	467.73	despesa	pago	2025-11-11	2025-11-13 22:12:14.858288+00	\N	1	\N	\N
10	6	mensalidade SF 2025-11	1454.10	despesa	pago	2025-11-05	2025-11-13 22:12:54.757375+00	\N	1	\N	\N
11	4	iptu benjamin 2025-11	73.17	despesa	pago	2025-11-05	2025-11-13 22:13:39.964885+00	\N	1	\N	\N
12	7	Rancho Atacadão	1450.00	despesa	pago	2025-11-01	2025-11-13 22:14:35.583962+00	\N	1	\N	\N
13	9	Taxa caixa	31.00	despesa	pago	2025-11-01	2025-11-13 22:15:18.773931+00	\N	1	\N	\N
14	8	Obvious 2025-11	79.90	despesa	pago	2025-11-05	2025-11-13 22:15:44.59888+00	\N	1	\N	\N
15	10	amazon prime	19.90	despesa	pago	2025-11-05	2025-11-13 22:16:46.275613+00	\N	1	\N	\N
16	18	luz 2025-11	332.16	despesa	pago	2025-11-05	2025-11-13 22:17:13.385875+00	\N	1	\N	\N
17	4	Seguro AP	46.90	despesa	pago	2025-11-10	2025-11-13 22:18:22.062611+00	\N	1	\N	\N
18	11	Cartão C6	348.31	despesa	pago	2025-11-05	2025-11-13 22:18:48.96443+00	\N	1	\N	\N
19	13	Passagens João	70.00	despesa	pago	2025-11-05	2025-11-13 22:19:21.933459+00	\N	1	\N	\N
20	11	Cartão Banrisul	2288.99	despesa	pago	2025-11-01	2025-11-13 22:19:54.27767+00	\N	1	\N	\N
21	9	IPTU Stella	52.00	despesa	pago	2025-11-05	2025-11-13 22:20:39.461098+00	\N	1	\N	\N
22	14	Almoço João	251.30	despesa	pago	2025-11-05	2025-11-13 22:21:04.014109+00	\N	1	\N	\N
23	1	salario Anna 2025-10	2303.39	receita	recebido	2025-10-01	2025-11-13 22:22:00.926604+00	\N	1	\N	\N
24	1	Salário João 2025-10	3685.81	receita	recebido	2025-10-03	2025-11-13 23:43:39.603169+00	\N	1	\N	\N
25	2	Flash 2025-10	1805.00	receita	recebido	2025-10-01	2025-11-13 23:44:39.328719+00	\N	1	\N	\N
26	1	13° João - parcela 1	3421.79	receita	recebido	2025-10-10	2025-11-13 23:45:59.327807+00	\N	1	\N	\N
27	3	aluguel guapuruvu	640.00	receita	recebido	2025-10-10	2025-11-13 23:46:59.644065+00	\N	1	\N	\N
28	4	AP 2025-10	1071.23	despesa	pago	2025-10-10	2025-11-13 23:48:12.69911+00	\N	1	\N	\N
29	5	celular Anntonio	41.85	despesa	pago	2025-10-03	2025-11-13 23:49:45.502028+00	\N	1	\N	\N
30	4	Condominio Benjamin	484.51	despesa	pago	2025-10-10	2025-11-13 23:50:35.940058+00	\N	1	\N	\N
31	5	celular Anna	41.85	despesa	pago	2025-10-03	2025-11-13 23:52:19.870075+00	\N	1	\N	\N
32	5	celular João	41.85	despesa	pago	2025-10-03	2025-11-13 23:52:43.523306+00	\N	1	\N	\N
33	6	Colegio SF mensalidade	1454.10	despesa	pago	2025-10-03	2025-11-13 23:53:50.847998+00	\N	1	\N	\N
34	4	IPTU Benjamin	72.48	despesa	pago	2025-10-03	2025-11-13 23:56:20.278882+00	\N	1	\N	\N
35	7	Rancho Atacadão	1232.00	despesa	pago	2025-10-01	2025-11-13 23:57:07.598887+00	\N	1	\N	\N
36	1	13º João - 2ª parcela	1865.93	receita	recebido	2025-11-19	2025-11-19 11:20:59.252788+00	\N	1	\N	\N
37	21	Maquiagem Anna pós 	80.34	despesa	pago	2025-11-22	2025-11-22 14:30:50.40229+00	\N	1	\N	\N
38	21	Maquiagem Anna batons 	195.31	despesa	pago	2025-11-22	2025-11-22 14:31:17.20169+00	\N	1	\N	\N
39	21	Fones Anna 	57.24	despesa	pago	2025-11-22	2025-11-22 14:31:42.088744+00	\N	1	\N	\N
40	7	Rissul 	137.99	despesa	pago	2025-11-22	2025-11-22 21:57:51.873162+00	\N	1	\N	\N
41	7	Rissul 	62.47	despesa	pago	2025-11-23	2025-11-23 15:47:20.928257+00	\N	1	\N	\N
42	17	Vacinas Gaia 	55.00	despesa	pago	2025-11-24	2025-11-24 20:29:43.827954+00	\N	1	\N	\N
43	14	Lanche Anntonio 	10.00	despesa	pago	2025-11-25	2025-11-25 10:14:39.937385+00	\N	1	\N	\N
44	7	Rissul 	75.17	despesa	pago	2025-11-25	2025-11-25 21:55:36.21818+00	\N	1	\N	\N
45	7	Ifood 	80.95	despesa	pago	2025-11-25	2025-11-25 23:23:55.906909+00	\N	1	\N	\N
46	14	Ifood Anntonio 	25.99	despesa	pago	2025-11-25	2025-11-25 23:24:56.26809+00	\N	1	\N	\N
47	7	Zaffari 	104.99	despesa	pago	2025-11-26	2025-11-26 22:50:03.627223+00	\N	1	\N	\N
48	2	Flash 2025-12	1439.89	receita	recebido	2025-12-01	2025-11-27 14:43:16.189804+00	\N	1	\N	\N
49	1	salario Anna 2025-12	2303.00	receita	recebido	2025-12-01	2025-11-28 09:53:32.305639+00	\N	1	\N	\N
50	9	saldo caixa	2.91	receita	recebido	2025-12-01	2025-11-28 09:54:22.407452+00	\N	1	\N	\N
51	11	Cartão banrisul	2305.91	despesa	pago	2025-12-01	2025-11-28 09:57:28.082655+00	\N	1	\N	\N
52	7	Mercado  atacadão 	1402.00	despesa	pago	2025-12-01	2025-11-29 02:13:05.493147+00	\N	1	\N	\N
54	1	salario João 2025-12	4100.31	receita	recebido	2025-12-05	2025-12-05 14:04:24.125904+00	\N	1	\N	\N
64	18	luz 2025-12	255.59	despesa	pago	2025-12-10	2025-12-05 14:24:26.634004+00	\N	1		\N
70	13	passagens joao	40.00	despesa	pago	2025-12-05	2025-12-05 14:41:23.327983+00	\N	1	\N	\N
55	4	AP 2025-12	1068.58	despesa	pago	2025-12-05	2025-12-05 14:06:25.977054+00	\N	1	\N	\N
69	9	iptu stella	52.00	despesa	pago	2025-12-05	2025-12-05 14:30:38.982869+00	\N	1	\N	\N
53	6	Colegio SF mensalidade 2025-12	1454.10	despesa	pago	2025-12-05	2025-12-05 13:56:35.057281+00	\N	1	\N	\N
57	5	celular Anntonio	41.85	despesa	pago	2025-12-05	2025-12-05 14:12:44.752534+00	\N	1	\N	\N
58	5	celular Anna	41.85	despesa	pago	2025-12-05	2025-12-05 14:12:56.41953+00	\N	1	\N	\N
59	5	celular João	41.85	despesa	pago	2025-12-05	2025-12-05 14:13:10.375487+00	\N	1	\N	\N
67	10	amazon 2025-12	19.92	despesa	pago	2025-12-05	2025-12-05 14:28:26.718764+00	\N	1	\N	\N
63	18	luz 2025-11	258.65	despesa	pago	2025-12-05	2025-12-05 14:24:04.681888+00	\N	1		\N
65	8	internet 2025-12	79.90	despesa	pago	2025-12-05	2025-12-05 14:25:29.937359+00	\N	1		\N
66	4	IPTU Benjamin 2025-12	73.86	despesa	pago	2025-12-05	2025-12-05 14:26:58.47445+00	\N	1		\N
71	4	Condominio Benjamin 2025-11	475.89	despesa	pago	2025-12-05	2025-12-05 14:48:04.376906+00	\N	1		\N
68	4	seguro ap 2025-12	46.90	despesa	pago	2025-12-05	2025-12-05 14:29:04.319448+00	\N	1		\N
60	5	celular Anntonio	41.85	despesa	pendente	2026-01-01	2025-12-05 14:13:25.965755+00	\N	1		\N
61	5	celular Anna	41.85	despesa	pendente	2026-01-01	2025-12-05 14:13:43.161464+00	\N	1		\N
62	5	celular João	41.85	despesa	pendente	2026-01-01	2025-12-05 14:13:56.697159+00	\N	1		\N
56	20	Cartão C6 João 2025-12	308.98	despesa	pago	2025-12-05	2025-12-05 14:10:21.171696+00	\N	1	\N	\N
124	5	celular anntonio (1/11)	47.85	despesa	pendente	2026-02-01	2025-12-08 23:00:36.647936+00	\N	1	aac0bb875f69b90d	\N
73	16	panvel	71.98	despesa	pago	2025-12-05	2025-12-08 20:52:09.088683+00	\N	1	\N	\N
74	7	rissul	47.87	despesa	pago	2025-12-05	2025-12-08 20:52:57.639062+00	\N	1	\N	\N
75	7	mercado publico	37.54	despesa	pago	2025-12-06	2025-12-08 20:54:44.185688+00	\N	1	\N	\N
76	7	Banca 12 - compras para Natal panetones	276.24	despesa	pago	2025-12-06	2025-12-08 20:55:22.279843+00	\N	1	\N	\N
77	7	banca 47 - mercado publico	29.00	despesa	pago	2025-12-06	2025-12-08 20:56:14.435447+00	\N	1	\N	\N
78	13	Uber	17.91	despesa	pago	2025-12-06	2025-12-08 20:56:32.669161+00	\N	1	\N	\N
79	13	Uber	25.97	despesa	pago	2025-12-06	2025-12-08 20:56:54.750468+00	\N	1	\N	\N
80	13	Uber	14.93	despesa	pago	2025-12-06	2025-12-08 20:57:39.643051+00	\N	1	\N	\N
81	13	Uber	17.94	despesa	pago	2025-12-06	2025-12-08 21:01:47.327837+00	\N	1	\N	\N
82	7	Mercado publico - carne	169.67	despesa	pago	2025-12-06	2025-12-08 21:02:13.827781+00	\N	1	\N	\N
83	7	mercado publico	58.00	despesa	pago	2025-12-06	2025-12-08 21:02:41.606685+00	\N	1	\N	\N
84	7	mercado publico	83.25	despesa	pago	2025-12-06	2025-12-08 21:03:05.182553+00	\N	1	\N	\N
85	14	Almoço anna	22.00	despesa	pago	2025-12-08	2025-12-08 21:03:20.103529+00	\N	1	\N	\N
86	6	Mensalidade SF 2026 (1/8)	1091.00	despesa	pendente	2026-02-10	2025-12-08 22:24:04.796328+00	\N	1	3c70f25d0e990910	\N
87	6	Mensalidade SF 2026 (2/8)	1091.00	despesa	pendente	2026-03-10	2025-12-08 22:24:04.804902+00	\N	1	3c70f25d0e990910	\N
88	6	Mensalidade SF 2026 (3/8)	1091.00	despesa	pendente	2026-04-10	2025-12-08 22:24:04.806222+00	\N	1	3c70f25d0e990910	\N
89	6	Mensalidade SF 2026 (4/8)	1091.00	despesa	pendente	2026-05-10	2025-12-08 22:24:04.807364+00	\N	1	3c70f25d0e990910	\N
90	6	Mensalidade SF 2026 (5/8)	1091.00	despesa	pendente	2026-06-10	2025-12-08 22:24:04.808471+00	\N	1	3c70f25d0e990910	\N
91	6	Mensalidade SF 2026 (6/8)	1091.00	despesa	pendente	2026-07-10	2025-12-08 22:24:04.809714+00	\N	1	3c70f25d0e990910	\N
92	6	Mensalidade SF 2026 (7/8)	1091.00	despesa	pendente	2026-08-10	2025-12-08 22:24:04.81092+00	\N	1	3c70f25d0e990910	\N
93	6	Mensalidade SF 2026 (8/8)	1091.00	despesa	pendente	2026-09-10	2025-12-08 22:24:04.811974+00	\N	1	3c70f25d0e990910	\N
95	6	Faculdade anna (2/13)	56.10	despesa	pendente	2026-01-10	2025-12-08 22:30:01.505388+00	\N	1	1a6f818c8abb0797	\N
96	6	Faculdade anna (3/13)	56.10	despesa	pendente	2026-02-10	2025-12-08 22:30:01.506708+00	\N	1	1a6f818c8abb0797	\N
97	6	Faculdade anna (4/13)	56.10	despesa	pendente	2026-03-10	2025-12-08 22:30:01.507905+00	\N	1	1a6f818c8abb0797	\N
98	6	Faculdade anna (5/13)	56.10	despesa	pendente	2026-04-10	2025-12-08 22:30:01.510053+00	\N	1	1a6f818c8abb0797	\N
99	6	Faculdade anna (6/13)	56.10	despesa	pendente	2026-05-10	2025-12-08 22:30:01.511376+00	\N	1	1a6f818c8abb0797	\N
100	6	Faculdade anna (7/13)	56.10	despesa	pendente	2026-06-10	2025-12-08 22:30:01.512615+00	\N	1	1a6f818c8abb0797	\N
101	6	Faculdade anna (8/13)	56.10	despesa	pendente	2026-07-10	2025-12-08 22:30:01.513778+00	\N	1	1a6f818c8abb0797	\N
102	6	Faculdade anna (9/13)	56.10	despesa	pendente	2026-08-10	2025-12-08 22:30:01.514992+00	\N	1	1a6f818c8abb0797	\N
103	6	Faculdade anna (10/13)	56.10	despesa	pendente	2026-09-10	2025-12-08 22:30:01.516283+00	\N	1	1a6f818c8abb0797	\N
104	6	Faculdade anna (11/13)	56.10	despesa	pendente	2026-10-10	2025-12-08 22:30:01.517543+00	\N	1	1a6f818c8abb0797	\N
105	6	Faculdade anna (12/13)	56.10	despesa	pendente	2026-11-10	2025-12-08 22:30:01.518744+00	\N	1	1a6f818c8abb0797	\N
106	6	Faculdade anna (13/13)	56.10	despesa	pendente	2026-12-10	2025-12-08 22:30:01.519928+00	\N	1	1a6f818c8abb0797	\N
94	6	Faculdade anna (1/13)	56.10	despesa	pago	2025-12-10	2025-12-08 22:30:01.503772+00	\N	1	1a6f818c8abb0797	\N
125	5	celular anntonio (2/11)	47.85	despesa	pendente	2026-03-01	2025-12-08 23:00:36.65495+00	\N	1	aac0bb875f69b90d	\N
126	5	celular anntonio (3/11)	47.85	despesa	pendente	2026-04-01	2025-12-08 23:00:36.65646+00	\N	1	aac0bb875f69b90d	\N
127	5	celular anntonio (4/11)	47.85	despesa	pendente	2026-05-01	2025-12-08 23:00:36.657895+00	\N	1	aac0bb875f69b90d	\N
128	5	celular anntonio (5/11)	47.85	despesa	pendente	2026-06-01	2025-12-08 23:00:36.659468+00	\N	1	aac0bb875f69b90d	\N
72	4	Condominio Guapuruvu 3/11	240.00	despesa	pago	2025-12-05	2025-12-05 14:50:42.912952+00	\N	1		\N
129	5	celular anntonio (6/11)	47.85	despesa	pendente	2026-07-01	2025-12-08 23:00:36.661156+00	\N	1	aac0bb875f69b90d	\N
130	5	celular anntonio (7/11)	47.85	despesa	pendente	2026-08-01	2025-12-08 23:00:36.662693+00	\N	1	aac0bb875f69b90d	\N
131	5	celular anntonio (8/11)	47.85	despesa	pendente	2026-09-01	2025-12-08 23:00:36.66403+00	\N	1	aac0bb875f69b90d	\N
132	5	celular anntonio (9/11)	47.85	despesa	pendente	2026-10-01	2025-12-08 23:00:36.665415+00	\N	1	aac0bb875f69b90d	\N
133	5	celular anntonio (10/11)	47.85	despesa	pendente	2026-11-01	2025-12-08 23:00:36.666983+00	\N	1	aac0bb875f69b90d	\N
134	5	celular anntonio (11/11)	47.85	despesa	pendente	2026-12-01	2025-12-08 23:00:36.668366+00	\N	1	aac0bb875f69b90d	\N
135	5	celular joao (1/11)	47.85	despesa	pendente	2026-02-01	2025-12-08 23:00:57.906471+00	\N	1	59e4680f9e5de09d	\N
136	5	celular joao (2/11)	47.85	despesa	pendente	2026-03-01	2025-12-08 23:00:57.908078+00	\N	1	59e4680f9e5de09d	\N
137	5	celular joao (3/11)	47.85	despesa	pendente	2026-04-01	2025-12-08 23:00:57.909306+00	\N	1	59e4680f9e5de09d	\N
138	5	celular joao (4/11)	47.85	despesa	pendente	2026-05-01	2025-12-08 23:00:57.910513+00	\N	1	59e4680f9e5de09d	\N
139	5	celular joao (5/11)	47.85	despesa	pendente	2026-06-01	2025-12-08 23:00:57.915885+00	\N	1	59e4680f9e5de09d	\N
140	5	celular joao (6/11)	47.85	despesa	pendente	2026-07-01	2025-12-08 23:00:57.917182+00	\N	1	59e4680f9e5de09d	\N
141	5	celular joao (7/11)	47.85	despesa	pendente	2026-08-01	2025-12-08 23:00:57.918423+00	\N	1	59e4680f9e5de09d	\N
142	5	celular joao (8/11)	47.85	despesa	pendente	2026-09-01	2025-12-08 23:00:57.919557+00	\N	1	59e4680f9e5de09d	\N
143	5	celular joao (9/11)	47.85	despesa	pendente	2026-10-01	2025-12-08 23:00:57.92084+00	\N	1	59e4680f9e5de09d	\N
144	5	celular joao (10/11)	47.85	despesa	pendente	2026-11-01	2025-12-08 23:00:57.922138+00	\N	1	59e4680f9e5de09d	\N
145	5	celular joao (11/11)	47.85	despesa	pendente	2026-12-01	2025-12-08 23:00:57.92326+00	\N	1	59e4680f9e5de09d	\N
146	5	celular anna (1/11)	47.85	despesa	pendente	2026-02-01	2025-12-08 23:01:18.741587+00	\N	1	a484db16eb7f1829	\N
147	5	celular anna (2/11)	47.85	despesa	pendente	2026-03-01	2025-12-08 23:01:18.743159+00	\N	1	a484db16eb7f1829	\N
148	5	celular anna (3/11)	47.85	despesa	pendente	2026-04-01	2025-12-08 23:01:18.744388+00	\N	1	a484db16eb7f1829	\N
149	5	celular anna (4/11)	47.85	despesa	pendente	2026-05-01	2025-12-08 23:01:18.745698+00	\N	1	a484db16eb7f1829	\N
150	5	celular anna (5/11)	47.85	despesa	pendente	2026-06-01	2025-12-08 23:01:18.74708+00	\N	1	a484db16eb7f1829	\N
151	5	celular anna (6/11)	47.85	despesa	pendente	2026-07-01	2025-12-08 23:01:18.748314+00	\N	1	a484db16eb7f1829	\N
152	5	celular anna (7/11)	47.85	despesa	pendente	2026-08-01	2025-12-08 23:01:18.749504+00	\N	1	a484db16eb7f1829	\N
153	5	celular anna (8/11)	47.85	despesa	pendente	2026-09-01	2025-12-08 23:01:18.750804+00	\N	1	a484db16eb7f1829	\N
154	5	celular anna (9/11)	47.85	despesa	pendente	2026-10-01	2025-12-08 23:01:18.751981+00	\N	1	a484db16eb7f1829	\N
155	5	celular anna (10/11)	47.85	despesa	pendente	2026-11-01	2025-12-08 23:01:18.753239+00	\N	1	a484db16eb7f1829	\N
156	5	celular anna (11/11)	47.85	despesa	pendente	2026-12-01	2025-12-08 23:01:18.754362+00	\N	1	a484db16eb7f1829	\N
157	10	Amazon Prime (1/12)	19.90	despesa	pendente	2026-01-01	2025-12-08 23:02:11.220194+00	\N	1	968951804c1e0d90	\N
158	10	Amazon Prime (2/12)	19.90	despesa	pendente	2026-02-01	2025-12-08 23:02:11.221787+00	\N	1	968951804c1e0d90	\N
159	10	Amazon Prime (3/12)	19.90	despesa	pendente	2026-03-01	2025-12-08 23:02:11.223051+00	\N	1	968951804c1e0d90	\N
160	10	Amazon Prime (4/12)	19.90	despesa	pendente	2026-04-01	2025-12-08 23:02:11.224244+00	\N	1	968951804c1e0d90	\N
161	10	Amazon Prime (5/12)	19.90	despesa	pendente	2026-05-01	2025-12-08 23:02:11.225393+00	\N	1	968951804c1e0d90	\N
162	10	Amazon Prime (6/12)	19.90	despesa	pendente	2026-06-01	2025-12-08 23:02:11.226536+00	\N	1	968951804c1e0d90	\N
163	10	Amazon Prime (7/12)	19.90	despesa	pendente	2026-07-01	2025-12-08 23:02:11.227721+00	\N	1	968951804c1e0d90	\N
164	10	Amazon Prime (8/12)	19.90	despesa	pendente	2026-08-01	2025-12-08 23:02:11.228851+00	\N	1	968951804c1e0d90	\N
165	10	Amazon Prime (9/12)	19.90	despesa	pendente	2026-09-01	2025-12-08 23:02:11.230306+00	\N	1	968951804c1e0d90	\N
166	10	Amazon Prime (10/12)	19.90	despesa	pendente	2026-10-01	2025-12-08 23:02:11.231624+00	\N	1	968951804c1e0d90	\N
167	10	Amazon Prime (11/12)	19.90	despesa	pendente	2026-11-01	2025-12-08 23:02:11.23318+00	\N	1	968951804c1e0d90	\N
168	10	Amazon Prime (12/12)	19.90	despesa	pendente	2026-12-01	2025-12-08 23:02:11.23444+00	\N	1	968951804c1e0d90	\N
169	8	Internet (1/4)	79.90	despesa	pendente	2026-01-10	2025-12-08 23:11:21.352077+00	\N	1	a03fed2ecae42745	\N
170	8	Internet (2/4)	79.90	despesa	pendente	2026-02-10	2025-12-08 23:11:21.353913+00	\N	1	a03fed2ecae42745	\N
171	8	Internet (3/4)	79.90	despesa	pendente	2026-03-10	2025-12-08 23:11:21.355228+00	\N	1	a03fed2ecae42745	\N
172	8	Internet (4/4)	79.90	despesa	pendente	2026-04-10	2025-12-08 23:11:21.356435+00	\N	1	a03fed2ecae42745	\N
173	8	Internet (1/8)	99.90	despesa	pendente	2026-05-10	2025-12-08 23:11:59.51265+00	\N	1	d8b034b5d369e8ef	\N
174	8	Internet (2/8)	99.90	despesa	pendente	2026-06-10	2025-12-08 23:11:59.514252+00	\N	1	d8b034b5d369e8ef	\N
175	8	Internet (3/8)	99.90	despesa	pendente	2026-07-10	2025-12-08 23:11:59.515807+00	\N	1	d8b034b5d369e8ef	\N
176	8	Internet (4/8)	99.90	despesa	pendente	2026-08-10	2025-12-08 23:11:59.516936+00	\N	1	d8b034b5d369e8ef	\N
177	8	Internet (5/8)	99.90	despesa	pendente	2026-09-10	2025-12-08 23:11:59.517893+00	\N	1	d8b034b5d369e8ef	\N
178	8	Internet (6/8)	99.90	despesa	pendente	2026-10-10	2025-12-08 23:11:59.519185+00	\N	1	d8b034b5d369e8ef	\N
179	8	Internet (7/8)	99.90	despesa	pendente	2026-11-10	2025-12-08 23:11:59.520351+00	\N	1	d8b034b5d369e8ef	\N
180	8	Internet (8/8)	99.90	despesa	pendente	2026-12-10	2025-12-08 23:11:59.521532+00	\N	1	d8b034b5d369e8ef	\N
181	4	Parcela Apartamento (1/12)	1068.58	despesa	pendente	2026-01-10	2025-12-08 23:14:15.79213+00	\N	1	05094fa119de6563	\N
182	4	Parcela Apartamento (2/12)	1068.58	despesa	pendente	2026-02-10	2025-12-08 23:14:15.793889+00	\N	1	05094fa119de6563	\N
183	4	Parcela Apartamento (3/12)	1068.58	despesa	pendente	2026-03-10	2025-12-08 23:14:15.795162+00	\N	1	05094fa119de6563	\N
184	4	Parcela Apartamento (4/12)	1068.58	despesa	pendente	2026-04-10	2025-12-08 23:14:15.796262+00	\N	1	05094fa119de6563	\N
185	4	Parcela Apartamento (5/12)	1068.58	despesa	pendente	2026-05-10	2025-12-08 23:14:15.797279+00	\N	1	05094fa119de6563	\N
186	4	Parcela Apartamento (6/12)	1068.58	despesa	pendente	2026-06-10	2025-12-08 23:14:15.798306+00	\N	1	05094fa119de6563	\N
187	4	Parcela Apartamento (7/12)	1068.58	despesa	pendente	2026-07-10	2025-12-08 23:14:15.800231+00	\N	1	05094fa119de6563	\N
188	4	Parcela Apartamento (8/12)	1068.58	despesa	pendente	2026-08-10	2025-12-08 23:14:15.80137+00	\N	1	05094fa119de6563	\N
189	4	Parcela Apartamento (9/12)	1068.58	despesa	pendente	2026-09-10	2025-12-08 23:14:15.802292+00	\N	1	05094fa119de6563	\N
190	4	Parcela Apartamento (10/12)	1068.58	despesa	pendente	2026-10-10	2025-12-08 23:14:15.803236+00	\N	1	05094fa119de6563	\N
191	4	Parcela Apartamento (11/12)	1068.58	despesa	pendente	2026-11-10	2025-12-08 23:14:15.804233+00	\N	1	05094fa119de6563	\N
192	4	Parcela Apartamento (12/12)	1068.58	despesa	pendente	2026-12-10	2025-12-08 23:14:15.80517+00	\N	1	05094fa119de6563	\N
193	14	Mercado (Rancho) (1/12)	1400.00	despesa	pendente	2026-01-01	2025-12-08 23:15:54.549243+00	\N	1	43d5096d71c33ec1	\N
194	14	Mercado (Rancho) (2/12)	1400.00	despesa	pendente	2026-02-01	2025-12-08 23:15:54.550669+00	\N	1	43d5096d71c33ec1	\N
195	14	Mercado (Rancho) (3/12)	1400.00	despesa	pendente	2026-03-01	2025-12-08 23:15:54.551918+00	\N	1	43d5096d71c33ec1	\N
196	14	Mercado (Rancho) (4/12)	1400.00	despesa	pendente	2026-04-01	2025-12-08 23:15:54.553156+00	\N	1	43d5096d71c33ec1	\N
197	14	Mercado (Rancho) (5/12)	1400.00	despesa	pendente	2026-05-01	2025-12-08 23:15:54.554278+00	\N	1	43d5096d71c33ec1	\N
198	14	Mercado (Rancho) (6/12)	1400.00	despesa	pendente	2026-06-01	2025-12-08 23:15:54.555435+00	\N	1	43d5096d71c33ec1	\N
199	14	Mercado (Rancho) (7/12)	1400.00	despesa	pendente	2026-07-01	2025-12-08 23:15:54.55682+00	\N	1	43d5096d71c33ec1	\N
200	14	Mercado (Rancho) (8/12)	1400.00	despesa	pendente	2026-08-01	2025-12-08 23:15:54.557979+00	\N	1	43d5096d71c33ec1	\N
201	14	Mercado (Rancho) (9/12)	1400.00	despesa	pendente	2026-09-01	2025-12-08 23:15:54.55915+00	\N	1	43d5096d71c33ec1	\N
202	14	Mercado (Rancho) (10/12)	1400.00	despesa	pendente	2026-10-01	2025-12-08 23:15:54.56038+00	\N	1	43d5096d71c33ec1	\N
203	14	Mercado (Rancho) (11/12)	1400.00	despesa	pendente	2026-11-01	2025-12-08 23:15:54.561692+00	\N	1	43d5096d71c33ec1	\N
204	14	Mercado (Rancho) (12/12)	1400.00	despesa	pendente	2026-12-01	2025-12-08 23:15:54.562893+00	\N	1	43d5096d71c33ec1	\N
108	6	Mensalidae Pós João (2/17)	92.65	despesa	pendente	2026-02-15	2025-12-08 22:42:55.85826+00	\N	1	6c5be658a3567bc4	\N
109	6	Mensalidae Pós João (3/17)	92.65	despesa	pendente	2026-03-15	2025-12-08 22:42:55.859453+00	\N	1	6c5be658a3567bc4	\N
110	6	Mensalidae Pós João (4/17)	92.65	despesa	pendente	2026-04-15	2025-12-08 22:42:55.860697+00	\N	1	6c5be658a3567bc4	\N
111	6	Mensalidae Pós João (5/17)	92.65	despesa	pendente	2026-05-15	2025-12-08 22:42:55.861916+00	\N	1	6c5be658a3567bc4	\N
112	6	Mensalidae Pós João (6/17)	92.65	despesa	pendente	2026-06-15	2025-12-08 22:42:55.863113+00	\N	1	6c5be658a3567bc4	\N
113	6	Mensalidae Pós João (7/17)	92.65	despesa	pendente	2026-07-15	2025-12-08 22:42:55.864231+00	\N	1	6c5be658a3567bc4	\N
114	6	Mensalidae Pós João (8/17)	92.65	despesa	pendente	2026-08-15	2025-12-08 22:42:55.865369+00	\N	1	6c5be658a3567bc4	\N
115	6	Mensalidae Pós João (9/17)	92.65	despesa	pendente	2026-09-15	2025-12-08 22:42:55.866536+00	\N	1	6c5be658a3567bc4	\N
116	6	Mensalidae Pós João (10/17)	92.65	despesa	pendente	2026-10-15	2025-12-08 22:42:55.867668+00	\N	1	6c5be658a3567bc4	\N
117	6	Mensalidae Pós João (11/17)	92.65	despesa	pendente	2026-11-15	2025-12-08 22:42:55.868885+00	\N	1	6c5be658a3567bc4	\N
118	6	Mensalidae Pós João (12/17)	92.65	despesa	pendente	2026-12-15	2025-12-08 22:42:55.870154+00	\N	1	6c5be658a3567bc4	\N
119	6	Mensalidae Pós João (13/17)	92.65	despesa	pendente	2027-01-15	2025-12-08 22:42:55.871312+00	\N	1	6c5be658a3567bc4	\N
120	6	Mensalidae Pós João (14/17)	92.65	despesa	pendente	2027-02-15	2025-12-08 22:42:55.872342+00	\N	1	6c5be658a3567bc4	\N
121	6	Mensalidae Pós João (15/17)	92.65	despesa	pendente	2027-03-15	2025-12-08 22:42:55.873288+00	\N	1	6c5be658a3567bc4	\N
122	6	Mensalidae Pós João (16/17)	92.65	despesa	pendente	2027-04-15	2025-12-08 22:42:55.874216+00	\N	1	6c5be658a3567bc4	\N
123	6	Mensalidae Pós João (17/17)	92.65	despesa	pendente	2027-05-15	2025-12-08 22:42:55.875278+00	\N	1	6c5be658a3567bc4	\N
107	6	Mensalidade Pós João (1/17)	92.65	despesa	pendente	2026-01-15	2025-12-08 22:42:55.856579+00	\N	1	6c5be658a3567bc4	\N
205	4	Condominio Benjamin (1/12)	450.00	despesa	pendente	2026-01-10	2025-12-08 23:18:24.947232+00	\N	1	297979c663e92a53	\N
206	4	Condominio Benjamin (2/12)	450.00	despesa	pendente	2026-02-10	2025-12-08 23:18:24.949145+00	\N	1	297979c663e92a53	\N
207	4	Condominio Benjamin (3/12)	450.00	despesa	pendente	2026-03-10	2025-12-08 23:18:24.950311+00	\N	1	297979c663e92a53	\N
208	4	Condominio Benjamin (4/12)	450.00	despesa	pendente	2026-04-10	2025-12-08 23:18:24.9513+00	\N	1	297979c663e92a53	\N
209	4	Condominio Benjamin (5/12)	450.00	despesa	pendente	2026-05-10	2025-12-08 23:18:24.952405+00	\N	1	297979c663e92a53	\N
210	4	Condominio Benjamin (6/12)	450.00	despesa	pendente	2026-06-10	2025-12-08 23:18:24.953527+00	\N	1	297979c663e92a53	\N
211	4	Condominio Benjamin (7/12)	450.00	despesa	pendente	2026-07-10	2025-12-08 23:18:24.954558+00	\N	1	297979c663e92a53	\N
212	4	Condominio Benjamin (8/12)	450.00	despesa	pendente	2026-08-10	2025-12-08 23:18:24.955888+00	\N	1	297979c663e92a53	\N
213	4	Condominio Benjamin (9/12)	450.00	despesa	pendente	2026-09-10	2025-12-08 23:18:24.957275+00	\N	1	297979c663e92a53	\N
214	4	Condominio Benjamin (10/12)	450.00	despesa	pendente	2026-10-10	2025-12-08 23:18:24.958514+00	\N	1	297979c663e92a53	\N
215	4	Condominio Benjamin (11/12)	450.00	despesa	pendente	2026-11-10	2025-12-08 23:18:24.959851+00	\N	1	297979c663e92a53	\N
216	4	Condominio Benjamin (12/12)	450.00	despesa	pendente	2026-12-10	2025-12-08 23:18:24.961043+00	\N	1	297979c663e92a53	\N
217	4	Seguro AP (1/12)	46.90	despesa	pendente	2026-01-10	2025-12-09 00:06:43.541834+00	\N	1	ded168a3e5d45fa7	\N
218	4	Seguro AP (2/12)	46.90	despesa	pendente	2026-02-10	2025-12-09 00:06:43.54906+00	\N	1	ded168a3e5d45fa7	\N
219	4	Seguro AP (3/12)	46.90	despesa	pendente	2026-03-10	2025-12-09 00:06:43.550495+00	\N	1	ded168a3e5d45fa7	\N
220	4	Seguro AP (4/12)	46.90	despesa	pendente	2026-04-10	2025-12-09 00:06:43.551713+00	\N	1	ded168a3e5d45fa7	\N
221	4	Seguro AP (5/12)	46.90	despesa	pendente	2026-05-10	2025-12-09 00:06:43.553079+00	\N	1	ded168a3e5d45fa7	\N
222	4	Seguro AP (6/12)	46.90	despesa	pendente	2026-06-10	2025-12-09 00:06:43.554327+00	\N	1	ded168a3e5d45fa7	\N
223	4	Seguro AP (7/12)	46.90	despesa	pendente	2026-07-10	2025-12-09 00:06:43.555586+00	\N	1	ded168a3e5d45fa7	\N
224	4	Seguro AP (8/12)	46.90	despesa	pendente	2026-08-10	2025-12-09 00:06:43.556774+00	\N	1	ded168a3e5d45fa7	\N
225	4	Seguro AP (9/12)	46.90	despesa	pendente	2026-09-10	2025-12-09 00:06:43.558069+00	\N	1	ded168a3e5d45fa7	\N
226	4	Seguro AP (10/12)	46.90	despesa	pendente	2026-10-10	2025-12-09 00:06:43.559384+00	\N	1	ded168a3e5d45fa7	\N
227	4	Seguro AP (11/12)	46.90	despesa	pendente	2026-11-10	2025-12-09 00:06:43.561235+00	\N	1	ded168a3e5d45fa7	\N
228	4	Seguro AP (12/12)	46.90	despesa	pendente	2026-12-10	2025-12-09 00:06:43.562332+00	\N	1	ded168a3e5d45fa7	\N
229	12	Bezerra (1/12)	15.00	despesa	pendente	2026-01-01	2025-12-09 00:07:45.851925+00	\N	1	fa4de8a4adb67575	\N
230	12	Bezerra (2/12)	15.00	despesa	pendente	2026-02-01	2025-12-09 00:07:45.853904+00	\N	1	fa4de8a4adb67575	\N
231	12	Bezerra (3/12)	15.00	despesa	pendente	2026-03-01	2025-12-09 00:07:45.8552+00	\N	1	fa4de8a4adb67575	\N
232	12	Bezerra (4/12)	15.00	despesa	pendente	2026-04-01	2025-12-09 00:07:45.856382+00	\N	1	fa4de8a4adb67575	\N
233	12	Bezerra (5/12)	15.00	despesa	pendente	2026-05-01	2025-12-09 00:07:45.857554+00	\N	1	fa4de8a4adb67575	\N
234	12	Bezerra (6/12)	15.00	despesa	pendente	2026-06-01	2025-12-09 00:07:45.85869+00	\N	1	fa4de8a4adb67575	\N
235	12	Bezerra (7/12)	15.00	despesa	pendente	2026-07-01	2025-12-09 00:07:45.859888+00	\N	1	fa4de8a4adb67575	\N
236	12	Bezerra (8/12)	15.00	despesa	pendente	2026-08-01	2025-12-09 00:07:45.861128+00	\N	1	fa4de8a4adb67575	\N
237	12	Bezerra (9/12)	15.00	despesa	pendente	2026-09-01	2025-12-09 00:07:45.862302+00	\N	1	fa4de8a4adb67575	\N
238	12	Bezerra (10/12)	15.00	despesa	pendente	2026-10-01	2025-12-09 00:07:45.863471+00	\N	1	fa4de8a4adb67575	\N
239	12	Bezerra (11/12)	15.00	despesa	pendente	2026-11-01	2025-12-09 00:07:45.864633+00	\N	1	fa4de8a4adb67575	\N
240	12	Bezerra (12/12)	15.00	despesa	pendente	2026-12-01	2025-12-09 00:07:45.86569+00	\N	1	fa4de8a4adb67575	\N
241	13	Passagens João (1/12)	90.00	despesa	pendente	2026-01-01	2025-12-09 00:09:49.616473+00	\N	1	2272724fd3df2d60	\N
242	13	Passagens João (2/12)	90.00	despesa	pendente	2026-02-01	2025-12-09 00:09:49.618376+00	\N	1	2272724fd3df2d60	\N
243	13	Passagens João (3/12)	90.00	despesa	pendente	2026-03-01	2025-12-09 00:09:49.619896+00	\N	1	2272724fd3df2d60	\N
244	13	Passagens João (4/12)	90.00	despesa	pendente	2026-04-01	2025-12-09 00:09:49.621305+00	\N	1	2272724fd3df2d60	\N
245	13	Passagens João (5/12)	90.00	despesa	pendente	2026-05-01	2025-12-09 00:09:49.622555+00	\N	1	2272724fd3df2d60	\N
246	13	Passagens João (6/12)	90.00	despesa	pendente	2026-06-01	2025-12-09 00:09:49.624068+00	\N	1	2272724fd3df2d60	\N
247	13	Passagens João (7/12)	90.00	despesa	pendente	2026-07-01	2025-12-09 00:09:49.625431+00	\N	1	2272724fd3df2d60	\N
248	13	Passagens João (8/12)	90.00	despesa	pendente	2026-08-01	2025-12-09 00:09:49.626882+00	\N	1	2272724fd3df2d60	\N
249	13	Passagens João (9/12)	90.00	despesa	pendente	2026-09-01	2025-12-09 00:09:49.628265+00	\N	1	2272724fd3df2d60	\N
250	13	Passagens João (10/12)	90.00	despesa	pendente	2026-10-01	2025-12-09 00:09:49.629571+00	\N	1	2272724fd3df2d60	\N
251	13	Passagens João (11/12)	90.00	despesa	pendente	2026-11-01	2025-12-09 00:09:49.631028+00	\N	1	2272724fd3df2d60	\N
252	13	Passagens João (12/12)	90.00	despesa	pendente	2026-12-01	2025-12-09 00:09:49.632093+00	\N	1	2272724fd3df2d60	\N
254	13	Uber	31.46	despesa	pago	2025-12-09	2025-12-09 10:33:09.547956+00	\N	1		\N
256	21	Nvme	652.54	despesa	pago	2025-12-09	2025-12-09 15:53:57.25362+00	\N	1		\N
255	1	Férias 	7416.95	receita	recebido	2025-12-09	2025-12-09 14:55:58.809922+00	\N	1		\N
257	13	Uber 	35.72	despesa	pago	2025-12-09	2025-12-09 20:42:58.443582+00	\N	1		\N
258	7	Rissul 	149.14	despesa	pago	2025-12-09	2025-12-09 21:23:47.037943+00	\N	1		\N
259	14	Lanche	146.99	despesa	pago	2025-12-10	2025-12-10 00:08:51.713783+00	\N	1		\N
260	4	Condominio atrasado Guapuruvu (1/7)	120.00	despesa	pendente	2026-01-10	2025-12-10 12:29:22.947515+00	\N	1	66128366b64ef950	\N
261	4	Condominio atrasado Guapuruvu (2/7)	120.00	despesa	pendente	2026-02-10	2025-12-10 12:29:22.949449+00	\N	1	66128366b64ef950	\N
262	4	Condominio atrasado Guapuruvu (3/7)	120.00	despesa	pendente	2026-03-10	2025-12-10 12:29:22.950895+00	\N	1	66128366b64ef950	\N
263	4	Condominio atrasado Guapuruvu (4/7)	120.00	despesa	pendente	2026-04-10	2025-12-10 12:29:22.952261+00	\N	1	66128366b64ef950	\N
264	4	Condominio atrasado Guapuruvu (5/7)	120.00	despesa	pendente	2026-05-10	2025-12-10 12:29:22.953636+00	\N	1	66128366b64ef950	\N
265	4	Condominio atrasado Guapuruvu (6/7)	120.00	despesa	pendente	2026-06-10	2025-12-10 12:29:22.954815+00	\N	1	66128366b64ef950	\N
266	4	Condominio atrasado Guapuruvu (7/7)	120.00	despesa	pendente	2026-07-10	2025-12-10 12:29:22.956101+00	\N	1	66128366b64ef950	\N
268	3	Aluguel guapuruvu (2/13)	640.00	receita	pendente	2026-01-10	2025-12-10 12:30:29.55804+00	\N	1	5585040e8cf7688e	\N
269	3	Aluguel guapuruvu (3/13)	640.00	receita	pendente	2026-02-10	2025-12-10 12:30:29.559114+00	\N	1	5585040e8cf7688e	\N
270	3	Aluguel guapuruvu (4/13)	640.00	receita	pendente	2026-03-10	2025-12-10 12:30:29.560369+00	\N	1	5585040e8cf7688e	\N
271	3	Aluguel guapuruvu (5/13)	640.00	receita	pendente	2026-04-10	2025-12-10 12:30:29.561468+00	\N	1	5585040e8cf7688e	\N
272	3	Aluguel guapuruvu (6/13)	640.00	receita	pendente	2026-05-10	2025-12-10 12:30:29.562448+00	\N	1	5585040e8cf7688e	\N
273	3	Aluguel guapuruvu (7/13)	640.00	receita	pendente	2026-06-10	2025-12-10 12:30:29.563409+00	\N	1	5585040e8cf7688e	\N
274	3	Aluguel guapuruvu (8/13)	640.00	receita	pendente	2026-07-10	2025-12-10 12:30:29.564622+00	\N	1	5585040e8cf7688e	\N
275	3	Aluguel guapuruvu (9/13)	640.00	receita	pendente	2026-08-10	2025-12-10 12:30:29.565613+00	\N	1	5585040e8cf7688e	\N
276	3	Aluguel guapuruvu (10/13)	640.00	receita	pendente	2026-09-10	2025-12-10 12:30:29.566621+00	\N	1	5585040e8cf7688e	\N
277	3	Aluguel guapuruvu (11/13)	640.00	receita	pendente	2026-10-10	2025-12-10 12:30:29.567851+00	\N	1	5585040e8cf7688e	\N
278	3	Aluguel guapuruvu (12/13)	640.00	receita	pendente	2026-11-10	2025-12-10 12:30:29.56907+00	\N	1	5585040e8cf7688e	\N
282	19	Cartão Banrisul	2300.00	despesa	pendente	2026-01-01	2025-12-10 13:03:43.631869+00	\N	1		\N
267	3	Aluguel guapuruvu (1/13)	565.00	receita	recebido	2025-12-12	2025-12-10 12:30:29.55655+00	\N	1	5585040e8cf7688e	\N
279	3	Aluguel guapuruvu (13/13)	640.00	receita	pendente	2026-12-10	2025-12-10 12:30:29.570201+00	\N	1	5585040e8cf7688e	\N
280	1	Salario Joao	1200.00	receita	pendente	2026-01-08	2025-12-10 12:49:45.911029+00	\N	1		\N
281	1	Salario João	3000.00	receita	pendente	2026-02-05	2025-12-10 12:50:51.659685+00	\N	1		\N
284	1	Salario João (1/10)	3500.00	receita	pendente	2026-03-05	2025-12-10 13:26:56.064555+00	\N	1	832fa25e6b50776a	\N
285	1	Salario João (2/10)	3500.00	receita	pendente	2026-04-05	2025-12-10 13:26:56.066349+00	\N	1	832fa25e6b50776a	\N
286	1	Salario João (3/10)	3500.00	receita	pendente	2026-05-05	2025-12-10 13:26:56.067594+00	\N	1	832fa25e6b50776a	\N
287	1	Salario João (4/10)	3500.00	receita	pendente	2026-06-05	2025-12-10 13:26:56.068644+00	\N	1	832fa25e6b50776a	\N
288	1	Salario João (5/10)	3500.00	receita	pendente	2026-07-05	2025-12-10 13:26:56.069743+00	\N	1	832fa25e6b50776a	\N
289	1	Salario João (6/10)	3500.00	receita	pendente	2026-08-05	2025-12-10 13:26:56.070832+00	\N	1	832fa25e6b50776a	\N
290	1	Salario João (7/10)	3500.00	receita	pendente	2026-09-05	2025-12-10 13:26:56.071949+00	\N	1	832fa25e6b50776a	\N
291	1	Salario João (8/10)	3500.00	receita	pendente	2026-10-05	2025-12-10 13:26:56.07326+00	\N	1	832fa25e6b50776a	\N
292	1	Salario João (9/10)	3500.00	receita	pendente	2026-11-05	2025-12-10 13:26:56.074313+00	\N	1	832fa25e6b50776a	\N
293	1	Salario João (10/10)	3500.00	receita	pendente	2026-12-05	2025-12-10 13:26:56.075445+00	\N	1	832fa25e6b50776a	\N
283	1	Salario Anna	2300.00	receita	pendente	2026-01-01	2025-12-10 13:06:06.787823+00	\N	1		\N
253	4	Gás reserva	97.88	despesa	pago	2025-12-12	2025-12-09 00:13:59.084108+00	\N	1		\N
294	1	Salario Anna (1/11)	2300.00	receita	pendente	2026-02-01	2025-12-10 13:27:29.623181+00	\N	1	77a400b4b712c824	\N
295	1	Salario Anna (2/11)	2300.00	receita	pendente	2026-03-01	2025-12-10 13:27:29.625182+00	\N	1	77a400b4b712c824	\N
296	1	Salario Anna (3/11)	2300.00	receita	pendente	2026-04-01	2025-12-10 13:27:29.626509+00	\N	1	77a400b4b712c824	\N
297	1	Salario Anna (4/11)	2300.00	receita	pendente	2026-05-01	2025-12-10 13:27:29.627752+00	\N	1	77a400b4b712c824	\N
298	1	Salario Anna (5/11)	2300.00	receita	pendente	2026-06-01	2025-12-10 13:27:29.629125+00	\N	1	77a400b4b712c824	\N
299	1	Salario Anna (6/11)	2300.00	receita	pendente	2026-07-01	2025-12-10 13:27:29.630281+00	\N	1	77a400b4b712c824	\N
300	1	Salario Anna (7/11)	2300.00	receita	pendente	2026-08-01	2025-12-10 13:27:29.631333+00	\N	1	77a400b4b712c824	\N
301	1	Salario Anna (8/11)	2300.00	receita	pendente	2026-09-01	2025-12-10 13:27:29.632649+00	\N	1	77a400b4b712c824	\N
302	1	Salario Anna (9/11)	2300.00	receita	pendente	2026-10-01	2025-12-10 13:27:29.633833+00	\N	1	77a400b4b712c824	\N
303	1	Salario Anna (10/11)	2300.00	receita	pendente	2026-11-01	2025-12-10 13:27:29.63504+00	\N	1	77a400b4b712c824	\N
304	1	Salario Anna (11/11)	2300.00	receita	pendente	2026-12-01	2025-12-10 13:27:29.636223+00	\N	1	77a400b4b712c824	\N
306	14	Flash (2/12)	1660.00	receita	pendente	2026-02-01	2025-12-10 13:34:41.764552+00	\N	1	cf04c71c76a79b48	\N
307	14	Flash (3/12)	1660.00	receita	pendente	2026-03-01	2025-12-10 13:34:41.765804+00	\N	1	cf04c71c76a79b48	\N
308	14	Flash (4/12)	1660.00	receita	pendente	2026-04-01	2025-12-10 13:34:41.767632+00	\N	1	cf04c71c76a79b48	\N
309	14	Flash (5/12)	1660.00	receita	pendente	2026-05-01	2025-12-10 13:34:41.76873+00	\N	1	cf04c71c76a79b48	\N
310	14	Flash (6/12)	1660.00	receita	pendente	2026-06-01	2025-12-10 13:34:41.769789+00	\N	1	cf04c71c76a79b48	\N
311	14	Flash (7/12)	1660.00	receita	pendente	2026-07-01	2025-12-10 13:34:41.770707+00	\N	1	cf04c71c76a79b48	\N
312	14	Flash (8/12)	1660.00	receita	pendente	2026-08-01	2025-12-10 13:34:41.771747+00	\N	1	cf04c71c76a79b48	\N
313	14	Flash (9/12)	1660.00	receita	pendente	2026-09-01	2025-12-10 13:34:41.772818+00	\N	1	cf04c71c76a79b48	\N
314	14	Flash (10/12)	1660.00	receita	pendente	2026-10-01	2025-12-10 13:34:41.773928+00	\N	1	cf04c71c76a79b48	\N
315	14	Flash (11/12)	1660.00	receita	pendente	2026-11-01	2025-12-10 13:34:41.774945+00	\N	1	cf04c71c76a79b48	\N
316	14	Flash (12/12)	1660.00	receita	pendente	2026-12-01	2025-12-10 13:34:41.775937+00	\N	1	cf04c71c76a79b48	\N
305	2	Flash (1/12)	1660.00	receita	pendente	2026-01-01	2025-12-10 13:34:41.762736+00	\N	1	cf04c71c76a79b48	\N
317	14	Almoço João	351.20	despesa	pendente	2026-01-01	2025-12-10 13:41:19.410908+00	\N	1		\N
318	14	Almoço João	351.20	despesa	pendente	2026-02-01	2025-12-10 13:42:30.154779+00	\N	1		\N
320	6	Mensalidade SF 2026 + rematricula (1/3)	1450.00	despesa	pendente	2026-10-10	2025-12-10 14:08:45.22949+00	\N	1	8e4acdd0bf445cd3	\N
321	6	Mensalidade SF 2026 + rematricula (2/3)	1450.00	despesa	pendente	2026-11-10	2025-12-10 14:08:45.231463+00	\N	1	8e4acdd0bf445cd3	\N
322	6	Mensalidade SF 2026 + rematricula (3/3)	1450.00	despesa	pendente	2026-12-10	2025-12-10 14:08:45.232947+00	\N	1	8e4acdd0bf445cd3	\N
323	14	almoço anna	50.00	despesa	pago	2025-12-10	2025-12-10 15:28:16.204897+00	\N	1		\N
324	4	condominio benjamin 2025-12	468.91	despesa	pago	2025-12-10	2025-12-10 15:36:24.196548+00	\N	1		\N
325	23	contador	200.00	despesa	pago	2025-12-10	2025-12-10 15:57:23.349819+00	\N	1		\N
326	24	Caixa mes Janeiro	2000.00	despesa	pago	2025-12-10	2025-12-10 15:59:32.449006+00	\N	1		\N
319	25	Salvamento Ferias para Janeiro	2000.00	receita	recebido	2026-01-01	2025-12-10 13:46:23.979718+00	\N	1		\N
327	21	presente anntonio	59.99	despesa	pago	2025-12-10	2025-12-10 16:34:41.825056+00	\N	1		\N
328	1	13° João -  parcela 1	3421.79	receita	pendente	2026-10-15	2025-12-11 09:18:23.24493+00	\N	1		\N
329	1	13° João -  parcela 2	1865.93	receita	pendente	2026-11-11	2025-12-11 09:19:08.899043+00	\N	1		\N
330	1	Ferias Joao	7416.95	receita	pendente	2026-12-10	2025-12-11 09:20:19.01795+00	\N	1		\N
331	13	Uber	21.90	despesa	pago	2025-12-11	2025-12-11 12:16:06.882646+00	\N	1		\N
332	14	Almoço anna	22.00	despesa	pago	2025-12-11	2025-12-11 14:27:42.074156+00	\N	1		\N
333	14	Confraternização anna bezerra 	100.00	despesa	pago	2025-12-11	2025-12-11 21:49:20.96848+00	\N	1		\N
334	13	Uber	11.94	despesa	pago	2025-12-13	2025-12-13 13:11:13.480088+00	\N	1		\N
335	21	Fones 	96.00	despesa	pago	2025-12-13	2025-12-13 13:11:28.224632+00	\N	1		\N
336	21	Cuecas	69.98	despesa	pago	2025-12-13	2025-12-13 13:11:53.442413+00	\N	1		\N
337	14	Sorvete 	73.00	despesa	pago	2025-12-13	2025-12-13 13:19:49.991482+00	\N	1		\N
338	13	Uber	9.95	despesa	pago	2025-12-13	2025-12-13 13:32:28.047122+00	\N	1		\N
339	14	Refrigerante rissul 	16.98	despesa	pago	2025-12-14	2025-12-14 15:48:55.129511+00	\N	1		\N
340	14	Almoço domingo 	105.90	despesa	pago	2025-12-14	2025-12-14 16:04:17.260298+00	\N	1		\N
341	23	troca de gás	100.00	despesa	pendente	2026-03-01	2025-12-15 00:58:23.430971+00	\N	1		\N
342	2	Participação de lucros 	1700.00	receita	recebido	2025-12-19	2025-12-19 18:13:42.74913+00	\N	1		\N
343	14	Rissul 	225.53	despesa	pago	2025-12-19	2025-12-19 19:28:32.863362+00	\N	1		\N
\.


--
-- Data for Name: user_familias; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.user_familias (user_id, familia_id) FROM stdin;
3	1
2	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, nome, email, password, role, familia_id, created_at, updated_at, deleted_at) FROM stdin;
3	Anna Paula	joao.anna@gmail.com	$2a$10$R4fRARsxV6o7.bd/bwF6HeUwSQpMvlCSmEA9RLI11o3LFJxNA4uTe	user	\N	2025-12-22 14:06:05.092107+00	2025-12-22 14:06:12.56843+00	\N
1	Administrador	admin@admin.com	$2a$10$1xzeB6KWbQpSWTVt0rKUhelWnkyAwRG39ubAu1v8A5g14V9I50rum	admin	\N	2025-12-22 13:54:13.993174+00	2025-12-22 14:17:46.431745+00	\N
2	João Avila	joao.avila.rs@gmail.com	$2a$10$RfNTM9znN.aVBm1ipJ7b7.4yn3Emfw3mCbaiwjyfMC.Cj4I8LQHh.	user	\N	2025-12-22 13:57:51.581323+00	2025-12-22 14:18:26.829676+00	\N
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.usuarios (id, email, senha_hash, role, familia_id, created_at) FROM stdin;
1	admin@admin.com	$2a$10$a.dHyFSi6.QdOcWEL/YLzOFUnl7mlM.YihaYw/xrBvqzmRx.CO08q	admin	\N	2025-11-13 10:06:50.07523+00
2	joao.avila.rs@gmail.com	$2a$10$flDpRhSx11dLLITMYxte5edEdVJC8bwC1JIOqyLeZgJ7O8kRg4bGS	user	1	2025-11-13 11:14:59.073072+00
3	joao.anna@gmail.com	$2a$10$cY1aNCn3xY4V96hzKApUEelsPUtpIsmZlzVoAst3khtj7NNkRaofe	user	1	2025-11-13 11:15:15.016644+00
\.


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.categorias_id_seq', 25, true);


--
-- Name: familias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.familias_id_seq', 1, true);


--
-- Name: transacao_recorrentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.transacao_recorrentes_id_seq', 1, false);


--
-- Name: transacoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.transacoes_id_seq', 343, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: familias familias_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_pkey PRIMARY KEY (id);


--
-- Name: transacao_recorrentes transacao_recorrentes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transacao_recorrentes
    ADD CONSTRAINT transacao_recorrentes_pkey PRIMARY KEY (id);


--
-- Name: transacoes transacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT transacoes_pkey PRIMARY KEY (id);


--
-- Name: familias uni_familias_nome; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT uni_familias_nome UNIQUE (nome);


--
-- Name: usuarios uni_usuarios_email; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT uni_usuarios_email UNIQUE (email);


--
-- Name: user_familias user_familias_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_familias
    ADD CONSTRAINT user_familias_pkey PRIMARY KEY (user_id, familia_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_categorias_familia_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_categorias_familia_id ON public.categorias USING btree (familia_id);


--
-- Name: idx_familias_deleted_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_familias_deleted_at ON public.familias USING btree (deleted_at);


--
-- Name: idx_transacoes_deleted_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_transacoes_deleted_at ON public.transacoes USING btree (deleted_at);


--
-- Name: idx_transacoes_familia_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_transacoes_familia_id ON public.transacoes USING btree (familia_id);


--
-- Name: idx_transacoes_group_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_transacoes_group_id ON public.transacoes USING btree (group_id);


--
-- Name: idx_transacoes_usuario_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_transacoes_usuario_id ON public.transacoes USING btree (usuario_id);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_familia_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_users_familia_id ON public.users USING btree (familia_id);


--
-- Name: idx_usuarios_familia_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_usuarios_familia_id ON public.usuarios USING btree (familia_id);


--
-- Name: categorias fk_categorias_familia; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT fk_categorias_familia FOREIGN KEY (familia_id) REFERENCES public.familias(id);


--
-- Name: transacoes fk_transacoes_categoria; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT fk_transacoes_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- Name: transacoes fk_transacoes_familia; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT fk_transacoes_familia FOREIGN KEY (familia_id) REFERENCES public.familias(id);


--
-- Name: transacoes fk_transacoes_usuario; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.transacoes
    ADD CONSTRAINT fk_transacoes_usuario FOREIGN KEY (usuario_id) REFERENCES public.users(id);


--
-- Name: user_familias fk_user_familias_familia; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_familias
    ADD CONSTRAINT fk_user_familias_familia FOREIGN KEY (familia_id) REFERENCES public.familias(id);


--
-- Name: user_familias fk_user_familias_user; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_familias
    ADD CONSTRAINT fk_user_familias_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: usuarios fk_usuarios_familia; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_familia FOREIGN KEY (familia_id) REFERENCES public.familias(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ztgrTE5ue11PN56YfIhJEBJIUcww28iUjR9jGZfOZnphxLfg0lqg1LaffgmdIF0

