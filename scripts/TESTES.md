# Testes Automatizados — QuebraCódigo

## Pré-requisitos

1. Servidor Spring Boot rodando em `http://localhost:8150`
2. Banco PostgreSQL configurado e acessível
3. Node.js 18+

## Instalação

```bash
cd scripts
npm install
npx playwright install chromium
```

## Como rodar os testes

| Comando | O que faz |
|---|---|
| `npm test` | Todos os testes (headless) |
| `npm run test:headed` | Todos os testes com janela visível |
| `npm run test:smoke` | Apenas testes críticos marcados com @smoke |
| `npm run test:auth` | Apenas testes de autenticação |
| `npm run test:report` | Abre o relatório HTML do último run |
| `npm run test:ui` | Interface visual do Playwright |
| `npm run test:debug` | Modo debug (passo a passo) |

## Estrutura

```
scripts/
├── playwright.config.js        # Configuração central
├── tests/
│   ├── auth/
│   │   ├── login.spec.js       # 9 testes de login
│   │   ├── register.spec.js    # 9 testes de cadastro
│   │   └── logout.spec.js      # 4 testes de logout/sessão
│   ├── navigation/
│   │   └── pages.spec.js       # 10 testes de navegação e responsividade
│   └── regression/
│       └── smoke.spec.js       # 7 testes de regressão e fluxo completo
├── pages/                      # Page Object Model
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   └── HomePage.js
├── fixtures/
│   └── auth.fixture.js         # Fixture de autenticação reutilizável
└── screenshots/                # Screenshots capturadas automaticamente
```

## Relatório HTML

Após rodar os testes:
```bash
npm run test:report
```
O relatório abre no browser com detalhes de cada teste, screenshots e vídeos de falhas.
