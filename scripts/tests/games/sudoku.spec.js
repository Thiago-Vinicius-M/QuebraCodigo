/**
 * sudoku.spec.js - Testes do Sudoku
 *
 * Tipo: E2E / UI
 *
 * Regras de negocio (geracao, conflitos, solve) migraram para JUnit:
 *   app/src/test/java/br/com/user/game/sudoku/SudokuServiceTest.java
 *
 * Aqui permanece a validacao de interface.
 */

import { test, expect } from '../../fixtures/auth.fixture.js';
import { SudokuPage } from '../../pages/SudokuPage.js';

test.describe('Sudoku - Interface (UI)', () => {

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
