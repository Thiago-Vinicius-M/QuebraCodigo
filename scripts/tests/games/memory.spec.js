/**
 * memory.spec.js — Testes do Jogo da Memória
 *
 * Tipo: E2E / UI
 *
 * Regras de negócio (deck, pares, fórmula de score) migraram para JUnit:
 *   app/src/test/java/br/com/user/game/memory/MemoryServiceTest.java
 *
 * Aqui permanece só a validação de interface (DOM, animações, contadores).
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { MemoryPage } from '../../pages/MemoryPage.js';

// ── UI Tests ──────────────────────────────────────────────────────────────────

test.describe('Memória — Interface (UI)', () => {

  /**
   * TESTE 5 — Grid inicial tem 16 cartas (4×4) @smoke
   *
   * Objetivo: verificar renderização inicial.
   * Tipo: UI / Smoke
   */
  test('deve renderizar 16 cartas no grid 4×4 ao iniciar @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    const count = await memPage.allCards.count();
    expect(count).toBe(16);
  });

  /**
   * TESTE 6 — Cartas iniciam viradas para baixo
   *
   * Objetivo: verificar estado inicial (nenhuma carta revelada).
   * Tipo: UI / Funcional
   */
  test('nenhuma carta deve estar virada ao iniciar o jogo', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    const flippedCount = await memPage.flippedCards.count();
    expect(flippedCount).toBe(0);
  });

  /**
   * TESTE 7 — Clicar uma carta a vira
   *
   * Objetivo: verificar que o clique aplica a animação de virada.
   * Tipo: UI / Funcional
   */
  test('clicar uma carta deve virá-la (adicionar classe .flipped)', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    await memPage.clickCardAt(0);
    await page.waitForTimeout(100);

    const flipped = await memPage.flippedCards.count();
    expect(flipped).toBe(1);
  });

  /**
   * TESTE 8 — Par correto fica permanentemente virado
   *
   * Objetivo: verificar que dois cards com mesmo hash recebem .matched.
   * Tipo: UI / Funcional (usa dataset.hash para encontrar o par)
   */
  test('par correto deve permanecer virado com classe .matched @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    // Encontra dois cards com o mesmo hash (par real) via DOM
    const pair = await memPage.findMatchingPairIndices();
    expect(pair, 'deve existir pelo menos um par no deck').not.toBeNull();

    // Clica a primeira carta do par
    await memPage.clickCardAt(pair.idx1);
    await page.waitForTimeout(150);

    // Clica a segunda carta do par
    await memPage.clickCardAt(pair.idx2);

    // Aguarda o processamento do match (setTimeout de 380ms no JS)
    await page.waitForTimeout(500);

    // Ambas devem ter .matched
    const matched = await memPage.matchedCards.count();
    expect(matched).toBe(2);
  });

  /**
   * TESTE 9 — Par errado volta a virar após ~380ms
   *
   * Objetivo: verificar que cartas sem match voltam ao estado inicial.
   * Tipo: UI / Funcional
   */
  test('par errado deve virar de volta após o timeout', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    // Encontra duas cartas com hashes DIFERENTES
    const pair = await memPage.findNonMatchingPairIndices();
    if (!pair) { test.skip(); return; }

    await memPage.clickCardAt(pair.idx1);
    await page.waitForTimeout(100);
    await memPage.clickCardAt(pair.idx2);

    // Aguarda o timeout de 380ms + buffer
    await page.waitForTimeout(600);

    // Nenhuma carta deve ter .flipped sem ter .matched
    const flippedWithoutMatch = await page.evaluate(() => {
      return [...document.querySelectorAll('.card3d.flipped:not(.matched)')].length;
    });
    expect(flippedWithoutMatch).toBe(0);
  });

  /**
   * TESTE 10 — Contador de movimentos incrementa
   *
   * Objetivo: verificar que cada par tentado (2 cartas) incrementa o contador.
   * Tipo: UI / Funcional
   */
  test('contador de movimentos deve incrementar a cada par tentado', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    const movesBefore = await memPage.getMoves();
    expect(movesBefore).toBe(0);

    // Clica 2 cartas (par 1, seja correto ou não)
    await memPage.clickCardAt(0);
    await page.waitForTimeout(100);
    await memPage.clickCardAt(1);
    await page.waitForTimeout(500); // aguarda processamento

    const movesAfter = await memPage.getMoves();
    expect(movesAfter).toBe(1);
  });

  /**
   * TESTE 11 — Troca de tamanho recria o grid
   *
   * Objetivo: verificar que o select de tamanho dispara novo jogo via API.
   * Tipo: UI / Funcional
   */
  test('mudar tamanho para 6×4 deve renderizar 24 cartas', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    await memPage.setSize(6);        // 6 colunas × 4 linhas = 24 cartas
    await page.waitForTimeout(800);  // aguarda o re-render

    const count = await memPage.allCards.count();
    expect(count).toBe(24);
  });

  /**
   * TESTE 12 — Screenshot do estado de par encontrado
   *
   * Objetivo: documentar visualmente o estado de match para o TCC.
   * Tipo: UI / Documentação
   */
  test('deve capturar screenshot do estado após encontrar um par', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const memPage = new MemoryPage(page);
    await memPage.goto();

    const pair = await memPage.findMatchingPairIndices();
    if (!pair) { return; }

    await memPage.clickCardAt(pair.idx1);
    await page.waitForTimeout(150);
    await memPage.clickCardAt(pair.idx2);
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/memoria-par-encontrado.png', fullPage: true });
  });

});
