/**
 * smoke.spec.js — Testes de Regressão e Fluxo Completo
 *
 * Tipo: E2E + Regressão + Fluxo Completo
 *
 * O que é regressão:
 *   Testes que verificam se funcionalidades que antes funcionavam
 *   continuam funcionando após novas alterações no código.
 *   São executados após cada deploy ou mudança significativa.
 *
 * Cobre:
 *   ✓ Fluxo completo: cadastro → home → jogo → logout
 *   ✓ Login → acesso a múltiplos jogos → volta para home
 *   ✓ Formulário reativo após falha de login
 *   ✓ API de pontuação acessível (autenticado)
 *   ✓ Fluxo de jogo básico (Sudoku: novo jogo carrega)
 *
 * Como descrever no TCC:
 *   "Suite de regressão (smoke tests) que executa os fluxos críticos do
 *   sistema de ponta a ponta, sendo executada após cada modificação para
 *   garantir que nenhuma funcionalidade essencial foi quebrada."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';

// ── Testes ────────────────────────────────────────────────────────────────────

test.describe('Regressão — Fluxo Completo @smoke', () => {

  /**
   * TESTE 1 — Fluxo crítico: Cadastro → Home → Jogo → Logout
   *
   * Objetivo: validar o caminho principal do usuário no sistema.
   * Tipo: E2E / Regressão / Fluxo Completo
   * Valida: todos os passos críticos em sequência sem falha
   *
   * Este é o teste mais importante para apresentar no TCC —
   * simula 100% do fluxo real de um usuário novo.
   */
  test('fluxo completo: cadastro → home → jogo → logout @smoke', async ({ page }) => {
    const uid = Date.now();
    const user = {
      primeiroNome:   'Smoke',
      ultimoNome:     'Test',
      email:          `smoke_${uid}@quebracodigo.test`,
      dataNascimento: '12/08/2001',
      usuario:        `smoke_${uid}`,
      senha:          'SmokeTeste123',
    };

    // ── Passo 1: Cadastro ──────────────────────────────────────────
    await page.goto('http://localhost:8150/cadastro.html');
    await page.fill('#first-name',       user.primeiroNome);
    await page.fill('#last-name',        user.ultimoNome);
    await page.fill('#data-nascimento',  user.dataNascimento);
    await page.fill('#email',            user.email);
    await page.fill('#usuario',          user.usuario);
    await page.fill('#senha',            user.senha);
    await page.click('#criarConta-button');

    await page.waitForURL('**/index.html', { timeout: 10_000 });
    expect(page.url()).toContain('index.html');

    // ── Passo 2: Navegar para um jogo ──────────────────────────────
    await page.goto('http://localhost:8150/games/sudoku/sudoku.html');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('sudoku.html');

    // Grid do Sudoku deve estar renderizado
    await expect(page.locator('#sGrid')).toBeVisible();

    // ── Passo 3: Voltar para a home ────────────────────────────────
    await page.click('.go-back');
    await page.waitForURL('**/index.html', { timeout: 5_000 });

    // ── Passo 4: Logout ────────────────────────────────────────────
    await page.request.post('http://localhost:8150/auth/logout');

    // Verifica que a sessão foi encerrada
    const meRes = await page.request.get('http://localhost:8150/auth/me');
    expect(meRes.status()).toBe(401);

    // Screenshot do estado final para documentação
    await page.screenshot({ path: 'screenshots/fluxo-completo-pos-logout.png' });
  });

  /**
   * TESTE 2 — Login e navegação por múltiplos jogos
   *
   * Objetivo: verificar que o usuário consegue acessar todos os jogos
   *   sem perder a sessão entre navegações.
   * Tipo: Regressão / Funcional
   * Valida: persistência da sessão HTTP através de múltiplos carregamentos de página
   */
  test('deve manter sessão ao navegar por múltiplos jogos @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const jogos = [
      { url: '/games/sudoku/sudoku.html',   selector: '#sGrid' },
      { url: '/games/memory/memory.html',   selector: '.memory-grid' },
      { url: '/games/connect4/connect4.html', selector: '.c4-board' },
      { url: '/games/2048/2048.html',       selector: '.grid-container' },
    ];

    for (const jogo of jogos) {
      await page.goto(`http://localhost:8150${jogo.url}`);
      await page.waitForLoadState('networkidle');

      // Não deve ter sido redirecionado para login
      expect(page.url()).not.toContain('login.html');

      // Elemento principal do jogo deve estar visível
      await expect(page.locator(jogo.selector)).toBeVisible();
    }
  });

  /**
   * TESTE 3 — Formulário de login reativo após falha
   *
   * Objetivo: verificar que o formulário continua funcional após erro de login.
   * Tipo: Regressão / UI
   * Valida: ausência de bug onde o botão fica desabilitado após falha
   */
  test('deve permitir nova tentativa de login após falha', async ({ page, testUser }) => {
    // Registra o usuário de teste
    await page.request.post('http://localhost:8150/auth/register', { data: testUser });

    await page.goto('http://localhost:8150/login.html');

    // Primeiro login — FALHA intencional
    await page.fill('input[name="usuario"]', testUser.usuario);
    await page.fill('input[name="senha"]', 'senha_errada');
    await page.click('#login-btn');

    // Aguarda mensagem de erro (o login.html cria #login-error com o texto)
    await page.waitForSelector('#login-error', { timeout: 5_000 });
    await expect(page.locator('#login-error')).not.toBeEmpty();

    // Segundo login — com credenciais corretas
    await page.fill('input[name="usuario"]', testUser.usuario);
    await page.fill('input[name="senha"]', testUser.senha);
    await page.click('#login-btn');

    // Deve logar com sucesso na segunda tentativa
    await page.waitForURL('**/index.html', { timeout: 10_000 });
    expect(page.url()).toContain('index.html');
  });

});

