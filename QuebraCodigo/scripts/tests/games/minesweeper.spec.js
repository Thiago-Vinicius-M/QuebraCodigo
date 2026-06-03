/**
 * minesweeper.spec.js — Testes do Minesweeper
 *
 * Tipo: E2E + UI + Funcional
 *
 * ESTRATÉGIAS SEGURAS USADAS:
 *   1. #hintBtn revela uma célula GARANTIDAMENTE segura (procura !isMine && !isRevealed)
 *   2. Primeiro clique em qualquer célula é sempre seguro
 *      (placeMines() exclui a célula clicada - linha 105 do minesweeper.js)
 *   3. Bandeiras via right-click (.contextmenu) são testadas em células
 *      não-reveladas — não dependem de conhecer posição das minas
 *
 * LIMITAÇÃO DOCUMENTADA:
 *   Game Over (pisar em mina) não é testável deterministicamente — as minas
 *   são posicionadas aleatoriamente após o primeiro clique. Seria necessário
 *   expor a instância do jogo em window para injetar estado.
 *
 * Cobre:
 *   ✓ Grid fácil tem 64 células (8×8)
 *   ✓ Grid médio tem 196 células (14×14)
 *   ✓ Grid difícil tem 400 células (20×20)
 *   ✓ Primeiro clique nunca explode (garantia do código)
 *   ✓ Primeiro clique revela ao menos 1 célula
 *   ✓ Timer inicia após primeiro clique
 *   ✓ Botão Dica revela célula segura
 *   ✓ Right-click coloca bandeira na célula
 *   ✓ Right-click duplo remove a bandeira
 *   ✓ Contador de minas decrementa ao colocar bandeira
 *   ✓ Troca de dificuldade recria o grid corretamente
 *   ✓ Reiniciar reseta timer e grid
 *
 * Como descrever no TCC:
 *   "Testes de interface do Minesweeper que exploram garantias do próprio
 *   código (primeiro clique seguro, botão dica) para criar cenários
 *   previsíveis sem depender da posição aleatória das minas, demonstrando
 *   a técnica de testar invariantes do sistema."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { MinesweeperPage } from '../../pages/MinesweeperPage.js';

// ── Estrutura do Grid ──────────────────────────────────────────────────────────

test.describe('Minesweeper — Estrutura do Grid', () => {

  /**
   * TESTE 1 — Grid fácil tem 64 células (8×8) @smoke
   *
   * Objetivo: verificar que a dificuldade "easy" cria o grid correto.
   * Tipo: UI / Smoke
   */
  test('dificuldade Fácil deve renderizar 64 células (8×8) @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    const count = await msPage.allCells.count();
    expect(count).toBe(64); // 8 × 8
  });

  /**
   * TESTE 2 — Grid médio tem 196 células (14×14)
   *
   * Objetivo: verificar mudança de dificuldade para medium.
   * Tipo: UI / Funcional
   */
  test('dificuldade Médio deve renderizar 196 células (14×14)', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    await msPage.clickDifficulty('medium');

    const count = await msPage.allCells.count();
    expect(count).toBe(196); // 14 × 14
  });

  /**
   * TESTE 3 — Grid difícil tem 400 células (20×20)
   *
   * Objetivo: verificar mudança de dificuldade para hard.
   * Tipo: UI / Funcional
   */
  test('dificuldade Difícil deve renderizar 400 células (20×20)', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    await msPage.clickDifficulty('hard');

    const count = await msPage.allCells.count();
    expect(count).toBe(400); // 20 × 20
  });

  /**
   * TESTE 4 — Contador de minas correto por dificuldade
   *
   * Objetivo: verificar que o contador exibe o número configurado.
   * Tipo: UI / Funcional
   */
  test('contador deve exibir o número correto de minas por dificuldade', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    const easyMines = await msPage.getMineCount();
    expect(easyMines).toBe(10);

    await msPage.clickDifficulty('medium');
    const mediumMines = await msPage.getMineCount();
    expect(mediumMines).toBe(30);

    await msPage.clickDifficulty('hard');
    const hardMines = await msPage.getMineCount();
    expect(hardMines).toBe(80);
  });

});

