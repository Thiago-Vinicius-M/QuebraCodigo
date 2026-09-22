# Alterações no banco — schema `app`, Flyway e Supabase

Documento para alinhar o grupo sobre o que mudou na persistência do QuebraCódigo: por que o schema `app` existe, quais passos foram feitos, o impacto ao rodar o projeto e como configurar cada ambiente.

**Público:** time do TCC / colaboradores que sobem a API Spring Boot.  
**App:** porta `8150` → `http://localhost:8150`.

---

## 1. Resumo em uma frase

Saímos do modelo “Postgres local com tabelas no `public`” para **schema dedicado `app` + Flyway + (opcionalmente) Supabase via Session Pooler**, evitando erro de permissão no PostgreSQL 15+ e falhas de rede IPv6.

---

## 2. Problema que motivou a mudança

No **PostgreSQL 15+**, usuários que não são donos do schema `public` **não têm permissão `CREATE`** nele por padrão.

Se o Flyway ou o Hibernate tentam criar tabelas em `public` com o usuário da aplicação, o log mostra algo como:

```text
permission denied for schema public
```

**Decisão:** criar o schema `app`, torná-lo dono do usuário da app (`qc_user` no local, ou o usuário do projeto no Supabase) e apontar datasource, Flyway e Hibernate para esse schema.

---

## 3. Passos que foram executados

| # | Ação | Artefato / local |
|---|------|------------------|
| 1 | Script de setup (uma vez por banco) | `app/scripts/postgres-setup.sql` |
| 2 | Init automático do schema no Postgres Docker | `app/scripts/docker-init.sql` |
| 3 | URL JDBC com `currentSchema=app` | `app/src/main/resources/application.properties` |
| 4 | Flyway restrito ao schema `app` | `spring.flyway.schemas=app`, `locations=classpath:db/migration` |
| 5 | Hibernate no mesmo schema | `spring.jpa.properties.hibernate.default_schema=app` |
| 6 | Migration inicial (`usuarios`) | `app/src/main/resources/db/migration/V1__create_usuarios.sql` |
| 7 | Compose padrão → app + banco na nuvem (Supabase) | `docker-compose.yml` + `.env` / `.env.example` |
| 8 | Override opcional com Postgres local | `docker-compose.local-db.yml` |
| 9 | Documentação de execução no README | `README.md`, `docs/README-detalhado.md` |

### O que o `postgres-setup.sql` faz

Executado **uma vez**, como superusuário (`postgres`), no banco alvo:

1. `GRANT CONNECT` ao usuário da aplicação.
2. `CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION qc_user` (no local).

Depois disso, Flyway e Hibernate conseguem criar/alterar objetos **dentro de `app`** sem tocar no `public`.

No **Supabase**, o equivalente é rodar no SQL Editor (uma vez) a criação do schema `app` com o papel adequado ao projeto.

---

## 4. Impacto real na hora de rodar

### 4.1 Onde ficam as tabelas

| Antes (visão antiga) | Agora |
|----------------------|--------|
| Tabelas no schema `public` | Tabelas no schema **`app`** (ex.: `app.usuarios`) |
| Só olhar `public` no DBeaver bastava | É preciso abrir o schema **`app`** no cliente SQL |

Se alguém conectar e só expandir `public`, vai achar que “não tem tabela” — elas estão em `app`.

### 4.2 O que acontece na subida do Spring

1. Conecta no Postgres (local ou pooler Supabase) com `currentSchema=app`.
2. **Flyway** aplica migrations em `classpath:db/migration` e mantém o histórico no schema `app`.
3. **Hibernate** (`ddl-auto=update`) alinha o restante do modelo JPA no mesmo schema.
4. A API sobe em **`http://localhost:8150`**.

Não é necessário criar a tabela `usuarios` à mão se o schema `app` já existir e a app subir com Flyway habilitado.

### 4.3 Configuração relevante (`application.properties`)

Conceitos (valores sensíveis ficam no `.env` / secrets do time — **não versionar senha real**):

