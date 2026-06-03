package br.com.user.game.flowfree;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lógica do Flow Free: definição dos 10 níveis, validação de caminhos,
 * dicas e detecção de vitória.
 *
 * Estratégia de interação:
 *  - O frontend gerencia o arrasto localmente (sem chamada a cada célula).
 *  - Quando o arrasto termina, chama {@code setPath} com o caminho completo.
 *  - O servidor valida e persiste; o frontend sincroniza com a resposta.
 */
@Service
public class FlowFreeService {

    // ─── Definição dos níveis ─────────────────────────────────────────────────

    /**
     * Cada nível é um array de caminhos: LEVELS[nível][cor][célula][row/col].
     * As soluções são exatamente as do jogo vanilla original.
     */
    private static final int[][][][] LEVELS = {
        // Nível 1 - 5x5: cada linha é uma cor
        { {{0,0},{0,1},{0,2},{0,3},{0,4}}, {{1,0},{1,1},{1,2},{1,3},{1,4}},
          {{2,0},{2,1},{2,2},{2,3},{2,4}}, {{3,0},{3,1},{3,2},{3,3},{3,4}},
          {{4,0},{4,1},{4,2},{4,3},{4,4}} },
        // Nível 2 - 5x5: cada coluna é uma cor
        { {{0,0},{1,0},{2,0},{3,0},{4,0}}, {{0,1},{1,1},{2,1},{3,1},{4,1}},
          {{0,2},{1,2},{2,2},{3,2},{4,2}}, {{0,3},{1,3},{2,3},{3,3},{4,3}},
          {{0,4},{1,4},{2,4},{3,4},{4,4}} },
        // Nível 3 - 5x5
        { {{0,0},{0,1},{1,1},{1,0},{2,0}}, {{0,2},{0,3},{0,4},{1,4},{1,3}},
          {{1,2},{2,2},{2,3},{2,4}},       {{2,1},{3,1},{3,0},{4,0},{4,1}},
          {{3,2},{3,3},{3,4},{4,4},{4,3},{4,2}} },
        // Nível 4 - 5x5
        { {{0,0},{1,0},{2,0},{2,1},{1,1}}, {{0,1},{0,2},{0,3},{0,4},{1,4}},
          {{1,2},{1,3},{2,3},{3,3},{3,2}}, {{2,2},{3,1},{3,0},{4,0},{4,1}},
          {{4,2},{4,3},{4,4},{3,4},{2,4}} },
        // Nível 5 - 5x5
        { {{0,0},{0,1},{1,1},{1,0},{2,0}}, {{0,2},{0,3},{0,4},{1,4},{2,4}},
          {{1,2},{1,3},{2,3},{2,2},{2,1}}, {{3,0},{3,1},{3,2},{3,3},{3,4}},
          {{4,0},{4,1},{4,2},{4,3},{4,4}} },
        // Nível 6 - 6x6: cada linha
        { {{0,0},{0,1},{0,2},{0,3},{0,4},{0,5}}, {{1,0},{1,1},{1,2},{1,3},{1,4},{1,5}},
          {{2,0},{2,1},{2,2},{2,3},{2,4},{2,5}}, {{3,0},{3,1},{3,2},{3,3},{3,4},{3,5}},
          {{4,0},{4,1},{4,2},{4,3},{4,4},{4,5}}, {{5,0},{5,1},{5,2},{5,3},{5,4},{5,5}} },
        // Nível 7 - 6x6: cada coluna
        { {{0,0},{1,0},{2,0},{3,0},{4,0},{5,0}}, {{0,1},{1,1},{2,1},{3,1},{4,1},{5,1}},
          {{0,2},{1,2},{2,2},{3,2},{4,2},{5,2}}, {{0,3},{1,3},{2,3},{3,3},{4,3},{5,3}},
          {{0,4},{1,4},{2,4},{3,4},{4,4},{5,4}}, {{0,5},{1,5},{2,5},{3,5},{4,5},{5,5}} },
        // Nível 8 - 6x6: blocos 2x3
        { {{0,0},{0,1},{0,2},{1,2},{1,1},{1,0}}, {{0,3},{0,4},{0,5},{1,5},{1,4},{1,3}},
          {{2,0},{2,1},{2,2},{3,2},{3,1},{3,0}}, {{2,3},{2,4},{2,5},{3,5},{3,4},{3,3}},
          {{4,0},{4,1},{4,2},{5,2},{5,1},{5,0}}, {{4,3},{4,4},{4,5},{5,5},{5,4},{5,3}} },
        // Nível 9 - 6x6: serpentina
        { {{0,0},{1,0},{2,0},{2,1},{1,1},{0,1}}, {{0,2},{0,3},{0,4},{0,5},{1,5},{2,5}},
          {{1,2},{1,3},{1,4},{2,4},{2,3},{2,2}}, {{3,0},{3,1},{3,2},{3,3},{3,4},{3,5}},
          {{4,0},{4,1},{4,2},{4,3},{4,4},{4,5}}, {{5,0},{5,1},{5,2},{5,3},{5,4},{5,5}} },
        // Nível 10 - 6x6: colunas
        { {{0,0},{1,0},{2,0},{3,0},{4,0},{5,0}}, {{0,1},{1,1},{2,1},{3,1},{4,1},{5,1}},
          {{0,2},{1,2},{2,2},{3,2},{4,2},{5,2}}, {{0,3},{1,3},{2,3},{3,3},{4,3},{5,3}},
          {{0,4},{1,4},{2,4},{3,4},{4,4},{5,4}}, {{0,5},{1,5},{2,5},{3,5},{4,5},{5,5}} },
    };

