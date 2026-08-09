package br.com.user.game.memory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Sprint 1 — regras do Memory em JUnit (substitui testes de API do Playwright).
 */
class MemoryServiceTest {

    private MemoryService service;

    @BeforeEach
    void setUp() {
        service = new MemoryService();
    }

    @Test
    void newGame_deveCriarDeckComTamanhoCorretoParaCadaGrid() {
        assertThat(service.newGame(4, 4).getCards()).hasSize(16);
        assertThat(service.newGame(5, 4).getCards()).hasSize(20);
        assertThat(service.newGame(6, 4).getCards()).hasSize(24);
    }

    @Test
    void newGame_cadaImagemDeveAparecerExatamenteDuasVezes() {
        MemoryState state = service.newGame(4, 4);

        Map<String, Integer> counts = new HashMap<>();
        for (MemoryCard card : state.getCards()) {
            counts.merge(card.getPairValue(), 1, Integer::sum);
        }

        assertThat(counts.values()).allMatch(count -> count == 2);
        assertThat(counts).hasSize(8);
    }

    @Test
    void newGame_gridImparDeveSerRejeitado() {
        assertThatThrownBy(() -> service.newGame(3, 3))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void calculateScore_4x4_deveSeguirFormulaDocumentada() {
        MemoryService.ScoreResult result = service.calculateScore(8, 30, 16);
        // base=80 + max(0,60-6)=54 + max(0,24-8)=16 → 150; coins=150/25=6
        assertThat(result.points()).isEqualTo(150);
        assertThat(result.coins()).isEqualTo(6);
    }

    @Test
    void calculateScore_desempenhoPiorDeveGerarMenosPontos() {
        MemoryService.ScoreResult fast = service.calculateScore(8, 10, 16);
        MemoryService.ScoreResult slow = service.calculateScore(40, 300, 16);

        assertThat(fast.points()).isGreaterThan(slow.points());
    }

    @Test
    void calculateScore_basesPorTamanhoDeGrid() {
        assertThat(service.calculateScore(24, 300, 16).points()).isEqualTo(80);
        assertThat(service.calculateScore(24, 300, 20).points()).isEqualTo(110);
        assertThat(service.calculateScore(24, 300, 24).points()).isEqualTo(140);
    }

    @Test
    void flip_parCorretoDeveMarcarMatched() {
        MemoryState state = service.newGame(4, 4);
        int first = 0;
        int pair = findPairIndex(state, first);

        service.flip(state.getGameId(), first);
        MemoryState after = service.flip(state.getGameId(), pair);

        assertThat(after.getCards().get(first).isMatched()).isTrue();
        assertThat(after.getCards().get(pair).isMatched()).isTrue();
        assertThat(after.getMatchedPairs()).isEqualTo(1);
        assertThat(after.getMoves()).isEqualTo(1);
    }

    private int findPairIndex(MemoryState state, int firstIndex) {
        String value = state.getCards().get(firstIndex).getPairValue();
        for (int i = 0; i < state.getCards().size(); i++) {
            if (i != firstIndex && value.equals(state.getCards().get(i).getPairValue())) {
                return i;
            }
        }
        throw new IllegalStateException("Par não encontrado");
    }
}