| Propriedade | Papel |
|-------------|--------|
| `spring.datasource.url` … `?currentSchema=app&sslmode=require` | Força o schema e SSL (Supabase) |
| `spring.flyway.enabled=true` | Liga migrations |
| `spring.flyway.schemas=app` | Histórico e objetos Flyway no `app` |
| `spring.flyway.baseline-on-migrate=true` | Facilita banco já existente |
| `spring.jpa.properties.hibernate.default_schema=app` | JPA/Hibernate no mesmo schema |
| `server.port=8150` | Porta da aplicação |

### 4.4 Por que Session Pooler (Supabase)

A URL direta `db.*.supabase.co` costuma exigir **IPv6**. Em redes só **IPv4**, a conexão falha.

O projeto usa o **Session Pooler** (`*.pooler.supabase.com`, porta `5432`), obtido no dashboard: **Connect → Session pooler**.

Modelo em `.env.example`:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-REGION.pooler.supabase.com:5432/postgres?currentSchema=app&sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.SEU_PROJECT_REF
SPRING_DATASOURCE_PASSWORD=SUA_SENHA_DO_BANCO
```

---

## 5. Como cada pessoa configura

### Opção A — Docker + Supabase (padrão do repositório)

1. No Supabase SQL Editor: criar o schema `app` **uma vez** (equivalente ao setup SQL).
2. Na raiz do repo:

```bash
cp .env.example .env
# editar URL do Session pooler, usuário e senha
docker compose up --build
```

3. Abrir `http://localhost:8150`.

O `docker-compose.yml` injeta as variáveis do `.env` na app e usa `network_mode: host` para evitar timeout SSL com o pooler em alguns ambientes Docker.

### Opção B — Docker com Postgres local

```bash
docker compose -f docker-compose.yml -f docker-compose.local-db.yml up --build
```

- Sobe Postgres 16 com usuário `qc_user` / senha `qc_pass` / banco `quebra_codigo`.
- `docker-init.sql` cria o schema `app` automaticamente.
- A app aponta para `jdbc:postgresql://db:5432/quebra_codigo?currentSchema=app`.

### Opção C — Sem Docker (`mvn spring-boot:run`)

**Uma vez por máquina (Postgres local):**

```sql
CREATE ROLE qc_user LOGIN PASSWORD 'qc_pass';
CREATE DATABASE quebra_codigo OWNER qc_user;
```

```bash
psql -U postgres -d quebra_codigo -f app/scripts/postgres-setup.sql
```

Depois:

```bash
cd app
mvn spring-boot:run
```

Ajuste `application.properties` (ou variáveis de ambiente) para localhost **ou** para o pooler Supabase, conforme o ambiente do time.

---

## 6. Checklist rápido pro time

- [ ] Sei que os dados ficam no schema **`app`**, não em `public`.
- [ ] Schema `app` criado **uma vez** (SQL Editor Supabase ou `postgres-setup.sql` / Docker init).
- [ ] Se for Supabase: uso **Session Pooler** (IPv4), não a URL direta `db.*`.
- [ ] Tenho `.env` a partir de `.env.example` quando uso Docker.
- [ ] No cliente SQL, inspeciono tabelas em **`app`**.
- [ ] Consigo abrir a app em `http://localhost:8150`.

---

## 7. Arquivos para consultar

| Arquivo | Uso |
|---------|-----|
| `app/scripts/postgres-setup.sql` | Setup manual do schema (local / referência Supabase) |
| `app/scripts/docker-init.sql` | Schema no Postgres do compose local |
| `app/src/main/resources/db/migration/` | Migrations Flyway |
| `app/src/main/resources/application.properties` | Datasource, Flyway, JPA |
| `.env.example` | Modelo de credenciais Docker/Supabase |
| `docker-compose.yml` | App + Supabase |
| `docker-compose.local-db.yml` | Override com Postgres local |
| `README.md` | Passo a passo curto de execução |

---

## 8. Frase de alinhamento (reunião)

Migrámos para o schema `app` com Flyway (e Supabase via Session Pooler quando na nuvem) para o time subir o projeto **sem** `permission denied for schema public` e **sem** depender de IPv6 na conexão direta do Supabase.

## 9. Apresentação visual

Versão em estilo site (transições GSAP, sem scrollbar): `docs/apresentacao/site/index.html`.