// ── Primeiro Clique Seguro ─────────────────────────────────────────────────────

test.describe('Minesweeper — Garantia do Primeiro Clique', () => {

  /**
   * TESTE 5 — Primeiro clique nunca explode @smoke
   *
   * Objetivo: verificar a invariante de segurança do jogo.
   * Tipo: UI / Funcional / Smoke
   *
   * Base no código: placeMines(excludeRow, excludeCol) não coloca mina
   * onde o jogador clicou. Testamos 5 posições diferentes para maior cobertura.
   */
  test('primeiro clique nunca deve causar game over @smoke', async ({ authenticatedPage }) => {
    const testPositions = [
      { row: 0, col: 0 }, { row: 7, col: 7 }, { row: 3, col: 4 },
      { row: 0, col: 7 }, { row: 4, col: 0 },
    ];

    for (const pos of testPositions) {
      const page = authenticatedPage;
      const msPage = new MinesweeperPage(page);
      await msPage.goto();

      await msPage.clickCell(pos.row, pos.col);

      // Jogo não deve ter terminado com game over
      const gameOver = await msPage.isGameMessageVisible();
      expect(gameOver, `pos ${pos.row},${pos.col} não deve causar game over`).toBe(false);

      // Célula clicada deve estar revelada
      const isRevealed = await msPage.isCellRevealed(pos.row, pos.col);
      expect(isRevealed, `pos ${pos.row},${pos.col} deve estar revelada`).toBe(true);

      // Reinicia para próxima iteração
      await msPage.clickRestart();
    }
  });

  /**
   * TESTE 6 — Primeiro clique revela ao menos 1 célula
   *
   * Objetivo: verificar que a célula clicada muda de estado.
   * Tipo: UI / Funcional
   */
  test('primeiro clique deve revelar ao menos 1 célula', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    const beforeCount = await msPage.countRevealed();
    expect(beforeCount).toBe(0); // nenhuma revelada antes do primeiro clique

    await msPage.clickCell(3, 3);

    const afterCount = await msPage.countRevealed();
    expect(afterCount).toBeGreaterThan(0); // pelo menos 1 revelada
  });

  /**
   * TESTE 7 — Timer inicia após primeiro clique
   *
   * Objetivo: verificar que o timer inicia com o jogo (não antes).
   * Tipo: UI / Funcional
   */
  test('timer deve iniciar após o primeiro clique', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    const timerBefore = await msPage.getTimer();
    expect(timerBefore).toBe(0);

    await msPage.clickCell(0, 0);

    // Aguarda 1.1 segundo para o timer incrementar
    await page.waitForTimeout(1_100);

    const timerAfter = await msPage.getTimer();
    expect(timerAfter).toBeGreaterThan(0);
  });

});

// ── Bandeiras ─────────────────────────────────────────────────────────────────

