/**
 * Classe Connect4Game - Implementa a lógica do jogo Connect 4
 * Jogo onde dois jogadores tentam conectar 4 peças em linha
 */
class Connect4Game {
    constructor() {
        this.ROWS = 6;
        this.COLS = 7;
        this.EMPTY = 0;
        this.PLAYER1 = 1;
        this.PLAYER2 = 2;
        
        this.board = [];
        this.currentPlayer = this.PLAYER1;
        this.gameActive = true;
        this.scores = { player1: 0, player2: 0 };
        this.winningCells = [];
        
        this.initializeBoard();
        this.createUI();
        this.updateDisplay();
    }
    
    /**
     * Inicializa o tabuleiro vazio
     */
    initializeBoard() {
        this.board = [];
        for (let row = 0; row < this.ROWS; row++) {
            this.board[row] = new Array(this.COLS).fill(this.EMPTY);
        }
    }
    
    /**
     * Cria a interface do usuário
     */
    createUI() {
        const grid = document.getElementById('connect4-grid');
        grid.innerHTML = '';
        
        // Cria as células do grid
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'connect4-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Adiciona evento de clique apenas na primeira linha (para facilitar o jogo)
                if (row === 0) {
                    cell.addEventListener('click', () => this.dropPiece(col));
                    cell.style.cursor = 'pointer';
                }
                
                grid.appendChild(cell);
            }
        }
        
        // Adiciona eventos de hover para mostrar onde a peça vai cair
        for (let col = 0; col < this.COLS; col++) {
            const columnCells = document.querySelectorAll(`[data-col="${col}"]`);
            columnCells.forEach(cell => {
                cell.addEventListener('mouseenter', () => this.highlightColumn(col, true));
                cell.addEventListener('mouseleave', () => this.highlightColumn(col, false));
            });
        }
    }
    
    /**
     * Destaca uma coluna quando o mouse passa sobre ela
     * @param {number} col coluna a destacar
     * @param {boolean} highlight se deve destacar ou remover destaque
     */
    highlightColumn(col, highlight) {
        if (!this.gameActive) return;
        
        const columnCells = document.querySelectorAll(`[data-col="${col}"]`);
        columnCells.forEach(cell => {
            if (highlight) {
                cell.style.backgroundColor = '#d5dbdb';
            } else {
                // Restaura a cor original baseada no estado da célula
                const row = parseInt(cell.dataset.row);
                const cellValue = this.board[row][col];
                
                if (cellValue === this.EMPTY) {
                    cell.style.backgroundColor = 'white';
                } else if (cellValue === this.PLAYER1) {
                    cell.style.backgroundColor = '#e74c3c';
                } else {
                    cell.style.backgroundColor = '#f39c12';
                }
            }
        });
    }
    
    /**
     * Solta uma peça na coluna especificada
     * @param {number} col coluna onde soltar a peça
     */
    dropPiece(col) {
        if (!this.gameActive) return;
        
        // Encontra a linha mais baixa disponível na coluna
        let row = -1;
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (this.board[r][col] === this.EMPTY) {
                row = r;
                break;
            }
        }
        
        // Se a coluna está cheia, não faz nada
        if (row === -1) {
            return;
        }
        
        // Coloca a peça no tabuleiro
        this.board[row][col] = this.currentPlayer;
        
        // Atualiza a interface
        this.updateCellDisplay(row, col);
        
        // Verifica se há vitória
        if (this.checkWin(row, col)) {
            this.endGame(this.currentPlayer);
        } else if (this.isBoardFull()) {
            this.endGame(null); // Empate
        } else {
            // Troca o jogador
            this.currentPlayer = this.currentPlayer === this.PLAYER1 ? this.PLAYER2 : this.PLAYER1;
            this.updateDisplay();
        }
    }
    
    /**
     * Atualiza a exibição de uma célula específica
     * @param {number} row linha da célula
     * @param {number} col coluna da célula
     */
    updateCellDisplay(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const value = this.board[row][col];
        
        cell.classList.remove('player1', 'player2', 'winning');
        
        if (value === this.PLAYER1) {
            cell.classList.add('player1');
        } else if (value === this.PLAYER2) {
            cell.classList.add('player2');
        }
    }
    
    /**
     * Verifica se há uma vitória a partir da última peça colocada
     * @param {number} row linha da última peça
     * @param {number} col coluna da última peça
     * @returns {boolean} true se há vitória
     */
    checkWin(row, col) {
        const player = this.board[row][col];
        
        // Direções: horizontal, vertical, diagonal /, diagonal \
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal \
            [1, -1]   // diagonal /
        ];
        
        for (const [deltaRow, deltaCol] of directions) {
            const winningCells = this.checkDirection(row, col, deltaRow, deltaCol, player);
            if (winningCells.length >= 4) {
                this.winningCells = winningCells;
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Verifica uma direção específica para vitória
     * @param {number} row linha inicial
     * @param {number} col coluna inicial
     * @param {number} deltaRow incremento da linha
     * @param {number} deltaCol incremento da coluna
     * @param {number} player jogador a verificar
     * @returns {Array} array com as células que formam a linha (se >= 4)
     */
    checkDirection(row, col, deltaRow, deltaCol, player) {
        const cells = [[row, col]];
        
        // Verifica na direção positiva
        let r = row + deltaRow;
        let c = col + deltaCol;
        while (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS && this.board[r][c] === player) {
            cells.push([r, c]);
            r += deltaRow;
            c += deltaCol;
        }
        
        // Verifica na direção negativa
        r = row - deltaRow;
        c = col - deltaCol;
        while (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS && this.board[r][c] === player) {
            cells.unshift([r, c]);
            r -= deltaRow;
            c -= deltaCol;
        }
        
        return cells;
    }
    
    /**
     * Verifica se o tabuleiro está cheio
     * @returns {boolean} true se o tabuleiro está cheio
     */
    isBoardFull() {
        for (let col = 0; col < this.COLS; col++) {
            if (this.board[0][col] === this.EMPTY) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Termina o jogo
     * @param {number|null} winner jogador vencedor ou null para empate
     */
    endGame(winner) {
        this.gameActive = false;
        
        if (winner) {
            // Destaca as células vencedoras
            this.winningCells.forEach(([row, col]) => {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.classList.add('winning');
            });
            
            // Atualiza o placar
            if (winner === this.PLAYER1) {
                this.scores.player1++;
                document.getElementById('current-player').textContent = 'Jogador 1 Venceu!';
                document.getElementById('current-player').style.color = '#e74c3c';
            } else {
                this.scores.player2++;
                document.getElementById('current-player').textContent = 'Jogador 2 Venceu!';
                document.getElementById('current-player').style.color = '#f39c12';
            }
            
            this.updateScores();
            
            setTimeout(() => {
                alert(`Jogador ${winner} venceu!`);
            }, 500);
        } else {
            document.getElementById('current-player').textContent = 'Empate!';
            document.getElementById('current-player').style.color = '#7f8c8d';
            
            setTimeout(() => {
                alert('Empate! O tabuleiro está cheio.');
            }, 500);
        }
    }
    
    /**
     * Atualiza a exibição do jogo
     */
    updateDisplay() {
        // Atualiza o indicador do jogador atual
        const currentPlayerElement = document.getElementById('current-player');
        if (this.gameActive) {
            currentPlayerElement.textContent = `Vez do Jogador ${this.currentPlayer}`;
            currentPlayerElement.style.color = this.currentPlayer === this.PLAYER1 ? '#e74c3c' : '#f39c12';
        }
        
        // Atualiza o tabuleiro
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                this.updateCellDisplay(row, col);
            }
        }
        
        this.updateScores();
    }
    
    /**
     * Atualiza os placares na interface
     */
    updateScores() {
        document.getElementById('score1').textContent = this.scores.player1;
        document.getElementById('score2').textContent = this.scores.player2;
    }
    
    /**
     * Inicia um novo jogo
     */
    newGame() {
        this.initializeBoard();
        this.currentPlayer = this.PLAYER1;
        this.gameActive = true;
        this.winningCells = [];
        
        // Limpa todas as células
        const cells = document.querySelectorAll('.connect4-cell');
        cells.forEach(cell => {
            cell.classList.remove('player1', 'player2', 'winning');
        });
        
        this.updateDisplay();
    }
    
    /**
     * Reseta o placar
     */
    resetScore() {
        this.scores = { player1: 0, player2: 0 };
        this.updateScores();
    }
}

// Instância global do jogo Connect 4
let connect4;

