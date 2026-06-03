/**
 * LoginPage — Page Object Model da tela de login.
 *
 * Encapsula todos os seletores e ações da página /login.html.
 * Quando o HTML mudar, só este arquivo precisa ser atualizado —
 * os testes continuam sem alteração (princípio DRY).
 *
 * Seletores baseados no login.html real do projeto.
 */
export class LoginPage {

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // ── Campos do formulário ──────────────────────────────────────
    this.usuarioInput = page.locator('input[name="usuario"]');
    this.senhaInput   = page.locator('input[name="senha"]');

    // ── Botões ────────────────────────────────────────────────────
    this.loginBtn  = page.locator('#login-btn');
    this.createBtn = page.locator('#create-btn');

    // ── Feedback visual ───────────────────────────────────────────
    // Criado dinamicamente pelo JS após tentativa de login inválida
    this.errorMsg  = page.locator('#login-error');

    // Wrappers dos inputs — recebem .has-error / .has-success
    this.inputBoxes = page.locator('.input-box');

    // Checkbox "Lembrar-me"
    this.rememberMe = page.locator('#remember-me');
  }

  // ── Navegação ───────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/login.html');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Ações ───────────────────────────────────────────────────────

  /** Preenche e submete o formulário de login. */
  async login(usuario, senha) {
    await this.usuarioInput.fill(usuario);
    await this.senhaInput.fill(senha);
    await this.loginBtn.click();
  }

  /** Preenche apenas o campo usuário (útil para testar validação isolada). */
  async fillUsuario(valor) {
    await this.usuarioInput.fill(valor);
  }

  /** Preenche apenas o campo senha. */
  async fillSenha(valor) {
    await this.senhaInput.fill(valor);
  }

  // ── Assertions helpers ──────────────────────────────────────────

  /**
   * Aguarda a mensagem de erro aparecer e retorna o texto.
   * O erro usa a classe .is-visible para exibição — não display:none.
   */
  async getErrorText() {
    await this.errorMsg.waitFor({ state: 'attached', timeout: 5_000 });
    // Aguarda a classe .is-visible ser aplicada pelo JS
    await this.page.waitForSelector('#login-error.is-visible', { timeout: 5_000 });
    return this.errorMsg.textContent();
  }

  /** Verifica se os inputs estão no estado de erro (borda vermelha). */
  async hasInputError() {
    return this.page.locator('.input-box.has-error').count().then(n => n > 0);
  }

  /** Verifica se os inputs estão no estado de sucesso (borda verde). */
  async hasInputSuccess() {
    return this.page.locator('.input-box.has-success').count().then(n => n > 0);
  }

  /** Aguarda redirecionamento para o index após login bem-sucedido. */
  async waitForSuccessRedirect() {
    await this.page.waitForURL('**/index.html', { timeout: 10_000 });
  }
}
