package com.webgames.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.util.Random;

/**
 * Classe que representa um tabuleiro de Sudoku.
 * 
 * Esta classe implementa toda a lógica necessária para:
 * - Gerar tabuleiros válidos de Sudoku
 * - Validar movimentos
 * - Resolver puzzles automaticamente
 * - Verificar se o jogo foi completado
 * 
 * O tabuleiro é representado como uma matriz 9x9 onde:
 * - 0 representa uma célula vazia
 * - 1-9 representam os números do Sudoku
 * 
 * @author Desenvolvedor
 * @version 1.0.0
 */
public class SudokuBoard {
    
    /** Tamanho do tabuleiro Sudoku (9x9) */
    public static final int SIZE = 9;
    
    /** Tamanho de cada subgrid 3x3 */
    public static final int SUBGRID_SIZE = 3;
    
    /** Valor que representa uma célula vazia */
    public static final int EMPTY_CELL = 0;
    
    /** Tabuleiro atual do jogo */
    private int[][] board;
    
    /** Tabuleiro original (com células fixas) */
    private int[][] originalBoard;
    
    /** Controla quais células são editáveis */
    private boolean[][] editable;
    
    /** Gerador de números aleatórios */
    private Random random;
    
    /**
     * Construtor que inicializa um novo tabuleiro Sudoku.
     */
    public SudokuBoard() {
        this.board = new int[SIZE][SIZE];
        this.originalBoard = new int[SIZE][SIZE];
        this.editable = new boolean[SIZE][SIZE];
        this.random = new Random();
        
        // Inicializa todas as células como editáveis
        for (int i = 0; i < SIZE; i++) {
            Arrays.fill(editable[i], true);
        }
    }
    
    /**
     * Gera um novo puzzle Sudoku.
     * 
     * @param difficulty nível de dificuldade (número de células a remover)
     */
    public void generateNewPuzzle(int difficulty) {
        // Limpa o tabuleiro
        clearBoard();
        
        // Gera um tabuleiro completo válido
        generateCompleteBoard();
        
        // Copia o tabuleiro completo para o original
        copyBoard(board, originalBoard);
        
        // Remove células para criar o puzzle
        removeCells(difficulty);
        
        // Define quais células são editáveis
        setEditableCells();
    }
    
    /**
     * Limpa todo o tabuleiro, definindo todas as células como vazias.
     */
    private void clearBoard() {
        for (int row = 0; row < SIZE; row++) {
            Arrays.fill(board[row], EMPTY_CELL);
            Arrays.fill(editable[row], true);
        }
    }
    
    /**
     * Gera um tabuleiro Sudoku completo e válido usando backtracking.
     * 
     * @return true se conseguiu gerar o tabuleiro
     */
    private boolean generateCompleteBoard() {
        return fillBoard(0, 0);
    }
    
    /**
     * Preenche o tabuleiro recursivamente usando backtracking.
     * 
     * @param row linha atual
     * @param col coluna atual
     * @return true se conseguiu preencher
     */
    private boolean fillBoard(int row, int col) {
        // Se chegou ao final do tabuleiro, está completo
        if (row == SIZE) {
            return true;
        }
        
        // Calcula próxima posição
        int nextRow = (col == SIZE - 1) ? row + 1 : row;
        int nextCol = (col == SIZE - 1) ? 0 : col + 1;
        
        // Cria uma lista de números de 1 a 9 em ordem aleatória
        List<Integer> numbers = new ArrayList<>();
        for (int i = 1; i <= 9; i++) {
            numbers.add(i);
        }
        Collections.shuffle(numbers, random);
        
        // Tenta cada número
        for (int num : numbers) {
            if (isValidMove(row, col, num)) {
                board[row][col] = num;
                
                // Recursivamente preenche o resto do tabuleiro
                if (fillBoard(nextRow, nextCol)) {
                    return true;
                }
                
                // Se não funcionou, remove o número (backtrack)
                board[row][col] = EMPTY_CELL;
            }
        }
        
        return false;
    }
    
