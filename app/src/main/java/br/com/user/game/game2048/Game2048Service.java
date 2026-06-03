package br.com.user.game.game2048;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Toda a lógica de regras do 2048 vive aqui.
 * As partidas ficam em memória (ConcurrentHashMap); para persistir,
 * basta trocar o Map por um repositório JPA.
 */
@Service
public class Game2048Service {

    private static final int SIZE     = 4;
    private static final int WIN_TILE = 2048;

    private final Map<String, Game2048State> games = new ConcurrentHashMap<>();
    private final Random rng = new Random();

    // ─── API pública ──────────────────────────────────────────────────────────

    /** Cria e armazena uma nova partida com 2 peças iniciais. */
    public Game2048State newGame() {
        int[][] grid = new int[SIZE][SIZE];
        addRandomTile(grid);
        addRandomTile(grid);

        Game2048State state = new Game2048State();
        state.setGameId(UUID.randomUUID().toString());
        state.setGrid(grid);
        state.setScore(0);
        state.setWon(false);
        state.setGameOver(false);
        state.setMoved(false);
        state.setCanUndo(false);
        state.setMessage("Use as setas para mover as peças!");

        games.put(state.getGameId(), state);
        return state;
    }

    /**
     * Executa um movimento na direção indicada.
     *
     * @param direction "UP", "DOWN", "LEFT" ou "RIGHT"
     * @throws IllegalArgumentException se a direção for inválida.
     * @throws IllegalStateException    se o jogo estiver encerrado ou não encontrado.
     */
    public Game2048State move(String gameId, String direction) {
        Game2048State state = getState(gameId);

        if (state.isGameOver()) {
            throw new IllegalStateException("Partida já encerrada.");
        }

        // Salva estado anterior para o Desfazer
        int[][] previousGrid = deepCopy(state.getGrid());
        int previousScore    = state.getScore();

        int[] scoreGained = { 0 };
        int[][] newGrid   = applyMove(state.getGrid(), direction, scoreGained);

        boolean moved = !gridsEqual(state.getGrid(), newGrid);
        state.setMoved(moved);

        if (moved) {
            state.setPreviousGrid(previousGrid);
            state.setPreviousScore(previousScore);
            state.setCanUndo(true);

            state.setGrid(newGrid);
            state.setScore(state.getScore() + scoreGained[0]);
            addRandomTile(state.getGrid());
            updateGameStatus(state);
        } else {
            state.setMessage("Sem movimento nessa direção.");
        }

        return state;
    }

    /**
     * Desfaz o último movimento.
     *
     * @throws IllegalStateException se não houver estado anterior ou jogo não encontrado.
     */
    public Game2048State undo(String gameId) {
        Game2048State state = getState(gameId);

        if (!state.isCanUndo() || state.getPreviousGrid() == null) {
            throw new IllegalStateException("Nenhum movimento para desfazer.");
        }

        state.setGrid(state.getPreviousGrid());
        state.setScore(state.getPreviousScore());
        state.setPreviousGrid(null);
        state.setCanUndo(false);
        state.setGameOver(false);
        state.setMoved(false);
        state.setMessage("Último movimento desfeito.");

        return state;
    }

    /** Retorna o estado de uma partida existente. */
    public Game2048State getState(String gameId) {
        Game2048State state = games.get(gameId);
        if (state == null) {
            throw new IllegalStateException("Partida não encontrada: " + gameId);
        }
        return state;
    }

    /** Remove uma partida da memória. */
    public void removeGame(String gameId) {
        games.remove(gameId);
    }

    // ─── Lógica de movimento ──────────────────────────────────────────────────

    /**
     * Aplica o movimento em todas as linhas/colunas conforme a direção.
     * Estratégia: normaliza sempre para "slide left" usando transposição e inversão.
     */
    private int[][] applyMove(int[][] grid, String direction, int[] scoreGained) {
        int[][] g = deepCopy(grid);

        switch (direction.toUpperCase()) {
            case "LEFT"  -> slideAllRowsLeft(g, scoreGained);
            case "RIGHT" -> { reverseRows(g); slideAllRowsLeft(g, scoreGained); reverseRows(g); }
            case "UP"    -> { transpose(g);   slideAllRowsLeft(g, scoreGained); transpose(g); }
            case "DOWN"  -> {
                transpose(g);
                reverseRows(g);
                slideAllRowsLeft(g, scoreGained);
                reverseRows(g);
                transpose(g);
            }
            default -> throw new IllegalArgumentException("Direção inválida: " + direction);
        }
        return g;
    }

