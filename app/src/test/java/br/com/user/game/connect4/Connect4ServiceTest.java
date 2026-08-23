package br.com.user.game.connect4;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Sprint 3 — regras do Connect 4 em JUnit (substitui testes de API do Playwright).
 */
class Connect4ServiceTest {

    private Connect4Service service;

    @BeforeEach
    void setUp() {
        service = new Connect4Service();
    }

    @Test
    void newGame_deveCriarGrid6x7VazioComTurnoRed() {
        Connect4State state = service.newGame();

        assertThat(state.getBoard()).hasDimensions(6, 7);
        assertThat(state.getCurrentPlayer()).isEqualTo("RED");
        assertThat(state.isGameOver()).isFalse();
        assertThat(state.getWinner()).isNull();
    }

    @Test
    void makeMove_deveInserirPecaNaLinhaMaisBaixa() {
        Connect4State state = service.newGame();
        Connect4State after = service.makeMove(state.getGameId(), 3);

        assertThat(after.getBoard()[5][3]).isEqualTo("RED");
        assertThat(after.getCurrentPlayer()).isEqualTo("YELLOW");
    }

    @Test
    void makeMove_deveDetectarVitoriaHorizontal() {
        Connect4State state = service.newGame();
        String id = state.getGameId();

        // RED nas colunas 0-2, YELLOW nas 0-2 (empilha), RED completa 0-3 na linha de baixo? 
        // Melhor: RED joga 0,1,2,3 na mesma linha inferior intercalando YELLOW em outra coluna.
        service.makeMove(id, 0); // RED
        service.makeMove(id, 6); // YELLOW
        service.makeMove(id, 1); // RED
        service.makeMove(id, 6); // YELLOW
        service.makeMove(id, 2); // RED
        service.makeMove(id, 6); // YELLOW
        Connect4State win = service.makeMove(id, 3); // RED vence horizontal

        assertThat(win.isGameOver()).isTrue();
        assertThat(win.getWinner()).isEqualTo("RED");
    }

    @Test
    void makeMove_deveDetectarVitoriaVertical() {
        Connect4State state = service.newGame();
        String id = state.getGameId();

        service.makeMove(id, 0); // RED
        service.makeMove(id, 1); // YELLOW
        service.makeMove(id, 0); // RED
        service.makeMove(id, 1); // YELLOW
        service.makeMove(id, 0); // RED
        service.makeMove(id, 1); // YELLOW
        Connect4State win = service.makeMove(id, 0); // RED vertical

        assertThat(win.isGameOver()).isTrue();
        assertThat(win.getWinner()).isEqualTo("RED");
    }

    @Test
    void makeMove_colunaCheiaDeveLancarErro() {
        Connect4State state = service.newGame();
        String id = state.getGameId();

        for (int i = 0; i < 6; i++) {
            service.makeMove(id, 0);
        }

        assertThatThrownBy(() -> service.makeMove(id, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cheia");
    }
}