    /**
     * Remove células do tabuleiro para criar o puzzle.
     * 
     * @param cellsToRemove número de células a remover
     */
    private void removeCells(int cellsToRemove) {
        int removed = 0;
        
        while (removed < cellsToRemove) {
            int row = random.nextInt(SIZE);
            int col = random.nextInt(SIZE);
            
            if (board[row][col] != EMPTY_CELL) {
                board[row][col] = EMPTY_CELL;
                removed++;
            }
        }
    }
    
    /**
     * Define quais células são editáveis (células vazias).
     */
    private void setEditableCells() {
        for (int row = 0; row < SIZE; row++) {
            for (int col = 0; col < SIZE; col++) {
                editable[row][col] = (board[row][col] == EMPTY_CELL);
            }
        }
    }
    
    /**
     * Copia um tabuleiro para outro.
     * 
     * @param source tabuleiro origem
     * @param destination tabuleiro destino
     */
    private void copyBoard(int[][] source, int[][] destination) {
        for (int row = 0; row < SIZE; row++) {
            System.arraycopy(source[row], 0, destination[row], 0, SIZE);
        }
    }
    
    /**
     * Verifica se um movimento é válido.
     * 
     * @param row linha
     * @param col coluna
     * @param num número a ser colocado
     * @return true se o movimento é válido
     */
    public boolean isValidMove(int row, int col, int num) {
        // Verifica se o número já existe na linha
        for (int c = 0; c < SIZE; c++) {
            if (board[row][c] == num) {
                return false;
            }
        }
        
        // Verifica se o número já existe na coluna
        for (int r = 0; r < SIZE; r++) {
            if (board[r][col] == num) {
                return false;
            }
        }
        
        // Verifica se o número já existe no subgrid 3x3
        int subgridRow = (row / SUBGRID_SIZE) * SUBGRID_SIZE;
        int subgridCol = (col / SUBGRID_SIZE) * SUBGRID_SIZE;
        
        for (int r = subgridRow; r < subgridRow + SUBGRID_SIZE; r++) {
            for (int c = subgridCol; c < subgridCol + SUBGRID_SIZE; c++) {
                if (board[r][c] == num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Faz um movimento no tabuleiro.
     * 
     * @param row linha
     * @param col coluna
     * @param num número a ser colocado
     * @return true se o movimento foi feito com sucesso
     */
    public boolean makeMove(int row, int col, int num) {
        // Verifica se a célula é editável
        if (!editable[row][col]) {
            return false;
        }
        
        // Se num é 0, limpa a célula
        if (num == EMPTY_CELL) {
            board[row][col] = EMPTY_CELL;
            return true;
        }
        
        // Verifica se o movimento é válido
        if (isValidMove(row, col, num)) {
            board[row][col] = num;
            return true;
        }
        
        return false;
    }
    
    /**
     * Verifica se o jogo foi completado com sucesso.
     * 
     * @return true se o jogo está completo e correto
     */
    public boolean isGameComplete() {
        // Verifica se todas as células estão preenchidas
        for (int row = 0; row < SIZE; row++) {
            for (int col = 0; col < SIZE; col++) {
                if (board[row][col] == EMPTY_CELL) {
                    return false;
                }
            }
        }
        
        // Verifica se o tabuleiro está válido
        return isBoardValid();
    }
    
    /**
     * Verifica se o tabuleiro atual está válido.
     * 
     * @return true se o tabuleiro é válido
     */
    public boolean isBoardValid() {
        // Verifica todas as linhas
        for (int row = 0; row < SIZE; row++) {
            if (!isRowValid(row)) {
                return false;
            }
        }
        
        // Verifica todas as colunas
        for (int col = 0; col < SIZE; col++) {
            if (!isColumnValid(col)) {
                return false;
            }
        }
        
        // Verifica todos os subgrids 3x3
        for (int row = 0; row < SIZE; row += SUBGRID_SIZE) {
            for (int col = 0; col < SIZE; col += SUBGRID_SIZE) {
                if (!isSubgridValid(row, col)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Verifica se uma linha é válida.
     * 
     * @param row linha a verificar
     * @return true se a linha é válida
     */
    private boolean isRowValid(int row) {
        boolean[] used = new boolean[SIZE + 1];
        for (int col = 0; col < SIZE; col++) {
            int num = board[row][col];
            if (num != EMPTY_CELL) {
                if (used[num]) {
                    return false;
                }
                used[num] = true;
            }
        }
        return true;
    }
    
    /**
     * Verifica se uma coluna é válida.
     * 
     * @param col coluna a verificar
     * @return true se a coluna é válida
     */
    private boolean isColumnValid(int col) {
        boolean[] used = new boolean[SIZE + 1];
        for (int row = 0; row < SIZE; row++) {
            int num = board[row][col];
            if (num != EMPTY_CELL) {
                if (used[num]) {
                    return false;
                }
                used[num] = true;
            }
        }
        return true;
    }
    
    /**
     * Verifica se um subgrid 3x3 é válido.
     * 
     * @param startRow linha inicial do subgrid
     * @param startCol coluna inicial do subgrid
     * @return true se o subgrid é válido
     */
    private boolean isSubgridValid(int startRow, int startCol) {
        boolean[] used = new boolean[SIZE + 1];
        for (int row = startRow; row < startRow + SUBGRID_SIZE; row++) {
            for (int col = startCol; col < startCol + SUBGRID_SIZE; col++) {
                int num = board[row][col];
                if (num != EMPTY_CELL) {
                    if (used[num]) {
                        return false;
                    }
                    used[num] = true;
                }
            }
        }
        return true;
    }
    
    /**
     * Resolve o Sudoku automaticamente usando backtracking.
     * 
     * @return true se conseguiu resolver
     */
    public boolean solve() {
        return solveSudoku(0, 0);
    }
    
    /**
     * Resolve o Sudoku recursivamente usando backtracking.
     * 
     * @param row linha atual
     * @param col coluna atual
     * @return true se conseguiu resolver
     */
    private boolean solveSudoku(int row, int col) {
        // Se chegou ao final, está resolvido
        if (row == SIZE) {
            return true;
        }
        
        // Calcula próxima posição
        int nextRow = (col == SIZE - 1) ? row + 1 : row;
        int nextCol = (col == SIZE - 1) ? 0 : col + 1;
        
        // Se a célula não é editável, pula para a próxima
        if (!editable[row][col]) {
            return solveSudoku(nextRow, nextCol);
        }
        
        // Tenta números de 1 a 9
        for (int num = 1; num <= 9; num++) {
            if (isValidMove(row, col, num)) {
                board[row][col] = num;
                
                if (solveSudoku(nextRow, nextCol)) {
                    return true;
                }
                
                board[row][col] = EMPTY_CELL;
            }
        }
        
        return false;
    }
    
    /**
     * Limpa todas as células editáveis.
     */
    public void clearEditableCells() {
        for (int row = 0; row < SIZE; row++) {
            for (int col = 0; col < SIZE; col++) {
                if (editable[row][col]) {
                    board[row][col] = EMPTY_CELL;
                }
            }
        }
    }
    
    // Getters e Setters
    
    /**
     * Obtém o tabuleiro atual.
     * 
     * @return matriz representando o tabuleiro
     */
    public int[][] getBoard() {
        // Retorna uma cópia para evitar modificações externas
        int[][] copy = new int[SIZE][SIZE];
        copyBoard(board, copy);
        return copy;
    }
    
    /**
     * Obtém o valor de uma célula específica.
     * 
     * @param row linha
     * @param col coluna
     * @return valor da célula
     */
    public int getCell(int row, int col) {
        if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
            return board[row][col];
        }
        return EMPTY_CELL;
    }
    
    /**
     * Verifica se uma célula é editável.
     * 
     * @param row linha
     * @param col coluna
     * @return true se a célula é editável
     */
    public boolean isEditable(int row, int col) {
        if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
            return editable[row][col];
        }
        return false;
    }
    
    /**
     * Obtém a matriz de células editáveis.
     * 
     * @return matriz booleana indicando quais células são editáveis
     */
    public boolean[][] getEditableMatrix() {
        // Retorna uma cópia para evitar modificações externas
        boolean[][] copy = new boolean[SIZE][SIZE];
        for (int row = 0; row < SIZE; row++) {
            System.arraycopy(editable[row], 0, copy[row], 0, SIZE);
        }
        return copy;
    }
}

