/**
 * Game2048Page — Page Object Model do jogo 2048.
 *
 * Frontend atual (React client-side):
 *   - Grid:   .grid-container (16 .grid-cell de fundo)
 *   - Peça:   .tile (posicionada por left/top; valor no textContent)
 *   - Score:  .score-container "Pontos" .score-value
 *   - Botões: .btn "Desfazer" / "Reiniciar" (sem id)
 *
 * NOTA: os tiles NÃO têm data-row/data-col nesta versão (posição via CSS),
 *       então readTiles retorna apenas os valores.
 */
export class Game2048Page {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Controles ─────────────────────────────────────────────────
    this.undoBtn     = page.locator('.btn', { hasText: 'Desfazer' });
    this.restartBtn  = page.locator('.btn', { hasText: 'Reiniciar' });
    this.tryAgainBtn = page.locator('.btn-action');
    this.scoreEl     = page.locator('.score-container', { hasText: 'Pontos' }).locator('.score-value');
    this.bestEl      = page.locator('.score-container', { hasText: 'Melhor' }).locator('.score-value');
    this.gameMsg     = page.locator('.game-message');

    // ── Grid ──────────────────────────────────────────────────────
    this.gridContainer = page.locator('.grid-container');
    this.bgCells       = page.locator('.grid-container .grid-cell'); // 16 células de fundo
    this.tiles         = page.locator('.grid-container .tile');      // peças ativas
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/2048/2048.html');
    // Aguarda as 2 peças iniciais serem renderizadas
    await this.page.waitForSelector('.grid-container .tile', { timeout: 20_000 });
  }

  // ── Movimentos (com espera de animação) ─────────────────────────

  /** @param {'ArrowUp'|'ArrowDown'|'ArrowLeft'|'ArrowRight'} direction */
  async pressArrow(direction) {
    await this.page.keyboard.press(direction);
    await this.page.waitForTimeout(250);
  }

  async pressUp()    { await this.pressArrow('ArrowUp'); }
  async pressDown()  { await this.pressArrow('ArrowDown'); }
  async pressLeft()  { await this.pressArrow('ArrowLeft'); }
  async pressRight() { await this.pressArrow('ArrowRight'); }

  async pressSequence(directions) {
    for (const dir of directions) {
      await this.pressArrow(dir);
    }
  }

  // ── Ações ───────────────────────────────────────────────────────

  async clickUndo() {
    await this.undoBtn.click();
    await this.page.waitForTimeout(100);
  }

  async clickRestart() {
    await this.restartBtn.click();
    await this.page.waitForSelector('.grid-container .tile', { timeout: 10_000 });
  }

  // ── Leitura de estado ───────────────────────────────────────────

  /** Retorna a pontuação atual como número. */
  async getScore() {
    return parseInt(await this.scoreEl.textContent(), 10) || 0;
  }

  /** Conta quantas peças (tiles) existem atualmente. */
  async countTiles() {
    return this.tiles.count();
  }

  /**
   * Lê os valores dos tiles atuais (não há data-row/col nesta versão).
   * @returns {Promise<number[]>}
   */
  async readTileValues() {
    return this.page.evaluate(() => {
      return [...document.querySelectorAll('.grid-container .tile')]
        .map(t => parseInt(t.textContent, 10) || 0);
    });
  }

  /** Retorna o maior valor entre as peças atualmente no tabuleiro. */
  async getMaxTileValue() {
    const values = await this.readTileValues();
    return values.reduce((max, v) => Math.max(max, v), 0);
  }

  /** Retorna true se a mensagem de game over / vitória está visível. */
  async isGameMessageVisible() {
    return (await this.gameMsg.count()) > 0;
  }

  /** Retorna o título da mensagem final (Game Over! / Você Venceu!). */
  async getMessageTitle() {
    return this.page.locator('.message-title').textContent();
  }
}