test.describe('Minesweeper — Sistema de Bandeiras', () => {

  /**
   * TESTE 8 — Right-click coloca bandeira
   *
   * Objetivo: verificar que clique direito marca uma célula com 🚩.
   * Tipo: UI / Funcional
   */
  test('right-click deve colocar bandeira na célula @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    const flagsBefore = await msPage.countFlagged();
    expect(flagsBefore).toBe(0);

    // Right-click em célula não-revelada (posição 0,0 — seguro antes do 1º clique)
    await msPage.rightClickCell(0, 0);

    const flagsAfter = await msPage.countFlagged();
    expect(flagsAfter).toBe(1);

    const isFlagged = await msPage.isCellFlagged(0, 0);
    expect(isFlagged).toBe(true);
  });

  /**
   * TESTE 9 — Segundo right-click remove a bandeira
   *
   * Objetivo: verificar o toggle de bandeira (flag/unflag).
   * Tipo: UI / Funcional
   */
  test('dois right-clicks devem colocar e depois remover a bandeira', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    // Coloca bandeira
    await msPage.rightClickCell(2, 2);
    expect(await msPage.isCellFlagged(2, 2)).toBe(true);

    // Remove bandeira
    await msPage.rightClickCell(2, 2);
    expect(await msPage.isCellFlagged(2, 2)).toBe(false);
  });

  /**
   * TESTE 10 — Contador de minas decrementa ao colocar bandeira
   *
   * Objetivo: verificar que o HUD é atualizado corretamente.
   * Tipo: UI / Funcional
   */
  test('contador de minas deve decrementar ao colocar bandeira', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    const mineBefore = await msPage.getMineCount();
    expect(mineBefore).toBe(10);

    await msPage.rightClickCell(1, 1);

    const mineAfter = await msPage.getMineCount();
    expect(mineAfter).toBe(9);
  });

  /**
   * TESTE 11 — Contador volta ao normal ao remover bandeira
   *
   * Objetivo: verificar que remover bandeira incrementa o contador.
   * Tipo: UI / Funcional / Regressão
   */
  test('contador deve incrementar ao remover bandeira', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    await msPage.rightClickCell(1, 1); // coloca
    expect(await msPage.getMineCount()).toBe(9);

    await msPage.rightClickCell(1, 1); // remove
    expect(await msPage.getMineCount()).toBe(10);
  });

});

// ── Controles ─────────────────────────────────────────────────────────────────

test.describe('Minesweeper — Controles', () => {

  /**
   * TESTE 12 — Botão Dica revela célula segura
   *
   * Objetivo: verificar que #hintBtn funciona sem causar game over.
   * Tipo: UI / Funcional
   *
   * O código de giveHint() procura !isRevealed && !isMine && !isFlagged,
   * garantindo que nunca revela uma mina.
   */
  test('botão Dica deve revelar uma célula segura antes do primeiro clique', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    // Clica em uma célula para gerar as minas primeiro
    await msPage.clickCell(4, 4);
    await page.waitForTimeout(200);

    const revealedBefore = await msPage.countRevealed();

    // Usa a dica
    await msPage.clickHint();

    const revealedAfter = await msPage.countRevealed();
    expect(revealedAfter).toBeGreaterThan(revealedBefore);

    // Não deve ter gerado game over
    const gameOver = await msPage.isGameMessageVisible();
    expect(gameOver).toBe(false);
  });

  /**
   * TESTE 13 — Reiniciar zera timer e grid @smoke
   *
   * Objetivo: verificar que restart() reseta completamente o estado.
   * Tipo: UI / Funcional / Smoke
   */
  test('reiniciar deve zerar timer e remover células reveladas @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    // Joga um pouco
    await msPage.clickCell(0, 0);
    await page.waitForTimeout(1_200);

    const timerDuring = await msPage.getTimer();
    expect(timerDuring).toBeGreaterThan(0);

    // Reinicia
    await msPage.clickRestart();

    const timerAfter = await msPage.getTimer();
    const revealedAfter = await msPage.countRevealed();

    expect(timerAfter).toBe(0);
    expect(revealedAfter).toBe(0);
  });

  /**
   * TESTE 14 — Screenshot do estado de jogo com bandeiras
   *
   * Objetivo: documentar visualmente o estado com bandeiras para o TCC.
   * Tipo: UI / Documentação
   */
  test('deve capturar screenshot com bandeiras colocadas', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const msPage = new MinesweeperPage(page);
    await msPage.goto();

    // Coloca 3 bandeiras e clica uma célula segura
    await msPage.rightClickCell(0, 0);
    await msPage.rightClickCell(0, 7);
    await msPage.rightClickCell(7, 0);
    await msPage.clickCell(3, 3);

    await page.screenshot({ path: 'screenshots/minesweeper-bandeiras.png', fullPage: true });
  });

});
