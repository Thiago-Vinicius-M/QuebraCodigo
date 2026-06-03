package br.com.user.game.memory;

/**
 * Representa uma carta do Jogo da Memória.
 */
public class MemoryCard {

    /** Posição da carta no grid (0-based). */
    private int index;

    /**
     * Identificador do par ao qual esta carta pertence.
     * Duas cartas com o mesmo pairId formam um par.
     * Valor: emoji string (ex: "🍎").
     */
    private String pairValue;

    /** true se a carta está virada para cima (face visível). */
    private boolean flipped;

    /** true se o par já foi encontrado (permanece visível). */
    private boolean matched;

    public MemoryCard() {}

    public MemoryCard(int index, String pairValue) {
        this.index = index;
        this.pairValue = pairValue;
        this.flipped = false;
        this.matched = false;
    }

    // ─── Getters e Setters ────────────────────────────────────────────────────

    public int getIndex() { return index; }
    public void setIndex(int index) { this.index = index; }

    public String getPairValue() { return pairValue; }
    public void setPairValue(String pairValue) { this.pairValue = pairValue; }

    public boolean isFlipped() { return flipped; }
    public void setFlipped(boolean flipped) { this.flipped = flipped; }

    public boolean isMatched() { return matched; }
    public void setMatched(boolean matched) { this.matched = matched; }
}
