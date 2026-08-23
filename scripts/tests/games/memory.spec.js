/**
 * memory.spec.js — Testes do Jogo da Memória
 *
 * Tipo: E2E + API + Funcional + UI
 *
 * Técnica-chave: cada .card3d tem dataset.hash com o caminho da imagem.
 *   Isso permite encontrar pares deterministicamente via page.evaluate(),
 *   sem depender da posição aleatória do deck gerado pelo backend.
 *
 * Cobre:
 *   ✓ API: deck retorna tamanho correto para cada configuração
 *   ✓ API: deck contém pares exatos (cada imagem aparece 2×)
 *   ✓ API: cálculo de pontuação segue fórmula esperada
 *   ✓ UI:  grid renderiza número correto de cartas
 *   ✓ UI:  cartas começam viradas para baixo
 *   ✓ UI:  clicar uma carta a vira (classe .flipped)
 *   ✓ UI:  par correto fica permanentemente virado (.matched)
 *   ✓ UI:  par errado volta a virar após ~380ms
 *   ✓ UI:  contador de movimentos incrementa a cada par testado
 *   ✓ UI:  troca de tamanho recria o grid com contagem correta
 *
 * Como descrever no TCC:
 *   "Testes E2E que validam a integração entre o backend (deck gerado
 *   via API) e o frontend (animações flip, contador de movimentos),
 *   usando inspeção de atributos DOM para localizar pares de forma
 *   determinística e independente da aleatoriedade."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { MemoryPage } from '../../pages/MemoryPage.js';

// ── API Tests ─────────────────────────────────────────────────────────────────

test.describe('Memória — API REST', () => {

  /**
   * TESTE 1 — Tamanho do deck por configuração de grid
   *
   * Objetivo: verificar que cada tamanho retorna o número correto de cartas.
   * Tipo: Teste de API / Contrato
   */
  test('POST /new deve retornar deck com tamanho correto para cada grid @smoke', async ({ authenticatedPage }) => {
    const cases = [
      { size: '4x4', expected: 16, cols: 4, rows: 4 },
      { size: '5x4', expected: 20, cols: 5, rows: 4 },
      { size: '6x4', expected: 24, cols: 6, rows: 4 },
    ];

    for (const { size, expected, cols, rows } of cases) {
      const res = await authenticatedPage.request.post(
        `http://localhost:8150/api/games/memory/new?size=${encodeURIComponent(size)}`
      );
      expect(res.ok(), `size=${size} deve retornar 200`).toBe(true);

      const data = await res.json();
      expect(data.deck).toHaveLength(expected);
      expect(data.cols).toBe(cols);
      expect(data.rows).toBe(rows);
    }
  });

  /**
   * TESTE 2 — Deck contém pares exatos
   *
   * Objetivo: verificar que cada imagem aparece exatamente 2 vezes.
   * Tipo: Teste de API / Regra de negócio
   * Valida: propriedade de "deck de pares" do MemoryService.java
   */
  test('POST /new deve retornar deck onde cada imagem aparece exatamente 2 vezes', async ({ authenticatedPage }) => {
    const res  = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/memory/new?size=4x4'
    );
    const { deck } = await res.json();

    const counts = {};
    for (const card of deck) {
      counts[card] = (counts[card] ?? 0) + 1;
    }

    for (const [card, count] of Object.entries(counts)) {
      expect(count, `imagem ${card} deve aparecer 2×`).toBe(2);
    }
  });

  /**
   * TESTE 3 — Cálculo de pontuação (grid 4×4)
   *
   * Objetivo: verificar a fórmula de score do MemoryService.java.
   * Tipo: Teste de API / Regra de negócio
   * Fórmula: base(80) + bonus(moves) + bonus(tempo)
   *   base = 80 para totalCards ≤ 16
   *   bonus = max(0, 60 - seconds/5) + max(0, 24 - moves)
   */
  test('POST /score deve calcular pontuação corretamente para 4×4', async ({ authenticatedPage }) => {
    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/memory/score',
      { data: { moves: 8, seconds: 30, totalCards: 16 } }
    );
    expect(res.ok()).toBe(true);

    const { points, coins } = await res.json();
    // base=80, bonus_tempo=max(0,60-6)=54, bonus_moves=max(0,24-8)=16 → 80+54+16=150
    expect(points).toBe(150);
    expect(coins).toBe(6);
  });

  /**
   * TESTE 4 — Pontuação menor com mais movimentos e tempo
   *
   * Objetivo: verificar que desempenho pior resulta em menos pontos.
   * Tipo: Teste de API / Regressão
   */
  test('POST /score com muitos movimentos e tempo deve retornar menos pontos', async ({ authenticatedPage }) => {
    const [fast, slow] = await Promise.all([
      authenticatedPage.request.post('http://localhost:8150/api/games/memory/score',
        { data: { moves: 8, seconds: 10, totalCards: 16 } }).then(r => r.json()),
      authenticatedPage.request.post('http://localhost:8150/api/games/memory/score',
        { data: { moves: 40, seconds: 300, totalCards: 16 } }).then(r => r.json()),
    ]);

    expect(fast.points).toBeGreaterThan(slow.points);
  });

});

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

    await memPage.setSize('6x4');
    await page.waitForTimeout(800); // aguarda API + render

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
