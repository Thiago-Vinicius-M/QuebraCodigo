/**
 * sudoku.spec.js — Testes do Sudoku
 *
 * Tipo: E2E + API + Funcional + UI
 *
 * Cobre:
 *   ✓ API: novo jogo retorna tabuleiro válido (3 dificuldades)
 *   ✓ API: validação detecta conflitos e board completo
 *   ✓ API: solver resolve qualquer estado válido
 *   ✓ UI:  grid renderiza 81 células
 *   ✓ UI:  células fixas são somente-leitura
 *   ✓ UI:  células não-fixas aceitam apenas dígitos 1-9
 *   ✓ UI:  input inválido (letra) é filtrado
 *   ✓ UI:  botão Resolver preenche o board e exibe overlay de vitória
 *   ✓ UI:  botão Limpar apaga células não-fixas
 *   ✓ UI:  troca de dificuldade gera novo tabuleiro
 *
 * Como descrever no TCC:
 *   "Testes que validam tanto a API REST do Sudoku (SudokuService.java)
 *   quanto a interface renderizada, cobrindo o ciclo completo de uma
 *   partida do ponto de vista do usuário."
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { SudokuPage } from '../../pages/SudokuPage.js';

// ── API Tests ─────────────────────────────────────────────────────────────────

test.describe('Sudoku — API REST', () => {

  /**
   * TESTE 1 — Novo jogo: estrutura da resposta
   *
   * Objetivo: garantir que o endpoint retorna um puzzle 9×9 válido.
   * Tipo: Teste de API / Contrato
   * Valida: board[81], fixed[81], difficulty no JSON de resposta
   */
  test('POST /new deve retornar puzzle com 81 células e array de fixas @smoke', async ({ authenticatedPage }) => {
    for (const diff of ['easy', 'medium', 'hard']) {
      const res = await authenticatedPage.request.post(
        `http://localhost:8150/api/games/sudoku/new?difficulty=${diff}`
      );
      expect(res.ok(), `dificuldade ${diff} deve retornar 200`).toBe(true);

      const data = await res.json();
      expect(data.board).toHaveLength(81);
      expect(data.fixed).toHaveLength(81);
      expect(data.difficulty).toBe(diff);

      // Todos os valores devem ser 0-9
      for (const v of data.board) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(9);
      }
    }
  });

  /**
   * TESTE 2 — Número de células fixas por dificuldade
   *
   * Objetivo: verificar que dificuldades diferentes geram densidades diferentes.
   * Tipo: Teste de API / Regra de negócio
   * Valida: easy > medium > hard em termos de células pré-preenchidas
   */
  test('POST /new deve ter mais células fixas em dificuldades mais fáceis', async ({ authenticatedPage }) => {
    const counts = {};
    for (const diff of ['easy', 'medium', 'hard']) {
      const res  = await authenticatedPage.request.post(
        `http://localhost:8150/api/games/sudoku/new?difficulty=${diff}`
      );
      const data = await res.json();
      counts[diff] = data.board.filter(v => v !== 0).length;
    }

    // easy remove 40 → 41 fixas | medium remove 50 → 31 | hard remove 58 → 23
    expect(counts.easy).toBeGreaterThan(counts.medium);
    expect(counts.medium).toBeGreaterThan(counts.hard);
  });

  /**
   * TESTE 3 — Validação detecta conflito óbvio
   *
   * Objetivo: verificar que o endpoint /validate detecta dois iguais na mesma linha.
   * Tipo: Teste de API / Regra de negócio
   * Valida: conflicts[0] e conflicts[1] = true quando board[0]=board[1]=1
   */
  test('POST /validate deve marcar conflito em células repetidas na mesma linha', async ({ authenticatedPage }) => {
    const board = Array(81).fill(0);
    board[0] = 1;
    board[1] = 1; // conflito: dois 1s na linha 0

    const res = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/sudoku/validate',
      { data: { board } }
    );
    expect(res.ok()).toBe(true);

    const data = await res.json();
    expect(data.conflicts[0]).toBe(true);
    expect(data.conflicts[1]).toBe(true);
    expect(data.complete).toBe(false);
  });

  /**
   * TESTE 4 — Validação detecta conflito em coluna
   *
   * Objetivo: verificar detecção de conflito vertical.
   * Tipo: Teste de API / Regra de negócio
   */
  test('POST /validate deve marcar conflito em células repetidas na mesma coluna', async ({ authenticatedPage }) => {
    const board = Array(81).fill(0);
    board[0]  = 5; // linha 0, coluna 0
    board[9]  = 5; // linha 1, coluna 0 → conflito na coluna 0

    const res  = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/sudoku/validate',
      { data: { board } }
    );
    const data = await res.json();
    expect(data.conflicts[0]).toBe(true);
    expect(data.conflicts[9]).toBe(true);
  });

  /**
   * TESTE 5 — Solver retorna tabuleiro completo
   *
   * Objetivo: verificar que o endpoint /solve preenche todos os zeros.
   * Tipo: Teste de API / Funcional
   * Valida: solved[81] sem nenhum zero
   */
  test('POST /solve deve retornar tabuleiro sem células vazias', async ({ authenticatedPage }) => {
    // Primeiro gera um puzzle
    const newRes  = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/sudoku/new?difficulty=easy'
    );
    const { board } = await newRes.json();

    // Pede ao backend para resolver
    const solveRes = await authenticatedPage.request.post(
      'http://localhost:8150/api/games/sudoku/solve',
      { data: { board } }
    );
    expect(solveRes.ok()).toBe(true);

    const { solved } = await solveRes.json();
    expect(solved).toHaveLength(81);

    // Nenhuma célula pode ser zero
    for (const v of solved) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

});

