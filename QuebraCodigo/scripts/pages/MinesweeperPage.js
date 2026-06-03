/**
 * MinesweeperPage — Page Object Model do Minesweeper.
 *
 * Estratégias seguras nos testes:
 *   1. Usar #hintBtn para revelar uma célula GARANTIDAMENTE segura
 *      (o código JS procura a primeira célula sem mina e a revela)
 *   2. O primeiro clique em qualquer célula é sempre seguro
 *      (placeMines exclui a célula clicada)
 *   3. Bandeiras são testadas com right-click (contextmenu)
 */
export class MinesweeperPage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Controles ─────────────────────────────────────────────────
    this.restartBtn      = page.locator('#restartBtn');
    this.hintBtn         = page.locator('#hintBtn');
    this.tryAgainBtn     = page.locator('#tryAgainBtn');
    this.mineCounter     = page.locator('#mineCounter');
    this.timerEl         = page.locator('#timer');
    this.gameMsg         = page.locator('#gameMessage');
    this.msgTitle        = page.locator('#messageTitle');

    // ── Dificuldade ────────────────────────────────────────────────
    this.diffBtns = {
      easy:   page.locator('.difficulty-btn[data-difficulty="easy"]'),
      medium: page.locator('.difficulty-btn[data-difficulty="medium"]'),
      hard:   page.locator('.difficulty-btn[data-difficulty="hard"]'),
    };

    // ── Grid ──────────────────────────────────────────────────────
    this.gridContainer = page.locator('#gridContainer');
    this.allCells      = page.locator('#gridContainer .cell');
    this.revealedCells = page.locator('#gridContainer .cell.revealed');
    this.flaggedCells  = page.locator('#gridContainer .cell.flagged');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/minesweeper/minesweeper.html');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('#gridContainer .cell', { timeout: 8_000 });
  }

  // ── Ações ───────────────────────────────────────────────────────

  async clickDifficulty(level) {
    await this.diffBtns[level].click();
    // Aguarda o grid ser recriado
    await this.page.waitForTimeout(300);
    await this.page.waitForSelector('#gridContainer .cell');
  }

  async clickRestart() {
    await this.restartBtn.click();
    await this.page.waitForTimeout(200);
  }

  async clickHint() {
    await this.hintBtn.click();
    // A dica revela células — aguarda a atualização do DOM
    await this.page.waitForTimeout(200);
  }

  /**
   * Clica em uma célula específica por posição (row, col).
   * O primeiro clique é garantidamente seguro (placeMines exclui essa posição).
   */
  async clickCell(row, col) {
    await this.page.locator(`.cell[data-row="${row}"][data-col="${col}"]`).click();
    await this.page.waitForTimeout(150);
  }

  /**
   * Clique direito em uma célula (coloca/remove bandeira).
   * Playwright usa { button: 'right' }.
   */
  async rightClickCell(row, col) {
    await this.page.locator(`.cell[data-row="${row}"][data-col="${col}"]`)
      .click({ button: 'right' });
    await this.page.waitForTimeout(150);
  }

  // ── Leitura de estado ───────────────────────────────────────────

  /** Retorna o número de minas exibido no contador. */
  async getMineCount() {
    return parseInt(await this.mineCounter.textContent(), 10);
  }

  /** Retorna o tempo exibido. */
  async getTimer() {
    return parseInt(await this.timerEl.textContent(), 10);
  }

  /** Conta células reveladas. */
  async countRevealed() {
    return this.revealedCells.count();
  }

  /** Conta células com bandeira. */
  async countFlagged() {
    return this.flaggedCells.count();
  }

  /** Retorna true se a mensagem de fim de jogo está visível. */
  async isGameMessageVisible() {
    return this.gameMsg.evaluate(el => el.classList.contains('show'));
  }

  /** Retorna o título da mensagem (Game Over! / Você Venceu!). */
  async getMessageTitle() {
    return this.msgTitle.textContent();
  }

  /** Verifica se uma célula específica está revelada. */
  async isCellRevealed(row, col) {
    return this.page.evaluate(({ r, c }) => {
      const el = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      return el ? el.classList.contains('revealed') : false;
    }, { r: row, c: col });
  }

  /** Verifica se uma célula específica tem bandeira. */
  async isCellFlagged(row, col) {
    return this.page.evaluate(({ r, c }) => {
      const el = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      return el ? el.classList.contains('flagged') : false;
    }, { r: row, c: col });
  }
}
