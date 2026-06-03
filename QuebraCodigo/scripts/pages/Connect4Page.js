/**
 * Connect4Page — Page Object Model do Connect 4.
 *
 * O tabuleiro tem 6 linhas × 7 colunas = 42 células (.c4-cell).
 * Índice de célula: row * 7 + col
 * Como o backend aplica gravidade, clicar QUALQUER célula de uma
 * coluna é equivalente — usamos a célula do topo (row=0) por convenção.
 */
export class Connect4Page {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.ROWS = 6;
    this.COLS = 7;

    // ── Controles ─────────────────────────────────────────────────
    this.startBtn   = page.locator('#c4Start');
    this.modeSelect = page.locator('#c4Mode');
    this.turnEl     = page.locator('#c4Turn');
    this.winnerEl   = page.locator('#c4Winner');
    this.winOverlay = page.locator('#win-overlay');
    this.playAgain  = page.locator('#play-again');

    // ── Tabuleiro ─────────────────────────────────────────────────
    this.board    = page.locator('#c4Board');
    this.allCells = page.locator('#c4Board .c4-cell');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/connect4/connect4.html');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('#c4Board', { timeout: 8_000 });
  }

  // ── Ações ───────────────────────────────────────────────────────

  async startGame(mode = 'pvp') {
    await this.modeSelect.selectOption(mode);
    await this.startBtn.click();
    // Aguarda o tabuleiro ser preenchido pela API
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(200);
  }

  /**
   * Clica na coluna indicada (0-6).
   * Usa a célula do topo da coluna (row 0) — o backend aplica gravidade.
   */
  async dropInColumn(col) {
    const cellIndex = 0 * this.COLS + col; // topo da coluna
    await this.page.locator(`#c4Board .c4-cell:nth-child(${cellIndex + 1})`).click();
    // Aguarda a resposta da API e re-renderização
    await this.page.waitForTimeout(300);
  }

  async clickPlayAgain() {
    await this.playAgain.click();
    await this.page.waitForTimeout(300);
  }

  // ── Leitura de estado via DOM ────────────────────────────────────

  /** Conta quantas peças (chips) existem no tabuleiro. */
  async countChips() {
    return this.page.locator('#c4Board .chip').count();
  }

  /** Conta peças de um jogador específico pela cor. */
  async countChipsByPlayer(player) {
    const color = player === 1 ? 'rgb(0, 102, 102)' : 'rgb(102, 0, 102)';
    return this.page.evaluate((targetColor) => {
      return [...document.querySelectorAll('#c4Board .chip')]
        .filter(chip => chip.style.background === targetColor).length;
    }, color);
  }

  /** Retorna o texto do indicador de turno. */
  async getTurnText() {
    return this.turnEl.textContent();
  }

  /** Retorna true se o overlay de vitória está visível. */
  async isWinVisible() {
    return this.page.evaluate(() => {
      const el = document.getElementById('win-overlay');
      return el ? !el.classList.contains('hidden') : false;
    });
  }

  /** Retorna o texto do vencedor no overlay. */
  async getWinnerText() {
    return this.winOverlay.locator('p').textContent();
  }
}
