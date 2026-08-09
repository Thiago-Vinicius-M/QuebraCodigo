package br.com.user.game.minesweeper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Sprint 4 — regras do Minesweeper em JUnit.
 */
class MinesweeperServiceTest {

    private MinesweeperService service;

    @BeforeEach
    void setUp() {
        service = new MinesweeperService();
    }

    @Test
    void newGame_deveConfigurarDificuldadesCorretas() {
        MinesweeperState easy = service.newGame("easy");
        MinesweeperState medium = service.newGame("medium");
        MinesweeperState hard = service.newGame("hard");

        assertThat(easy.getRows()).isEqualTo(8);
        assertThat(easy.getCols()).isEqualTo(8);
        assertThat(easy.getTotalMines()).isEqualTo(10);
        assertThat(easy.getCells()).hasSize(64);

        assertThat(medium.getCells()).hasSize(196);
        assertThat(medium.getTotalMines()).isEqualTo(30);

        assertThat(hard.getCells()).hasSize(400);
        assertThat(hard.getTotalMines()).isEqualTo(80);
    }

    @Test
    void primeiroClique_nuncaDeveCausarGameOver() {
        for (int i = 0; i < 20; i++) {
            MinesweeperState state = service.newGame("easy");
            MinesweeperState after = service.reveal(state.getGameId(), 0, 0);

            assertThat(after.isGameOver())
                    .as("primeiro clique em (0,0) na tentativa %s", i)
                    .isFalse();
            assertThat(after.isFirstClick()).isFalse();
            assertThat(after.getRevealedCount()).isGreaterThanOrEqualTo(1);
        }
    }

    @Test
    void flag_deveAlternarBandeiraEContador() {
        MinesweeperState state = service.newGame("easy");
        String id = state.getGameId();

        MinesweeperState flagged = service.flag(id, 1, 1);
        assertThat(flagged.getCells()[1 * 8 + 1].isFlagged()).isTrue();
        assertThat(flagged.getFlagCount()).isEqualTo(1);

        MinesweeperState unflagged = service.flag(id, 1, 1);
        assertThat(unflagged.getCells()[1 * 8 + 1].isFlagged()).isFalse();
        assertThat(unflagged.getFlagCount()).isZero();
    }

    @Test
    void hint_antesDoPrimeiroCliqueNaoDeveRevelar() {
        MinesweeperState state = service.newGame("easy");
        MinesweeperState after = service.hint(state.getGameId());

        assertThat(after.isFirstClick()).isTrue();
        assertThat(after.getRevealedCount()).isZero();
    }

    @Test
    void hint_aposPrimeiroCliqueDeveRevelarCelulaSegura() {
        MinesweeperState state = service.newGame("easy");
        service.reveal(state.getGameId(), 0, 0);
        int before = service.getState(state.getGameId()).getRevealedCount();

        MinesweeperState afterHint = service.hint(state.getGameId());

        assertThat(afterHint.getRevealedCount()).isGreaterThanOrEqualTo(before);
        assertThat(afterHint.isGameOver()).isFalse();
    }
}
