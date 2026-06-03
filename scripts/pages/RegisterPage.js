/**
 * RegisterPage — Page Object Model da tela de cadastro.
 *
 * Encapsula seletores e ações de /cadastro.html.
 * Validações do backend (em AuthService.java):
 *   - usuario: mínimo 2 caracteres, único
 *   - senha: mínimo 4 caracteres
 *   - email: formato válido, único
 *   - dataNascimento: formato dd/MM/aaaa estrito
 */
export class RegisterPage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Campos do formulário (IDs do cadastro.html real) ──────────
    this.primeiroNome    = page.locator('#first-name');
    this.ultimoNome      = page.locator('#last-name');
    this.dataNascimento  = page.locator('#data-nascimento');
    this.email           = page.locator('#email');
    this.usuario         = page.locator('#usuario');
    this.senha           = page.locator('#senha');

    // ── Botões ────────────────────────────────────────────────────
    this.submitBtn = page.locator('#criarConta-button');
    this.goBackBtn = page.locator('#go-back');

    // ── Mensagem de erro (criada dinamicamente pelo JS com id="cadastro-msg") ──
    this.errorMsg = page.locator('#cadastro-msg');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/cadastro.html');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Ações ───────────────────────────────────────────────────────

  /**
   * Preenche todos os campos do formulário.
   * @param {{ primeiroNome, ultimoNome, dataNascimento, email, usuario, senha }} data
   */
  async fill(data) {
    await this.primeiroNome.fill(data.primeiroNome   ?? '');
    await this.ultimoNome.fill(data.ultimoNome       ?? '');
    await this.dataNascimento.fill(data.dataNascimento ?? '');
    await this.email.fill(data.email                 ?? '');
    await this.usuario.fill(data.usuario             ?? '');
    await this.senha.fill(data.senha                 ?? '');
  }

  /** Submete o formulário clicando no botão. */
  async submit() {
    await this.submitBtn.click();
  }

  /** Preenche e submete em uma única chamada. */
  async register(data) {
    await this.fill(data);
    await this.submit();
  }

  // ── Assertion helpers ───────────────────────────────────────────

  /**
   * Aguarda e retorna a mensagem de erro do servidor.
   * O elemento #cadastro-msg é criado dinamicamente após resposta do backend.
   */
  async getErrorText() {
    await this.errorMsg.waitFor({ state: 'attached', timeout: 8_000 });
    return this.errorMsg.textContent();
  }

  /** Aguarda redirecionamento para index.html após cadastro bem-sucedido. */
  async waitForSuccessRedirect() {
    await this.page.waitForURL('**/index.html', { timeout: 10_000 });
  }
}
