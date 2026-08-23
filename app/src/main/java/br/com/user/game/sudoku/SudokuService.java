package br.com.user.game.sudoku;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Toda a lógica do Sudoku:
 * geração de puzzle, validação de jogadas, resolução e detecção de vitória.
 */
@Service
public class SudokuService {

    private static final int SIZE = 81;

    /** Quantidade de células removidas por dificuldade. */
    private static final Map<String, Integer> REMOVE_COUNT = Map.of(
            "easy",   40,
            "medium", 50,
            "hard",   58
    );

    private final Map<String, SudokuState> games = new ConcurrentHashMap<>();
    private final Random rng = new Random();

    // ─── API pública ──────────────────────────────────────────────────────────

    /** Gera e armazena uma nova partida. */
    public SudokuState newGame(String difficulty) {
        String diff = REMOVE_COUNT.containsKey(difficulty) ? difficulty : "easy";

        int[] solution = generateSolution();
        int[] puzzle   = carve(solution, REMOVE_COUNT.get(diff));

        boolean[] given = new boolean[SIZE];
        for (int i = 0; i < SIZE; i++) given[i] = puzzle[i] != 0;

        SudokuState state = new SudokuState();
        state.setGameId(UUID.randomUUID().toString());
        state.setBoard(puzzle.clone());
        state.setSolution(solution);
        state.setGiven(given);
        state.setConflicts(new boolean[SIZE]);
        state.setCorrect(new boolean[SIZE]);
        state.setDifficulty(diff);
        state.setGameOver(false);
        state.setMessage("Preencha o tabuleiro!");

        games.put(state.getGameId(), state);
        return state;
    }

    /**
     * Coloca um número em uma célula.
     *
     * @param index posição 0–80
     * @param value valor 1–9
     */
    public SudokuState place(String gameId, int index, int value) {
        SudokuState state = getState(gameId);
        validateIndex(index);

        if (state.getGiven()[index]) {
            throw new IllegalStateException("Célula fixa — não pode ser alterada.");
        }
        if (value < 1 || value > 9) {
            throw new IllegalArgumentException("Valor deve ser entre 1 e 9.");
        }
        if (state.isGameOver()) {
            throw new IllegalStateException("Partida já concluída.");
        }

        state.getBoard()[index] = value;
        updateValidation(state);
        return state;
    }

    /** Remove o valor de uma célula não-fixa. */
    public SudokuState erase(String gameId, int index) {
        SudokuState state = getState(gameId);
        validateIndex(index);

        if (state.getGiven()[index]) {
            throw new IllegalStateException("Célula fixa — não pode ser apagada.");
        }
        if (state.isGameOver()) {
            throw new IllegalStateException("Partida já concluída.");
        }

        state.getBoard()[index] = 0;
        updateValidation(state);
        return state;
    }

    /** Preenche o tabuleiro com a solução (botão "Resolver"). */
    public SudokuState solve(String gameId) {
        SudokuState state = getState(gameId);

        System.arraycopy(state.getSolution(), 0, state.getBoard(), 0, SIZE);
        updateValidation(state);
        state.setMessage("Solução revelada.");
        return state;
    }

    /** Limpa todas as entradas do jogador (mantém células fixas). */
    public SudokuState clear(String gameId) {
        SudokuState state = getState(gameId);

        for (int i = 0; i < SIZE; i++) {
            if (!state.getGiven()[i]) state.getBoard()[i] = 0;
        }
        state.setConflicts(new boolean[SIZE]);
        state.setCorrect(new boolean[SIZE]);
        state.setGameOver(false);
        state.setMessage("Tabuleiro limpo.");
        return state;
    }

    /** Retorna o estado de uma partida existente. */
    public SudokuState getState(String gameId) {
        SudokuState state = games.get(gameId);
        if (state == null) throw new IllegalStateException("Partida não encontrada: " + gameId);
        return state;
    }

    /** Remove uma partida da memória. */
    public void removeGame(String gameId) {
        games.remove(gameId);
    }

    // ─── Geração de puzzle ────────────────────────────────────────────────────

    /** Gera um tabuleiro completo e válido usando backtracking com ordem aleatória. */
    private int[] generateSolution() {
        int[] board = new int[SIZE];
        fillBoard(board);
        return board;
    }

    private boolean fillBoard(int[] board) {
        for (int i = 0; i < SIZE; i++) {
            if (board[i] == 0) {
                int[] nums = shuffledNums();
                for (int num : nums) {
                    if (isValid(board, i, num)) {
                        board[i] = num;
                        if (fillBoard(board)) return true;
                        board[i] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    /** Remove células do tabuleiro completo conforme a dificuldade. */
    private int[] carve(int[] solution, int removeCount) {
        int[] board = solution.clone();
        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < SIZE; i++) indices.add(i);
        Collections.shuffle(indices, rng);

        int removed = 0;
        for (int idx : indices) {
            if (removed >= removeCount) break;
            board[idx] = 0;
            removed++;
        }
        return board;
    }

    // ─── Validação ────────────────────────────────────────────────────────────

    /**
     * Verifica se colocar {@code num} na posição {@code index} é válido
     * (não há conflito na linha, coluna ou bloco 3×3).
     */
    private boolean isValid(int[] board, int index, int num) {
        int row      = index / 9;
        int col      = index % 9;
        int blockRow = (row / 3) * 3;
        int blockCol = (col / 3) * 3;

        for (int c = 0; c < 9; c++) if (board[row * 9 + c] == num) return false;
        for (int r = 0; r < 9; r++) if (board[r * 9 + col] == num) return false;
        for (int r = 0; r < 3; r++)
            for (int c = 0; c < 3; c++)
                if (board[(blockRow + r) * 9 + (blockCol + c)] == num) return false;
        return true;
    }

    /**
     * Recalcula os arrays {@code conflicts} e {@code correct} e verifica vitória.
     */
    private void updateValidation(SudokuState state) {
        boolean[] conflicts = new boolean[SIZE];
        boolean[] correct   = new boolean[SIZE];
        boolean hasConflict = false;
        boolean hasEmpty    = false;

        for (int i = 0; i < SIZE; i++) {
            int val = state.getBoard()[i];
            if (val == 0) { hasEmpty = true; continue; }

            int[] temp = state.getBoard().clone();
            temp[i] = 0;

            if (!isValid(temp, i, val)) {
                conflicts[i] = true;
                hasConflict  = true;
            } else if (!state.getGiven()[i]) {
                correct[i] = true;
            }
        }

        state.setConflicts(conflicts);
        state.setCorrect(correct);

        if (!hasEmpty && !hasConflict) {
            state.setGameOver(true);
            state.setMessage("Parabéns! Sudoku concluído! 🎉");
        } else if (hasConflict) {
            state.setMessage("Há conflitos no tabuleiro.");
        } else {
            state.setMessage("Continue preenchendo...");
        }
    }

    // ─── Utilitários ──────────────────────────────────────────────────────────

    private int[] shuffledNums() {
        int[] nums = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        for (int i = 8; i > 0; i--) {
            int j = rng.nextInt(i + 1);
            int tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
        }
        return nums;
    }

    private void validateIndex(int index) {
        if (index < 0 || index >= SIZE) {
            throw new IllegalArgumentException("Índice inválido: " + index);
        }
    }
}
