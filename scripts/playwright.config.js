// playwright.config.js
// Configuração central do Playwright para o projeto QuebraCódigo.
//
// Para rodar: npm test (dentro de scripts/)
// Pré-requisito: servidor Spring Boot rodando em http://localhost:8150

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  // Diretório onde ficam os arquivos .spec.js
  testDir: './tests',

  // Tempo máximo por teste (45 segundos)
  // As páginas de jogo transpilam JSX no navegador (Babel via CDN),
  // então o primeiro render pode demorar alguns segundos.
  timeout: 45_000,

  // Tempo máximo para cada expect() (12 segundos)
  // Elevado para absorver o tempo de transpilação/render do React no browser.
  expect: { timeout: 12_000 },

  // Testes de auth têm efeito colateral no banco — não paralelizar
  fullyParallel: false,
  workers: 1,

  // 1 retry automático em CI para falhas de rede/timing
  retries: process.env.CI ? 2 : 1,

  // Relatórios: HTML (abre com npm run test:report) + saída em lista no terminal
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    // URL base do servidor Spring Boot
    baseURL: 'http://localhost:8150',

    // Screenshot automático somente em falha
    screenshot: 'only-on-failure',

    // Vídeo salvo somente em falha (útil para depurar no TCC)
    video: 'retain-on-failure',

    // Trace salvo na primeira tentativa com falha
    trace: 'on-first-retry',

    // Inclui cookies de sessão em todas as requisições da página
    // (necessário para autenticação baseada em sessão HTTP)
    ignoreHTTPSErrors: true,
  },

  projects: [
    // Desktop Chrome — cenário principal
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile — garante compatibilidade responsiva
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
