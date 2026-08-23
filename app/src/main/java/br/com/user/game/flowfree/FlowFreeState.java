package br.com.user.game.flowfree;

import java.util.List;

/**
 * Estado completo de uma partida de Flow Free.
 * Serializado como JSON e enviado ao frontend.
 */
public class FlowFreeState {

    private String gameId;

    /** Índice do nível atual (0-based). */
    private int levelIndex;

    /** Tamanho do grid (size × size). */
    private int size;

    /**
     * Grid flat (size*size) com os valores das células.
     * 0 = vazio; 1–N = cor do fluxo.
     */
    private int[] grid;

    /**
     * Endpoints fixos de cada cor: pares de posições [row, col].
     * Cada cor possui exatamente 2 endpoints.
     * endpoints[colorIndex] = [[r1,c1],[r2,c2]]
     */
    private int[][][] endpoints;

    /** Número de cores no nível. */
    private int numColors;

    /** Dicas restantes nesta partida. */
    private int hintsRemaining;

    /** true quando todos os pares estão conectados e o grid está preenchido. */
    private boolean gameWon;

    /** Total de níveis disponíveis. */
    private int totalLevels;

    /** Mensagem de feedback. */
    private String message;

    // ─── Getters e Setters ────────────────────────────────────────────────────

    public String getGameId()               { return gameId; }
    public void   setGameId(String v)       { this.gameId = v; }

    public int  getLevelIndex()             { return levelIndex; }
    public void setLevelIndex(int v)        { this.levelIndex = v; }

    public int  getSize()                   { return size; }
    public void setSize(int v)              { this.size = v; }

    public int[] getGrid()                  { return grid; }
    public void  setGrid(int[] v)           { this.grid = v; }

    public int[][][] getEndpoints()              { return endpoints; }
    public void      setEndpoints(int[][][] v)   { this.endpoints = v; }

    public int  getNumColors()              { return numColors; }
    public void setNumColors(int v)         { this.numColors = v; }

    public int  getHintsRemaining()         { return hintsRemaining; }
    public void setHintsRemaining(int v)    { this.hintsRemaining = v; }

    public boolean isGameWon()              { return gameWon; }
    public void    setGameWon(boolean v)    { this.gameWon = v; }

    public int  getTotalLevels()            { return totalLevels; }
    public void setTotalLevels(int v)       { this.totalLevels = v; }

    public String getMessage()              { return message; }
    public void   setMessage(String v)      { this.message = v; }
}
