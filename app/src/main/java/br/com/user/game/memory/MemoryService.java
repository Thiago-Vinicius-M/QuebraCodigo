package br.com.user.game.memory;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Toda a lógica do Jogo da Memória.
 * As partidas ficam em memória (ConcurrentHashMap).
 */
@Service
public class MemoryService {

    /**
     * Pool de IDs das imagens das cartas (1 a 19).
     * Cada valor corresponde ao arquivo /games/img/cartas/{n}.png
     * servido pelo Spring nos recursos estáticos.
     */
    private static final List<String> IMAGE_POOL = List.of(
            "1","2","3","4","5","6","7","8","9","10",
            "11","12","13","14","15","16","17","18","19"
    );

    private final Map<String, MemoryState> games = new ConcurrentHashMap<>();

    // ─── API pública ──────────────────────────────────────────────────────────

    /**
     * Cria uma nova partida.
     *
     * @param cols número de colunas (4, 5 ou 6)
     * @param rows número de linhas (fixo em 4)
     */
    public MemoryState newGame(int cols, int rows) {
        int total = cols * rows;
        if (total % 2 != 0) {
            throw new IllegalArgumentException("O grid deve ter número par de células.");
        }
        int pairs = total / 2;

        List<String> emojis = new ArrayList<>(IMAGE_POOL.subList(0, Math.min(pairs, IMAGE_POOL.size())));
        // Se pairs > pool, recicla
        while (emojis.size() < pairs) {
            emojis.addAll(IMAGE_POOL.subList(0, Math.min(pairs - emojis.size(), IMAGE_POOL.size())));
        }
        emojis = emojis.subList(0, pairs);

        // Duplica para formar pares e embaralha
        List<String> deck = new ArrayList<>();
        emojis.forEach(e -> { deck.add(e); deck.add(e); });
        Collections.shuffle(deck);

        List<MemoryCard> cards = new ArrayList<>();
        for (int i = 0; i < deck.size(); i++) {
            cards.add(new MemoryCard(i, deck.get(i)));
        }

        MemoryState state = new MemoryState();
        state.setGameId(UUID.randomUUID().toString());
        state.setCards(cards);
        state.setCols(cols);
        state.setRows(rows);
        state.setMoves(0);
        state.setMatchedPairs(0);
        state.setTotalPairs(pairs);
        state.setGameOver(false);
        state.setFirstFlippedIndex(-1);
        state.setPendingReset(false);
        state.setMessage("Encontre todos os pares!");

        games.put(state.getGameId(), state);
        return state;
    }

    /**
     * Vira uma carta.
     * <ul>
     *   <li>1ª carta: apenas vira, aguarda a 2ª.</li>
     *   <li>2ª carta: compara com a 1ª.
     *     <ul>
     *       <li>Par: ambas marcadas como matched.</li>
     *       <li>Sem par: pendingReset=true; o frontend reverte após animação.</li>
     *     </ul>
     *   </li>
     * </ul>
     */
    public MemoryState flip(String gameId, int cardIndex) {
        MemoryState state = getState(gameId);

        if (state.isGameOver()) {
            throw new IllegalStateException("Partida já encerrada.");
        }
        if (state.isPendingReset()) {
            throw new IllegalStateException("Aguardando reversão das cartas. Chame /reset-pending primeiro.");
        }

        MemoryCard card = state.getCards().get(cardIndex);

        if (card.isMatched() || card.isFlipped()) {
            return state; // clique inválido, ignora
        }

        card.setFlipped(true);

        if (state.getFirstFlippedIndex() == -1) {
            // Primeira carta da jogada
            state.setFirstFlippedIndex(cardIndex);
            state.setMessage("Escolha a segunda carta...");
        } else {
            // Segunda carta da jogada
            state.setMoves(state.getMoves() + 1);
            MemoryCard first = state.getCards().get(state.getFirstFlippedIndex());

            if (first.getPairValue().equals(card.getPairValue())) {
                // Par encontrado!
                first.setMatched(true);
                card.setMatched(true);
                state.setMatchedPairs(state.getMatchedPairs() + 1);
                state.setFirstFlippedIndex(-1);
                state.setPendingReset(false);

                if (state.getMatchedPairs() == state.getTotalPairs()) {
                    state.setGameOver(true);
                    state.setMessage("Parabéns! Você encontrou todos os pares em " + state.getMoves() + " movimentos! 🎉");
                } else {
                    state.setMessage("Par encontrado! Continue!");
                }
            } else {
                // Sem par — frontend precisa chamar /reset-pending após animação
                state.setFirstFlippedIndex(-1);
                state.setPendingReset(true);
                state.setMessage("Não é um par. Tente novamente!");
            }
        }

        return state;
    }

    /**
     * Reverte as duas cartas sem par que estão viradas (chamado pelo frontend após animação).
     */
    public MemoryState resetPending(String gameId) {
        MemoryState state = getState(gameId);

        if (!state.isPendingReset()) {
            return state; // nada a fazer
        }

        state.getCards().stream()
                .filter(c -> c.isFlipped() && !c.isMatched())
                .forEach(c -> c.setFlipped(false));

        state.setPendingReset(false);
        state.setFirstFlippedIndex(-1);
        state.setMessage("Escolha uma carta...");

        return state;
    }

    /** Retorna o estado de uma partida existente. */
    public MemoryState getState(String gameId) {
        MemoryState state = games.get(gameId);
        if (state == null) {
            throw new IllegalStateException("Partida não encontrada: " + gameId);
        }
        return state;
    }

    /** Remove uma partida da memória. */
    public void removeGame(String gameId) {
        games.remove(gameId);
    }
}
