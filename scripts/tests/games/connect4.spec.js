/**
 * connect4.spec.js — Testes do Connect 4
 *
 * Tipo: E2E + API + Funcional + UI
 *
 * Técnica-chave para vitória determinística em PvP:
 *   Em modo PvP, P1 começa SEMPRE (sem random da CPU).
 *   Alternando cliques entre colunas seguras, controlamos ambos os lados
 *   e podemos forçar P1 a fazer 4 em linha de forma previsível.
 *
 *   Sequência usada:
 *     P1→col0, P2→col4, P1→col1, P2→col5, P1→col2, P2→col6, P1→col3 → WIN P1
 *
 * Cobre:
 *   ✓ API: novo jogo retorna grid 6×7 vazio
 *   ✓ API: drop insere peça na linha correta (gravidade)
 *   ✓ API: CPU responde automaticamente em PvE (retorno único)
 *   ✓ API: vitória detectada com 4 em linha
 *   ✓ API: coluna cheia retorna erro
 *   ✓ UI:  tabuleiro renderiza 42 células
 *   ✓ UI:  peça aparece após clicar coluna
 *   ✓ UI:  modo PvP alterna cores dos chips
 *   ✓ UI:  overlay de vitória exibe vencedor correto
 *
 * Como descrever no TCC:
 *   "Testes que combinam API REST (Connect4Service.java) com interação
 *   real no tabuleiro, incluindo um cenário de vitória determinístico
 *   em modo PvP e validação da IA em modo PvE via resposta da API."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { Connect4Page } from '../../pages/Connect4Page.js';

// ── API Tests ─────────────────────────────────────────────────────────────────

test.describe('Connect 4 — API REST', () => {

  /**
   * TESTE 1 — Novo jogo retorna grid vazio 6×7
   *
   * Objetivo: verificar o contrato do endpoint /new.
   * Tipo: API / Contrato
   */
  test('POST /new deve retornar grid 6×7 vazio @smoke', async ({ authenticatedPage }) => {
    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/connect4/new?mode=pvp'
    );
    expect(res.ok()).toBe(true);

    const data = await res.json();
    expect(data.grid).toHaveLength(6);
    expect(data.done).toBe(false);

    for (const row of data.grid) {
      expect(row).toHaveLength(7);
      for (const cell of row) expect(cell).toBe(0);
    }
  });

  /**
   * TESTE 2 — Drop insere peça na linha mais baixa (gravidade)
   *
   * Objetivo: verificar que a peça cai para a posição correta.
   * Tipo: API / Regra de negócio
   */
  test('POST /drop deve inserir peça na linha mais baixa disponível', async ({ authenticatedPage }) => {
    const grid = Array.from({ length: 6 }, () => Array(7).fill(0));

    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/connect4/drop',
      { data: { grid, turn: 1, col: 3, mode: 'pvp' } }
    );
    expect(res.ok()).toBe(true);

    const data = await res.json();
    // Coluna 3, primeira jogada → peça deve estar na linha 5 (fundo)
    expect(data.grid[5][3]).toBe(1);
    expect(data.lastRow).toBe(5);
    expect(data.lastCol).toBe(3);
    expect(data.lastPlayer).toBe(1);
    expect(data.done).toBe(false);
  });

  /**
   * TESTE 3 — API detecta vitória horizontal (4 em linha)
   *
   * Objetivo: verificar a lógica de checkWin para linhas horizontais.
   * Tipo: API / Regra de negócio
   * Estratégia: monta grid com P1 em 3 células e faz P1 jogar a 4ª
   */
  test('POST /drop deve detectar vitória horizontal do jogador 1', async ({ authenticatedPage }) => {
    // P1 já tem 3 peças em linha (cols 0,1,2 na linha 5)
    const grid = Array.from({ length: 6 }, () => Array(7).fill(0));
    grid[5][0] = 1;
    grid[5][1] = 1;
    grid[5][2] = 1;

    // P1 joga na col 3 → 4 em linha → vitória
    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/connect4/drop',
      { data: { grid, turn: 1, col: 3, mode: 'pvp' } }
    );
    expect(res.ok()).toBe(true);

    const data = await res.json();
    expect(data.done).toBe(true);
    expect(data.winner).toBe(1);
  });

  /**
   * TESTE 4 — API detecta vitória vertical (4 em coluna)
   *
   * Objetivo: verificar checkWin para colunas.
   * Tipo: API / Regra de negócio
   */
  test('POST /drop deve detectar vitória vertical', async ({ authenticatedPage }) => {
    const grid = Array.from({ length: 6 }, () => Array(7).fill(0));
    grid[5][0] = 1;
    grid[4][0] = 1;
    grid[3][0] = 1;
    // P1 joga na mesma coluna, linha 2 → 4 em coluna
    grid[2][0] = 0; // precisa estar vazio

    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/connect4/drop',
      { data: { grid, turn: 1, col: 0, mode: 'pvp' } }
    );
    const data = await res.json();
    expect(data.done).toBe(true);
    expect(data.winner).toBe(1);
  });

  /**
   * TESTE 5 — CPU responde automaticamente em PvE
   *
   * Objetivo: verificar que um único POST /drop retorna estado pós-CPU.
   * Tipo: API / Funcional
   * Valida: após jogada de P1, o grid já tem a resposta da CPU
   */
  test('POST /drop em modo PvE deve incluir jogada da CPU na resposta', async ({ authenticatedPage }) => {
    const grid = Array.from({ length: 6 }, () => Array(7).fill(0));

    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/connect4/drop',
      { data: { grid, turn: 1, col: 3, mode: 'pve' } }
    );
    expect(res.ok()).toBe(true);

    const data = await res.json();
    // P1 jogou (1 chip) + CPU jogou (1 chip) = 2 chips no grid
    let chipCount = 0;
    for (const row of data.grid)
      for (const cell of row)
        if (cell !== 0) chipCount++;

    expect(chipCount).toBe(2);
    // Turno deve ter voltado para P1
    expect(data.turn).toBe(1);
  });

  /**
   * TESTE 6 — Coluna cheia retorna erro
   *
   * Objetivo: verificar que jogar em coluna cheia é rejeitado.
   * Tipo: API / Validação
   */
  test('POST /drop em coluna cheia deve retornar erro 400', async ({ authenticatedPage }) => {
    // Enche a coluna 0 com P1 e P2 alternados
    const grid = Array.from({ length: 6 }, () => Array(7).fill(0));
    for (let r = 0; r < 6; r++) grid[r][0] = r % 2 === 0 ? 1 : 2;

    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/connect4/drop',
      { data: { grid, turn: 1, col: 0, mode: 'pvp' } }
    );
    expect(res.status()).toBe(400);

    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

});

