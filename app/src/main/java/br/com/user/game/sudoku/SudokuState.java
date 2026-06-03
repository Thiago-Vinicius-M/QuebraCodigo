package br.com.user.game.sudoku;

/**
 * Representa o estado completo de uma partida de Sudoku.
 * Serializado como JSON e enviado ao frontend a cada ação.
 *
 * O array {@code solution} é marcado como transient e nunca
 * é serializado — fica apenas na memória do servidor.
 */
public class SudokuState {

    private String gameId;

    /**
     * Tabuleiro atual com 81 posições (9×9).
     * 0 = célula vazia; 1-9 = valor preenchido.
     */
    private int[] board;

    /**
     * Solução completa do puzzle — transient, nunca enviada ao cliente.
     */
    private transient int[] solution;

    /**
     * Células fixas (dadas pelo puzzle); o jogador não pode alterá-las.
     */
    private boolean[] given;

    /**
     * Células com conflito (linha/coluna/bloco) — destaque vermelho.
     */
    private boolean[] conflicts;

    /**
     * Células preenchidas pelo usuário e sem conflito — destaque verde.
     */
    private boolean[] correct;

    /** Dificuldade: "easy", "medium" ou "hard". */
    private String difficulty;

    /** true quando o tabuleiro está completo e sem conflitos. */
    private boolean gameOver;

    /** Mensagem de feedback. */
    private String message;

    // ─── Getters e Setters ────────────────────────────────────────────────────

    public String getGameId()              { return gameId; }
    public void   setGameId(String v)      { this.gameId = v; }

    public int[]  getBoard()               { return board; }
    public void   setBoard(int[] v)        { this.board = v; }

    public int[]  getSolution()            { return solution; }
    public void   setSolution(int[] v)     { this.solution = v; }

    public boolean[] getGiven()            { return given; }
    public void      setGiven(boolean[] v) { this.given = v; }

    public boolean[] getConflicts()            { return conflicts; }
    public void      setConflicts(boolean[] v) { this.conflicts = v; }

    public boolean[] getCorrect()            { return correct; }
    public void      setCorrect(boolean[] v) { this.correct = v; }

    public String getDifficulty()          { return difficulty; }
    public void   setDifficulty(String v)  { this.difficulty = v; }

    public boolean isGameOver()            { return gameOver; }
    public void    setGameOver(boolean v)  { this.gameOver = v; }

    public String getMessage()             { return message; }
    public void   setMessage(String v)     { this.message = v; }
}
