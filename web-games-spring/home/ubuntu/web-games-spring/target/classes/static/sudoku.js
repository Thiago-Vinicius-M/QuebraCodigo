/**
 * Classe Sudoku - Implementa a lógica do jogo Sudoku
 * Traduzida da versão Java para JavaScript mantendo a mesma funcionalidade
 */
class SudokuGame {
    constructor() {
        this.SIZE = 9;
        this.SUBGRID_SIZE = 3;
        this.EMPTY_CELL = 0;
        
        // Tabuleiro do jogo - matriz 9x9
        this.board = [];
        // Tabuleiro original (com células fixas)
        this.originalBoard = [];
        // Controla quais células são editáveis
        this.editable = [];
        
        this.initializeArrays();
        this.generateNewGame();
        this.createUI();
    }
    
    /**
     * Inicializa as matrizes do jogo
     */
    initializeArrays() {
        for (let i = 0; i < this.SIZE; i++) {
            this.board[i] = new Array(this.SIZE).fill(this.EMPTY_CELL);
            this.originalBoard[i] = new Array(this.SIZE).fill(this.EMPTY_CELL);
            this.editable[i] = new Array(this.SIZE).fill(true);
        }
    }
    
    /**
     * Gera um novo jogo Sudoku
     * Cria um tabuleiro completo e remove algumas células para criar o puzzle
     */
    generateNewGame() {
        // Limpa o tabuleiro
        this.clearBoard();
        
        // Gera um tabuleiro completo válido
        this.generateCompleteBoard();
        
        // Copia o tabuleiro completo para o original
        this.copyBoard(this.board, this.originalBoard);
        
        // Remove células para criar o puzzle (deixa aproximadamente 30-35 células preenchidas)
        this.removeCells(45); // Remove 45 células, deixando 36 preenchidas
        
        // Define quais células são editáveis
        this.setEditableCells();
        
        // Atualiza a interface
        this.updateDisplay();
        this.updateStatus("Novo jogo iniciado! Boa sorte!");
    }
    