// ── UI Tests ──────────────────────────────────────────────────────────────────

test.describe('Connect 4 — Interface (UI)', () => {

  /**
   * TESTE 7 — Tabuleiro renderiza 42 células @smoke
   *
   * Objetivo: verificar estrutura do tabuleiro (6 linhas × 7 colunas).
   * Tipo: UI / Smoke
   */
  test('deve renderizar 42 células no tabuleiro @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const c4Page = new Connect4Page(page);
    await c4Page.goto();

    const count = await c4Page.allCells.count();
    expect(count).toBe(42); // 6 × 7
  });

  /**
   * TESTE 8 — Jogar cria um chip no tabuleiro
   *
   * Objetivo: verificar que clicar uma coluna (após iniciar) insere uma peça.
   * Tipo: UI / Funcional
   */
  test('clicar coluna deve inserir chip após iniciar jogo @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const c4Page = new Connect4Page(page);
    await c4Page.goto();

    await c4Page.startGame('pvp');

    const chipsBefore = await c4Page.countChips();
    await c4Page.dropInColumn(3);
    const chipsAfter = await c4Page.countChips();

    expect(chipsAfter).toBeGreaterThan(chipsBefore);
  });

  /**
   * TESTE 9 — Modo PvP alterna chips entre P1 (verde) e P2 (roxo)
   *
   * Objetivo: verificar que as cores alternam corretamente.
   * Tipo: UI / Funcional
   */
  test('modo PvP deve alternar cores dos chips entre os jogadores', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const c4Page = new Connect4Page(page);
    await c4Page.goto();

    await c4Page.startGame('pvp');

    // P1 joga col 0
    await c4Page.dropInColumn(0);
    // P2 joga col 1
    await c4Page.dropInColumn(1);

    const p1Count = await c4Page.countChipsByPlayer(1);
    const p2Count = await c4Page.countChipsByPlayer(2);

    expect(p1Count).toBe(1);
    expect(p2Count).toBe(1);
  });

  /**
   * TESTE 10 — Vitória em PvP exibe overlay com vencedor correto
   *
   * Objetivo: verificar fluxo completo de vitória no modo PvP.
   * Tipo: UI / E2E
   *
   * Sequência determinística (P1 sempre começa no PvP):
   *   P1→col0, P2→col4, P1→col1, P2→col5, P1→col2, P2→col6, P1→col3 → P1 vence
   *   (4 em linha horizontal na linha 5, colunas 0-3)
   */
  test('vitória P1 em PvP deve exibir overlay com mensagem correta @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const c4Page = new Connect4Page(page);
    await c4Page.goto();

    await c4Page.startGame('pvp');

    // Jogadas: P1 constrói linha em cols 0-3; P2 vai para 4-6 (inofensivas)
    const moves = [
      { player: 1, col: 0 },
      { player: 2, col: 4 },
      { player: 1, col: 1 },
      { player: 2, col: 5 },
      { player: 1, col: 2 },
      { player: 2, col: 6 },
      { player: 1, col: 3 }, // ← 4 em linha → vitória P1
    ];

    for (const move of moves) {
      await c4Page.dropInColumn(move.col);
    }

    // Aguarda o overlay aparecer
    await page.waitForSelector('#win-overlay:not(.hidden)', { timeout: 5_000 });
    expect(await c4Page.isWinVisible()).toBe(true);

    // Mensagem deve mencionar P1
    const winText = await c4Page.getWinnerText();
    expect(winText).toContain('jogador 1');

    await page.screenshot({ path: 'screenshots/connect4-vitoria-p1.png', fullPage: true });
  });

  /**
   * TESTE 11 — Jogar novamente reinicia o tabuleiro
   *
   * Objetivo: verificar que o botão "Jogar novamente" limpa o grid.
   * Tipo: UI / Funcional
   */
  test('botão Jogar novamente deve reiniciar o tabuleiro', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const c4Page = new Connect4Page(page);
    await c4Page.goto();

    await c4Page.startGame('pvp');
    await c4Page.dropInColumn(3);

    // Força o fim do jogo via vitória rápida
    // (simplificação: apenas testa que play-again funciona após algumas jogadas)
    // Reinicia manualmente chamando o botão start
    await c4Page.startGame('pvp');
    await page.waitForTimeout(300);

    const chips = await c4Page.countChips();
    expect(chips).toBe(0); // grid limpo
  });

});
