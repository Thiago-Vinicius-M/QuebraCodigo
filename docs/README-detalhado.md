# QuebraCodigo - README detalhado

Documentacao tecnica do projeto QuebraCodigo, com foco em execucao, arquitetura e operacao do ambiente.

## Visao geral

O QuebraCodigo e uma plataforma web academica com:

- autenticacao (cadastro, login e sessao HTTP);
- cursos com licoes e exercicios;
- jogos educativos;
- persistencia em PostgreSQL;
- back-end Spring Boot (Java 21).

O modulo principal ativo no repositorio e `app`.

## Stack tecnica

- **Back-end:** Spring Boot 3.3, Spring Web, Spring Data JPA
- **Banco:** PostgreSQL
- **Migracoes:** Flyway (`app/src/main/resources/db/migration`)
- **Autenticacao:** sessao HTTP + BCrypt
- **Front-end:** HTML, CSS e JavaScript

## Estrutura principal

```text
QuebraCodigo/
├── app/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── scripts/
│   │   ├── postgres-setup.sql
│   │   └── docker-init.sql
│   └── src/main/
│       ├── java/
│       └── resources/
│           ├── application.properties
│           ├── db/migration/
│           └── static/
├── docker-compose.yml
└── docs/
    └── README-detalhado.md
```

## Como subir com Docker (recomendado)

### Pre-requisitos

- Docker Desktop
- Docker Compose

### Passo a passo

Na raiz do repositorio:

```bash
docker compose up --build
```

Depois abra:

- `http://localhost:8150`

### O que sobe no compose

- `db` (PostgreSQL 16):
  - banco `quebra_codigo`
  - usuario `qc_user`
  - senha `qc_pass`
- `app` (Spring Boot):
  - porta `8150`
  - conecta no host `db` interno da rede Docker

### Comandos de operacao

```bash
# parar containers
docker compose down

# parar e apagar volumes (reset completo do banco)
docker compose down -v

# ver logs em tempo real
docker compose logs -f app
docker compose logs -f db
```

## Como subir sem Docker (local)

### Pre-requisitos

- Java 21
- Maven 3.9+
- PostgreSQL 14+ em `localhost:5432`

### Setup do banco (uma vez por maquina)

1. Criar role e database:

```sql
CREATE ROLE qc_user LOGIN PASSWORD 'qc_pass';
CREATE DATABASE quebra_codigo OWNER qc_user;
```

2. Aplicar setup do schema:

```bash
psql -U postgres -d quebra_codigo -f app/scripts/postgres-setup.sql
```

### Rodar a aplicacao

```bash
cd app
mvn spring-boot:run
```

Aplicacao disponivel em `http://localhost:8150`.

## Configuracoes importantes

Arquivo: `app/src/main/resources/application.properties`

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `server.port=8150`

No modo Docker, o `docker-compose.yml` sobrescreve as variaveis de datasource via `environment`.

Documentacao dedicada das mudancas de banco (schema `app`, Flyway, Supabase Session Pooler, impacto ao rodar e checklist do time): `docs/alteracoes-banco-schema-app-supabase.md`.

## Endpoints principais (visao geral)

- `POST /auth/login` - autentica usuario
- `POST /auth/register` - cadastra usuario
- `GET /auth/me` - dados do usuario logado
- `GET /api/cursos` - lista cursos
- `GET /api/licoes` - lista licoes
- `GET /api/exercicios` - lista exercicios
- `GET /api/jogos` - lista jogos
- `GET /api/leaderboard` - ranking

## Jogos incluidos

- Minesweeper
- Sudoku
- Memory
- Connect4
- 2048
- Flow Free
- outros jogos em `app/src/main/resources/static/games`

## Troubleshooting rapido

- **Porta 8150 ocupada:** altere o mapeamento no `docker-compose.yml` ou feche o processo concorrente.
- **Falha de conexao com banco no local:** verifique se PostgreSQL esta ativo e se credenciais batem com `application.properties`.
- **`permission denied for schema public`:** o projeto usa o schema `app` — veja `docs/alteracoes-banco-schema-app-supabase.md` e rode o setup uma vez.
- **Timeout / falha IPv6 no Supabase:** use Session Pooler (`*.pooler.supabase.com`), nao a URL direta `db.*`.
- **Nao ve tabelas no DBeaver:** inspecione o schema `app`, nao so `public`.
- **Reset total do ambiente Docker:** use `docker compose down -v` e depois `docker compose up --build`.

## Fluxo de contribuicao

Padroes de commit e colaboracao estao em `CONTRIBUTING.md`.
