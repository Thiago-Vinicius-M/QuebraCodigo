/**
 * register.spec.js — Testes da tela de Cadastro
 *
 * Tipo: E2E + Funcional + Validação de campos
 *
 * Cobre:
 *   ✓ Cadastro completo com dados válidos
 *   ✓ Usuário já existente (conflito no banco)
 *   ✓ E-mail já cadastrado
 *   ✓ Data de nascimento em formato inválido
 *   ✓ Validações do frontend (campos obrigatórios)
 *   ✓ Senha curta (< 4 caracteres)
 *   ✓ Usuário curto (< 2 caracteres)
 *   ✓ Navegação: voltar para login
 *
 * Como descrever no TCC:
 *   "Testes E2E de cadastro validando regras de negócio do backend
 *   (AuthService.java) e validações do frontend, garantindo que
 *   mensagens de erro corretas sejam exibidas ao usuário."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { RegisterPage } from '../../pages/RegisterPage.js';
import { LoginPage } from '../../pages/LoginPage.js';

// ── Dados base para testes ────────────────────────────────────────────────────

/**
 * Gera dados válidos únicos por execução.
 * uid baseado em Date.now() garante que cada test run use um usuário novo,
 * evitando conflitos de "usuário já existe" entre execuções.
 */
function makeValidUser(suffix = Date.now()) {
  return {
    primeiroNome:   'QA',
    ultimoNome:     'Registro',
    email:          `qa_reg_${suffix}@quebracodigo.test`,
    dataNascimento: '20/03/1998',
    usuario:        `qa_reg_${suffix}`,
    senha:          'Teste1234',
  };
}

// ── Testes ────────────────────────────────────────────────────────────────────

test.describe('Cadastro — Cenário Positivo', () => {

  /**
   * TESTE 1 — Cadastro completo válido @smoke
   *
   * Objetivo: verificar o fluxo principal de registro de novo usuário.
   * Tipo: E2E / Funcional
   * Valida:
   *   - Todos os campos preenchidos corretamente
   *   - API POST /auth/register retorna 200
   *   - Sessão estabelecida automaticamente após cadastro
   *   - Redirecionamento para index.html
   */
  test('deve cadastrar novo usuário e redirecionar para home @smoke', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = makeValidUser();

    await registerPage.goto();
    await registerPage.register(user);

    // Após cadastro bem-sucedido: window.location.href = "index.html"
    await registerPage.waitForSuccessRedirect();
    expect(page.url()).toContain('index.html');
  });

});

test.describe('Cadastro — Cenários Negativos (conflito de dados)', () => {

  // Usuário fixo criado uma vez para testar duplicidade
  let existingUser;

  test.beforeAll(async ({ request }) => {
    existingUser = makeValidUser('existing_' + Date.now());

    const res = await request.post('http://localhost:8150/auth/register', {
      data: existingUser,
    });
    if (!res.ok()) {
      throw new Error(`Falha ao criar usuário pré-existente: ${await res.text()}`);
    }
  });

  /**
   * TESTE 2 — Usuário já existente
   *
   * Objetivo: verificar mensagem de erro quando o nome de usuário está em uso.
   * Tipo: Funcional / Validação
   * Valida: mensagem "Este usuário já está em uso" (AuthService.java linha 96)
   */
  test('deve exibir erro ao cadastrar com usuário já existente', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register({
      ...existingUser,
      email: `diferente_${Date.now()}@quebracodigo.test`, // e-mail diferente
    });

    const errorText = await registerPage.getErrorText();
    expect(errorText).toContain('Este usuário já está em uso');
  });

  /**
   * TESTE 3 — E-mail já cadastrado
   *
   * Objetivo: verificar mensagem de erro quando o e-mail está em uso.
   * Tipo: Funcional / Validação
   * Valida: mensagem "Este e-mail já está cadastrado" (AuthService.java linha 98)
   */
  test('deve exibir erro ao cadastrar com e-mail já cadastrado', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register({
      ...existingUser,
      usuario: `outro_${Date.now()}`, // usuário diferente
      // e-mail é o mesmo do existingUser → conflito
    });

    const errorText = await registerPage.getErrorText();
    expect(errorText).toContain('Este e-mail já está cadastrado');
  });

  /**
   * TESTE 4 — Data de nascimento inválida
   *
   * Objetivo: verificar rejeição de datas em formato incorreto ou inexistentes.
   * Tipo: Validação de campo
   * Valida: mensagem "Data de nascimento inválida. Use dd/mm/aaaa." (AuthService.java)
   *
   * Nota: o backend usa DateTimeFormatter com ResolverStyle.STRICT —
   *       datas como 31/02/2000 são rejeitadas mesmo com formato correto.
   */
  test('deve exibir erro ao informar data de nascimento inválida', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = makeValidUser();

    await registerPage.goto();
    await registerPage.register({
      ...user,
      dataNascimento: '31/02/2000', // data impossível (fevereiro não tem dia 31)
    });

    const errorText = await registerPage.getErrorText();
    expect(errorText).toContain('Data de nascimento inválida');
  });

});

