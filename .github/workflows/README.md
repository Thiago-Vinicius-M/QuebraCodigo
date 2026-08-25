# Workflows de CI/CD

Os arquivos de workflow precisam ficar em `.github/workflows/` **na raiz**
do repositório. O GitHub Actions ignora YAML em pastas internas.

## Ativos

| Workflow | Quando roda | O que faz |
|----------|-------------|-----------|
| `ci.yml` | push/PR em `main` e `dev`, e **manual** (`workflow_dispatch`) | Restore Maven → `mvn verify` (JUnit + Testcontainers) → `docker build` |
| `sync-to-dev.yml` | `release: published` e **manual** | Fast-forward de `main` em `dev`. Se divergir, abre PR `chore/sync-main-to-dev`. |

### CI (este projeto)

GitHub → aba **Actions** → **CI** → **Run workflow**.

Etapas do job:

1. **Restore** — `mvn -f app/pom.xml dependency:resolve` (baixa Spring, PostgreSQL, Flyway, etc.) com cache de `~/.m2`
2. **Test** — `mvn -f app/pom.xml verify` (Java 21). Os testes de integração sobem Postgres via Testcontainers
3. **Imagem** — `docker build` com o `Dockerfile` da raiz (mesmo fluxo do `docker compose`)

Não há deploy automático: não há servidor/registry configurado. Publicar continua sendo `docker compose up --build` na máquina ou no servidor da banca.

Playwright (`scripts/`) não entra neste workflow (precisa da app + Postgres + Mailhog no ar).

### Sync `main` → `dev`

GitHub → **Actions** → **Sync main to dev** → **Run workflow**.

## Desativados (`.yml.disabled`)

Scaffold antigo de **Next.js/Node**. Não ligar: quebram o PR (`npm ci`, `.next`, `release-type: node`).

| Arquivo | Motivo |
|---------|--------|
| `ci.yml.disabled` | CI Node; o CI real é o `ci.yml` Maven |
| `release-please.yml.disabled` | Versionamento Node |
| `glitchtip-release.yml.disabled` | Sourcemaps Next.js |
