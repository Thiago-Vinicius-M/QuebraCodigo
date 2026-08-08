/**
 * SudokuPage — Page Object Model do jogo Sudoku.
 *
 * Frontend atual (React client-side):
 *   - Grid:   #sGrid (81 .sudoku-cell, cada uma com <input>)
 *   - Botões: #sNew, #sSolve, #sClear
 *   - Dificuldade: <select> dentro do label em .controls (sem id)
 *   - Mensagem: #sMsg
 *   - Overlay de vitória: .win-overlay (aparece só quando completo)
 */
export class SudokuPage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Controles ─────────────────────────────────────────────────
    this.newGameBtn  = page.locator('#sNew');
    this.solveBtn    = page.locator('#sSolve');
    this.clearBtn    = page.locator('#sClear');
    this.diffSelect  = page.locator('.game-header .controls select');
    this.msgEl       = page.locator('#sMsg');
    this.winOverlay  = page.locator('.win-overlay');
    this.winNewGame  = page.locator('.win-overlay .win-content button');

    // ── Grid ──────────────────────────────────────────────────────
    this.grid         = page.locator('#sGrid');
    this.allCells     = page.locator('#sGrid .sudoku-cell');
    this.allInputs    = page.locator('#sGrid .sudoku-cell input');
    this.fixedCells   = page.locator('#sGrid .sudoku-cell input.fixed');
    this.invalidCells = page.locator('#sGrid .sudoku-cell.invalid');
    this.correctCells = page.locator('#sGrid .sudoku-cell.correct');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/sudoku/sudoku.html');
    await this.page.waitForSelector('#sGrid .sudoku-cell', { timeout: 20_000 });
  }

  // ── Ações ───────────────────────────────────────────────────────

  async clickNewGame()    { await this.newGameBtn.click(); }
  async clickSolve()      { await this.solveBtn.click(); }
  async clickClear()      { await this.clearBtn.click(); }
  async setDifficulty(v)  { await this.diffSelect.selectOption(v); }

  /** Retorna o input de uma célula específica (índice 0-80). */
  inputAt(index) {
    return this.page.locator(`#sGrid .sudoku-cell:nth-child(${index + 1}) input`);
  }

  /** Digita um valor em uma célula não-fixa. */
  async typeInCell(index, value) {
    const input = this.inputAt(index);
    await input.click();
    await input.fill(String(value));
  }

  // ── Leitura de estado ───────────────────────────────────────────

  /** Retorna o board atual como int[81] lendo os inputs do DOM. */
  async readBoard() {
    return this.page.evaluate(() => {
      return [...document.querySelectorAll('#sGrid .sudoku-cell input')]
        .map(inp => parseInt(inp.value || '0') || 0);
    });
  }

  /** Conta células não-fixas ainda vazias. */
  async countEmptyCells() {
    return this.page.evaluate(() => {
      return [...document.querySelectorAll('#sGrid .sudoku-cell input')]
        .filter(inp => !inp.readOnly && inp.value === '').length;
    });
  }

  /** Conta células com a classe dada. */
  async countCellsWithClass(cls) {
    return this.page.evaluate((c) => {
      return document.querySelectorAll(`#sGrid .sudoku-cell.${c}`).length;
    }, cls);
  }

  // ── Assertion helpers ───────────────────────────────────────────

  /** Aguarda até o overlay de vitória ser visível. */
  async waitForWin() {
    await this.winOverlay.waitFor({ state: 'visible', timeout: 12_000 });
  }

  /** true se o overlay de vitória está oculto (ausente do DOM). */
  async isWinHidden() {
    return (await this.winOverlay.count()) === 0;
  }
}
