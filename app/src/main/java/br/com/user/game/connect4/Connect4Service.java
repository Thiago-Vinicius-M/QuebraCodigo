package br.com.user.game.connect4;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static br.com.user.game.connect4.Connect4State.COLS;
import static br.com.user.game.connect4.Connect4State.ROWS;

/**
 * Toda a lógica de regras do Connect 4 vive aqui.
 * As partidas ficam em memória (ConcurrentHashMap); para persistir,
 * basta trocar o Map por um repositório JPA.
 */
@Service
public class Connect4Service {

    /** Armazena partidas ativas por gameId. */
    private final Map<String, Connect4State> games = new ConcurrentHashMap<>();

    // ─── API pública ──────────────────────────────────────────────────────────

    /** Cria e armazena uma nova partida. */
    public Connect4State newGame() {
        String gameId = UUID.randomUUID().toString();
        Connect4State state = new Connect4State();
        state.setGameId(gameId);
        state.setBoard(new String[ROWS][COLS]);
        state.setCurrentPlayer("RED");
        state.setGameOver(false);
        state.setMessage("Vez de RED");
        games.put(gameId, state);
        return state;
    }

    /**
     * Registra uma jogada na coluna {@code col} (0-6).
     *
     * @throws IllegalArgumentException se a jogada for inválida.
     * @throws IllegalStateException    se o jogo já terminou ou não for encontrado.
     */
    public Connect4State makeMove(String gameId, int col) {
        Connect4State state = getState(gameId);

        if (state.isGameOver()) {
            throw new IllegalStateException("Partida já encerrada.");
        }
        if (col < 0 || col >= COLS) {
            throw new IllegalArgumentException("Coluna inválida: " + col);
        }

        int row = findEmptyRow(state.getBoard(), col);
        if (row == -1) {
            throw new IllegalArgumentException("Coluna " + col + " está cheia.");
        }

        String player = state.getCurrentPlayer();
        state.getBoard()[row][col] = player;

        if (checkWin(state.getBoard(), row, col, player)) {
            state.setWinner(player);
            state.setGameOver(true);
            state.setMessage(player + " venceu!");

        } else if (isDraw(state.getBoard())) {
            state.setWinner("DRAW");
            state.setGameOver(true);
            state.setMessage("Empate!");

        } else {
            String next = player.equals("RED") ? "YELLOW" : "RED";
            state.setCurrentPlayer(next);
            state.setMessage("Vez de " + next);
        }

        return state;
    }

    /** Retorna o estado de uma partida existente. */
    public Connect4State getState(String gameId) {
        Connect4State state = games.get(gameId);
        if (state == null) {
            throw new IllegalStateException("Partida não encontrada: " + gameId);
        }
        return state;
    }

    /** Remove uma partida da memória. */
    public void removeGame(String gameId) {
        games.remove(gameId);
    }

    // ─── Regras do jogo ───────────────────────────────────────────────────────

    /** Encontra a linha mais baixa disponível na coluna, ou -1 se cheia. */
    private int findEmptyRow(String[][] board, int col) {
        for (int r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] == null) return r;
        }
        return -1;
    }

    /** Verifica se o jogador que acabou de jogar em (row, col) formou 4 em linha. */
    private boolean checkWin(String[][] board, int row, int col, String player) {
        return checkDirection(board, row, col, player, 0, 1)   // horizontal
            || checkDirection(board, row, col, player, 1, 0)   // vertical
            || checkDirection(board, row, col, player, 1, 1)   // diagonal ↘
            || checkDirection(board, row, col, player, 1, -1); // diagonal ↙
    }

    /**
     * Conta peças consecutivas do mesmo jogador nas duas direções
     * a partir de (row, col) com deslocamento (dr, dc).
     */
    private boolean checkDirection(String[][] board, int row, int col, String player, int dr, int dc) {
        int count = 1;
        for (int dir = -1; dir <= 1; dir += 2) {
            int r = row + dir * dr;
            int c = col + dir * dc;
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && player.equals(board[r][c])) {
                count++;
                r += dir * dr;
                c += dir * dc;
            }
        }
        return count >= 4;
    }

    /** Empate: nenhuma célula vazia na primeira linha. */
    private boolean isDraw(String[][] board) {
        for (int c = 0; c < COLS; c++) {
            if (board[0][c] == null) return false;
        }
        return true;
    }
}