    /**
     * Limpa todo o tabuleiro
     */
    clearBoard() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                this.board[row][col] = this.EMPTY_CELL;
                this.editable[row][col] = true;
            }
        }
    }
    
    /**
     * Gera um tabuleiro Sudoku completo e válido
     * Usa backtracking para preencher o tabuleiro
     */
    generateCompleteBoard() {
        this.fillBoard(0, 0);
    }
    
    /**
     * Preenche o tabuleiro usando backtracking
     * @param {number} row linha atual
     * @param {number} col coluna atual
     * @returns {boolean} true se conseguiu preencher, false caso contrário
     */
    fillBoard(row, col) {
        // Se chegou ao final do tabuleiro, está completo
        if (row === this.SIZE) {
            return true;
        }
        
        // Calcula próxima posição
        const nextRow = (col === this.SIZE - 1) ? row + 1 : row;
        const nextCol = (col === this.SIZE - 1) ? 0 : col + 1;
        
        // Cria uma lista de números de 1 a 9 em ordem aleatória
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);
        
        // Tenta cada número
        for (const num of numbers) {
            if (this.isValidMove(row, col, num)) {
                this.board[row][col] = num;
                
                // Recursivamente preenche o resto do tabuleiro
                if (this.fillBoard(nextRow, nextCol)) {
                    return true;
                }
                
                // Se não funcionou, remove o número (backtrack)
                this.board[row][col] = this.EMPTY_CELL;
            }
        }
        
        return false;
    }
    
    /**
     * Embaralha um array
     * @param {Array} array array a ser embaralhado
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * Remove células do tabuleiro para criar o puzzle
     * @param {number} cellsToRemove número de células a remover
     */
    removeCells(cellsToRemove) {
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * this.SIZE);
            const col = Math.floor(Math.random() * this.SIZE);
            
            if (this.board[row][col] !== this.EMPTY_CELL) {
                this.board[row][col] = this.EMPTY_CELL;
                removed++;
            }
        }
    }
    
    /**
     * Define quais células são editáveis (células vazias)
     */
    setEditableCells() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                this.editable[row][col] = (this.board[row][col] === this.EMPTY_CELL);
            }
        }
    }
    
    /**
     * Copia um tabuleiro para outro
     * @param {Array} source tabuleiro origem
     * @param {Array} destination tabuleiro destino
     */
    copyBoard(source, destination) {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                destination[row][col] = source[row][col];
            }
        }
    }
    
    /**
     * Verifica se um movimento é válido
     * @param {number} row linha
     * @param {number} col coluna
     * @param {number} num número a ser colocado
     * @returns {boolean} true se o movimento é válido
     */
    isValidMove(row, col, num) {
        // Verifica se o número já existe na linha
        for (let c = 0; c < this.SIZE; c++) {
            if (this.board[row][c] === num) {
                return false;
            }
        }
        
        // Verifica se o número já existe na coluna
        for (let r = 0; r < this.SIZE; r++) {
            if (this.board[r][col] === num) {
                return false;
            }
        }
        
        // Verifica se o número já existe no subgrid 3x3
        const subgridRow = Math.floor(row / this.SUBGRID_SIZE) * this.SUBGRID_SIZE;
        const subgridCol = Math.floor(col / this.SUBGRID_SIZE) * this.SUBGRID_SIZE;
        
        for (let r = subgridRow; r < subgridRow + this.SUBGRID_SIZE; r++) {
            for (let c = subgridCol; c < subgridCol + this.SUBGRID_SIZE; c++) {
                if (this.board[r][c] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Faz um movimento no tabuleiro
     * @param {number} row linha
     * @param {number} col coluna
     * @param {number} num número a ser colocado
     * @returns {boolean} true se o movimento foi feito com sucesso
     */
    makeMove(row, col, num) {
        // Verifica se a célula é editável
        if (!this.editable[row][col]) {
            return false;
        }
        
        // Se num é 0, limpa a célula
        if (num === this.EMPTY_CELL) {
            this.board[row][col] = this.EMPTY_CELL;
            return true;
        }
        
        // Verifica se o movimento é válido
        if (this.isValidMove(row, col, num)) {
            this.board[row][col] = num;
            return true;
        }
        
        return false;
    }
    
    /**
     * Verifica se o jogo foi completado com sucesso
     * @returns {boolean} true se o jogo está completo e correto
     */
    isGameComplete() {
        // Verifica se todas as células estão preenchidas
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                if (this.board[row][col] === this.EMPTY_CELL) {
                    return false;
                }
            }
        }
        
        // Verifica se o tabuleiro está válido
        return this.isBoardValid();
    }
    
    /**
     * Verifica se o tabuleiro atual está válido
     * @returns {boolean} true se o tabuleiro é válido
     */
    isBoardValid() {
        // Verifica todas as linhas
        for (let row = 0; row < this.SIZE; row++) {
            if (!this.isRowValid(row)) {
                return false;
            }
        }
        
        // Verifica todas as colunas
        for (let col = 0; col < this.SIZE; col++) {
            if (!this.isColumnValid(col)) {
                return false;
            }
        }
        
        // Verifica todos os subgrids 3x3
        for (let row = 0; row < this.SIZE; row += this.SUBGRID_SIZE) {
            for (let col = 0; col < this.SIZE; col += this.SUBGRID_SIZE) {
                if (!this.isSubgridValid(row, col)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Verifica se uma linha é válida
     * @param {number} row linha a verificar
     * @returns {boolean} true se a linha é válida
     */
    isRowValid(row) {
        const used = new Array(this.SIZE + 1).fill(false);
        for (let col = 0; col < this.SIZE; col++) {
            const num = this.board[row][col];
            if (num !== this.EMPTY_CELL) {
                if (used[num]) {
                    return false;
                }
                used[num] = true;
            }
        }
        return true;
    }
    
    /**
     * Verifica se uma coluna é válida
     * @param {number} col coluna a verificar
     * @returns {boolean} true se a coluna é válida
     */
    isColumnValid(col) {
        const used = new Array(this.SIZE + 1).fill(false);
        for (let row = 0; row < this.SIZE; row++) {
            const num = this.board[row][col];
            if (num !== this.EMPTY_CELL) {
                if (used[num]) {
                    return false;
                }
                used[num] = true;
            }
        }
        return true;
    }
    
    /**
     * Verifica se um subgrid 3x3 é válido
     * @param {number} startRow linha inicial do subgrid
     * @param {number} startCol coluna inicial do subgrid
     * @returns {boolean} true se o subgrid é válido
     */
    isSubgridValid(startRow, startCol) {
        const used = new Array(this.SIZE + 1).fill(false);
        for (let row = startRow; row < startRow + this.SUBGRID_SIZE; row++) {
            for (let col = startCol; col < startCol + this.SUBGRID_SIZE; col++) {
                const num = this.board[row][col];
                if (num !== this.EMPTY_CELL) {
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
     * Limpa todas as células editáveis
     */
    clearEditableCells() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                if (this.editable[row][col]) {
                    this.board[row][col] = this.EMPTY_CELL;
                }
            }
        }
        this.updateDisplay();
        this.updateStatus("Células editáveis foram limpas.");
    }
    
    /**
     * Resolve o Sudoku automaticamente
     * @returns {boolean} true se conseguiu resolver
     */
    solve() {
        if (this.solveSudoku(0, 0)) {
            this.updateDisplay();
            this.updateStatus("Puzzle resolvido automaticamente!", "success");
            this.disableAllCells();
            return true;
        } else {
            this.updateStatus("Não foi possível resolver este puzzle.", "error");
            return false;
        }
    }
    
    /**
     * Resolve o Sudoku usando backtracking
     * @param {number} row linha atual
     * @param {number} col coluna atual
     * @returns {boolean} true se conseguiu resolver
     */
    solveSudoku(row, col) {
        // Se chegou ao final, está resolvido
        if (row === this.SIZE) {
            return true;
        }
        
        // Calcula próxima posição
        const nextRow = (col === this.SIZE - 1) ? row + 1 : row;
        const nextCol = (col === this.SIZE - 1) ? 0 : col + 1;
        
        // Se a célula não é editável, pula para a próxima
        if (!this.editable[row][col]) {
            return this.solveSudoku(nextRow, nextCol);
        }
        
        // Tenta números de 1 a 9
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(row, col, num)) {
                this.board[row][col] = num;
                
                if (this.solveSudoku(nextRow, nextCol)) {
                    return true;
                }
                
                this.board[row][col] = this.EMPTY_CELL;
            }
        }
        
        return false;
    }
    
    /**
     * Cria a interface do usuário do Sudoku
     */
    createUI() {
        const grid = document.getElementById('sudoku-grid');
        grid.innerHTML = '';
        
        for (let row = 0; row < this.SIZE; row++) {
            const tr = document.createElement('tr');
            
            for (let col = 0; col < this.SIZE; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                
                input.type = 'text';
                input.maxLength = 1;
                input.className = 'sudoku-cell';
                input.id = `cell-${row}-${col}`;
                
                // Adiciona bordas para separar subgrids 3x3
                if (row % 3 === 0 && row !== 0) {
                    input.classList.add('top-border');
                }
                if (col % 3 === 0 && col !== 0) {
                    input.classList.add('left-border');
                }
                
                // Adiciona event listeners
                input.addEventListener('input', (e) => this.handleCellInput(row, col, e.target));
                input.addEventListener('click', (e) => e.target.select());
                
                td.appendChild(input);
                tr.appendChild(td);
            }
            
            grid.appendChild(tr);
        }
    }
    
    /**
     * Manipula a entrada de dados em uma célula
     * @param {number} row linha da célula
     * @param {number} col coluna da célula
     * @param {HTMLElement} cell célula que recebeu a entrada
     */
    handleCellInput(row, col, cell) {
        let value = cell.value.trim();
        
        // Remove caracteres inválidos
        if (value && !/^[1-9]$/.test(value)) {
            cell.value = '';
            return;
        }
        
        // Converte para número
        const num = value === '' ? 0 : parseInt(value);
        
        // Tenta fazer o movimento
        if (this.makeMove(row, col, num)) {
            // Movimento válido - remove destaque de erro se houver
            cell.classList.remove('invalid');
            
            // Verifica se o jogo foi completado
            if (this.isGameComplete()) {
                this.updateStatus("Parabéns! Você completou o Sudoku!", "success");
                this.disableAllCells();
            } else {
                this.updateStatus("Continue jogando...");
            }
        } else {
            // Movimento inválido
            if (num !== 0) {
                cell.classList.add('invalid');
                this.updateStatus("Movimento inválido! Tente outro número.", "error");
            }
        }
    }
    
    /**
     * Atualiza a exibição do tabuleiro
     */
    updateDisplay() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                const value = this.board[row][col];
                
                // Define o valor da célula
                if (value === 0) {
                    cell.value = '';
                } else {
                    cell.value = value.toString();
                }
                
                // Define se a célula é editável
                if (this.editable[row][col]) {
                    cell.classList.remove('fixed');
                    cell.disabled = false;
                } else {
                    cell.classList.add('fixed');
                    cell.disabled = true;
                }
                
                // Remove estilos de erro
                cell.classList.remove('invalid');
            }
        }
    }
    
    /**
     * Atualiza o status do jogo
     * @param {string} message mensagem a exibir
     * @param {string} type tipo da mensagem (success, error, ou padrão)
     */
    updateStatus(message, type = '') {
        const statusElement = document.getElementById('sudoku-status');
        statusElement.textContent = message;
        statusElement.className = 'sudoku-status';
        if (type) {
            statusElement.classList.add(type);
        }
    }
    
    /**
     * Desabilita todas as células editáveis
     */
    disableAllCells() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                if (this.editable[row][col]) {
                    const cell = document.getElementById(`cell-${row}-${col}`);
                    cell.disabled = true;
                }
            }
        }
    }
    
    /**
     * Habilita todas as células editáveis
     */
    enableAllCells() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                if (this.editable[row][col]) {
                    const cell = document.getElementById(`cell-${row}-${col}`);
                    cell.disabled = false;
                }
            }
        }
    }
    
    /**
     * Verifica a solução atual
     */
    check() {
        if (this.isGameComplete()) {
            this.updateStatus("Parabéns! Solução correta!", "success");
            this.disableAllCells();
        } else {
            // Conta células vazias
            let emptyCells = 0;
            for (let row = 0; row < this.SIZE; row++) {
                for (let col = 0; col < this.SIZE; col++) {
                    if (this.board[row][col] === 0) {
                        emptyCells++;
                    }
                }
            }
            
            this.updateStatus(`Ainda faltam ${emptyCells} células para completar.`);
        }
    }
    
    /**
     * Inicia um novo jogo
     */
    newGame() {
        this.generateNewGame();
        this.enableAllCells();
    }
    
    /**
     * Limpa células editáveis
     */
    clear() {
        this.clearEditableCells();
        this.enableAllCells();
    }
}

// Instância global do jogo Sudoku
let sudoku;