    /** Desliza todas as linhas para a esquerda. */
    private void slideAllRowsLeft(int[][] g, int[] scoreGained) {
        for (int r = 0; r < SIZE; r++) {
            g[r] = slideRowLeft(g[r], scoreGained);
        }
    }

    /**
     * Desliza uma linha para a esquerda: remove zeros, mescla iguais adjacentes,
     * preenche o restante com zeros.
     */
    private int[] slideRowLeft(int[] row, int[] scoreGained) {
        // 1. Coleta não-zeros
        int[] packed = new int[SIZE];
        int pos = 0;
        for (int v : row) if (v != 0) packed[pos++] = v;

        // 2. Mescla pares iguais adjacentes
        int[] result = new int[SIZE];
        int rPos = 0;
        int i = 0;
        while (i < pos) {
            if (i + 1 < pos && packed[i] == packed[i + 1]) {
                int merged = packed[i] * 2;
                result[rPos++] = merged;
                scoreGained[0] += merged;
                i += 2;
            } else {
                result[rPos++] = packed[i];
                i++;
            }
        }
        return result; // posições restantes já são 0 (int padrão)
    }

    // ─── Transformações de grid ───────────────────────────────────────────────

    /** Inverte cada linha do grid in-place. */
    private void reverseRows(int[][] g) {
        for (int r = 0; r < SIZE; r++) {
            for (int c = 0; c < SIZE / 2; c++) {
                int tmp = g[r][c];
                g[r][c] = g[r][SIZE - 1 - c];
                g[r][SIZE - 1 - c] = tmp;
            }
        }
    }

    /** Transpõe o grid in-place (troca linhas por colunas). */
    private void transpose(int[][] g) {
        for (int r = 0; r < SIZE; r++) {
            for (int c = r + 1; c < SIZE; c++) {
                int tmp = g[r][c];
                g[r][c] = g[c][r];
                g[c][r] = tmp;
            }
        }
    }

    // ─── Estado do jogo ───────────────────────────────────────────────────────

    /** Atualiza vitória/derrota e a mensagem de feedback. */
    private void updateGameStatus(Game2048State state) {
        // Vitória: alguma peça atingiu WIN_TILE
        if (!state.isWon() && hasWinTile(state.getGrid())) {
            state.setWon(true);
            state.setMessage("Parabéns! Você chegou em " + WIN_TILE + "! 🎉");
            return;
        }

        // Derrota: sem células vazias e sem fusões possíveis
        if (!hasEmptyCell(state.getGrid()) && !canMakeMove(state.getGrid())) {
            state.setGameOver(true);
            state.setMessage("Game Over! Pontuação: " + state.getScore());
            return;
        }

        state.setMessage("Pontuação: " + state.getScore());
    }

    private boolean hasWinTile(int[][] g) {
        for (int[] row : g)
            for (int v : row)
                if (v == WIN_TILE) return true;
        return false;
    }

    private boolean hasEmptyCell(int[][] g) {
        for (int[] row : g)
            for (int v : row)
                if (v == 0) return true;
        return false;
    }

    /** Retorna true se ainda existe ao menos um par de células adjacentes iguais. */
    private boolean canMakeMove(int[][] g) {
        for (int r = 0; r < SIZE; r++) {
            for (int c = 0; c < SIZE; c++) {
                if (c + 1 < SIZE && g[r][c] == g[r][c + 1]) return true;
                if (r + 1 < SIZE && g[r][c] == g[r + 1][c]) return true;
            }
        }
        return false;
    }

    // ─── Utilitários ──────────────────────────────────────────────────────────

    /** Adiciona uma peça aleatória (90% = 2, 10% = 4) em célula vazia. */
    private void addRandomTile(int[][] g) {
        List<int[]> empty = new ArrayList<>();
        for (int r = 0; r < SIZE; r++)
            for (int c = 0; c < SIZE; c++)
                if (g[r][c] == 0) empty.add(new int[]{r, c});

        if (empty.isEmpty()) return;
        int[] cell = empty.get(rng.nextInt(empty.size()));
        g[cell[0]][cell[1]] = rng.nextDouble() < 0.9 ? 2 : 4;
    }

    private int[][] deepCopy(int[][] g) {
        int[][] copy = new int[SIZE][SIZE];
        for (int r = 0; r < SIZE; r++)
            copy[r] = g[r].clone();
        return copy;
    }

    private boolean gridsEqual(int[][] a, int[][] b) {
        for (int r = 0; r < SIZE; r++)
            for (int c = 0; c < SIZE; c++)
                if (a[r][c] != b[r][c]) return false;
        return true;
    }
}
