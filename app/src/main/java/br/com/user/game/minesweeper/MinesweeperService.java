package br.com.user.game.minesweeper;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Toda a lógica do Campo Minado:
 * geração de minas (após o 1º clique), flood-fill, bandeiras, dica e detecção de vitória.
 *
 * As posições reais das minas ficam em {@code GameData.mineMap} e nunca
 * são enviadas ao cliente — o campo {@code mine} das células só é
 * populado quando o jogo termina.
 */
@Service
public class MinesweeperService {

    // ─── Configurações de dificuldade ─────────────────────────────────────────

    private record Config(int rows, int cols, int mines) {}

    private static final Map<String, Config> CONFIGS = Map.of(
            "easy",   new Config(8,  8,  10),
            "medium", new Config(14, 14, 30),
            "hard",   new Config(20, 20, 80)
    );

    // ─── Estado interno ───────────────────────────────────────────────────────

    /** Dados que ficam apenas no servidor (mineMap nunca vai ao cliente). */
    private static class GameData {
        MinesweeperState state;
        boolean[] mineMap;   // posições reais das minas
        Config    config;
    }

    private final Map<String, GameData> games = new ConcurrentHashMap<>();
    private final Random rng = new Random();

    // ─── API pública ──────────────────────────────────────────────────────────

    /** Cria e armazena uma nova partida (sem minas ainda — 1º clique é seguro). */
    public MinesweeperState newGame(String difficulty) {
        Config cfg = CONFIGS.getOrDefault(difficulty, CONFIGS.get("easy"));
        int total  = cfg.rows() * cfg.cols();

        MinesweeperCell[] cells = new MinesweeperCell[total];
        for (int i = 0; i < total; i++) cells[i] = new MinesweeperCell();

        MinesweeperState state = new MinesweeperState();
        state.setGameId(UUID.randomUUID().toString());
        state.setCells(cells);
        state.setRows(cfg.rows());
        state.setCols(cfg.cols());
        state.setTotalMines(cfg.mines());
        state.setFlagCount(0);
        state.setRevealedCount(0);
        state.setDifficulty(difficulty);
        state.setFirstClick(true);
        state.setGameOver(false);
        state.setGameWon(false);
        state.setMessage("Clique para revelar uma célula!");

        GameData data = new GameData();
        data.state   = state;
        data.mineMap = new boolean[total];
        data.config  = cfg;

        games.put(state.getGameId(), data);
        return state;
    }

    /**
     * Revela uma célula.
     * No primeiro clique, as minas são posicionadas evitando a célula clicada.
     */
    public MinesweeperState reveal(String gameId, int row, int col) {
        GameData data  = getGameData(gameId);
        MinesweeperState state = data.state;

        if (state.isGameOver() || state.isGameWon()) return state;

        int idx = index(row, col, data.config.cols());
        validateIndex(idx, data.config);

        MinesweeperCell cell = state.getCells()[idx];
        if (cell.isRevealed() || cell.isFlagged()) return state;

        // Primeiro clique: posiciona minas agora (garante célula clicada segura)
        if (state.isFirstClick()) {
            placeMines(data, row, col);
            state.setFirstClick(false);
        }

        // Clicou numa mina → Game Over
        if (data.mineMap[idx]) {
            cell.setMine(true);
            cell.setExploded(true);
            cell.setRevealed(true);
            state.setGameOver(true);
            revealAllMines(data);
            state.setMessage("💥 Game Over! Você pisou em uma mina!");
            return state;
        }

        // Revela em flood-fill
        floodReveal(data, row, col);
        checkWin(data);
        return state;
    }

    /** Alterna a bandeira em uma célula não revelada. */
    public MinesweeperState flag(String gameId, int row, int col) {
        GameData data  = getGameData(gameId);
        MinesweeperState state = data.state;

        if (state.isGameOver() || state.isGameWon()) return state;

        int idx = index(row, col, data.config.cols());
        validateIndex(idx, data.config);

        MinesweeperCell cell = state.getCells()[idx];
        if (cell.isRevealed()) return state;

        if (cell.isFlagged()) {
            cell.setFlagged(false);
            state.setFlagCount(state.getFlagCount() - 1);
        } else if (state.getFlagCount() < data.config.mines()) {
            cell.setFlagged(true);
            state.setFlagCount(state.getFlagCount() + 1);
        }

        return state;
    }