    private static final int TOTAL_LEVELS = LEVELS.length;
    private static final int HINTS_PER_LEVEL = 2;

    // ─── Estado interno ───────────────────────────────────────────────────────

    /** Dados internos que incluem a solução (nunca enviada ao cliente). */
    private static class GameData {
        FlowFreeState state;
        int[][][] solution;   // solução do nível atual (referência a LEVELS[n])
        int hintsCarryOver;
    }

    private final Map<String, GameData> games = new ConcurrentHashMap<>();

    // ─── API pública ──────────────────────────────────────────────────────────

    /** Cria nova partida no nível indicado (1-based). */
    public FlowFreeState newGame(int level) {
        int idx = Math.max(0, Math.min(level - 1, TOTAL_LEVELS - 1));
        return createGame(idx, 0);
    }

    /**
     * Define o caminho completo de uma cor.
     * O frontend envia o path após o arrasto terminar.
     *
     * @param path lista de [row, col] desde o endpoint de origem até onde o
     *             usuário arrastou (inclusive). Pode terminar no endpoint destino
     *             (conexão completa) ou em qualquer célula vazia (parcial).
     */
    public FlowFreeState setPath(String gameId, int color, List<int[]> path) {
        GameData data = getGameData(gameId);
        FlowFreeState state = data.state;
        if (state.isGameWon()) return state;

        int numColors = state.getNumColors();
        if (color < 1 || color > numColors)
            throw new IllegalArgumentException("Cor inválida: " + color);

        // Limpa caminho existente desta cor (exceto endpoints)
        clearColor(state, color);

        if (path == null || path.isEmpty()) return state;

        int size = state.getSize();

        // Valida: começa num endpoint desta cor
        int[] first = path.get(0);
        if (!isEndpoint(state, first[0], first[1], color))
            throw new IllegalArgumentException("Caminho deve iniciar num endpoint da cor " + color + ".");

        // Valida: caminho contínuo e sem cruzar outras cores
        for (int i = 0; i < path.size(); i++) {
            int[] cell = path.get(i);
            int r = cell[0], c = cell[1];

            if (r < 0 || r >= size || c < 0 || c >= size)
                throw new IllegalArgumentException("Célula fora do grid.");

            // Adjacência
            if (i > 0) {
                int[] prev = path.get(i - 1);
                if (Math.abs(prev[0] - r) + Math.abs(prev[1] - c) != 1)
                    throw new IllegalArgumentException("Caminho não é contínuo.");
            }

            // Não pode sobrescrever endpoint de outra cor
            int existing = state.getGrid()[r * size + c];
            if (existing != 0 && existing != color && isEndpointOfColor(state, r, c, existing))
                throw new IllegalArgumentException("Caminho cruza endpoint de outra cor.");
        }

        // Escreve caminho no grid
        for (int[] cell : path) {
            state.getGrid()[cell[0] * size + cell[1]] = color;
        }

        checkWin(state);
        if (!state.isGameWon())
            state.setMessage("Continue conectando os pontos!");

        return state;
    }