// ── UI Tests ──────────────────────────────────────────────────────────────────

test.describe('Sudoku — Interface (UI)', () => {

  /**
   * TESTE 6 — Grid renderiza 81 células @smoke
   *
   * Objetivo: verificar a renderização inicial do tabuleiro.
   * Tipo: UI / Smoke
   */
  test('deve renderizar 81 células no grid ao carregar @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sudokuPage = new SudokuPage(page);
    await sudokuPage.goto();

    const count = await sudokuPage.allCells.count();
    expect(count).toBe(81);
  });

  /**
   * TESTE 7 — Células fixas são somente-leitura
   *
   * Objetivo: verificar que o usuário não pode editar valores pré-preenchidos.
   * Tipo: UI / Funcional
   */
  test('células pré-preenchidas devem ser somente-leitura', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sudokuPage = new SudokuPage(page);
    await sudokuPage.goto();

    const fixedCount = await page.evaluate(() => {
      return [...document.querySelectorAll('#sGrid input')]
        .filter(inp => inp.readOnly).length;
    });

    // Deve haver pelo menos 23 células fixas (dificuldade hard)
    expect(fixedCount).toBeGreaterThan(20);
  });

  /**
   * TESTE 8 — Células não-fixas aceitam apenas 1-9
   *
   * Objetivo: verificar que letras e zero são filtrados pelo JS.
   * Tipo: UI / Validação de campo
   */
  test('células editáveis devem filtrar caracteres inválidos', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sudokuPage = new SudokuPage(page);
    await sudokuPage.goto();

    // Encontra a primeira célula não-fixa
    const editableInput = page.locator('#sGrid input:not([readonly])').first();
    await editableInput.click();

    // Tenta digitar letra — deve ser filtrada
    await editableInput.fill('a');
    expect(await editableInput.inputValue()).toBe('');

    // Tenta digitar 0 — deve ser filtrado
    await editableInput.fill('0');
    expect(await editableInput.inputValue()).toBe('');

    // Tenta digitar número válido — deve aceitar
    await editableInput.fill('5');
    expect(await editableInput.inputValue()).toBe('5');
  });

  /**
   * TESTE 9 — Botão Resolver preenche o board e exibe vitória
   *
   * Objetivo: verificar o fluxo completo de resolução automática.
   * Tipo: UI / E2E
   * Estratégia: o botão chama POST /api/games/sudoku/solve → preenche
   *             todos os campos → validateBoard() detecta complete=true → overlay
   */
  test('botão Resolver deve preencher o board e exibir overlay de vitória @smoke', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sudokuPage = new SudokuPage(page);
    await sudokuPage.goto();

    await sudokuPage.clickSolve();

    // Aguarda a resposta da API e preenchimento dos campos
    await page.waitForTimeout(500);

    // Nenhuma célula editável deve estar vazia
    const emptyCount = await sudokuPage.countEmptyCells();
    expect(emptyCount).toBe(0);

    // Overlay de vitória deve aparecer
    await sudokuPage.waitForWin();
    expect(await sudokuPage.isWinHidden()).toBe(false);
  });

  /**
   * TESTE 10 — Botão Limpar apaga células não-fixas
   *
   * Objetivo: verificar que Limpar reseta as entradas do usuário.
   * Tipo: UI / Funcional
   */
  test('botão Limpar deve apagar células editadas pelo usuário', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sudokuPage = new SudokuPage(page);
    await sudokuPage.goto();

    // Preenche algumas células editáveis
    const editableInputs = page.locator('#sGrid input:not([readonly])');
    const count = await editableInputs.count();

    if (count > 0) {
      await editableInputs.first().fill('3');
    }

    // Clica em Limpar
    await sudokuPage.clickClear();

    // Todas as células editáveis devem estar vazias
    const emptyAfter = await sudokuPage.countEmptyCells();
    expect(emptyAfter).toBe(count);
  });

  /**
   * TESTE 11 — Troca de dificuldade gera novo tabuleiro
   *
   * Objetivo: verificar que mudar a dificuldade reinicia o jogo.
   * Tipo: UI / Funcional
   */
  test('mudar dificuldade deve gerar novo tabuleiro com densidade diferente', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sudokuPage = new SudokuPage(page);
    await sudokuPage.goto();

    // Lê o board em fácil
    const boardEasy = await sudokuPage.readBoard();
    const fixedEasy = boardEasy.filter(v => v !== 0).length;

    // Muda para difícil
    await sudokuPage.setDifficulty('hard');
    await page.waitForTimeout(600); // aguarda API + render

    const boardHard = await sudokuPage.readBoard();
    const fixedHard = boardHard.filter(v => v !== 0).length;

    // Hard deve ter menos células preenchidas que easy
    expect(fixedHard).toBeLessThan(fixedEasy);
  });

  /**
   * TESTE 12 — Screenshot do estado de erro visual
   *
   * Objetivo: documentar o feedback de conflito (célula vermelha).
   * Tipo: UI / Documentação
   */
  test('deve mostrar célula vermelha ao inserir valor em conflito', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sudokuPage = new SudokuPage(page);
    await sudokuPage.goto();

    // Pega dois inputs editáveis na mesma linha (linha 0 = índices 0-8)
    const editables = await page.evaluate(() => {
      return [...document.querySelectorAll('#sGrid input:not([readonly])')]
        .map((inp, globalIdx) => ({
          globalIdx: [...document.querySelectorAll('#sGrid input')].indexOf(inp),
          row: Math.floor(
            [...document.querySelectorAll('#sGrid input')].indexOf(inp) / 9
          ),
        }));
    });

    // Agrupa editáveis por linha
    const byRow = {};
    for (const e of editables) {
      if (!byRow[e.row]) byRow[e.row] = [];
      byRow[e.row].push(e.globalIdx);
    }

    // Procura linha com pelo menos 2 editáveis
    const rowWithTwo = Object.entries(byRow).find(([, idxs]) => idxs.length >= 2);
    if (!rowWithTwo) {
      test.skip(); // não há linha com 2 editáveis no puzzle atual
      return;
    }

    const [, idxs] = rowWithTwo;
    await sudokuPage.typeInCell(idxs[0], 7);
    await sudokuPage.typeInCell(idxs[1], 7); // conflito: dois 7s na mesma linha

    await page.waitForTimeout(300);

    const invalidCount = await sudokuPage.invalidCells.count();
    expect(invalidCount).toBeGreaterThan(0);

    // Screenshot para o TCC
    await page.screenshot({ path: 'screenshots/sudoku-conflito.png', fullPage: true });
  });

});
