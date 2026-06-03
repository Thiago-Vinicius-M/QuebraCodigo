package br.com.user.game.minesweeper;

/**
 * Representa uma célula do Campo Minado enviada ao frontend.
 *
 * O campo {@code mine} só é {@code true} quando o jogo termina
 * (game over ou vitória), revelando a posição das minas.
 * Durante o jogo, a posição das minas fica apenas no servidor
 * (array {@code mineMap} no {@code MinesweeperService}).
 */
public class MinesweeperCell {

    /** true quando a célula foi revelada pelo jogador. */
    private boolean revealed;

    /** true quando o jogador colocou uma bandeira aqui. */
    private boolean flagged;

    /**
     * true quando há uma mina nesta célula.
     * Só é enviado como {@code true} após o fim do jogo.
     */
    private boolean mine;

    /** true na mina específica que causou o game over (destaque vermelho). */
    private boolean exploded;

    /**
     * Quantidade de minas nos 8 vizinhos (0–8).
     * Significativo apenas quando {@code revealed == true && mine == false}.
     */
    private int adjacentMines;

    public MinesweeperCell() {}

    // ─── Getters e Setters ────────────────────────────────────────────────────

    public boolean isRevealed()        { return revealed; }
    public void    setRevealed(boolean v) { this.revealed = v; }

    public boolean isFlagged()         { return flagged; }
    public void    setFlagged(boolean v)  { this.flagged = v; }

    public boolean isMine()            { return mine; }
    public void    setMine(boolean v)  { this.mine = v; }

    public boolean isExploded()           { return exploded; }
    public void    setExploded(boolean v) { this.exploded = v; }

    public int  getAdjacentMines()     { return adjacentMines; }
    public void setAdjacentMines(int v){ this.adjacentMines = v; }
}