    /**
     * Dica: revela a primeira célula segura não revelada e não marcada.
     * Não funciona antes do primeiro clique.
     */
    public MinesweeperState hint(String gameId) {
        GameData data  = getGameData(gameId);
        MinesweeperState state = data.state;

        if (state.isGameOver() || state.isGameWon() || state.isFirstClick()) return state;

        int total = data.config.rows() * data.config.cols();
        for (int i = 0; i < total; i++) {
            MinesweeperCell cell = state.getCells()[i];
            if (!data.mineMap[i] && !cell.isRevealed() && !cell.isFlagged()) {
                int r = i / data.config.cols();
                int c = i % data.config.cols();
                floodReveal(data, r, c);
                checkWin(data);
                state.setMessage("💡 Dica usada!");
                return state;
            }
        }
        return state;
    }

    public MinesweeperState getState(String gameId) {
        return getGameData(gameId).state;
    }

    public void removeGame(String gameId) {
        games.remove(gameId);
    }

    // ─── Lógica interna ───────────────────────────────────────────────────────

    /** Posiciona minas aleatoriamente, excluindo a célula do primeiro clique. */
    private void placeMines(GameData data, int excludeRow, int excludeCol) {
        int total    = data.config.rows() * data.config.cols();
        int excludeIdx = index(excludeRow, excludeCol, data.config.cols());
        int placed   = 0;

        while (placed < data.config.mines()) {
            int idx = rng.nextInt(total);
            if (idx == excludeIdx || data.mineMap[idx]) continue;
            data.mineMap[idx] = true;
            placed++;
        }

        // Calcula adjacentes para todas as células
        for (int i = 0; i < total; i++) {
            if (!data.mineMap[i]) {
                data.state.getCells()[i].setAdjacentMines(countAdjacentMines(data, i));
            }
        }
    }

    /** Conta minas nos 8 vizinhos de uma célula. */
    private int countAdjacentMines(GameData data, int idx) {
        int count = 0;
        int row = idx / data.config.cols();
        int col = idx % data.config.cols();

        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                if (dr == 0 && dc == 0) continue;
                int nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < data.config.rows() && nc >= 0 && nc < data.config.cols()) {
                    if (data.mineMap[index(nr, nc, data.config.cols())]) count++;
                }
            }
        }
        return count;
    }

    /**
     * Flood-fill: revela célula; se adjacentMines == 0, expande recursivamente
     * para os 8 vizinhos (comportamento clássico do Minesweeper).
     */
    private void floodReveal(GameData data, int row, int col) {
        if (row < 0 || row >= data.config.rows() || col < 0 || col >= data.config.cols()) return;

        int idx = index(row, col, data.config.cols());
        MinesweeperCell cell = data.state.getCells()[idx];

        if (cell.isRevealed() || cell.isFlagged() || data.mineMap[idx]) return;

        cell.setRevealed(true);
        data.state.setRevealedCount(data.state.getRevealedCount() + 1);

        if (cell.getAdjacentMines() == 0) {
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    if (dr == 0 && dc == 0) continue;
                    floodReveal(data, row + dr, col + dc);
                }
            }
        }
    }

    /** Verifica vitória: todas as células seguras reveladas. */
    private void checkWin(GameData data) {
        MinesweeperState state = data.state;
        int safeCells = data.config.rows() * data.config.cols() - data.config.mines();

        if (state.getRevealedCount() >= safeCells) {
            state.setGameWon(true);
            // Coloca bandeira em todas as minas não marcadas
            for (int i = 0; i < data.mineMap.length; i++) {
                if (data.mineMap[i]) {
                    MinesweeperCell cell = state.getCells()[i];
                    cell.setMine(true);
                    if (!cell.isFlagged()) {
                        cell.setFlagged(true);
                        state.setFlagCount(state.getFlagCount() + 1);
                    }
                }
            }
            state.setMessage("🎉 Você Venceu! Parabéns!");
        } else {
            state.setMessage("Minas restantes: " + (state.getTotalMines() - state.getFlagCount()));
        }
    }

    /** Revela todas as minas ao final do jogo (game over). */
    private void revealAllMines(GameData data) {
        for (int i = 0; i < data.mineMap.length; i++) {
            if (data.mineMap[i]) {
                MinesweeperCell cell = data.state.getCells()[i];
                cell.setMine(true);
                if (!cell.isExploded()) cell.setRevealed(true);
            }
        }
    }

    // ─── Utilitários ──────────────────────────────────────────────────────────

    private int index(int row, int col, int cols) {
        return row * cols + col;
    }

    private void validateIndex(int idx, Config cfg) {
        if (idx < 0 || idx >= cfg.rows() * cfg.cols()) {
            throw new IllegalArgumentException("Posição inválida.");
        }
    }

    private GameData getGameData(String gameId) {
        GameData data = games.get(gameId);
        if (data == null) throw new IllegalStateException("Partida não encontrada: " + gameId);
        return data;
    }
}
