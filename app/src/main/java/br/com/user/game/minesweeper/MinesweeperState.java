package br.com.user.game.minesweeper;

/**
 * Estado completo de uma partida de Campo Minado.
 * Serializado como JSON e enviado ao frontend a cada ação.
 */
public class MinesweeperState {

    private String gameId;

    /**
     * Células do campo em ordem linha-a-linha (flat array de rows × cols).
     * Acesso: índice = row * cols + col.
     */
    private MinesweeperCell[] cells;

    private int rows;
    private int cols;

    /** Total de minas na partida. */
    private int totalMines;

    /** Bandeiras colocadas pelo jogador. */
    private int flagCount;

    /** Células seguras reveladas até agora. */
    private int revealedCount;

    /** Dificuldade: "easy", "medium" ou "hard". */
    private String difficulty;

    /**
     * true enquanto o primeiro clique ainda não ocorreu.
     * As minas são posicionadas somente após o primeiro clique
     * para garantir que o jogador nunca perde na primeira jogada.
     */
    private boolean firstClick;

    /** true quando o jogador revelou uma mina (derrota). */
    private boolean gameOver;

    /** true quando todas as células seguras foram reveladas (vitória). */
    private boolean gameWon;

    /** Mensagem de feedback. */
    private String message;

    // ─── Getters e Setters ────────────────────────────────────────────────────

    public String getGameId()              { return gameId; }
    public void   setGameId(String v)      { this.gameId = v; }

    public MinesweeperCell[] getCells()        { return cells; }
    public void              setCells(MinesweeperCell[] v) { this.cells = v; }

    public int  getRows()                  { return rows; }
    public void setRows(int v)             { this.rows = v; }

    public int  getCols()                  { return cols; }
    public void setCols(int v)             { this.cols = v; }

    public int  getTotalMines()            { return totalMines; }
    public void setTotalMines(int v)       { this.totalMines = v; }

    public int  getFlagCount()             { return flagCount; }
    public void setFlagCount(int v)        { this.flagCount = v; }

    public int  getRevealedCount()         { return revealedCount; }
    public void setRevealedCount(int v)    { this.revealedCount = v; }

    public String getDifficulty()          { return difficulty; }
    public void   setDifficulty(String v)  { this.difficulty = v; }

    public boolean isFirstClick()          { return firstClick; }
    public void    setFirstClick(boolean v){ this.firstClick = v; }

    public boolean isGameOver()            { return gameOver; }
    public void    setGameOver(boolean v)  { this.gameOver = v; }

    public boolean isGameWon()             { return gameWon; }
    public void    setGameWon(boolean v)   { this.gameWon = v; }

    public String getMessage()             { return message; }
    public void   setMessage(String v)     { this.message = v; }
}
