/**
 * login.spec.js — Testes da tela de Login
 *
 * Tipo: E2E + Funcional + Validação de campos
 *
 * Cobre:
 *   ✓ Login com credenciais válidas
 *   ✓ Login com senha incorreta
 *   ✓ Login com campos vazios
 *   ✓ Login com usuário inexistente
 *   ✓ Persistência do campo "Lembrar-me"
 *   ✓ Feedback visual (has-error / has-success)
 *   ✓ Navegação para tela de cadastro
 *
 * Como descrever no TCC:
 *   "Testes funcionais E2E que simulam o comportamento real do usuário
 *   na tela de autenticação, cobrindo cenários positivos e negativos
 *   e validando mensagens de feedback da interface."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { RegisterPage } from '../../pages/RegisterPage.js';

// ── Setup: cria um usuário de teste antes da suite ────────────────────────────
// O usuário é registrado via API (rápido) e reutilizado em todos os testes
// positivos desta suite.
let sharedUser;

test.beforeAll(async ({ request }) => {
  const uid = Date.now();
  sharedUser = {
    primeiroNome:   'QA',
    ultimoNome:     'Login',
    email:          `qa_login_${uid}@quebracodigo.test`,
    dataNascimento: '10/05/1995',
    usuario:        `qa_login_${uid}`,
    senha:          'SenhaTeste123',
  };

  const res = await request.post('http://localhost:8150/auth/register', {
    data: sharedUser,
  });

  if (!res.ok()) {
    throw new Error(`Falha ao criar usuário de teste: ${res.status()}`);
  }
});

// ── Testes ────────────────────────────────────────────────────────────────────

test.describe('Login — Cenários Positivos', () => {

  /**
   * TESTE 1 — Login válido
   *
   * Objetivo: verificar que um usuário cadastrado consegue autenticar-se.
   * Tipo: E2E / Funcional
   * Valida: fluxo completo de login → redirecionamento → sessão ativa
   */
  test('deve realizar login com credenciais válidas e redirecionar para home @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navega para a tela de login
    await loginPage.goto();

    // Preenche e submete as credenciais corretas
    await loginPage.login(sharedUser.usuario, sharedUser.senha);

    // Verifica redirecionamento para a home após login bem-sucedido
    await loginPage.waitForSuccessRedirect();
    expect(page.url()).toContain('index.html');

    // Verifica que a sessão foi estabelecida (auth-guard não redirecionou de volta)
    await expect(page).not.toHaveURL(/login\.html/);
  });

  /**
   * TESTE 2 — Feedback visual de sucesso
   *
   * Objetivo: verificar que os campos ficam verdes após login válido.
   * Tipo: Teste de UI / Interface
   * Valida: classe CSS .has-success nos wrappers dos inputs
   */
  test('deve exibir feedback visual de sucesso nos campos após login válido', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillUsuario(sharedUser.usuario);
    await loginPage.fillSenha(sharedUser.senha);
    await loginPage.loginBtn.click();

    // O JS adiciona .has-success antes do redirect
    await page.waitForSelector('.input-box.has-success', { timeout: 5_000 });
    expect(await loginPage.hasInputSuccess()).toBe(true);
  });

  /**
   * TESTE 3 — Lembrar-me
   *
   * Objetivo: verificar que o campo usuário é pré-preenchido na próxima visita.
   * Tipo: Funcional
   * Valida: uso de localStorage para persistir o identificador
   */
  test('deve pré-preencher o campo usuário ao marcar "Lembrar-me"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Marca "Lembrar-me" e faz login
    await loginPage.rememberMe.check();
    await loginPage.login(sharedUser.usuario, sharedUser.senha);
    await loginPage.waitForSuccessRedirect();

    // Simula nova visita abrindo a página de login novamente
    await page.goto('/login.html');
    await page.waitForLoadState('domcontentloaded');

    // Campo deve estar pré-preenchido com o usuário salvo
    await expect(loginPage.usuarioInput).toHaveValue(sharedUser.usuario);
  });

});

test.describe('Login — Cenários Negativos', () => {

  /**
   * TESTE 4 — Login com senha incorreta
   *
   * Objetivo: verificar que o sistema rejeita credenciais inválidas.
   * Tipo: Funcional / Validação
   * Valida: mensagem de erro "Usuário ou senha inválidos" (exato do AuthService.java)
   */
  test('deve exibir erro ao usar senha incorreta', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(sharedUser.usuario, 'senha_errada_xpto');

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Usuário ou senha inválidos');
  });

  /**
   * TESTE 5 — Login com usuário inexistente
   *
   * Objetivo: verificar mensagem de erro para usuário não cadastrado.
   * Tipo: Funcional / Validação
   * Valida: mesma mensagem genérica (sem expor se o usuário existe ou não — boa prática de segurança)
   */
  test('deve exibir erro ao usar usuário que não existe', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('usuario_que_nao_existe_xpto123', 'qualquersenha');

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Usuário ou senha inválidos');
  });

  /**
   * TESTE 6 — Campos vazios
   *
   * Objetivo: verificar que o formulário não submete sem usuário e senha.
   * Tipo: Validação de campos
   * Valida: feedback visual de erro + mensagem (validação no frontend antes do fetch)
   */
  test('deve exibir erro ao submeter com campos vazios', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Clica em Entrar sem preencher nada
    await loginPage.loginBtn.click();

    // O JS do login.html valida campos vazios antes de chamar a API
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Preencha usuário e senha');

    // Inputs devem estar com feedback de erro (borda vermelha)
    expect(await loginPage.hasInputError()).toBe(true);
  });

  /**
   * TESTE 7 — Formulário reativo: erro some ao digitar
   *
   * Objetivo: verificar que o feedback de erro desaparece quando o usuário
   * começa a corrigir os campos (UX esperada).
   * Tipo: Teste de UI / Interface
   */
  test('deve limpar o estado de erro ao começar a digitar nos campos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Gera o estado de erro
    await loginPage.loginBtn.click();
    await page.waitForSelector('.input-box.has-error', { timeout: 5_000 });

    // Começa a digitar — o JS remove a classe de erro (listener "input")
    await loginPage.usuarioInput.fill('digitando_algo');
    await page.waitForSelector('.input-box:not(.has-error)', { timeout: 3_000 });
    expect(await loginPage.hasInputError()).toBe(false);
  });

  /**
   * TESTE 8 — Screenshot em falha (documentação automática)
   *
   * Objetivo: documentar visualmente o estado de erro da tela de login.
   * Tipo: Teste de UI
   * Nota: screenshot é capturado automaticamente pelo Playwright em qualquer
   *       falha. Este teste captura manualmente para o relatório.
   */
  test('deve capturar screenshot do estado de erro para documentação', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('usuario_invalido_doc', 'senhaerrada');
    await loginPage.getErrorText(); // aguarda o erro aparecer

    // Screenshot manual para documentação no TCC
    await page.screenshot({
      path: 'screenshots/login-estado-erro.png',
      fullPage: true,
    });
  });

});

test.describe('Login — Navegação', () => {

  /**
   * TESTE 9 — Botão "Criar conta"
   *
   * Objetivo: verificar navegação da tela de login para o cadastro.
   * Tipo: Funcional / Navegação
   */
  test('deve navegar para a tela de cadastro ao clicar em "Criar conta"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.createBtn.click();

    // O botão usa animateAndGo() — aguarda o redirect
    await page.waitForURL('**/cadastro.html', { timeout: 5_000 });
    expect(page.url()).toContain('cadastro.html');
  });

});
