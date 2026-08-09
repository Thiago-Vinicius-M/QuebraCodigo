package br.com.user.game.sudoku;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Sprint 2 — regras do Sudoku em JUnit (substitui testes de API do Playwright).
 */
class SudokuServiceTest {

    private SudokuService service;

    @BeforeEach
    void setUp() {
        service = new SudokuService();
    }

    @Test
    void newGame_deveRetornarBoardCom81CelulasEGiven() {
        SudokuState state = service.newGame("easy");

        assertThat(state.getBoard()).hasSize(81);
        assertThat(state.getGiven()).hasSize(81);
        assertThat(state.getDifficulty()).isEqualTo("easy");
        assertThat(state.getGameId()).isNotBlank();
    }

    @Test
    void newGame_facilDeveTerMaisCelulasFixasQueDificil() {
        SudokuState easy = service.newGame("easy");
        SudokuState hard = service.newGame("hard");

        long easyGiven = countGiven(easy);
        long hardGiven = countGiven(hard);

        assertThat(easyGiven).isGreaterThan(hardGiven);
        assertThat(easyGiven).isEqualTo(41); // 81 - 40
        assertThat(hardGiven).isEqualTo(23); // 81 - 58
    }

    @Test
    void place_deveDetectarConflitoNaMesmaLinha() {
        SudokuState state = service.newGame("easy");
        int[] editable = findTwoEditableInSameRow(state);
        int value = findSafeValueForCell(state, editable[0]);

        service.place(state.getGameId(), editable[0], value);
        SudokuState after = service.place(state.getGameId(), editable[1], value);

        assertThat(after.getConflicts()[editable[0]]).isTrue();
        assertThat(after.getConflicts()[editable[1]]).isTrue();
        assertThat(after.isGameOver()).isFalse();
    }

    @Test
    void place_deveDetectarConflitoNaMesmaColuna() {
        SudokuState state = service.newGame("easy");
        int[] editable = findTwoEditableInSameColumn(state);
        int value = findSafeValueForCell(state, editable[0]);

        service.place(state.getGameId(), editable[0], value);
        SudokuState after = service.place(state.getGameId(), editable[1], value);

        assertThat(after.getConflicts()[editable[0]]).isTrue();
        assertThat(after.getConflicts()[editable[1]]).isTrue();
    }

    @Test
    void solve_devePreencherTabuleiroSemVaziosNemConflitos() {
        SudokuState state = service.newGame("medium");
        SudokuState solved = service.solve(state.getGameId());

        assertThat(solved.getBoard()).doesNotContain(0);
        assertThat(solved.getConflicts()).containsOnly(false);
        assertThat(solved.isGameOver()).isTrue();
    }

    @Test
    void place_emCelulaFixaDeveFalhar() {
        SudokuState state = service.newGame("easy");
        int fixedIndex = findFixedIndex(state);

        assertThatThrownBy(() -> service.place(state.getGameId(), fixedIndex, 5))
                .isInstanceOf(IllegalStateException.class);
    }

    private long countGiven(SudokuState state) {
        long count = 0;
        for (boolean given : state.getGiven()) {
            if (given) count++;
        }
        return count;
    }

    private int findFixedIndex(SudokuState state) {
        for (int i = 0; i < state.getGiven().length; i++) {
            if (state.getGiven()[i]) return i;
        }
        throw new IllegalStateException("Nenhuma célula fixa");
    }

    private int[] findTwoEditableInSameRow(SudokuState state) {
        for (int row = 0; row < 9; row++) {
            int first = -1;
            for (int col = 0; col < 9; col++) {
                int idx = row * 9 + col;
                if (!state.getGiven()[idx]) {
                    if (first == -1) first = idx;
                    else return new int[]{first, idx};
                }
            }
        }
        throw new IllegalStateException("Não há duas editáveis na mesma linha");
    }

    private int[] findTwoEditableInSameColumn(SudokuState state) {
        for (int col = 0; col < 9; col++) {
            int first = -1;
            for (int row = 0; row < 9; row++) {
                int idx = row * 9 + col;
                if (!state.getGiven()[idx]) {
                    if (first == -1) first = idx;
                    else return new int[]{first, idx};
                }
            }
        }
        throw new IllegalStateException("Não há duas editáveis na mesma coluna");
    }

    private int findSafeValueForCell(SudokuState state, int index) {
        for (int value = 1; value <= 9; value++) {
            return value;
        }
        return 1;
    }
}
