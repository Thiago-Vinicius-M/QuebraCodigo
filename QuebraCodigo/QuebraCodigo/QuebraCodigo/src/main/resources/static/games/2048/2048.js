// ===== CLASSE PRINCIPAL DO JOGO =====
class Game2048 {
    constructor() {
        // CONFIGURAÇÕES BÁSICAS
        this.size = 4; // Grid 4x4
        this.grid = []; // Array 2D que armazena os números
        this.score = 0; // Pontuação atual
        this.bestScore = parseInt(localStorage.getItem('best2048')) || 0; // Melhor pontuação salva
        this.previousState = null; // Estado anterior (para desfazer)
        this.gameOver = false; // Flag de fim de jogo
        this.won = false; // Flag de vitória (chegou em 2048)

        // REFERÊNCIAS AOS ELEMENTOS HTML
        this.gridContainer = document.getElementById('gridContainer');
        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.undoBtn = document.getElementById('undoBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.tryAgainBtn = document.getElementById('tryAgainBtn');
        this.gameMessage = document.getElementById('gameMessage');
        this.messageTitle = document.getElementById('messageTitle');
        this.messageText = document.getElementById('messageText');

        // INICIA O JOGO
        this.init();
    }

    // ===== INICIALIZAÇÃO =====
    init() {
        // Cria grid vazio 4x4 (todos zeros)
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));

        // Reseta variáveis
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.previousState = null;

        // Adiciona 2 peças iniciais aleatórias
        this.addRandomTile();
        this.addRandomTile();

        // Atualiza interface
        this.updateScore();
        this.updateBestScore();
        this.render();
        this.setupEventListeners();
        this.updateUndoButton();
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    setupEventListeners() {
        // Remove listeners antigos (previne duplicação)
        // Clonamos os botões para limpar todos os eventos
        const newRestartBtn = this.restartBtn.cloneNode(true);
        this.restartBtn.parentNode.replaceChild(newRestartBtn, this.restartBtn);
        this.restartBtn = newRestartBtn;

        const newUndoBtn = this.undoBtn.cloneNode(true);
        this.undoBtn.parentNode.replaceChild(newUndoBtn, this.undoBtn);
        this.undoBtn = newUndoBtn;

        const newTryAgainBtn = this.tryAgainBtn.cloneNode(true);
        this.tryAgainBtn.parentNode.replaceChild(newTryAgainBtn, this.tryAgainBtn);
        this.tryAgainBtn = newTryAgainBtn;

        // EVENTO: Teclas do teclado (↑↓←→)
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // EVENTO: Cliques nos botões
        this.restartBtn.addEventListener('click', () => this.restart());
        this.undoBtn.addEventListener('click', () => this.undo());
        this.tryAgainBtn.addEventListener('click', () => this.restart());
    }

    // ===== HANDLER DE TECLAS =====
    handleKeyPress(e) {
        if (this.gameOver) return; // Não faz nada se jogo acabou

        const key = e.key;
        let moved = false;

        // Detecta qual seta foi pressionada
        if (key === 'ArrowUp') {
            e.preventDefault(); // Previne scroll da página
            moved = this.move('up');
        } else if (key === 'ArrowDown') {
            e.preventDefault();
            moved = this.move('down');
        } else if (key === 'ArrowLeft') {
            e.preventDefault();
            moved = this.move('left');
        } else if (key === 'ArrowRight') {
            e.preventDefault();
            moved = this.move('right');
        }

        // Se houve movimento válido
        if (moved) {
            this.addRandomTile(); // Adiciona nova peça
            this.render(); // Redesenha o grid
            this.updateScore(); // Atualiza pontuação
            this.checkGameState(); // Verifica vitória/derrota
        }
    }

    // ===== SALVAR ESTADO (PARA DESFAZER) =====
    saveState() {
        // Clona o grid e pontuação atual
        this.previousState = {
            grid: this.grid.map(row => [...row]), // Deep copy
            score: this.score
        };
        this.updateUndoButton();
    }

    // ===== DESFAZER ÚLTIMA JOGADA =====
    undo() {
        if (!this.previousState) return; // Nada para desfazer

        // Restaura estado anterior
        this.grid = this.previousState.grid;
        this.score = this.previousState.score;
        this.previousState = null;
        this.gameOver = false;

        this.hideMessage();
        this.render();
        this.updateScore();
        this.updateUndoButton();
    }

    // ===== ATUALIZA ESTADO DO BOTÃO DESFAZER =====
    updateUndoButton() {
        // Desabilita se não há estado anterior
        this.undoBtn.disabled = !this.previousState;
    }

