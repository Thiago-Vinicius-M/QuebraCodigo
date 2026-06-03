/**
 * logout.spec.js — Testes de Logout e proteção de sessão
 *
 * Tipo: E2E + Segurança + Regressão
 *
 * Cobre:
 *   ✓ Logout invalida a sessão no servidor
 *   ✓ Após logout, GET /auth/me retorna 401
 *   ✓ Acesso a página protegida após logout redireciona para login
 *   ✓ Sessão não persiste entre contextos de browser
 *
 * Como descrever no TCC:
 *   "Testes de segurança que verificam o encerramento correto de sessão,
 *   garantindo que usuários deslogados não consigam acessar rotas protegidas —
 *   validando o comportamento do auth-guard.js integrado ao backend."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';

test.describe('Logout — Invalidação de Sessão', () => {

  /**
   * TESTE 1 — Logout via API invalida sessão @smoke
   *
   * Objetivo: verificar que POST /auth/logout realmente destrói a sessão HTTP.
   * Tipo: E2E / Segurança
   * Valida:
   *   - Logout retorna { ok: true }
   *   - Chamada subsequente a /auth/me retorna 401 (não autenticado)
   */
  test('deve invalidar a sessão após logout @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Confirma que está autenticado antes do logout
    const meBefore = await page.request.get('http://localhost:8150/auth/me');
    expect(meBefore.ok()).toBe(true);

    // Executa o logout via API (mesmo endpoint chamado pelo Auth.logout() do frontend)
    const logoutRes = await page.request.post('http://localhost:8150/auth/logout');
    expect(logoutRes.ok()).toBe(true);

    const logoutBody = await logoutRes.json();
    expect(logoutBody).toHaveProperty('ok', true);

    // Verifica que a sessão foi invalidada — /auth/me deve retornar 401
    const meAfter = await page.request.get('http://localhost:8150/auth/me');
    expect(meAfter.status()).toBe(401);
  });

  /**
   * TESTE 2 — Acesso a página protegida após logout redireciona para login
   *
   * Objetivo: verificar que o auth-guard.js bloqueia acesso após logout.
   * Tipo: E2E / Regressão / Segurança
   * Valida:
   *   - auth-guard chama /auth/me
   *   - Com sessão inválida, redireciona para /login.html
   *   - Usuário não consegue acessar a home sem nova autenticação
   */
  test('deve redirecionar para login ao acessar home após logout', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Executa logout
    await page.request.post('http://localhost:8150/auth/logout');

    // Tenta acessar página protegida
    await page.goto('http://localhost:8150/index.html');

    // auth-guard.js detecta 401 e redireciona para login.html
    await page.waitForURL('**/login.html', { timeout: 8_000 });
    expect(page.url()).toContain('login.html');
  });

  /**
   * TESTE 3 — Acesso a jogos após logout também redireciona
   *
   * Objetivo: verificar que páginas de jogos também são protegidas.
   * Tipo: Regressão / Segurança
   * Valida: qualquer página com auth-guard.js bloqueia após logout
   */
  test('deve redirecionar para login ao acessar jogo após logout', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.request.post('http://localhost:8150/auth/logout');

    // Tentativa de acesso direto ao Sudoku
    await page.goto('http://localhost:8150/games/sudoku/sudoku.html');

    await page.waitForURL('**/login.html', { timeout: 8_000 });
    expect(page.url()).toContain('login.html');
  });

  /**
   * TESTE 4 — Novo contexto de browser não herda sessão
   *
   * Objetivo: verificar que a sessão é exclusiva do contexto (aba) atual.
   * Tipo: Segurança / Isolamento de sessão
   * Valida: cookies de sessão não são compartilhados entre contextos isolados
   *
   * Nota para o TCC: Playwright cria contextos isolados por padrão,
   *   simulando usuários diferentes abrindo o sistema simultaneamente.
   */
  test('novo contexto de browser não deve ter acesso autenticado', async ({ browser }) => {
    // Cria um contexto limpo sem cookies de sessão
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();

    // Tenta acessar página protegida sem autenticação
    await freshPage.goto('http://localhost:8150/index.html');

    // auth-guard.js deve redirecionar para login
    await freshPage.waitForURL('**/login.html', { timeout: 8_000 });
    expect(freshPage.url()).toContain('login.html');

    await freshContext.close();
  });

});
