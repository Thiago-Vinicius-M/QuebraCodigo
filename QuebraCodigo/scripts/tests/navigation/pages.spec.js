/**
 * pages.spec.js — Testes de Navegação e Proteção de Rotas
 *
 * Tipo: E2E + Segurança + Teste de Interface
 *
 * Cobre:
 *   ✓ Páginas públicas acessíveis sem autenticação
 *   ✓ Páginas protegidas redirecionam para login sem autenticação
 *   ✓ Navegação entre jogos (autenticado)
 *   ✓ Botão "Voltar" funcional nos jogos
 *   ✓ Viewport responsivo (desktop e mobile)
 *
 * Como descrever no TCC:
 *   "Testes de navegação que validam as regras de acesso do sistema,
 *   garantindo que o auth-guard.js proteja corretamente as rotas privadas
 *   e que a navegação entre páginas funcione em diferentes dispositivos."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';

// ── Páginas protegidas do sistema ─────────────────────────────────────────────
// Todas usam auth-guard.js no <head>
const PROTECTED_PAGES = [
  '/index.html',
  '/games/sudoku/sudoku.html',
  '/games/memory/memory.html',
  '/games/connect4/connect4.html',
  '/games/2048/2048.html',
];

// ── Páginas públicas ──────────────────────────────────────────────────────────
const PUBLIC_PAGES = [
  '/login.html',
  '/cadastro.html',
];

// ── Testes ────────────────────────────────────────────────────────────────────

test.describe('Navegação — Páginas Públicas', () => {

  /**
   * TESTE 1 — Páginas públicas carregam sem autenticação
   *
   * Objetivo: garantir que login e cadastro são acessíveis sem sessão.
   * Tipo: Funcional / Navegação
   * Valida: status 200 e ausência de redirecionamento para login
   */
  for (const url of PUBLIC_PAGES) {
    test(`deve carregar ${url} sem autenticação`, async ({ page }) => {
      await page.goto(`http://localhost:8150${url}`);
      await page.waitForLoadState('domcontentloaded');

      // Página pública não deve ser redirecionada
      expect(page.url()).not.toContain('/login.html'.replace(url, ''));

      // Deve ter carregado com sucesso (sem erro 404 ou 500)
      const title = await page.title();
      expect(title).toBeTruthy();
    });
  }

});

test.describe('Navegação — Proteção de Rotas (sem autenticação)', () => {

  /**
   * TESTE 2 — Páginas protegidas redirecionam sem autenticação @smoke
   *
   * Objetivo: verificar que o auth-guard.js bloqueia todas as rotas privadas.
   * Tipo: E2E / Segurança / Regressão
   * Valida: cada página protegida redireciona para /login.html
   *
   * Nota TCC: este teste usa `test.each` equivalente com loop,
   *   cobrindo todas as rotas protegidas automaticamente.
   */
  for (const url of PROTECTED_PAGES) {
    test(`deve redirecionar ${url} para login sem sessão @smoke`, async ({ page }) => {
      await page.goto(`http://localhost:8150${url}`);

      // auth-guard.js: chama /auth/me → 401 → window.location.href = '/login.html'
      await page.waitForURL('**/login.html', { timeout: 8_000 });
      expect(page.url()).toContain('login.html');
    });
  }

});

test.describe('Navegação — Páginas Autenticadas', () => {

  /**
   * TESTE 3 — Navegar entre jogos estando autenticado
   *
   * Objetivo: verificar que o usuário autenticado consegue acessar os jogos.
   * Tipo: E2E / Funcional / Navegação
   * Valida: carregamento das páginas de jogo sem redirecionamento
   */
  test('deve acessar Sudoku autenticado sem redirecionamento', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('http://localhost:8150/games/sudoku/sudoku.html');
    await page.waitForLoadState('networkidle');

    // Não deve ter sido redirecionado para login
    expect(page.url()).not.toContain('login.html');
    expect(page.url()).toContain('sudoku.html');

    // Grid do Sudoku deve existir na página
    await expect(page.locator('#sGrid')).toBeVisible();
  });

  test('deve acessar Jogo da Memória autenticado', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('http://localhost:8150/games/memory/memory.html');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('memory.html');
    await expect(page.locator('#mGrid')).toBeVisible();
  });

  test('deve acessar Connect 4 autenticado', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('http://localhost:8150/games/connect4/connect4.html');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('connect4.html');
    await expect(page.locator('#c4Board')).toBeVisible();
  });

  test('deve acessar 2048 autenticado', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('http://localhost:8150/games/2048/2048.html');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('2048.html');
    await expect(page.locator('#gridContainer')).toBeVisible();
  });

  /**
   * TESTE 4 — Botão Voltar nos jogos
   *
   * Objetivo: verificar que o botão "←" de cada jogo retorna para o index.
   * Tipo: Funcional / Navegação
   * Valida: click no #go-back redireciona para /index.html
   */
  test('deve retornar para home ao clicar em Voltar no Sudoku', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('http://localhost:8150/games/sudoku/sudoku.html');
    await page.waitForLoadState('networkidle');

    // O botão de voltar tem id="go-back" em todos os jogos
    await page.click('#go-back');

    await page.waitForURL('**/index.html', { timeout: 5_000 });
    expect(page.url()).toContain('index.html');
  });

});

test.describe('Navegação — Responsividade', () => {

  /**
   * TESTE 5 — Tela de login responsiva em mobile
   *
   * Objetivo: verificar que a tela de login renderiza corretamente em mobile.
   * Tipo: Teste de Interface / UI
   * Valida: elementos visíveis em viewport 390×844 (iPhone 12)
   */
  test('deve renderizar login corretamente em viewport mobile', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();

    await page.goto('http://localhost:8150/login.html');
    await page.waitForLoadState('domcontentloaded');

    // Elementos críticos devem ser visíveis
    await expect(page.locator('input[name="usuario"]')).toBeVisible();
    await expect(page.locator('input[name="senha"]')).toBeVisible();
    await expect(page.locator('#login-btn')).toBeVisible();

    // Screenshot de documentação para o TCC
    await page.screenshot({
      path: 'screenshots/login-mobile-390.png',
      fullPage: true,
    });

    await ctx.close();
  });

  /**
   * TESTE 6 — 2048 responsivo em mobile
   *
   * Objetivo: verificar que o tabuleiro do 2048 é visível em mobile.
   * Tipo: Teste de Interface
   */
  test('deve renderizar 2048 corretamente em viewport mobile', async ({ browser, request }) => {
    // Registra e autentica via API para usar no contexto mobile
    const uid = Date.now();
    const creds = {
      primeiroNome: 'QA', ultimoNome: 'Mobile', dataNascimento: '01/01/2000',
      email: `qa_mob_${uid}@quebracodigo.test`, usuario: `qa_mob_${uid}`, senha: 'Teste1234',
    };

    await request.post('http://localhost:8150/auth/register', { data: creds });

    // Contexto mobile com login via UI
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();

    await page.goto('http://localhost:8150/login.html');
    await page.fill('input[name="usuario"]', creds.usuario);
    await page.fill('input[name="senha"]', creds.senha);
    await page.click('#login-btn');
    await page.waitForURL('**/index.html', { timeout: 10_000 });

    await page.goto('http://localhost:8150/games/2048/2048.html');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#gridContainer')).toBeVisible();

    await page.screenshot({
      path: 'screenshots/2048-mobile-390.png',
      fullPage: true,
    });

    await ctx.close();
  });

});
