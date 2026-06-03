/**
 * MemoryPage — Page Object Model do Jogo da Memória.
 *
 * Ponto-chave: dataset.hash de cada .card3d contém o caminho da imagem.
 * Isso permite encontrar pares deterministicamente via page.evaluate(),
 * sem depender da posição aleatória do deck.
 */
export class MemoryPage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Controles ─────────────────────────────────────────────────
    this.startBtn   = page.locator('#mStart');
    this.resetBtn   = page.locator('#mReset');
    this.sizeSelect = page.locator('#mSize');
    this.movesEl    = page.locator('#mMoves');
    this.timeEl     = page.locator('#mTime');
    this.winOverlay = page.locator('#win-overlay');
    this.playAgain  = page.locator('#play-again');

    // ── Grid ──────────────────────────────────────────────────────
    this.grid        = page.locator('#mGrid');
    this.allCards    = page.locator('#mGrid .card3d');
    this.flippedCards = page.locator('#mGrid .card3d.flipped');
    this.matchedCards = page.locator('#mGrid .card3d.matched');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/games/memory/memory.html');
    await this.page.waitForLoadState('networkidle');
    // Aguarda o deck ser carregado pela API e o grid renderizado
    await this.page.waitForSelector('#mGrid .card3d', { timeout: 10_000 });
  }

  // ── Ações ───────────────────────────────────────────────────────

  async clickStart()       { await this.startBtn.click(); }
  async clickReset()       { await this.resetBtn.click(); }
  async setSize(value)     { await this.sizeSelect.selectOption(value); }

  /** Clica na carta no índice dado (0-based). */
  async clickCardAt(index) {
    await this.page.locator(`#mGrid .card3d:nth-child(${index + 1})`).click();
  }

  /** Aguarda as cartas serem renderizadas (útil após troca de tamanho). */
  async waitForCards() {
    await this.page.waitForSelector('#mGrid .card3d', { timeout: 8_000 });
  }

  // ── Leitura de estado via DOM ────────────────────────────────────

  /**
   * Retorna os índices (0-based) de dois cards com o mesmo dataset.hash.
   * Garante que o teste encontre um par real, sem adivinhar.
   *
   * @returns {{ idx1: number, idx2: number, hash: string }}
   */
  async findMatchingPairIndices() {
    return this.page.evaluate(() => {
      const cards = [...document.querySelectorAll('#mGrid .card3d')];
      const seen = new Map();
      for (let i = 0; i < cards.length; i++) {
        const hash = cards[i].dataset.hash;
        if (seen.has(hash)) {
          return { idx1: seen.get(hash), idx2: i, hash };
        }
        seen.set(hash, i);
      }
      return null;
    });
  }

  /**
   * Retorna os índices de dois cards com hashes DIFERENTES
   * (para testar o caso de par errado).
   */
  async findNonMatchingPairIndices() {
    return this.page.evaluate(() => {
      const cards = [...document.querySelectorAll('#mGrid .card3d')];
      if (cards.length < 2) return null;
      const hash0 = cards[0].dataset.hash;
      const idx2  = cards.findIndex((c, i) => i > 0 && c.dataset.hash !== hash0);
      return idx2 !== -1 ? { idx1: 0, idx2 } : null;
    });
  }

  /** Retorna o número de movimentos atual. */
  async getMoves() {
    return parseInt(await this.movesEl.textContent(), 10) || 0;
  }

  /** Retorna true se o overlay de vitória está visível. */
  async isWinVisible() {
    return this.page.evaluate(() => {
      const el = document.getElementById('win-overlay');
      return el ? !el.classList.contains('hidden') : false;
    });
  }
}
