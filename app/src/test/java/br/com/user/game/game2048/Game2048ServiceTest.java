package br.com.user.game.game2048;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Sprint 5 — regras do 2048 em JUnit.
 */
class Game2048ServiceTest {

    private Game2048Service service;

    @BeforeEach
    void setUp() {
        service = new Game2048Service();
    }

    @Test
    void newGame_deveIniciarComDuasPecasEScoreZero() {
        Game2048State state = service.newGame();

        assertThat(countTiles(state.getGrid())).isEqualTo(2);
        assertThat(state.getScore()).isZero();
        assertThat(state.isCanUndo()).isFalse();
        assertThat(state.isGameOver()).isFalse();
    }

    @Test
    void move_quandoHouverDeslocamentoDeveGerarNovaPecaEHabilitarUndo() {
        Game2048State state = service.newGame();
        String id = state.getGameId();

        Game2048State after = null;
        for (String direction : new String[]{"LEFT", "RIGHT", "UP", "DOWN"}) {
            after = service.move(id, direction);
            if (after.isMoved()) break;
        }

        assertThat(after).isNotNull();
        assertThat(after.isMoved()).isTrue();
        assertThat(after.isCanUndo()).isTrue();
        assertThat(countTiles(after.getGrid())).isGreaterThanOrEqualTo(2);
    }

    @Test
    void undo_deveRestaurarGridEScoreAnteriores() {
        Game2048State state = service.newGame();
        String id = state.getGameId();

        Game2048State moved = null;
        for (String direction : new String[]{"LEFT", "RIGHT", "UP", "DOWN"}) {
            moved = service.move(id, direction);
            if (moved.isMoved()) break;
        }
        assertThat(moved.isMoved()).isTrue();

        int[][] gridBeforeUndo = deepCopy(moved.getGrid());
        int scoreBeforeUndo = moved.getScore();

        Game2048State undone = service.undo(id);

        assertThat(undone.isCanUndo()).isFalse();
        assertThat(undone.getScore()).isLessThanOrEqualTo(scoreBeforeUndo);
        assertThat(gridsEqual(undone.getGrid(), gridBeforeUndo)).isFalse();
        assertThat(countTiles(undone.getGrid())).isEqualTo(2);
    }

    @Test
    void undo_semMovimentoAnteriorDeveFalhar() {
        Game2048State state = service.newGame();

        assertThatThrownBy(() -> service.undo(state.getGameId()))
                .isInstanceOf(IllegalStateException.class);
    }

    private int countTiles(int[][] grid) {
        int count = 0;
        for (int[] row : grid) {
            for (int cell : row) {
                if (cell != 0) count++;
            }
        }
        return count;
    }

    private int[][] deepCopy(int[][] grid) {
        int[][] copy = new int[grid.length][];
        for (int i = 0; i < grid.length; i++) {
            copy[i] = grid[i].clone();
        }
        return copy;
    }

    private boolean gridsEqual(int[][] a, int[][] b) {
        for (int r = 0; r < a.length; r++) {
            for (int c = 0; c < a[r].length; c++) {
                if (a[r][c] != b[r][c]) return false;
            }
        }
        return true;
    }
}
