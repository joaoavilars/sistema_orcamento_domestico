# 🚀 ContaJunto

**ContaJunto** é um sistema de orçamento familiar colaborativo, projetado para que casais ou famílias possam gerenciar suas finanças de forma unificada.

Construído com uma stack moderna de Go (backend), React (frontend) e PostgreSQL, tudo orquestrado com Docker. O sistema utiliza um modelo *multi-tenant* onde um "Super Admin" pode criar e gerenciar múltiplas "Famílias", e cada família compartilha suas próprias transações e categorias.

![Visão Geral do App](httpsImage of ContaJunto dashboard dark mode]

---

## ✨ Funcionalidades

* **Autenticação JWT:** Sistema de login seguro com JSON Web Tokens.
* **Modelo de Família:** Transações e Categorias pertencem a uma "Família", permitindo que múltiplos usuários (ex: casal) compartilhem o mesmo orçamento.
* **Gerenciamento de Transações (CRUD):** Adicione, edite e exclua receitas ou despesas.
* **Gerenciamento de Categorias (CRUD):** Crie categorias personalizadas com nomes e cores.
* **Dashboard Interativo:**
    * Sumário de Receitas, Despesas e Saldo do mês.
    * Gráfico de Pizza com a distribuição de despesas por categoria.
    * Gráfico de Barras com o balanço (Receita vs. Despesa) dos últimos 12 meses.
* **Painel de Super Admin:**
    * Gerenciamento de Usuários (CRUD).
    * Gerenciamento de Famílias (CRUD).
    * Associação de usuários a famílias.
* **Design Responsivo:** Funciona em desktop e mobile (PWA).
* **Modo Dark/Light:** Tema claro e escuro com persistência.

---

## 🛠️ Stack Tecnológica

* **Backend (API):** **Go (Golang)**
    * **Roteamento:** Gin-Gonic
    * **ORM:** GORM
    * **Autenticação:** JWT (golang-jwt)
    * **Senhas:** Bcrypt
* **Frontend (UI):** **React.js**
    * **Build Tool:** Vite
    * **Estilização:** Tailwind CSS (com modo Dark)
    * **Roteamento:** React Router v6
    * **Requisições:** Axios
    * **Gráficos:** Recharts
    * **Ícones:** Heroicons
* **Banco de Dados:** **PostgreSQL** (Imagem Alpine)
* **Infraestrutura & Deploy:**
    * **Containerização:** Docker & Docker Compose
    * **Proxy Reverso (Frontend):** Nginx (servindo o build estático do React)

---

## 🏁 Como Rodar o Projeto

Este projeto é 100% containerizado. A única dependência na sua máquina é o **Docker** e o **Docker Compose**.

### 1. Preparação

Clone este repositório (ou tenha os arquivos localmente).

### 2. Arquivo de Ambiente (`.env`)

Crie um arquivo chamado `.env` na pasta raiz do projeto (no mesmo nível do `docker-compose.yml`). Este arquivo guardará suas senhas.

Copie o conteúdo abaixo para o seu `.env`:

```env
# Use um gerador de chaves (como 'openssl rand -base64 32') para criar este segredo
JWT_SECRET=SuaChaveSecretaMuitoLongaEAleatoriaAqui

# Credenciais do Banco de Dados PostgreSQL
POSTGRES_USER=contajunto_user
POSTGRES_PASSWORD=SuaSenhaForteParaOBancoAqui
POSTGRES_DB=contajunto_db
```

### 3. Subindo os Contêineres

Este comando irá construir as imagens do backend e frontend, e iniciar os três serviços (backend, frontend, db).

```bash
# Constrói e sobe os contêineres em background
docker compose up --build -d
```

Se você precisar forçar uma reconstrução (caso o cache esteja atrapalhando):
```bash
docker compose build --no-cache
docker compose up -d
```

### 4. Acessando o Sistema

* **Aplicação (Frontend):** [http://localhost](http://localhost) (ou a porta que você definiu, ex: `http://localhost:8083`)
* **Login do Super Admin:**
    * **Email:** `admin@admin.com`
    * **Senha:** `admin123` (ou a senha definida no `backend/database/database.go` no `seedUser`)

### Fluxo de Primeiro Uso (Recomendado)

1.  Acesse `http://localhost` e faça login como `admin@admin.com`.
2.  Navegue até a aba **"Usuários"**.
3.  Clique no botão **"+"** ao lado do dropdown "Família" para criar sua primeira família (ex: "Família Ávila").
4.  Use o formulário "Cadastrar Novo Usuário" para criar seu usuário principal (ex: `joao@email.com`), definindo a "Role" como "Usuário Padrão" e selecionando a "Família Ávila".
5.  Crie um segundo usuário (ex: `anna@email.com`) e associe-o à **mesma** "Família Ávila".
6.  Faça **Logout** da conta admin.
7.  Faça **Login** com o seu usuário (`joao@email.com`).
8.  Agora você pode cadastrar categorias e transações que serão compartilhadas com todos os membros da "Família Ávila".