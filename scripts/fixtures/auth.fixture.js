/**
 * auth.fixture.js — Fixtures de autenticação reutilizáveis.
 *
 * O que resolve:
 *   - Testes que precisam de um usuário autenticado não devem refazer o login
 *     pela UI a cada teste (lento e frágil). Este fixture:
 *       1. Registra um usuário único via API (POST /auth/register)
 *       2. Faz login uma vez via UI (capturando o cookie de sessão HTTP)
 *       3. Entrega o `page` já autenticado para o teste
 *       4. Faz logout via API ao finalizar
 *
 *   - Isolamento: cada suite que usa `authenticatedPage` recebe um
 *     usuário diferente (uid = Date.now()), evitando conflito entre
 *     execuções paralelas ou consecutivas.
 *
 * Uso nos testes:
 *   import { test, expect } from '../../fixtures/auth.fixture.js';
 *   test('deve acessar home', async ({ authenticatedPage }) => { ... });
 */

import { test as base, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8150';

// ── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Gera dados de usuário únicos para cada execução de teste.
 * Usa Date.now() para garantir unicidade mesmo em execuções rápidas.
 */
function makeTestUser() {
  const uid = Date.now();
  return {
    primeiroNome:   'QA',
    ultimoNome:     'Teste',
    email:          `qa_${uid}@quebracodigo.test`,
    dataNascimento: '15/06/2000',
    usuario:        `qa_${uid}`,
    senha:          'QaTeste123',
  };
}

/**
 * Registra um usuário diretamente na API (sem UI).
 * Mais rápido que preencher o formulário — só o teste de cadastro usa a UI.
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {ReturnType<typeof makeTestUser>} creds
 */
async function registerViaApi(request, creds) {
  const res = await request.post(`${BASE_URL}/auth/register`, {
    data: {
      primeiroNome:   creds.primeiroNome,
      ultimoNome:     creds.ultimoNome,
      email:          creds.email,
      dataNascimento: creds.dataNascimento,
      usuario:        creds.usuario,
      senha:          creds.senha,
    },
  });

  if (!res.ok()) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `Fixture: falha ao registrar usuário de teste. ` +
      `Status ${res.status()} — ${body.error ?? JSON.stringify(body)}`
    );
  }
  return res;
}

// ── Extensão do `test` com fixtures customizados ─────────────────────────────

export const test = base.extend({

  /**
   * Fixture: `testUser`
   * Fornece credenciais únicas para o teste (não faz nenhuma requisição).
   * Útil em testes de cadastro que preenchem o formulário manualmente.
   */
  testUser: async ({}, use) => {
    await use(makeTestUser());
  },

  /**
   * Fixture: `authenticatedPage`
   * Entrega um `page` com sessão HTTP válida (usuário já logado).
   *
   * Estratégia:
   *   - Registro via API (não polui o teste de cadastro)
   *   - Login via página UI (garante que o cookie de sessão está no contexto
   *     do browser, exatamente como um usuário real faria)
   *   - Teardown: logout via API para invalidar a sessão no servidor
   */
  authenticatedPage: async ({ page, request }, use) => {
    const creds = makeTestUser();

    // 1. Cria o usuário via API
    await registerViaApi(request, creds);

    // 2. Login pela UI — assim o browser context recebe o cookie de sessão
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('domcontentloaded');
    await page.fill('input[name="usuario"]', creds.usuario);
    await page.fill('input[name="senha"]', creds.senha);
    await page.click('#login-btn');

    // 3. Aguarda redirecionamento para index (login concluído)
    await page.waitForURL('**/index.html', { timeout: 10_000 });

    // 4. Entrega o page autenticado para o teste
    await use(page);

    // 5. Teardown: invalida a sessão no servidor
    await page.request.post(`${BASE_URL}/auth/logout`).catch(() => {
      // Ignora erros no logout do teardown (sessão pode já ter expirado)
    });
  },
});

// Re-exporta `expect` para que os testes que importam daqui
// não precisem importar do @playwright/test separadamente
export { expect };
