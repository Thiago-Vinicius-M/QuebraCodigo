# QuebraCodigo

Plataforma educacional com jogos interativos, trilhas de programacao e back-end em Spring Boot.

## Estrutura do repositorio

```text
QuebraCodigo/
├── app/                          # modulo principal (Spring Boot)
│   ├── Dockerfile
│   ├── pom.xml
│   ├── scripts/
│   └── src/
├── docker-compose.yml            # sobe a app (banco no Supabase)
├── docker-compose.local-db.yml   # override opcional com Postgres local
├── .env.example                  # modelo de credenciais
├── docs/
│   └── README-detalhado.md
├── CONTRIBUTING.md
└── README.md
```

## Como executar

### Docker (recomendado) — com Supabase

1. Configure o banco na nuvem (schema `app` criado uma vez no SQL Editor).
2. Na raiz do projeto:

```bash
cp .env.example .env
# edite .env com URL/usuario/senha do Session pooler (Connect no dashboard)
docker compose up --build
```

A aplicacao sobe em `http://localhost:8150`.

Comandos uteis:

```bash
# para os containers
docker compose down

# Postgres local (sem Supabase)
docker compose -f docker-compose.yml -f docker-compose.local-db.yml up --build
```

### Sem Docker (modo local)

1. Entre no modulo principal:

```bash
cd app
```

2. Execute:

```bash
mvn spring-boot:run
```

3. Acesse `http://localhost:8150`.

## Pre-requisitos

### Para Docker

- Docker Desktop
- Docker Compose

### Para modo local

- Java 21 (JDK)
- Maven 3.9+
- PostgreSQL 14+ em `localhost:5432`

## Banco de dados no Docker

No modo Docker, o `docker-compose.yml` ja cria:

- banco `quebra_codigo`
- usuario `qc_user`
- schema `app` (via `app/scripts/docker-init.sql`)

Nao e necessario rodar setup manual nesse modo.

## Banco de dados no modo local (uma vez por maquina)

Rode os passos abaixo antes do primeiro `mvn spring-boot:run`:

```sql
CREATE ROLE qc_user LOGIN PASSWORD 'qc_pass';
CREATE DATABASE quebra_codigo OWNER qc_user;
```

Depois execute:

```bash
psql -U postgres -d quebra_codigo -f app/scripts/postgres-setup.sql
```

## Colaboracao do time

Use `CONTRIBUTING.md` para fluxo de trabalho e padrao de commits.

## Documentacao detalhada

Detalhes tecnicos (funcionalidades, APIs, stack e equipe) em `docs/README-detalhado.md`.
