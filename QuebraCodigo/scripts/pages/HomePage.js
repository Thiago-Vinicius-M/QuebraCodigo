/**
 * HomePage — Page Object Model da página inicial autenticada (/index.html).
 *
 * Páginas protegidas do sistema usam auth-guard.js, que chama GET /auth/me
 * e redireciona para /login.html se não houver sessão válida.
 */
export class HomePage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/index.html');
    // Aguarda a resolução do auth-guard (fetch + possível redirect)
    await this.page.waitForLoadState('networkidle');
  }

  // ── Assertion helpers ───────────────────────────────────────────

  /** Retorna true se a URL atual ainda é o index (não foi redirecionado). */
  isOnHomePage() {
    return this.page.url().includes('index.html');
  }

  /** Retorna true se foi redirecionado para login (não autenticado). */
  wasRedirectedToLogin() {
    return this.page.url().includes('login.html');
  }

  /**
   * Aguarda até estar na home autenticada.
   * Lança erro se redirecionar para login.
   */
  async waitForAuthenticatedLoad() {
    await this.page.waitForFunction(
      () => !window.location.href.includes('login.html'),
      { timeout: 8_000 }
    );
  }
}
