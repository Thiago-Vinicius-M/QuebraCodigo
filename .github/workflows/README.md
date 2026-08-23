# Workflows de CI/CD

> Local correto: os arquivos de workflow **precisam** ficar em `.github/workflows/`
> **na raiz do repositório**. Antes desta reestruturação eles estavam em
> `QuebraCodigo/app/.github/workflows/`, por isso o GitHub Actions **não os executava**.

## Ativos

| Workflow | Quando roda | O que faz |
|----------|-------------|-----------|
| `sync-to-dev.yml` | `release: published` e **manual** (`workflow_dispatch`) | Faz fast-forward de `main` em `dev`. Se houver divergência, abre uma PR `chore/sync-main-to-dev`. |

### Como sincronizar `main` → `dev` manualmente
GitHub → aba **Actions** → **Sync main to dev** → **Run workflow**.
(Ou, via API/CLI, atualizar a ref `dev` para o SHA de `main` quando for fast-forward.)

## Desativados (`.yml.disabled`)

Estes workflows vieram de um **scaffold voltado para Next.js/Node** e **não se aplicam**
a este projeto, que é **Spring Boot / Maven**. Ativá-los faria o CI **falhar** em todo PR
(usam `npm ci`, `npm run lint`, `npm run build`, `.next`, `release-type: node`, etc.,
sem um `package.json` correspondente na raiz).

| Arquivo | Por que está desativado | Para reativar |
|---------|-------------------------|---------------|
| `ci.yml.disabled` | `npm ci` + `npm run lint` + `commitlint` (Node) | Adaptar para Maven (ex.: `mvn -q -f app/pom.xml verify`) e manter só o `commitlint` se houver `package.json` na raiz. |
| `release-please.yml.disabled` | `release-type: node` | Trocar para versionamento compatível com Maven (ou remover). |
| `glitchtip-release.yml.disabled` | Faz `npm run build` e sobe sourcemaps de `.next` (Next.js) | Adaptar ao build real do projeto (ou remover). |

> Para reativar qualquer um, remova o sufixo `.disabled` **após** adaptá-lo ao Maven.
