package br.com.user.game.game2048;

/**
 * Representa o estado completo de uma partida do 2048.
 * Serializado como JSON e enviado ao frontend a cada ação.
 */
public class Game2048State {

    private String gameId;

    /** Grade 4×4 com os valores das peças (0 = célula vazia). */
    private int[][] grid;

    private int score;

    /** true quando alguma peça atingiu o valor 2048. */
    private boolean won;

    /** true quando não há mais movimentos possíveis. */
    private boolean gameOver;

    /** true se o último movimento alterou o tabuleiro. */
    private boolean moved;

    /** true quando há um estado anterior disponível para desfazer. */
    private boolean canUndo;

    /** Mensagem de feedback para o jogador. */
    private String message;

    // ─── Campos internos (transient = não são enviados ao cliente) ────────────

    /** Cópia do grid antes do último movimento (para o Desfazer). */
    private transient int[][] previousGrid;

    /** Pontuação antes do último movimento. */
    private transient int previousScore;

    // ─── Getters e Setters ──────────────────────────────────────────────────────

    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }

    public int[][] getGrid() { return grid; }
    public void setGrid(int[][] grid) { this.grid = grid; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public boolean isWon() { return won; }
    public void setWon(boolean won) { this.won = won; }

    public boolean isGameOver() { return gameOver; }
    public void setGameOver(boolean gameOver) { this.gameOver = gameOver; }

    public boolean isMoved() { return moved; }
    public void setMoved(boolean moved) { this.moved = moved; }

    public boolean isCanUndo() { return canUndo; }
    public void setCanUndo(boolean canUndo) { this.canUndo = canUndo; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int[][] getPreviousGrid() { return previousGrid; }
    public void setPreviousGrid(int[][] previousGrid) { this.previousGrid = previousGrid; }

    public int getPreviousScore() { return previousScore; }
    public void setPreviousScore(int previousScore) { this.previousScore = previousScore; }
}
