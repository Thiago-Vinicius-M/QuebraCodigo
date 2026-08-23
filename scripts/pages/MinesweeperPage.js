/**
 * MinesweeperPage — Page Object Model do Minesweeper.
 *
 * Frontend atual (React client-side):
 *   - Grid:   .grid-container (células .cell em ordem row-major; SEM data-row/col)
 *   - Dificuldade: botões .difficulty-btn na ordem [easy, medium, hard]
 *   - Reiniciar/Dica: botões .btn ("Reiniciar" / "Dica")
 *   - HUD: <span>💣 N</span> e <span>⏱ Ns</span> em .controls
 *   - Fim de jogo: .game-message.show (título em .message-title)
 *
 * Como as células não têm data-row/col, calculamos o índice pela ordem:
 *   índice = row * cols + col, com cols = √(total de células) (grids quadrados).
 */
export class MinesweeperPage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Controles ─────────────────────────────────────────────────
    this.restartBtn = page.locator('.game-header .controls .btn', { hasText: 'Reiniciar' });
    this.hintBtn    = page.locator('.game-header .controls .btn', { hasText: 'Dica' });
    this.mineSpan   = page.locator('.game-header .controls span').nth(0);
    this.timerSpan  = page.locator('.game-header .controls span').nth(1);
    this.gameMsg    = page.locator('.game-message');
    this.msgTitle   = page.locator('.message-title');

    // ── Dificuldade (ordem: easy, medium, hard) ────────────────────
    this.diffIndex = { easy: 0, medium: 1, hard: 2 };

    // ── Grid ──────────────────────────────────────────────────────
    this.gridContainer = page.locator('.grid-container');
    this.allCells      = page.locator('.grid-container .cell');
    this.revealedCells = page.locator('.grid-container .cell.revealed');
    this.flaggedCells  = page.locator('.grid-container .cell.flagged');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/minesweeper/minesweeper.html');
    await this.page.waitForSelector('.grid-container .cell', { timeout: 20_000 });
  }

  // ── Helpers internos ─────────────────────────────────────────────

  /** Número de colunas do grid atual (grids são quadrados). */
  async _cols() {
    const total = await this.allCells.count();
    return Math.round(Math.sqrt(total));
  }

  /** Localizador da célula (row, col) pela ordem row-major. */
  async _cell(row, col) {
    const cols = await this._cols();
    const idx = row * cols + col;
    return this.page.locator(`.grid-container .cell:nth-child(${idx + 1})`);
  }

  // ── Ações ───────────────────────────────────────────────────────

  async clickDifficulty(level) {
    await this.page.locator('.difficulty-btn').nth(this.diffIndex[level]).click();
    await this.page.waitForTimeout(300);
    await this.page.waitForSelector('.grid-container .cell');
  }

  async clickRestart() {
    await this.restartBtn.click();
    await this.page.waitForTimeout(200);
  }

  async clickHint() {
    await this.hintBtn.click();
    await this.page.waitForTimeout(200);
  }

  /** Clica em uma célula (row, col). O primeiro clique é sempre seguro. */
  async clickCell(row, col) {
    const cell = await this._cell(row, col);
    await cell.click();
    await this.page.waitForTimeout(150);
  }

  /** Clique direito (coloca/remove bandeira). */
  async rightClickCell(row, col) {
    const cell = await this._cell(row, col);
    await cell.click({ button: 'right' });
    await this.page.waitForTimeout(150);
  }

  // ── Leitura de estado ───────────────────────────────────────────

  /** Extrai o número de um texto tipo "💣 10" / "⏱ 3s". */
  _digits(text) {
    const m = (text || '').replace(/[^\d]/g, '');
    return m === '' ? 0 : parseInt(m, 10);
  }

  async getMineCount() {
    return this._digits(await this.mineSpan.textContent());
  }

  async getTimer() {
    return this._digits(await this.timerSpan.textContent());
  }

  async countRevealed() {
    return this.revealedCells.count();
  }

  async countFlagged() {
    return this.flaggedCells.count();
  }

  /** true se a mensagem de fim de jogo (.game-message.show) está presente. */
  async isGameMessageVisible() {
    return (await this.gameMsg.count()) > 0;
  }

  async getMessageTitle() {
    return this.msgTitle.textContent();
  }

  async isCellRevealed(row, col) {
    const cell = await this._cell(row, col);
    return (await cell.getAttribute('class') || '').includes('revealed');
  }

  async isCellFlagged(row, col) {
    const cell = await this._cell(row, col);
    return (await cell.getAttribute('class') || '').includes('flagged');
  }
}