    /** Dica: revela uma célula da solução adjacente ao caminho atual de uma cor incompleta. */
    public FlowFreeState hint(String gameId) {
        GameData data = getGameData(gameId);
        FlowFreeState state = data.state;

        if (state.isGameWon() || state.getHintsRemaining() <= 0) return state;

        int size   = state.getSize();
        int[] grid = state.getGrid();

        for (int color = 1; color <= state.getNumColors(); color++) {
            if (isColorConnected(state, color)) continue;

            int[][] solutionPath = data.solution[color - 1];

            // Encontra célula da solução adjacente ao caminho atual desta cor
            Set<String> filled = new HashSet<>();
            for (int i = 0; i < size * size; i++)
                if (grid[i] == color) filled.add((i / size) + "," + (i % size));

            for (int[] cell : solutionPath) {
                int r = cell[0], c = cell[1];
                if (grid[r * size + c] == color) continue;

                for (int[] d : new int[][]{{0,1},{0,-1},{1,0},{-1,0}}) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size
                            && filled.contains(nr + "," + nc)) {
                        grid[r * size + c] = color;
                        state.setHintsRemaining(state.getHintsRemaining() - 1);
                        checkWin(state);
                        if (!state.isGameWon()) state.setMessage("💡 Dica usada!");
                        return state;
                    }
                }
            }
        }
        state.setMessage("Nenhuma dica disponível para o estado atual.");
        return state;
    }

    /** Reinicia o nível atual. */
    public FlowFreeState restart(String gameId) {
        GameData data = getGameData(gameId);
        int level = data.state.getLevelIndex();
        int carry = data.hintsCarryOver;
        FlowFreeState newState = createGame(level, carry);
        // Transfere o gameId para manter o mesmo ID
        newState.setGameId(data.state.getGameId());
        data.state   = newState;
        data.solution = LEVELS[level];
        games.put(newState.getGameId(), data);
        return newState;
    }

    /** Vai para outro nível. */
    public FlowFreeState goToLevel(String gameId, int level) {
        GameData data = getGameData(gameId);
        int idx = Math.max(0, Math.min(level - 1, TOTAL_LEVELS - 1));
        int carry = data.state.getHintsRemaining();   // carrega as dicas restantes
        FlowFreeState newState = createGame(idx, carry);
        newState.setGameId(data.state.getGameId());
        data.state    = newState;
        data.solution = LEVELS[idx];
        games.put(newState.getGameId(), data);
        return newState;
    }

    public FlowFreeState getState(String gameId) {
        return getGameData(gameId).state;
    }

    public void removeGame(String gameId) {
        games.remove(gameId);
    }

    // ─── Criação de partida ───────────────────────────────────────────────────

    private FlowFreeState createGame(int idx, int hintsCarryOver) {
        int[][][] levelPaths = LEVELS[idx];
        int numColors = levelPaths.length;
        int size = levelPaths[0][0].length > 0
                ? (idx < 5 ? 5 : 6)   // níveis 0-4 = 5x5, 5-9 = 6x6
                : 5;

        // Determina size real pelo maior índice nas cells do nível
        int maxIdx = 0;
        for (int[][] path : levelPaths)
            for (int[] cell : path)
                maxIdx = Math.max(maxIdx, Math.max(cell[0], cell[1]));
        size = maxIdx + 1;

        int[] grid = new int[size * size];
        int[][][] endpoints = new int[numColors][2][2];

        for (int c = 0; c < numColors; c++) {
            int[][] path = levelPaths[c];
            int[] start  = path[0];
            int[] end    = path[path.length - 1];
            int color    = c + 1;
            grid[start[0] * size + start[1]] = color;
            grid[end[0]   * size + end[1]  ] = color;
            endpoints[c][0] = new int[]{start[0], start[1]};
            endpoints[c][1] = new int[]{end[0],   end[1]  };
        }

        FlowFreeState state = new FlowFreeState();
        state.setGameId(UUID.randomUUID().toString());
        state.setLevelIndex(idx);
        state.setSize(size);
        state.setGrid(grid);
        state.setEndpoints(endpoints);
        state.setNumColors(numColors);
        state.setHintsRemaining(HINTS_PER_LEVEL + hintsCarryOver);
        state.setTotalLevels(TOTAL_LEVELS);
        state.setGameWon(false);
        state.setMessage("Conecte todos os pares preenchendo o tabuleiro!");

        GameData data = new GameData();
        data.state         = state;
        data.solution      = levelPaths;
        data.hintsCarryOver = hintsCarryOver;

        games.put(state.getGameId(), data);
        return state;
    }

    // ─── Lógica interna ───────────────────────────────────────────────────────

    /** Remove células não-endpoint de uma cor do grid. */
    private void clearColor(FlowFreeState state, int color) {
        int[] grid = state.getGrid();
        int size   = state.getSize();
        for (int i = 0; i < grid.length; i++) {
            if (grid[i] == color) {
                int r = i / size, c = i % size;
                if (!isEndpoint(state, r, c, color)) grid[i] = 0;
            }
        }
    }

    /** Verifica vitória: todas cores conectadas E grid sem células vazias. */
    private void checkWin(FlowFreeState state) {
        for (int color = 1; color <= state.getNumColors(); color++) {
            if (!isColorConnected(state, color)) return;
        }
        for (int v : state.getGrid()) {
            if (v == 0) return;
        }
        state.setGameWon(true);
        state.setMessage("🎉 Parabéns! Você completou o nível " + (state.getLevelIndex() + 1) + "!");
    }

    /** BFS para verificar se os dois endpoints de uma cor estão conectados pelo grid. */
    private boolean isColorConnected(FlowFreeState state, int color) {
        int size = state.getSize();
        int[] grid = state.getGrid();
        int[][][] eps = state.getEndpoints();
        int[] start = eps[color - 1][0];
        int[] end   = eps[color - 1][1];

        boolean[] visited = new boolean[size * size];
        Queue<Integer> queue = new LinkedList<>();
        int si = start[0] * size + start[1];
        queue.add(si);
        visited[si] = true;

        while (!queue.isEmpty()) {
            int idx = queue.poll();
            int r = idx / size, c = idx % size;
            if (r == end[0] && c == end[1]) return true;
            for (int[] d : new int[][]{{0,1},{0,-1},{1,0},{-1,0}}) {
                int nr = r + d[0], nc = c + d[1];
                if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
                int ni = nr * size + nc;
                if (!visited[ni] && grid[ni] == color) {
                    visited[ni] = true;
                    queue.add(ni);
                }
            }
        }
        return false;
    }

    private boolean isEndpoint(FlowFreeState state, int r, int c, int color) {
        int[][][] eps = state.getEndpoints();
        int ci = color - 1;
        return (eps[ci][0][0] == r && eps[ci][0][1] == c)
            || (eps[ci][1][0] == r && eps[ci][1][1] == c);
    }

    private boolean isEndpointOfColor(FlowFreeState state, int r, int c, int color) {
        return isEndpoint(state, r, c, color);
    }

    private GameData getGameData(String gameId) {
        GameData data = games.get(gameId);
        if (data == null) throw new IllegalStateException("Partida não encontrada: " + gameId);
        return data;
    }
}