test.describe('Regressão — API REST dos Jogos (smoke fino)', () => {

  /**
   * Smoke alinhado à API atual (/start). Regras detalhadas estão em JUnit.
   */
  test('POST /api/games/sudoku/start deve retornar puzzle válido', async ({ authenticatedPage }) => {
    const response = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/sudoku/start?difficulty=easy'
    );

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data).toHaveProperty('board');
    expect(data).toHaveProperty('given');
    expect(data).toHaveProperty('difficulty', 'easy');
    expect(Array.isArray(data.board)).toBe(true);
    expect(data.board).toHaveLength(81);
  });

  test('POST /api/games/memory/start deve retornar deck válido', async ({ authenticatedPage }) => {
    const response = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/memory/start?cols=4&rows=4'
    );

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data).toHaveProperty('cards');
    expect(data).toHaveProperty('cols', 4);
    expect(data).toHaveProperty('rows', 4);
    expect(data.cards).toHaveLength(16);

    const counts = {};
    for (const card of data.cards) {
      counts[card.pairValue] = (counts[card.pairValue] ?? 0) + 1;
    }
    for (const count of Object.values(counts)) {
      expect(count).toBe(2);
    }
  });

  test('POST /api/games/connect4/start deve retornar estado inicial válido', async ({ authenticatedPage }) => {
    const response = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/connect4/start'
    );

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data).toHaveProperty('board');
    expect(data).toHaveProperty('currentPlayer', 'RED');
    expect(data).toHaveProperty('gameOver', false);
    expect(data.board).toHaveLength(6);
    for (const row of data.board) {
      expect(row).toHaveLength(7);
    }
  });

  test('POST /api/games/memory/score deve calcular pontuação', async ({ authenticatedPage }) => {
    const response = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/memory/score',
      { data: { moves: 8, seconds: 30, totalCards: 16 } }
    );

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.points).toBe(150);
    expect(data.coins).toBe(6);
  });

});
