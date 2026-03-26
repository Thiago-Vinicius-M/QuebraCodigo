// ===== CLASSE PRINCIPAL DO MINESWEEPER =====
class Minesweeper {
    constructor() {
        // CONFIGURAÇÕES DE DIFICULDADE
        // Cada dificuldade tem: tamanho do grid e quantidade de minas
        this.difficulties = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 14, cols: 14, mines: 30 },
            hard: { rows: 20, cols: 20, mines: 80 }
        };

        // ESTADO DO JOGO
        this.currentDifficulty = 'easy'; // Dificuldade inicial
        this.config = this.difficulties.easy; // Configuração ativa
        this.grid = []; // Array 2D representando o campo
        this.minePositions = []; // Posições das minas
        this.revealedCount = 0; // Células reveladas
        this.flagCount = 0; // Bandeiras colocadas
        this.gameOver = false; // Flag de fim de jogo
        this.gameWon = false; // Flag de vitória
        this.firstClick = true; // Primeira jogada (gera minas depois)
        this.timerInterval = null; // Referência do timer
        this.timeElapsed = 0; // Tempo decorrido

        // REFERÊNCIAS HTML
        this.gridContainer = document.getElementById('gridContainer');
        this.mineCounterElement = document.getElementById('mineCounter');
        this.timerElement = document.getElementById('timer');
        this.restartBtn = document.getElementById('restartBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.tryAgainBtn = document.getElementById('tryAgainBtn');
        this.gameMessage = document.getElementById('gameMessage');
        this.messageIcon = document.getElementById('messageIcon');
        this.messageTitle = document.getElementById('messageTitle');
        this.messageText = document.getElementById('messageText');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');

        // INICIA O JOGO
        this.init();
    }

    // ===== INICIALIZAÇÃO =====
    init() {
        // Reseta variáveis
        this.grid = [];
        this.minePositions = [];
        this.revealedCount = 0;
        this.flagCount = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timeElapsed = 0;

        // Para timer anterior se existir
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Cria grid vazio
        this.createGrid();

        // Renderiza grid na tela
        this.renderGrid();

        // Atualiza contadores
        this.updateMineCounter();
        this.updateTimer();

        // Configura eventos
        this.setupEventListeners();
    }

    // ===== CRIA GRID VAZIO =====
    createGrid() {
        const { rows, cols } = this.config;

        // Cria array 2D
        // Cada célula é um objeto com propriedades
        for (let i = 0; i < rows; i++) {
            this.grid[i] = [];
            for (let j = 0; j < cols; j++) {
                this.grid[i][j] = {
                    isMine: false,      // Tem mina?
                    isRevealed: false,  // Foi revelada?
                    isFlagged: false,   // Tem bandeira?
                    adjacentMines: 0    // Quantas minas ao redor
                };
            }
        }
    }

    // ===== COLOCA MINAS NO CAMPO =====
    // Chamado apenas no primeiro clique para evitar mina na primeira jogada
    placeMines(excludeRow, excludeCol) {
        const { rows, cols, mines } = this.config;
        let minesPlaced = 0;

        // Coloca minas aleatórias
        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);

            // Não coloca mina onde o jogador clicou ou onde já tem mina
            if ((row === excludeRow && col === excludeCol) || this.grid[row][col].isMine) {
                continue;
            }

            this.grid[row][col].isMine = true;
            this.minePositions.push({ row, col });
            minesPlaced++;
        }

        // Calcula números (quantas minas adjacentes)
        this.calculateAdjacentMines();
    }

    // ===== CALCULA NÚMEROS DE MINAS ADJACENTES =====
    calculateAdjacentMines() {
        const { rows, cols } = this.config;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (this.grid[i][j].isMine) continue;

                let count = 0;

                // Verifica as 8 células ao redor
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        if (di === 0 && dj === 0) continue; // Pula a própria célula

                        const ni = i + di;
                        const nj = j + dj;

                        // Verifica se está dentro do grid
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                            if (this.grid[ni][nj].isMine) {
                                count++;
                            }
                        }
                    }
                }

                this.grid[i][j].adjacentMines = count;
            }
        }
    }

    // ===== RENDERIZA GRID NA TELA =====
    renderGrid() {
        const { rows, cols } = this.config;

        // Limpa grid anterior
        this.gridContainer.innerHTML = '';

        // Define template de colunas CSS (tamanho dinâmico)
        this.gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Cria células HTML
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                // Eventos de clique
                cell.addEventListener('click', (e) => this.handleLeftClick(i, j));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, i, j));

                this.gridContainer.appendChild(cell);
            }
        }
    }

    // ===== CLIQUE ESQUERDO (REVELAR) =====
    handleLeftClick(row, col) {
        if (this.gameOver || this.gameWon) return;

        const cell = this.grid[row][col];

        // Não faz nada se já revelada ou com bandeira
        if (cell.isRevealed || cell.isFlagged) return;

        // PRIMEIRO CLIQUE: Gera minas e inicia timer
        if (this.firstClick) {
            this.placeMines(row, col);
            this.startTimer();
            this.firstClick = false;
        }

        // Se clicou em mina: GAME OVER
        if (cell.isMine) {
            this.explode(row, col);
            return;
        }

        // Revela célula
        this.revealCell(row, col);

        // Verifica vitória
        this.checkWin();
    }

    // ===== CLIQUE DIREITO (BANDEIRA) =====
    handleRightClick(e, row, col) {
        e.preventDefault(); // Impede menu de contexto do navegador

        if (this.gameOver || this.gameWon) return;

        const cell = this.grid[row][col];
        const cellElement = this.getCellElement(row, col);

        // Não faz nada se já revelada
        if (cell.isRevealed) return;

        // Alterna bandeira
        if (cell.isFlagged) {
            // Remove bandeira
            cell.isFlagged = false;
            cellElement.classList.remove('flagged');
            this.flagCount--;
        } else {
            // Coloca bandeira (se ainda tem minas disponíveis)
            if (this.flagCount < this.config.mines) {
                cell.isFlagged = true;
                cellElement.classList.add('flagged');
                this.flagCount++;
            }
        }

        this.updateMineCounter();
    }

    // ===== REVELA CÉLULA =====
    revealCell(row, col) {
        const { rows, cols } = this.config;
        const cell = this.grid[row][col];

        // Já revelada ou com bandeira: ignora
        if (cell.isRevealed || cell.isFlagged) return;

        // Marca como revelada
        cell.isRevealed = true;
        this.revealedCount++;

        const cellElement = this.getCellElement(row, col);
        cellElement.classList.add('revealed');

        // Mostra número se tiver minas adjacentes
        if (cell.adjacentMines > 0) {
            cellElement.textContent = cell.adjacentMines;
            cellElement.dataset.count = cell.adjacentMines;
        } else {
            // CÉLULA VAZIA (0 minas): Revela adjacentes automaticamente
            // Isso cria o efeito de "área revelada" do Minesweeper clássico
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;

                    const ni = row + di;
                    const nj = col + dj;

                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                        this.revealCell(ni, nj); // Recursão!
                    }
                }
            }
        }
    }

    // ===== EXPLOSÃO (GAME OVER) =====
    explode(row, col) {
        this.gameOver = true;
        this.stopTimer();

        // Marca mina que explodiu
        const cellElement = this.getCellElement(row, col);
        cellElement.classList.add('mine', 'exploded');

        // Revela todas as minas
        this.minePositions.forEach(pos => {
            const mineCell = this.getCellElement(pos.row, pos.col);
            mineCell.classList.add('mine');
        });

        // Mostra mensagem de derrota
        this.showMessage('💥', 'Game Over!', `Você pisou em uma mina! Tempo: ${this.timeElapsed}s`);
    }

    // ===== VERIFICA VITÓRIA =====
    checkWin() {
        const { rows, cols, mines } = this.config;
        const totalCells = rows * cols;
        const safeCells = totalCells - mines;

        // Ganhou se revelou todas as células seguras
        if (this.revealedCount === safeCells) {
            this.gameWon = true;
            this.stopTimer();

            // Coloca bandeira em todas as minas
            this.minePositions.forEach(pos => {
                const cell = this.grid[pos.row][pos.col];
                if (!cell.isFlagged) {
                    cell.isFlagged = true;
                    const cellElement = this.getCellElement(pos.row, pos.col);
                    cellElement.classList.add('flagged');
                }
            });

            this.showMessage('🎉', 'Você Venceu!', `Parabéns! Tempo: ${this.timeElapsed}s`);
        }
    }

    // ===== DICA (REVELA CÉLULA SEGURA) =====
    giveHint() {
        if (this.gameOver || this.gameWon) return;

        const { rows, cols } = this.config;

        // Procura célula segura não revelada
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = this.grid[i][j];
                if (!cell.isRevealed && !cell.isMine && !cell.isFlagged) {
                    this.revealCell(i, j);
                    this.checkWin();
                    return;
                }
            }
        }
    }

    // ===== TIMER =====
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        this.timerElement.textContent = this.timeElapsed;
    }

    // ===== ATUALIZA CONTADOR DE MINAS =====
    updateMineCounter() {
        // Minas restantes = Total - Bandeiras colocadas
        this.mineCounterElement.textContent = this.config.mines - this.flagCount;
    }

    // ===== AUXILIARES =====
    // Pega elemento HTML da célula
    getCellElement(row, col) {
        return this.gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    // Mostra mensagem de fim de jogo
    showMessage(icon, title, text) {
        this.messageIcon.textContent = icon;
        this.messageTitle.textContent = title;
        this.messageText.textContent = text;
        this.gameMessage.classList.add('show');
    }

    // Esconde mensagem
    hideMessage() {
        this.gameMessage.classList.remove('show');
    }

    // ===== TROCA DIFICULDADE =====
    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.config = this.difficulties[difficulty];
        this.hideMessage();
        this.init();

        // Atualiza botões de dificuldade (visual)
        this.difficultyBtns.forEach(btn => {
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ===== REINICIAR =====
    restart() {
        this.hideMessage();
        this.init();
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    setupEventListeners() {
        // Remove listeners antigos (previne duplicação)
        const newRestartBtn = this.restartBtn.cloneNode(true);
        this.restartBtn.parentNode.replaceChild(newRestartBtn, this.restartBtn);
        this.restartBtn = newRestartBtn;

        const newHintBtn = this.hintBtn.cloneNode(true);
        this.hintBtn.parentNode.replaceChild(newHintBtn, this.hintBtn);
        this.hintBtn = newHintBtn;

        const newTryAgainBtn = this.tryAgainBtn.cloneNode(true);
        this.tryAgainBtn.parentNode.replaceChild(newTryAgainBtn, this.tryAgainBtn);
        this.tryAgainBtn = newTryAgainBtn;

        // Botões
        this.restartBtn.addEventListener('click', () => this.restart());
        this.hintBtn.addEventListener('click', () => this.giveHint());
        this.tryAgainBtn.addEventListener('click', () => this.restart());

        // Botões de dificuldade
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.changeDifficulty(btn.dataset.difficulty);
            });
        });
    }
}

// ===== INICIA O JOGO =====
const game = new Minesweeper();