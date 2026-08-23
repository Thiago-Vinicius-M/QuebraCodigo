# Reestruturação do repositório e workflows

## Resumo

Este documento registra a normalização da estrutura do repositório e o ajuste
dos workflows de GitHub Actions.

## O que mudou na estrutura

Antes, todo o projeto vivia dentro de uma subpasta `QuebraCodigo/` na raiz do
repositório (ex.: `QuebraCodigo/app/...`). Isso causava dois problemas:

1. **Workflows não executavam.** O GitHub Actions só roda workflows em
   `.github/workflows/` **na raiz do repositório**. Os arquivos estavam em
   `QuebraCodigo/app/.github/workflows/`, portanto eram ignorados (inclusive o
   `sync-to-dev`).
2. **Descompasso com a cópia local.** A pasta de trabalho local correspondia ao
   conteúdo de `QuebraCodigo/` (com `app/` na raiz), diferente do layout do repo.

### Depois (estrutura padrão, na raiz)

```
.
├── .github/
│   ├── workflows/
│   │   ├── sync-to-dev.yml            # ATIVO
│   │   ├── ci.yml.disabled            # scaffold Next.js (inativo)
│   │   ├── release-please.yml.disabled
│   │   ├── glitchtip-release.yml.disabled
│   │   └── README.md
│   └── PULL_REQUEST_TEMPLATE/
├── app/                               # módulo Spring Boot / Maven (pom.xml)
├── scripts/                           # testes E2E (Playwright)
├── docs/
├── README.md  CONTRIBUTING.md  pom.xml  .gitignore
└── ...
```

A movimentação foi feita com `git mv`, preservando o histórico (renomeações).

## Workflows

Os workflows do scaffold são voltados a **Next.js/Node** e **não se aplicam** a
este projeto **Spring Boot/Maven**. Por isso:

- **`sync-to-dev.yml`** (git puro) foi **mantido ativo** — sincroniza `main` → `dev`
  por fast-forward, com fallback de PR em caso de conflito. Pode ser disparado em
  **Actions → Sync main to dev → Run workflow**.
- **`ci.yml`, `release-please.yml`, `glitchtip-release.yml`** foram **desativados**
  (sufixo `.disabled`) para não falharem em todo PR. Ficam preservados para
  adaptação futura ao Maven. Detalhes em `.github/workflows/README.md`.

## Próximos passos sugeridos (opcional)

- Adaptar o `ci.yml` para Maven (ex.: `mvn -q -f app/pom.xml verify`) e manter o
  `commitlint` no título do PR caso exista `package.json` na raiz.
- Definir uma estratégia de release compatível com Maven (ou remover o
  release-please/glitchtip se não forem usados).
