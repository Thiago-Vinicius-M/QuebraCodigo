# 📚 Explicação Detalhada do Código - Passo a Passo

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Backend Java - Spring Boot](#backend-java---spring-boot)
3. [Frontend JavaScript](#frontend-javascript)
4. [Integração Frontend-Backend](#integração-frontend-backend)
5. [Algoritmos Implementados](#algoritmos-implementados)
6. [Padrões de Design Utilizados](#padrões-de-design-utilizados)

## 🏗️ Visão Geral da Arquitetura

### Arquitetura MVC (Model-View-Controller)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     VIEW        │    │   CONTROLLER    │    │     MODEL       │
│  (HTML/CSS/JS)  │◄──►│  (Spring Boot)  │◄──►│  (Java Classes) │
│                 │    │                 │    │                 │
│ • index.html    │    │ • HomeController│    │ • SudokuBoard   │
│ • styles.css    │    │ • REST APIs     │    │ • Game Logic    │
│ • *.js files    │    │ • Routing       │    │ • Algorithms    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Fluxo de Dados

1. **Usuário interage** com a interface (HTML/CSS/JS)
2. **JavaScript** processa a interação localmente
3. **Requisições AJAX** são enviadas para o backend (quando necessário)
4. **Spring Boot** processa a lógica de negócio
5. **Resposta JSON** é enviada de volta
6. **Interface é atualizada** dinamicamente

## 🚀 Backend Java - Spring Boot

### 1. Classe Principal - WebGamesApplication.java

```java
package com.webgames;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal da aplicação Spring Boot.
 * 
 * @SpringBootApplication é uma anotação composta que inclui:
 * - @Configuration: Marca a classe como fonte de definições de beans
 * - @EnableAutoConfiguration: Habilita configuração automática do Spring Boot
 * - @ComponentScan: Habilita escaneamento de componentes no pacote atual
 */
@SpringBootApplication
public class WebGamesApplication {

    /**
     * Método main que inicia a aplicação Spring Boot.
     * 
     * SpringApplication.run() faz:
     * 1. Cria um ApplicationContext Spring
     * 2. Registra beans automaticamente
     * 3. Inicia o servidor web embarcado (Tomcat)
     * 4. Configura logging e outras funcionalidades
     */
    public static void main(String[] args) {
        SpringApplication.run(WebGamesApplication.class, args);
        
        // Mensagem de boas-vindas no console
        System.out.println("=================================");
        System.out.println("🎮 Web Games Application Started!");
        System.out.println("=================================");
        System.out.println("📱 Acesse: http://localhost:8080");
        System.out.println("🎯 Jogos disponíveis:");
        System.out.println("   • Sudoku");
        System.out.println("   • Jogo da Memória");
        System.out.println("   • Connect 4");
        System.out.println("=================================");
    }
}
```

**Por que Spring Boot?**
- **Configuração automática**: Não precisa configurar manualmente Tomcat, Jackson, etc.
- **Servidor embarcado**: Aplicação roda como JAR executável
- **Starter dependencies**: Dependências pré-configuradas
- **Production-ready**: Métricas, health checks, etc.

### 2. Controller Web - HomeController.java

```java
package com.webgames.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller responsável por servir a página inicial.
 * 
 * @Controller indica que esta classe é um controller Spring MVC
 * Diferente de @RestController, retorna views (páginas) ao invés de JSON
 */
@Controller
public class HomeController {

    /**
     * Mapeia requisições GET para a raiz "/" para a página inicial.
     * 
     * @GetMapping é uma especialização de @RequestMapping(method = GET)
     * 
     * return "redirect:/index.html" redireciona para o arquivo estático
     * Spring Boot serve automaticamente arquivos em src/main/resources/static/
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/index.html";
    }
}
```

**Conceitos importantes:**
- **@Controller vs @RestController**: Controller retorna views, RestController retorna dados
- **Arquivos estáticos**: Spring Boot serve automaticamente de `/static/`
- **Redirect**: `redirect:` faz o navegador fazer nova requisição

### 3. Modelo de Dados - SudokuBoard.java

```java
package com.webgames.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.util.Random;

/**
 * Classe que representa um tabuleiro de Sudoku.
 * 
 * Implementa toda a lógica necessária para:
 * - Gerar tabuleiros válidos
 * - Validar movimentos
 * - Resolver puzzles
 * - Verificar completude
 */
public class SudokuBoard {
    
    // Constantes para melhor legibilidade e manutenção
    public static final int SIZE = 9;              // Tamanho do tabuleiro 9x9
    public static final int SUBGRID_SIZE = 3;      // Tamanho do subgrid 3x3
    public static final int EMPTY_CELL = 0;        // Valor para célula vazia
    
    // Estado do jogo
    private int[][] board;                         // Tabuleiro atual
    private int[][] originalBoard;                 // Tabuleiro original (backup)
    private boolean[][] editable;                  // Quais células são editáveis
    private Random random;                         // Gerador de números aleatórios
    
    /**
     * Construtor inicializa todas as estruturas de dados.
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
```

#### Algoritmo de Geração de Sudoku

```java
    /**
     * Gera um novo puzzle Sudoku usando backtracking.
     * 
     * Processo:
     * 1. Limpa o tabuleiro
     * 2. Gera um tabuleiro completo válido
     * 3. Remove células para criar o puzzle
     * 4. Define quais células são editáveis
     */
    public void generateNewPuzzle(int difficulty) {
        clearBoard();                    // Limpa tudo
        generateCompleteBoard();         // Gera tabuleiro completo
        copyBoard(board, originalBoard); // Salva backup
        removeCells(difficulty);         // Remove células (cria puzzle)
        setEditableCells();             // Define células editáveis
    }
    
    /**
     * Preenche o tabuleiro recursivamente usando backtracking.
     * 
     * Backtracking é um algoritmo que:
     * 1. Tenta uma solução
     * 2. Se não funciona, desfaz (backtrack)
     * 3. Tenta próxima opção
     * 4. Repete até encontrar solução
     */
    private boolean fillBoard(int row, int col) {
        // Caso base: chegou ao final do tabuleiro
        if (row == SIZE) {
            return true; // Tabuleiro completo!
        }
        
        // Calcula próxima posição (vai para próxima linha quando col = 9)
        int nextRow = (col == SIZE - 1) ? row + 1 : row;
        int nextCol = (col == SIZE - 1) ? 0 : col + 1;
        
        // Cria lista de números 1-9 em ordem aleatória
        List<Integer> numbers = new ArrayList<>();
        for (int i = 1; i <= 9; i++) {
            numbers.add(i);
        }
        Collections.shuffle(numbers, random); // Embaralha para variedade
        
        // Tenta cada número na ordem aleatória
        for (int num : numbers) {
            if (isValidMove(row, col, num)) {
                board[row][col] = num;           // Coloca o número
                
                if (fillBoard(nextRow, nextCol)) { // Recursão
                    return true;                 // Sucesso!
                }
                
                board[row][col] = EMPTY_CELL;    // Backtrack: remove número
            }
        }
        
        return false; // Nenhum número funcionou
    }
```

#### Validação de Movimentos

```java
    /**
     * Verifica se um movimento é válido segundo as regras do Sudoku.
     * 
     * Regras do Sudoku:
     * 1. Número não pode repetir na mesma linha
     * 2. Número não pode repetir na mesma coluna  
     * 3. Número não pode repetir no mesmo subgrid 3x3
     */
    public boolean isValidMove(int row, int col, int num) {
        // Regra 1: Verifica linha
        for (int c = 0; c < SIZE; c++) {
            if (board[row][c] == num) {
                return false; // Número já existe na linha
            }
        }
        
        // Regra 2: Verifica coluna
        for (int r = 0; r < SIZE; r++) {
            if (board[r][col] == num) {
                return false; // Número já existe na coluna
            }
        }
        
        // Regra 3: Verifica subgrid 3x3
        // Calcula posição do canto superior esquerdo do subgrid
        int subgridRow = (row / SUBGRID_SIZE) * SUBGRID_SIZE;
        int subgridCol = (col / SUBGRID_SIZE) * SUBGRID_SIZE;
        
        // Verifica todas as células do subgrid 3x3
        for (int r = subgridRow; r < subgridRow + SUBGRID_SIZE; r++) {
            for (int c = subgridCol; c < subgridCol + SUBGRID_SIZE; c++) {
                if (board[r][c] == num) {
                    return false; // Número já existe no subgrid
                }
            }
        }
        
        return true; // Movimento é válido!
    }
```

**Complexidade do Algoritmo:**
- **Geração**: O(9^(n*n)) no pior caso, mas otimizado com heurísticas
- **Validação**: O(1) - sempre verifica 27 células (9+9+9)
- **Resolução**: O(9^(n*n)) usando backtracking

## 🎨 Frontend JavaScript

### 1. Estrutura HTML - index.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Games - Sudoku, Jogo da Memória e Connect 4</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Cabeçalho principal -->
    <header>
        <h1>Web Games</h1>
        <p>Jogos desenvolvidos em JavaScript para navegador</p>
    </header>

    <!-- Navegação entre jogos -->
    <nav class="game-selector">
        <button class="game-btn active" data-game="sudoku">🔢 Sudoku</button>
        <button class="game-btn" data-game="memory">🧠 Jogo da Memória</button>
        <button class="game-btn" data-game="connect4">🔴 Connect 4</button>
    </nav>

    <!-- Container principal dos jogos -->
    <main class="game-container">
        <!-- Seção do Sudoku -->
        <section id="sudoku-section" class="game-section active">
            <h2>Sudoku</h2>
            <div class="game-controls">
                <button id="sudoku-new">Novo Jogo</button>
                <button id="sudoku-solve">Resolver</button>
                <button id="sudoku-clear">Limpar</button>
                <button id="sudoku-validate">Verificar</button>
            </div>
            <div id="sudoku-message" class="message"></div>
            <table id="sudoku-grid" class="sudoku-grid"></table>
        </section>

        <!-- Outras seções... -->
    </main>

    <!-- Scripts JavaScript -->
    <script src="sudoku.js"></script>
    <script src="memory.js"></script>
    <script src="connect4.js"></script>
    <script src="main.js"></script>
</body>
</html>
```

**Conceitos HTML importantes:**
- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<section>` para estrutura semântica
- **Data attributes**: `data-game="sudoku"` para identificar elementos
- **Viewport meta**: Essencial para responsividade mobile
- **Script loading**: Scripts carregados no final para melhor performance

### 2. Estilização CSS - styles.css

```css
/* Reset básico e configurações globais */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box; /* Inclui padding/border no width/height */
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: white;
}

/* Layout responsivo usando CSS Grid */
.game-container {
    display: grid;
    grid-template-columns: 1fr;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    gap: 20px;
}

/* Sudoku grid usando CSS Grid para layout perfeito */
.sudoku-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);
    gap: 2px;
    background-color: #333;
    border: 3px solid #333;
    margin: 20px auto;
    width: min(90vw, 450px); /* Responsivo: 90% da viewport ou 450px */
    aspect-ratio: 1; /* Mantém proporção quadrada */
}

/* Células do Sudoku */
.sudoku-cell {
    background-color: white;
    border: none;
    text-align: center;
    font-size: clamp(14px, 3vw, 24px); /* Fonte responsiva */
    font-weight: bold;
    color: #333;
    transition: all 0.2s ease;
}

/* Estados das células */
.sudoku-cell:focus {
    outline: 3px solid #4CAF50;
    background-color: #e8f5e8;
}

.sudoku-cell.fixed {
    background-color: #f0f0f0;
    color: #666;
    cursor: not-allowed;
}

.sudoku-cell.error {
    background-color: #ffebee;
    color: #d32f2f;
}

/* Bordas dos subgrids 3x3 */
.sudoku-cell:nth-child(3n) {
    border-right: 3px solid #333;
}

.sudoku-cell:nth-child(n+19):nth-child(-n+27),
.sudoku-cell:nth-child(n+46):nth-child(-n+54) {
    border-bottom: 3px solid #333;
}

/* Media queries para responsividade */
@media (max-width: 768px) {
    .game-container {
        padding: 10px;
    }
    
    .sudoku-grid {
        width: 95vw;
        gap: 1px;
    }
    
    .sudoku-cell {
        font-size: 16px;
        min-height: 35px;
    }
}

/* Animações suaves */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.game-section {
    animation: fadeIn 0.3s ease-out;
}
```

**Conceitos CSS importantes:**
- **CSS Grid**: Layout moderno e flexível
- **Clamp()**: Valores responsivos `clamp(min, preferred, max)`
- **Aspect-ratio**: Mantém proporções sem JavaScript
- **Custom properties**: Variáveis CSS para reutilização
- **Transitions**: Animações suaves para melhor UX

### 3. Lógica JavaScript - sudoku.js

```javascript
/**
 * Classe que gerencia o jogo Sudoku no frontend.
 * 
 * Responsabilidades:
 * - Criar interface do usuário
 * - Gerenciar interações do usuário
 * - Validar entrada de dados
 * - Comunicar com backend (futuro)
 * - Atualizar display em tempo real
 */
class SudokuGame {
    constructor() {
        // Estado do jogo
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.originalBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.editable = Array(9).fill().map(() => Array(9).fill(true));
        
        // Elementos DOM
        this.gridElement = document.getElementById('sudoku-grid');
        this.messageElement = document.getElementById('sudoku-message');
        
        // Inicialização
        this.createGrid();
        this.bindEvents();
        this.generateNewGame();
    }
    
    /**
     * Cria o grid 9x9 do Sudoku dinamicamente.
     * 
     * Usa DOM manipulation para criar elementos:
     * - 9 linhas (tr)
     * - 9 células por linha (td > input)
     * - Event listeners para cada célula
     */
    createGrid() {
        this.gridElement.innerHTML = ''; // Limpa grid existente
        
        for (let row = 0; row < 9; row++) {
            const tr = document.createElement('tr');
            
            for (let col = 0; col < 9; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                
                // Configuração do input
                input.type = 'text';
                input.maxLength = 1;
                input.className = 'sudoku-cell';
                input.id = `cell-${row}-${col}`;
                
                // Adiciona bordas dos subgrids 3x3
                if (row % 3 === 0 && row !== 0) {
                    input.classList.add('top-border');
                }
                if (col % 3 === 0 && col !== 0) {
                    input.classList.add('left-border');
                }
                
                // Event listeners
                input.addEventListener('input', (e) => this.handleInput(e, row, col));
                input.addEventListener('keydown', (e) => this.handleKeydown(e, row, col));
                
                td.appendChild(input);
                tr.appendChild(td);
            }
            
            this.gridElement.appendChild(tr);
        }
    }
    
    /**
     * Gerencia entrada de dados nas células.
     * 
     * Validações:
     * - Apenas números 1-9
     * - Células editáveis apenas
     * - Validação em tempo real
     */
    handleInput(event, row, col) {
        const input = event.target;
        const value = input.value;
        
        // Validação de entrada
        if (value && (!/^[1-9]$/.test(value))) {
            input.value = ''; // Remove caracteres inválidos
            return;
        }
        
        // Verifica se célula é editável
        if (!this.editable[row][col]) {
            input.value = this.board[row][col] || '';
            return;
        }
        
        // Atualiza estado interno
        this.board[row][col] = value ? parseInt(value) : 0;
        
        // Validação em tempo real
        this.validateCell(row, col);
        
        // Verifica se jogo foi completado
        if (this.isGameComplete()) {
            this.showMessage('🎉 Parabéns! Você completou o Sudoku!', 'success');
        }
    }
    
    /**
     * Valida uma célula específica em tempo real.
     * 
     * Aplica classes CSS para feedback visual:
     * - 'error': Movimento inválido (vermelho)
     * - 'valid': Movimento válido (verde)
     */
    validateCell(row, col) {
        const input = document.getElementById(`cell-${row}-${col}`);
        const value = this.board[row][col];
        
        if (value === 0) {
            input.classList.remove('error', 'valid');
            return;
        }
        
        const isValid = this.isValidMove(row, col, value);
        
        if (isValid) {
            input.classList.remove('error');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('error');
        }
    }
```

#### Algoritmo de Geração de Sudoku em JavaScript

```javascript
    /**
     * Gera um novo jogo Sudoku.
     * 
     * Processo similar ao backend Java:
     * 1. Gera tabuleiro completo
     * 2. Remove células aleatoriamente
     * 3. Atualiza interface
     */
    generateNewGame() {
        // Limpa tabuleiro
        this.clearBoard();
        
        // Gera tabuleiro completo válido
        this.generateCompleteBoard();
        
        // Salva como tabuleiro original
        this.originalBoard = this.board.map(row => [...row]);
        
        // Remove células para criar puzzle (45 = médio)
        this.removeCells(45);
        
        // Define células editáveis
        this.setEditableCells();
        
        // Atualiza interface
        this.updateDisplay();
        
        this.showMessage('Novo jogo iniciado! Boa sorte!', 'info');
    }
    
    /**
     * Algoritmo de backtracking para gerar tabuleiro completo.
     * 
     * Versão JavaScript do algoritmo implementado em Java.
     */
    generateCompleteBoard() {
        return this.fillBoard(0, 0);
    }
    
    fillBoard(row, col) {
        // Caso base: tabuleiro completo
        if (row === 9) return true;
        
        // Próxima posição
        const nextRow = col === 8 ? row + 1 : row;
        const nextCol = col === 8 ? 0 : col + 1;
        
        // Números 1-9 em ordem aleatória
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);
        
        // Tenta cada número
        for (const num of numbers) {
            if (this.isValidMove(row, col, num)) {
                this.board[row][col] = num;
                
                if (this.fillBoard(nextRow, nextCol)) {
                    return true; // Sucesso!
                }
                
                this.board[row][col] = 0; // Backtrack
            }
        }
        
        return false; // Falhou
    }
    
    /**
     * Algoritmo Fisher-Yates para embaralhar array.
     * 
     * Garante distribuição uniforme e aleatória.
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap
        }
    }
```

### 4. Jogo da Memória - memory.js

```javascript
/**
 * Classe que implementa o Jogo da Memória.
 * 
 * Características:
 * - Diferentes níveis de dificuldade
 * - Cronômetro automático
 * - Contador de movimentos
 * - Animações suaves
 */
class MemoryGame {
    constructor() {
        // Configurações dos níveis
        this.levels = {
            easy: { rows: 4, cols: 4, pairs: 8 },
            medium: { rows: 4, cols: 6, pairs: 12 },
            hard: { rows: 6, cols: 6, pairs: 18 }
        };
        
        // Estado do jogo
        this.currentLevel = 'medium';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timer = null;
        
        // Elementos DOM
        this.gridElement = document.getElementById('memory-grid');
        this.movesElement = document.getElementById('memory-moves');
        this.pairsElement = document.getElementById('memory-pairs');
        this.timeElement = document.getElementById('memory-time');
        
        this.init();
    }
    
    /**
     * Inicializa o jogo criando cartas e embaralhando.
     */
    init() {
        this.createCards();
        this.shuffleCards();
        this.createGrid();
        this.startTimer();
    }
    
    /**
     * Cria pares de cartas com símbolos únicos.
     * 
     * Usa emojis como símbolos para melhor experiência visual.
     */
    createCards() {
        const level = this.levels[this.currentLevel];
        const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎵', 
                        '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎭',
                        '🏆', '🏅', '🏈', '🏀', '⚽', '🎾', '🏐', '🏓'];
        
        this.cards = [];
        
        // Cria pares de cartas
        for (let i = 0; i < level.pairs; i++) {
            const symbol = symbols[i];
            this.cards.push({ id: i * 2, symbol, matched: false });
            this.cards.push({ id: i * 2 + 1, symbol, matched: false });
        }
    }
    
    /**
     * Embaralha cartas usando algoritmo Fisher-Yates.
     */
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    /**
     * Cria o grid visual das cartas.
     */
    createGrid() {
        const level = this.levels[this.currentLevel];
        this.gridElement.innerHTML = '';
        this.gridElement.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back">${card.symbol}</div>
                </div>
            `;
            
            cardElement.addEventListener('click', () => this.flipCard(index));
            this.gridElement.appendChild(cardElement);
        });
    }
    
    /**
     * Gerencia o flip (virar) das cartas.
     * 
     * Lógica:
     * 1. Vira carta se possível
     * 2. Se duas cartas viradas, verifica match
     * 3. Se match, marca como encontradas
     * 4. Se não match, vira de volta após delay
     */
    flipCard(index) {
        // Validações
        if (this.flippedCards.length >= 2) return;
        if (this.flippedCards.includes(index)) return;
        if (this.cards[index].matched) return;
        
        // Vira carta
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
        
        // Se duas cartas viradas, verifica match
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    
    /**
     * Verifica se as duas cartas viradas são iguais.
     */
    checkMatch() {
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        if (card1.symbol === card2.symbol) {
            // Match encontrado!
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            
            // Adiciona classe de sucesso
            document.querySelector(`[data-index="${index1}"]`).classList.add('matched');
            document.querySelector(`[data-index="${index2}"]`).classList.add('matched');
            
            // Verifica vitória
            if (this.matchedPairs === this.levels[this.currentLevel].pairs) {
                this.gameWon();
            }
        } else {
            // Não é match, vira cartas de volta
            document.querySelector(`[data-index="${index1}"]`).classList.remove('flipped');
            document.querySelector(`[data-index="${index2}"]`).classList.remove('flipped');
        }
        
        this.flippedCards = [];
        this.updateStats();
    }
```

### 5. Connect 4 - connect4.js

```javascript
/**
 * Classe que implementa o jogo Connect 4.
 * 
 * Regras:
 * - Tabuleiro 7x6 (7 colunas, 6 linhas)
 * - Jogadores alternam turnos
 * - Objetivo: conectar 4 peças em linha
 * - Direções: horizontal, vertical, diagonal
 */
class Connect4Game {
    constructor() {
        // Configurações do jogo
        this.ROWS = 6;
        this.COLS = 7;
        this.CONNECT = 4;
        
        // Estado do jogo
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
        this.currentPlayer = 1; // 1 = Jogador 1, 2 = Jogador 2
        this.gameOver = false;
        this.scores = { player1: 0, player2: 0 };
        
        // Elementos DOM
        this.gridElement = document.getElementById('connect4-grid');
        this.statusElement = document.getElementById('connect4-status');
        this.player1ScoreElement = document.getElementById('player1-score');
        this.player2ScoreElement = document.getElementById('player2-score');
        
        this.init();
    }
    
    /**
     * Inicializa o jogo criando o grid e configurando eventos.
     */
    init() {
        this.createGrid();
        this.updateDisplay();
    }
    
    /**
     * Cria o grid 7x6 do Connect 4.
     */
    createGrid() {
        this.gridElement.innerHTML = '';
        
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'connect4-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Adiciona evento de clique apenas na primeira linha
                if (row === 0) {
                    cell.addEventListener('click', () => this.dropPiece(col));
                    cell.classList.add('clickable');
                }
                
                this.gridElement.appendChild(cell);
            }
        }
    }
    
    /**
     * Simula a queda de uma peça na coluna especificada.
     * 
     * Física do jogo:
     * - Peça cai por gravidade
     * - Para na primeira posição livre (de baixo para cima)
     * - Animação visual da queda
     */
    dropPiece(col) {
        if (this.gameOver) return;
        
        // Encontra a linha mais baixa disponível
        let targetRow = -1;
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                targetRow = row;
                break;
            }
        }
        
        // Coluna cheia
        if (targetRow === -1) {
            this.showMessage('Coluna cheia! Escolha outra.', 'warning');
            return;
        }
        
        // Coloca a peça no tabuleiro
        this.board[targetRow][col] = this.currentPlayer;
        
        // Atualiza visual com animação
        this.animateDropPiece(targetRow, col);
        
        // Verifica vitória
        if (this.checkWin(targetRow, col)) {
            this.gameWon();
            return;
        }
        
        // Verifica empate
        if (this.isBoardFull()) {
            this.gameTied();
            return;
        }
        
        // Próximo jogador
        this.switchPlayer();
    }
    
    /**
     * Verifica vitória em todas as direções possíveis.
     * 
     * Direções verificadas:
     * - Horizontal (←→)
     * - Vertical (↑↓)  
     * - Diagonal principal (\)
     * - Diagonal secundária (/)
     */
    checkWin(row, col) {
        const player = this.board[row][col];
        
        // Direções: [deltaRow, deltaCol]
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonal \
            [1, -1]   // Diagonal /
        ];
        
        for (const [deltaRow, deltaCol] of directions) {
            let count = 1; // Conta a peça atual
            
            // Verifica em uma direção
            count += this.countDirection(row, col, deltaRow, deltaCol, player);
            
            // Verifica na direção oposta
            count += this.countDirection(row, col, -deltaRow, -deltaCol, player);
            
            // Se encontrou 4 ou mais em linha
            if (count >= this.CONNECT) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Conta peças consecutivas em uma direção específica.
     */
    countDirection(row, col, deltaRow, deltaCol, player) {
        let count = 0;
        let currentRow = row + deltaRow;
        let currentCol = col + deltaCol;
        
        // Continua contando enquanto:
        // 1. Está dentro do tabuleiro
        // 2. A peça pertence ao mesmo jogador
        while (
            currentRow >= 0 && currentRow < this.ROWS &&
            currentCol >= 0 && currentCol < this.COLS &&
            this.board[currentRow][currentCol] === player
        ) {
            count++;
            currentRow += deltaRow;
            currentCol += deltaCol;
        }
        
        return count;
    }
    
    /**
     * Anima a queda da peça com CSS transitions.
     */
    animateDropPiece(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        // Adiciona classe do jogador atual
        cell.classList.add(`player${this.currentPlayer}`);
        
        // Animação de queda (CSS)
        cell.style.transform = 'translateY(-300px)';
        cell.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Reseta posição após animação
        setTimeout(() => {
            cell.style.transform = 'translateY(0)';
        }, 50);
    }
```

## 🔗 Integração Frontend-Backend

### Comunicação via AJAX/Fetch API

```javascript
/**
 * Exemplo de integração com backend Spring Boot.
 * 
 * Usa Fetch API para comunicação assíncrona.
 */
class SudokuAPI {
    constructor() {
        this.baseURL = '/api/sudoku';
    }
    
    /**
     * Solicita novo jogo ao backend.
     */
    async newGame(difficulty = 45) {
        try {
            const response = await fetch(`${this.baseURL}/new-game`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ difficulty })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao gerar novo jogo:', error);
            throw error;
        }
    }
    
    /**
     * Envia movimento para validação no backend.
     */
    async makeMove(row, col, value) {
        try {
            const response = await fetch(`${this.baseURL}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ row, col, value })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao fazer movimento:', error);
            throw error;
        }
    }
    
    /**
     * Solicita resolução automática do puzzle.
     */
    async solvePuzzle() {
        try {
            const response = await fetch(`${this.baseURL}/solve`, {
                method: 'POST'
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao resolver puzzle:', error);
            throw error;
        }
    }
}
```

### Padrão Observer para Atualizações

```javascript
/**
 * Sistema de eventos para comunicação entre componentes.
 */
class GameEventSystem {
    constructor() {
        this.listeners = {};
    }
    
    /**
     * Registra listener para um evento.
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    /**
     * Dispara um evento para todos os listeners.
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    /**
     * Remove listener de um evento.
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}

// Uso do sistema de eventos
const gameEvents = new GameEventSystem();

// Registra listeners
gameEvents.on('sudoku:gameWon', (data) => {
    console.log('Sudoku completado!', data);
    // Atualiza estatísticas, mostra parabéns, etc.
});

gameEvents.on('memory:cardFlipped', (data) => {
    console.log('Carta virada:', data);
    // Atualiza contador de movimentos
});

// Dispara eventos
gameEvents.emit('sudoku:gameWon', { time: 180, moves: 45 });
```

## 🧮 Algoritmos Implementados

### 1. Backtracking (Sudoku)

**Complexidade**: O(9^(n²)) no pior caso
**Uso**: Geração e resolução de puzzles Sudoku

```
Algoritmo Backtracking:
1. Escolhe uma célula vazia
2. Tenta números 1-9
3. Para cada número:
   a. Verifica se é válido
   b. Se válido, coloca no tabuleiro
   c. Recursivamente resolve o resto
   d. Se não consegue resolver, remove número (backtrack)
4. Se todos os números falharam, retorna falso
5. Se tabuleiro completo, retorna verdadeiro
```

### 2. Fisher-Yates Shuffle

**Complexidade**: O(n)
**Uso**: Embaralhar cartas no Jogo da Memória

```
Algoritmo Fisher-Yates:
1. Para i de n-1 até 1:
   a. Escolhe j aleatório entre 0 e i
   b. Troca elementos[i] com elementos[j]
2. Resultado: array embaralhado uniformemente
```

### 3. Flood Fill (Connect 4)

**Complexidade**: O(1) - sempre verifica no máximo 4 direções
**Uso**: Verificação de vitória no Connect 4

```
Algoritmo de Verificação de Vitória:
1. Para cada direção (horizontal, vertical, diagonais):
   a. Conta peças consecutivas em uma direção
   b. Conta peças consecutivas na direção oposta
   c. Soma total (incluindo peça atual)
   d. Se total >= 4, vitória encontrada
```

## 🎨 Padrões de Design Utilizados

### 1. MVC (Model-View-Controller)

```
Model (Java):
- SudokuBoard: Lógica de negócio
- Algoritmos de geração/validação
- Estado do jogo

View (HTML/CSS):
- Interface do usuário
- Elementos visuais
- Responsividade

Controller (JavaScript + Spring):
- Gerencia interações do usuário
- Coordena Model e View
- APIs REST
```

### 2. Observer Pattern

```javascript
// Implementado no sistema de eventos
class GameObserver {
    update(event, data) {
        switch(event) {
            case 'gameWon':
                this.showCelebration(data);
                break;
            case 'gameOver':
                this.showGameOver(data);
                break;
        }
    }
}
```

### 3. Strategy Pattern

```javascript
// Diferentes estratégias para níveis de dificuldade
class DifficultyStrategy {
    static strategies = {
        easy: { cellsToRemove: 30, timeLimit: 600 },
        medium: { cellsToRemove: 45, timeLimit: 900 },
        hard: { cellsToRemove: 60, timeLimit: 1200 }
    };
    
    static getStrategy(level) {
        return this.strategies[level] || this.strategies.medium;
    }
}
```

### 4. Factory Pattern

```javascript
// Factory para criar diferentes tipos de jogos
class GameFactory {
    static createGame(type) {
        switch(type) {
            case 'sudoku':
                return new SudokuGame();
            case 'memory':
                return new MemoryGame();
            case 'connect4':
                return new Connect4Game();
            default:
                throw new Error(`Tipo de jogo desconhecido: ${type}`);
        }
    }
}
```

### 5. Singleton Pattern

```javascript
// Gerenciador global de jogos
class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        
        this.currentGame = null;
        this.games = {};
        GameManager.instance = this;
    }
    
    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
}
```

## 🚀 Otimizações Implementadas

### 1. Performance Frontend

- **Debouncing**: Evita validações excessivas durante digitação
- **Event Delegation**: Um listener para múltiplos elementos
- **CSS Animations**: Usa GPU para animações suaves
- **Lazy Loading**: Carrega jogos apenas quando necessário

### 2. Responsividade

- **CSS Grid**: Layout flexível e moderno
- **Viewport Units**: Tamanhos relativos à tela
- **Media Queries**: Adaptação para diferentes dispositivos
- **Touch Events**: Suporte completo a dispositivos móveis

### 3. Acessibilidade

- **Semantic HTML**: Estrutura semântica clara
- **ARIA Labels**: Descrições para leitores de tela
- **Keyboard Navigation**: Navegação por teclado
- **Color Contrast**: Cores com contraste adequado

---

Esta documentação fornece uma visão completa da implementação, desde os conceitos básicos até os algoritmos avançados utilizados. Cada seção inclui exemplos práticos e explicações detalhadas para facilitar o entendimento e a manutenção do código.