    // ===== LÓGICA DE MOVIMENTO =====
    // Esta é a parte mais complexa!
    move(direction) {
        this.saveState(); // Salva estado antes de mover
        let moved = false;

        // FUNÇÃO AUXILIAR: Rotaciona o grid 90° sentido horário
        // Usamos rotação para simplificar a lógica:
        // - Sempre processamos para CIMA
        // - Rotacionamos o grid conforme a direção desejada
        const rotateGrid = (grid) => {
            const newGrid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    newGrid[j][this.size - 1 - i] = grid[i][j];
                }
            }
            return newGrid;
        };

        // Quantas rotações precisamos?
        // Rotação horária: processamos sempre "para a esquerda" no grid rotacionado.
        // Com 1 rot: borda de BAIXO vira esquerda → move DOWN. Com 3 rot: borda de CIMA vira esquerda → move UP.
        let rotations = 0;
        if (direction === 'up') rotations = 3;    // cima vira esquerda com 3 rot
        else if (direction === 'right') rotations = 2; // direita vira esquerda com 2 rot
        else if (direction === 'down') rotations = 1;  // baixo vira esquerda com 1 rot
        // 'left' = 0 rotações (esquerda já é esquerda)

        // Rotaciona o grid
        for (let i = 0; i < rotations; i++) {
            this.grid = rotateGrid(this.grid);
        }

        // PROCESSA CADA LINHA (agora processando "para cima")
        for (let i = 0; i < this.size; i++) {
            // Remove zeros (empurra peças para cima)
            const row = this.grid[i].filter(x => x !== 0);
            const merged = [];

            // Junta peças iguais adjacentes
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    // Peças iguais: junta (dobra o valor)
                    merged.push(row[j] * 2);
                    this.score += row[j] * 2; // Adiciona pontos
                    j++; // Pula a próxima (já foi juntada)
                } else {
                    // Peça normal: adiciona sem mudança
                    merged.push(row[j]);
                }
            }

            // Preenche com zeros no final
            while (merged.length < this.size) {
                merged.push(0);
            }

            // Verifica se a linha mudou (houve movimento)
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(merged)) {
                moved = true;
            }
            this.grid[i] = merged;
        }

        // Desfaz as rotações (volta grid à orientação original)
        for (let i = 0; i < (4 - rotations) % 4; i++) {
            this.grid = rotateGrid(this.grid);
        }

        // Se não houve movimento, descarta o estado salvo
        if (!moved) {
            this.previousState = null;
            this.updateUndoButton();
        }

        return moved;
    }

    // ===== ADICIONA PEÇA ALEATÓRIA =====
    addRandomTile() {
        // Encontra células vazias
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ i, j });
                }
            }
        }

        // Se há células vazias, adiciona peça
        if (emptyCells.length > 0) {
            const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance de ser 2, 10% chance de ser 4
            this.grid[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // ===== RENDERIZA O GRID NA TELA =====
    render() {
        // Remove todas as tiles antigas
        const oldTiles = this.gridContainer.querySelectorAll('.tile');
        oldTiles.forEach(tile => tile.remove());

        // Mesmos valores do CSS do grid (padding e gap)
        const padding = 15;
        const gap = 15;
        const contentWidth = this.gridContainer.offsetWidth - 2 * padding;
        const contentHeight = this.gridContainer.offsetHeight - 2 * padding;
        // Tamanho da célula: espaço total menos os gaps, dividido pelo número de linhas/colunas
        const cellSize = Math.min(
            (contentWidth - (this.size - 1) * gap) / this.size,
            (contentHeight - (this.size - 1) * gap) / this.size
        );

        // Cria novas tiles baseadas no grid
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];

                // Só cria tile se valor não for zero
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`; // Classe define cor
                    tile.textContent = value;

                    // Posiciona exatamente sobre a célula do grid (mesma lógica do CSS Grid + gap)
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.left = `${padding + j * (cellSize + gap)}px`;
                    tile.style.top = `${padding + i * (cellSize + gap)}px`;

                    this.gridContainer.appendChild(tile);
                }
            }
        }
    }

    // ===== ATUALIZA PONTUAÇÃO =====
    updateScore() {
        this.scoreElement.textContent = this.score;

        // Atualiza melhor pontuação se necessário
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.updateBestScore();
            localStorage.setItem('best2048', this.bestScore); // Salva no navegador
        }
    }

    updateBestScore() {
        this.bestElement.textContent = this.bestScore;
    }

    // ===== VERIFICA ESTADO DO JOGO =====
    checkGameState() {
        // VERIFICA VITÓRIA (alcançou 2048)
        if (!this.won) {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j] === 2048) {
                        this.won = true;
                        this.showMessage('Você Venceu! 🎉', `Parabéns! Pontuação: ${this.score}`);
                        return;
                    }
                }
            }
        }

        // VERIFICA GAME OVER
        // 1. Se há célula vazia, jogo continua
        const hasEmptyCell = this.grid.some(row => row.includes(0));
        if (hasEmptyCell) return;

        // 2. Verifica se ainda há movimentos possíveis
        let canMove = false;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                // Verifica adjacentes horizontais e verticais
                if (j < this.size - 1 && current === this.grid[i][j + 1]) canMove = true;
                if (i < this.size - 1 && current === this.grid[i + 1][j]) canMove = true;
            }
        }

        // Se não pode mover, game over
        if (!canMove) {
            this.gameOver = true;
            this.showMessage('Game Over!', `Pontuação final: ${this.score}`);
        }
    }

    // ===== MOSTRA MENSAGEM =====
    showMessage(title, text) {
        this.messageTitle.textContent = title;
        this.messageText.textContent = text;
        this.gameMessage.classList.add('show');
    }

    // ===== ESCONDE MENSAGEM =====
    hideMessage() {
        this.gameMessage.classList.remove('show');
    }

    // ===== REINICIA O JOGO =====
    restart() {
        this.hideMessage();
        this.init();
    }
}

// ===== INICIA O JOGO QUANDO A PÁGINA CARREGA =====
const game = new Game2048();