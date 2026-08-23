# Testes Automatizados — QuebraCódigo

## Estratégia híbrida (JUnit + Playwright)

| Camada | Ferramenta | O que cobre |
|---|---|---|
| Regras de negócio / banco / API de serviço | **JUnit 5** (`app/src/test`) | Pontuação, Memory score/deck, Sudoku, Connect4, Minesweeper, 2048, Auth, Gamificação |
| Interface e fluxo de usuário | **Playwright** (`scripts/tests`) | Login/UI, navegação, overlays, smoke E2E |

Ordem recomendada:

```bash
cd app && mvn test
cd ../scripts && npm run test:smoke
```

## Pré-requisitos

1. Servidor Spring Boot rodando em `http://localhost:8150` (só para Playwright)
2. Banco PostgreSQL configurado e acessível
3. Node.js 18+ (Playwright)
4. Java 21 + Maven (JUnit)
5. Docker Desktop (opcional; Testcontainers). Sem Docker, os testes JUnit usam PostgreSQL local.

## Testes Java (JUnit)

```bash
cd app
mvn test
```

Principais suites:

| Pacote | Sprint | Conteúdo |
|---|---|---|
| `br.com.user.database` / `repository` / `service` (Pontuacao*) | 0 | Schema, persistência e regras de pontos |
| `br.com.user.game.memory` | 1 | Deck, pares, fórmula de score |
| `br.com.user.game.sudoku` | 2 | Geração, conflitos, solve |
| `br.com.user.game.connect4` | 3 | Gravidade, vitórias, coluna cheia |
| `br.com.user.game.minesweeper` | 4 | Config, 1º clique seguro, hint |
| `br.com.user.game.game2048` | 5 | Estado inicial, move, undo |
| `br.com.user.service.AuthServiceTest` | 6 | Register/login |
| `br.com.user.service.GamificationServiceTest` | 7 | Award + histórico + ranking |

## Playwright (E2E / UI)

### Instalação

```bash
cd scripts
npm install
npx playwright install chromium
```

### Como rodar

| Comando | O que faz |
|---|---|
| `npm test` | Todos os testes (headless) |
| `npm run test:headed` | Todos os testes com janela visível |
| `npm run test:smoke` | Apenas testes críticos marcados com @smoke |
| `npm run test:auth` | Apenas testes de autenticação |
| `npm run test:report` | Abre o relatório HTML do último run |
| `npm run test:ui` | Interface visual do Playwright |
| `npm run test:debug` | Modo debug (passo a passo) |

### Estrutura

```
scripts/
├── playwright.config.js
├── tests/
│   ├── auth/          # UI de login/cadastro/logout
│   ├── games/         # UI dos jogos (regras no JUnit)
│   ├── navigation/
│   └── regression/    # smoke E2E + smoke fino de /start
├── pages/
└── fixtures/
```

## Relatório HTML

```bash
npm run test:report
```
