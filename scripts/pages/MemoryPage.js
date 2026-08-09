/**
 * MemoryPage — Page Object Model do Jogo da Memória.
 *
 * Frontend atual (React client-side):
 *   - Grid:  .memory-grid
 *   - Carta: .card3d (com <img class="card-image" src="..."> no verso)
 *   - O "par" é identificado pelo src da imagem da carta (não há data-hash).
 */
export class MemoryPage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Controles ─────────────────────────────────────────────────
    this.startBtn   = page.locator('#mStart');
    this.resetBtn   = page.locator('#mReset');
    this.sizeSelect = page.locator('.controls select');
    this.movesEl    = page.locator('.muted:has-text("Movimentos") strong');
    this.timeEl     = page.locator('.muted:has-text("Tempo") strong');
    this.winOverlay = page.locator('.win-overlay');
    this.playAgain  = page.locator('#play-again');

    // ── Grid ──────────────────────────────────────────────────────
    this.grid         = page.locator('.memory-grid');
    this.allCards     = page.locator('.memory-grid .card3d');
    this.flippedCards = page.locator('.memory-grid .card3d.flipped');
    this.matchedCards = page.locator('.memory-grid .card3d.matched');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/memory/memory.html');
    // Aguarda o React/Babel renderizarem e o grid aparecer
    await this.page.waitForSelector('.memory-grid .card3d', { timeout: 20_000 });
  }

  // ── Ações ───────────────────────────────────────────────────────

  async clickStart()       { await this.startBtn.click(); }
  async clickReset()       { await this.resetBtn.click(); }
  async setSize(cols)      { await this.sizeSelect.selectOption(String(cols)); }

  /** Clica na carta no índice dado (0-based). */
  async clickCardAt(index) {
    await this.page.locator(`.memory-grid .card3d:nth-child(${index + 1})`).click();
  }

  /** Aguarda as cartas serem renderizadas (útil após troca de tamanho). */
  async waitForCards() {
    await this.page.waitForSelector('.memory-grid .card3d', { timeout: 15_000 });
  }

  // ── Leitura de estado via DOM ────────────────────────────────────

  /**
   * Retorna os índices (0-based) de dois cards com a mesma imagem (par real).
   * Usa o src da <img.card-image> de cada carta, garantindo um par determinístico.
   *
   * @returns {{ idx1: number, idx2: number } | null}
   */
  async findMatchingPairIndices() {
    return this.page.evaluate(() => {
      const cards = [...document.querySelectorAll('.memory-grid .card3d')];
      const seen = new Map();
      for (let i = 0; i < cards.length; i++) {
        const img = cards[i].querySelector('.card-image');
        const key = img ? img.getAttribute('src') : null;
        if (key == null) continue;
        if (seen.has(key)) {
          return { idx1: seen.get(key), idx2: i };
        }
        seen.set(key, i);
      }
      return null;
    });
  }

  /**
   * Retorna os índices de dois cards com imagens DIFERENTES
   * (para testar o caso de par errado).
   */
  async findNonMatchingPairIndices() {
    return this.page.evaluate(() => {
      const cards = [...document.querySelectorAll('.memory-grid .card3d')];
      if (cards.length < 2) return null;
      const srcOf = el => {
        const img = el.querySelector('.card-image');
        return img ? img.getAttribute('src') : null;
      };
      const src0 = srcOf(cards[0]);
      const idx2 = cards.findIndex((c, i) => i > 0 && srcOf(c) !== src0);
      return idx2 !== -1 ? { idx1: 0, idx2 } : null;
    });
  }

  /** Retorna o número de movimentos atual. */
  async getMoves() {
    return parseInt(await this.movesEl.textContent(), 10) || 0;
  }

  /** Retorna true se o overlay de vitória está visível. */
  async isWinVisible() {
    return this.page.locator('.win-overlay').isVisible();
  }
}
