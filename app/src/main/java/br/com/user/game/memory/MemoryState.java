package br.com.user.game.memory;

import java.util.List;

/**
 * Representa o estado completo de uma partida do Jogo da Memória.
 * Serializado como JSON e enviado ao frontend a cada ação.
 */
public class MemoryState {

    private String gameId;

    /** Lista de todas as cartas do grid (embaralhadas). */
    private List<MemoryCard> cards;

    /** Número de colunas do grid (4, 5 ou 6). */
    private int cols;

    /** Número de linhas do grid (sempre 4). */
    private int rows;

    /** Número de movimentos realizados (cada movimento = 2 cartas viradas). */
    private int moves;

    /** Pares já encontrados. */
    private int matchedPairs;

    /** Total de pares no jogo. */
    private int totalPairs;

    /** true quando todos os pares foram encontrados. */
    private boolean gameOver;

    /**
     * Índice da primeira carta virada aguardando a segunda.
     * -1 indica que nenhuma carta está aguardando par.
     */
    private int firstFlippedIndex;

    /**
     * true quando duas cartas sem par estão viradas e aguardam ser
     * revertidas pelo frontend (após animação de ~600ms).
     */
    private boolean pendingReset;

    /** Mensagem de feedback para o jogador. */
    private String message;

    // ─── Getters e Setters ────────────────────────────────────────────────────

    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }

    public List<MemoryCard> getCards() { return cards; }
    public void setCards(List<MemoryCard> cards) { this.cards = cards; }

    public int getCols() { return cols; }
    public void setCols(int cols) { this.cols = cols; }

    public int getRows() { return rows; }
    public void setRows(int rows) { this.rows = rows; }

    public int getMoves() { return moves; }
    public void setMoves(int moves) { this.moves = moves; }

    public int getMatchedPairs() { return matchedPairs; }
    public void setMatchedPairs(int matchedPairs) { this.matchedPairs = matchedPairs; }

    public int getTotalPairs() { return totalPairs; }
    public void setTotalPairs(int totalPairs) { this.totalPairs = totalPairs; }

    public boolean isGameOver() { return gameOver; }
    public void setGameOver(boolean gameOver) { this.gameOver = gameOver; }

    public int getFirstFlippedIndex() { return firstFlippedIndex; }
    public void setFirstFlippedIndex(int firstFlippedIndex) { this.firstFlippedIndex = firstFlippedIndex; }

    public boolean isPendingReset() { return pendingReset; }
    public void setPendingReset(boolean pendingReset) { this.pendingReset = pendingReset; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
