/**
 * Classe MemoryGame - Implementa a lógica do Jogo da Memória
 * Jogo onde o jogador deve encontrar pares de cartas iguais
 */
class MemoryGame {
    constructor() {
        this.difficulty = 'medium';
        this.gridSizes = {
            easy: { rows: 4, cols: 4, pairs: 8 },
            medium: { rows: 4, cols: 6, pairs: 12 },
            hard: { rows: 6, cols: 6, pairs: 18 }
        };
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.gameTimer = null;
        this.isGameActive = false;
        
        // Símbolos para as cartas (emojis)
        this.symbols = [
            '🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎸',
            '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎥', '📷',
            '📱', '💻', '⌚', '🔌', '💡', '🔋', '🔍', '🔒',
            '🗝️', '🎁', '🎀', '🎊', '🎉', '🎈', '🎂', '🍰',
            '🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍑', '🍒'
        ];
        
        this.createUI();
        this.newGame();
    }
    
    /**
     * Inicia um novo jogo
     */
    newGame() {
        this.resetGame();
        this.generateCards();
        this.shuffleCards();
        this.createGrid();
        this.updateStats();
        this.isGameActive = true;
        this.startTimer();
    }
    
    /**
     * Reseta o estado do jogo
     */
    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.isGameActive = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }
    
    /**
     * Gera as cartas do jogo baseado na dificuldade
     */
    generateCards() {
        const config = this.gridSizes[this.difficulty];
        const totalCards = config.rows * config.cols;
        const pairs = totalCards / 2;
        
        this.cards = [];
        
        // Seleciona símbolos aleatórios
        const selectedSymbols = this.symbols.slice(0, pairs);
        
        // Cria pares de cartas
        for (let i = 0; i < pairs; i++) {
            const symbol = selectedSymbols[i];
            this.cards.push({ id: i * 2, symbol, matched: false, flipped: false });
            this.cards.push({ id: i * 2 + 1, symbol, matched: false, flipped: false });
        }
    }
    
    /**
     * Embaralha as cartas
     */
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    /**
     * Cria a grade de cartas na interface
     */
    createGrid() {
        const config = this.gridSizes[this.difficulty];
        const grid = document.getElementById('memory-grid');
        
        // Define o layout da grade
        grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        grid.innerHTML = '';
        
        // Cria as cartas
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.index = index;
            cardElement.textContent = '?';
            
            cardElement.addEventListener('click', () => this.flipCard(index));
            
            grid.appendChild(cardElement);
        });
    }
    
    /**
     * Vira uma carta
     * @param {number} index índice da carta no array
     */
    flipCard(index) {
        if (!this.isGameActive) return;
        
        const card = this.cards[index];
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        
        // Verifica se a carta já está virada ou combinada
        if (card.flipped || card.matched || this.flippedCards.length >= 2) {
            return;
        }
        
        // Vira a carta
        card.flipped = true;
        cardElement.classList.add('flipped');
        cardElement.textContent = card.symbol;
        this.flippedCards.push(index);
        
        // Verifica se duas cartas foram viradas
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    /**
     * Verifica se as duas cartas viradas são iguais
     */
    checkMatch() {
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        const cardElement1 = document.querySelector(`[data-index="${index1}"]`);
        const cardElement2 = document.querySelector(`[data-index="${index2}"]`);
        
        if (card1.symbol === card2.symbol) {
            // Cartas combinam
            card1.matched = true;
            card2.matched = true;
            
            cardElement1.classList.add('matched');
            cardElement2.classList.add('matched');
            
            this.matchedPairs++;
            this.updateStats();
            
            // Verifica se o jogo terminou
            if (this.matchedPairs === this.gridSizes[this.difficulty].pairs) {
                this.endGame();
            }
        } else {
            // Cartas não combinam - vira de volta
            card1.flipped = false;
            card2.flipped = false;
            
            cardElement1.classList.remove('flipped');
            cardElement2.classList.remove('flipped');
            cardElement1.textContent = '?';
            cardElement2.textContent = '?';
        }
        
        this.flippedCards = [];
    }
    
    /**
     * Termina o jogo
     */
    endGame() {
        this.isGameActive = false;
        clearInterval(this.gameTimer);
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        setTimeout(() => {
            alert(`Parabéns! Você completou o jogo em ${this.moves} movimentos e ${minutes}:${seconds.toString().padStart(2, '0')}!`);
        }, 500);
    }
    
    /**
     * Inicia o cronômetro
     */
    startTimer() {
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    /**
     * Atualiza o cronômetro na interface
     */
    updateTimer() {
        if (!this.isGameActive) return;
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        document.getElementById('memory-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Atualiza as estatísticas na interface
     */
    updateStats() {
        document.getElementById('memory-moves').textContent = this.moves;
        document.getElementById('memory-pairs').textContent = this.matchedPairs;
        document.getElementById('memory-total-pairs').textContent = this.gridSizes[this.difficulty].pairs;
    }
    
    /**
     * Define a dificuldade do jogo
     * @param {string} difficulty nível de dificuldade (easy, medium, hard)
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.newGame();
    }
    
    /**
     * Cria a interface do usuário (não há muito a fazer aqui pois o HTML já existe)
     */
    createUI() {
        // A interface já está criada no HTML
        // Este método existe para manter consistência com outras classes
    }
}

// Instância global do jogo da memória
let memory;

