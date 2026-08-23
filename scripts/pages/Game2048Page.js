/**
 * Game2048Page — Page Object Model do jogo 2048.
 *
 * IMPORTANTE — Limitação de timing:
 *   O jogo possui um flag `_animating` que bloqueia input por ~150ms após
 *   cada movimento. Todos os métodos de movimento já incluem waitForTimeout(250)
 *   para garantir que a animação finalizou antes da próxima ação.
 *
 * Tiles têm dataset.row e dataset.col definidos pelo JS após cada renderização.
 */
export class Game2048Page {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Controles ─────────────────────────────────────────────────
    this.undoBtn     = page.locator('#undoBtn');
    this.restartBtn  = page.locator('#restartBtn');
    this.tryAgainBtn = page.locator('#tryAgainBtn');
    this.scoreEl     = page.locator('#score');
    this.bestEl      = page.locator('#best');
    this.gameMsg     = page.locator('#gameMessage');

    // ── Grid ──────────────────────────────────────────────────────
    this.gridContainer = page.locator('#gridContainer');
    this.bgCells       = page.locator('#gridContainer .grid-cell');  // 16 células de fundo
    this.tiles         = page.locator('#gridContainer .tile');       // peças ativas
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/2048/2048.html');
    await this.page.waitForLoadState('networkidle');
    // Aguarda as 2 peças iniciais serem renderizadas
    await this.page.waitForSelector('#gridContainer .tile', { timeout: 5_000 });
  }

  // ── Movimentos (com espera de animação) ─────────────────────────

  /**
   * Pressiona uma seta e aguarda a animação terminar.
   * O flag _animating bloqueia input por ~150ms — usamos 250ms de margem.
   *
   * @param {'ArrowUp'|'ArrowDown'|'ArrowLeft'|'ArrowRight'} direction
   */
  async pressArrow(direction) {
    await this.page.keyboard.press(direction);
    await this.page.waitForTimeout(250);
  }

  async pressUp()    { await this.pressArrow('ArrowUp'); }
  async pressDown()  { await this.pressArrow('ArrowDown'); }
  async pressLeft()  { await this.pressArrow('ArrowLeft'); }
  async pressRight() { await this.pressArrow('ArrowRight'); }

  /** Pressiona uma sequência de setas com espera entre cada. */
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
    await this.page.waitForSelector('#gridContainer .tile', { timeout: 5_000 });
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
   * Lê o estado do grid como objeto { row, col, value }[].
   * Usa os atributos data-row e data-col que o JS define em cada tile.
   */
  async readTiles() {
    return this.page.evaluate(() => {
      return [...document.querySelectorAll('#gridContainer .tile')].map(t => ({
        row:   parseInt(t.dataset.row, 10),
        col:   parseInt(t.dataset.col, 10),
        value: parseInt(t.textContent, 10),
      }));
    });
  }

  /** Retorna o maior valor entre as peças atualmente no tabuleiro. */
  async getMaxTileValue() {
    const tiles = await this.readTiles();
    return tiles.reduce((max, t) => Math.max(max, t.value), 0);
  }

  /** Retorna true se a mensagem de game over / vitória está visível. */
  async isGameMessageVisible() {
    return this.gameMsg.evaluate(el => el.classList.contains('show'));
  }

  /** Retorna o título da mensagem final (Game Over! / Você Venceu!). */
  async getMessageTitle() {
    return this.page.locator('#messageTitle').textContent();
  }
}
