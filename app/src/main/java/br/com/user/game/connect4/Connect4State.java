package br.com.user.game.connect4;

/**
 * Representa o estado completo de uma partida de Connect 4.
 * Serializado como JSON e enviado ao frontend.
 */
public class Connect4State {

    public static final int ROWS = 6;
    public static final int COLS = 7;

    private String gameId;

    /**
     * Tabuleiro 6x7.
     * Valores possíveis por célula: null (vazia), "RED", "YELLOW".
     */
    private String[][] board;

    /** Jogador da vez: "RED" ou "YELLOW". */
    private String currentPlayer;

    /** Vencedor: null, "RED", "YELLOW" ou "DRAW". */
    private String winner;

    private boolean gameOver;

    /** Mensagem de feedback (ex: "RED venceu!", "Empate!"). */
    private String message;

    // ─── Getters e Setters ──────────────────────────────────────────────────────

    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }

    public String[][] getBoard() { return board; }
    public void setBoard(String[][] board) { this.board = board; }

    public String getCurrentPlayer() { return currentPlayer; }
    public void setCurrentPlayer(String currentPlayer) { this.currentPlayer = currentPlayer; }

    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }

    public boolean isGameOver() { return gameOver; }
    public void setGameOver(boolean gameOver) { this.gameOver = gameOver; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