test.describe('Cadastro — Validações do Frontend', () => {

  /**
   * TESTE 5 — Campos obrigatórios vazios
   *
   * Objetivo: verificar que o frontend valida campos antes de chamar a API.
   * Tipo: Validação de campos
   * Valida: alert() do cadastro.html para campos não preenchidos
   *
   * Nota: a página usa alert() para validação do lado cliente.
   *       Playwright intercepta diálogos via page.on('dialog').
   */
  test('deve alertar ao submeter com nome e sobrenome vazios', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // Prepara interceptação do alert() antes de navegar
    let alertMessage = '';
    page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await registerPage.goto();
    // Submete sem preencher nenhum campo
    await registerPage.submit();

    expect(alertMessage).toContain('Preencha nome e sobrenome');
  });

  /**
   * TESTE 6 — Senha com menos de 4 caracteres
   *
   * Objetivo: verificar rejeição de senhas curtas.
   * Tipo: Validação de campo
   * Valida: alert "A senha deve ter pelo menos 4 caracteres" (cadastro.html)
   */
  test('deve alertar ao usar senha com menos de 4 caracteres', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = makeValidUser();

    let alertMessage = '';
    page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await registerPage.goto();
    await registerPage.fill({ ...user, senha: '123' }); // 3 chars — mínimo é 4
    await registerPage.submit();

    expect(alertMessage).toContain('pelo menos 4 caracteres');
  });

  /**
   * TESTE 7 — Usuário com menos de 2 caracteres
   *
   * Objetivo: verificar rejeição de usernames muito curtos.
   * Tipo: Validação de campo
   * Valida: alert "O usuário deve ter pelo menos 2 caracteres" (cadastro.html)
   */
  test('deve alertar ao usar nome de usuário com 1 caractere', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = makeValidUser();

    let alertMessage = '';
    page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await registerPage.goto();
    await registerPage.fill({ ...user, usuario: 'x' }); // 1 char — mínimo é 2
    await registerPage.submit();

    expect(alertMessage).toContain('pelo menos 2 caracteres');
  });

  /**
   * TESTE 8 — Data no formato incorreto (sem separadores)
   *
   * Objetivo: verificar rejeição de data fora do padrão dd/mm/aaaa.
   * Tipo: Validação de campo
   * Valida: alert "Use a data no formato dd/mm/aaaa"
   */
  test('deve alertar ao informar data sem o formato dd/mm/aaaa', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = makeValidUser();

    let alertMessage = '';
    page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await registerPage.goto();
    await registerPage.fill({ ...user, dataNascimento: '20031998' }); // sem separadores
    await registerPage.submit();

    expect(alertMessage).toContain('dd/mm/aaaa');
  });

});

test.describe('Cadastro — Navegação', () => {

  /**
   * TESTE 9 — Botão Voltar
   *
   * Objetivo: verificar que o botão de voltar retorna para login.html.
   * Tipo: Navegação
   */
  test('deve retornar para login ao clicar em Voltar', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    await registerPage.goBackBtn.click();

    await page.waitForURL('**/login.html', { timeout: 5_000 });
    expect(page.url()).toContain('login.html');
  });

});
