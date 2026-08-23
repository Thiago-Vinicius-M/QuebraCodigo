/**
 * Connect4Page — Page Object Model do Connect 4.
 *
 * Frontend atual (React client-side):
 *   - Tabuleiro: .c4-board  (42 botões .c4-cell — 6 linhas × 7 colunas)
 *   - Peça:      .chip (cor via style.background = CHIP_COLORS[jogador])
 *   - Overlay de vitória: .win-overlay (aparece só quando há vencedor)
 *   Como o backend/lógica aplica gravidade, clicar qualquer célula de uma
 *   coluna equivale a jogar naquela coluna — usamos a célula do topo (row 0).
 */
export class Connect4Page {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.ROWS = 6;
    this.COLS = 7;

    // ── Controles ─────────────────────────────────────────────────
    this.startBtn   = page.locator('#c4Start');
    this.modeSelect = page.locator('.game-header .controls select');
    this.turnEl     = page.locator('.game-header .controls span', { hasText: 'Vez' }).locator('strong');
    this.winnerEl   = page.locator('.game-header .controls span', { hasText: 'Vencedor' }).locator('strong');
    this.winOverlay = page.locator('.win-overlay');
    this.playAgain  = page.locator('#play-again');

    // ── Tabuleiro ─────────────────────────────────────────────────
    this.board    = page.locator('.c4-board');
    this.allCells = page.locator('.c4-board .c4-cell');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/connect4/connect4.html');
    await this.page.waitForSelector('.c4-board .c4-cell', { timeout: 20_000 });
  }

  // ── Ações ───────────────────────────────────────────────────────

  async startGame(mode = 'pvp') {
    await this.modeSelect.selectOption(mode);
    await this.startBtn.click();
    await this.page.waitForTimeout(250);
  }

  /**
   * Clica na coluna indicada (0-6).
   * Usa a célula do topo da coluna (row 0) — a gravidade posiciona a peça.
   */
  async dropInColumn(col) {
    const cellIndex = 0 * this.COLS + col; // topo da coluna
    await this.page.locator(`.c4-board .c4-cell:nth-child(${cellIndex + 1})`).click();
    await this.page.waitForTimeout(350);
  }

  async clickPlayAgain() {
    await this.playAgain.click();
    await this.page.waitForTimeout(300);
  }

  // ── Leitura de estado via DOM ────────────────────────────────────

  /** Conta quantas peças (chips) existem no tabuleiro. */
  async countChips() {
    return this.page.locator('.c4-board .chip').count();
  }

  /** Conta peças de um jogador específico pela cor (CHIP_COLORS). */
  async countChipsByPlayer(player) {
    const color = player === 1 ? 'rgb(0, 102, 102)' : 'rgb(102, 0, 102)';
    return this.page.evaluate((targetColor) => {
      return [...document.querySelectorAll('.c4-board .chip')]
        .filter(chip => chip.style.background === targetColor).length;
    }, color);
  }

  /** Retorna o texto do indicador de turno. */
  async getTurnText() {
    return this.turnEl.textContent();
  }

  /** Retorna true se o overlay de vitória está visível. */
  async isWinVisible() {
    return this.winOverlay.isVisible();
  }

  /** Retorna o texto do vencedor no overlay. */
  async getWinnerText() {
    return this.winOverlay.locator('p').textContent();
  }
}
