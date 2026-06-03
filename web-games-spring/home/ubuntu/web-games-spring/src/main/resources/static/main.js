/**
 * Script principal que coordena todos os jogos
 * Gerencia a navegação entre jogos e inicialização
 */

// Variáveis globais para os jogos
let sudoku, memory, connect4;

/**
 * Inicializa todos os jogos quando a página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os jogos
    initializeGames();
    
    // Mostra o jogo padrão (Sudoku)
    showGame('sudoku');
});

/**
 * Inicializa todas as instâncias dos jogos
 */
function initializeGames() {
    try {
        // Inicializa o Sudoku
        sudoku = new SudokuGame();
        console.log('Sudoku inicializado com sucesso');
        
        // Inicializa o Jogo da Memória
        memory = new MemoryGame();
        console.log('Jogo da Memória inicializado com sucesso');
        
        // Inicializa o Connect 4
        connect4 = new Connect4Game();
        console.log('Connect 4 inicializado com sucesso');
        
    } catch (error) {
        console.error('Erro ao inicializar os jogos:', error);
    }
}

/**
 * Mostra um jogo específico e esconde os outros
 * @param {string} gameId ID do jogo a mostrar ('sudoku', 'memory', 'connect4')
 */
function showGame(gameId) {
    // Lista de todos os jogos
    const games = ['sudoku', 'memory', 'connect4'];
    
    // Esconde todos os painéis de jogos
    games.forEach(game => {
        const panel = document.getElementById(`${game}-game`);
        const button = document.getElementById(`${game}-btn`);
        
        if (panel) {
            panel.classList.remove('active');
        }
        
        if (button) {
            button.classList.remove('active');
        }
    });
    
    // Mostra o jogo selecionado
    const selectedPanel = document.getElementById(`${gameId}-game`);
    const selectedButton = document.getElementById(`${gameId}-btn`);
    
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    }
    
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Executa ações específicas para cada jogo quando é mostrado
    switch (gameId) {
        case 'sudoku':
            // Redefine o foco no Sudoku se necessário
            if (sudoku) {
                sudoku.updateDisplay();
            }
            break;
            
        case 'memory':
            // Atualiza as estatísticas do jogo da memória
            if (memory) {
                memory.updateStats();
            }
            break;
            
        case 'connect4':
            // Atualiza a exibição do Connect 4
            if (connect4) {
                connect4.updateDisplay();
            }
            break;
    }
    
    console.log(`Jogo ativo: ${gameId}`);
}

/**
 * Utilitários gerais para todos os jogos
 */
const GameUtils = {
    /**
     * Mostra uma mensagem de sucesso
     * @param {string} message mensagem a exibir
     */
    showSuccess: function(message) {
        this.showNotification(message, 'success');
    },
    
    /**
     * Mostra uma mensagem de erro
     * @param {string} message mensagem a exibir
     */
    showError: function(message) {
        this.showNotification(message, 'error');
    },
    
    /**
     * Mostra uma notificação temporária
     * @param {string} message mensagem a exibir
     * @param {string} type tipo da notificação ('success', 'error', 'info')
     */
    showNotification: function(message, type = 'info') {
        // Cria o elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Define a cor baseada no tipo
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            default:
                notification.style.backgroundColor = '#3498db';
        }
        
        // Adiciona ao DOM
        document.body.appendChild(notification);
        
        // Anima a entrada
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        // Remove após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },
    
    /**
     * Formata tempo em segundos para MM:SS
     * @param {number} seconds segundos a formatar
     * @returns {string} tempo formatado
     */
    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Gera um número aleatório entre min e max (inclusive)
     * @param {number} min valor mínimo
     * @param {number} max valor máximo
     * @returns {number} número aleatório
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Embaralha um array (algoritmo Fisher-Yates)
     * @param {Array} array array a embaralhar
     * @returns {Array} array embaralhado
     */
    shuffleArray: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

/**
 * Gerenciador de eventos de teclado para melhorar a acessibilidade
 */
document.addEventListener('keydown', function(event) {
    // Teclas de navegação entre jogos
    if (event.altKey) {
        switch (event.key) {
            case '1':
                event.preventDefault();
                showGame('sudoku');
                break;
            case '2':
                event.preventDefault();
                showGame('memory');
                break;
            case '3':
                event.preventDefault();
                showGame('connect4');
                break;
        }
    }
    
    // Tecla ESC para ações específicas do jogo ativo
    if (event.key === 'Escape') {
        const activeGame = document.querySelector('.game-panel.active');
        if (activeGame) {
            const gameId = activeGame.id.replace('-game', '');
            
            switch (gameId) {
                case 'sudoku':
                    if (sudoku && confirm('Deseja iniciar um novo jogo de Sudoku?')) {
                        sudoku.newGame();
                    }
                    break;
                case 'memory':
                    if (memory && confirm('Deseja iniciar um novo jogo da memória?')) {
                        memory.newGame();
                    }
                    break;
                case 'connect4':
                    if (connect4 && confirm('Deseja iniciar um novo jogo de Connect 4?')) {
                        connect4.newGame();
                    }
                    break;
            }
        }
    }
});

/**
 * Detecta se o dispositivo é mobile para ajustes específicos
 */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // Adiciona classe CSS para dispositivos móveis
    document.body.classList.add('mobile-device');
    
    // Previne zoom em inputs no iOS
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth < 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        });
        
        input.addEventListener('blur', function() {
            if (window.innerWidth < 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        });
    });
}

/**
 * Adiciona suporte a Service Worker para funcionamento offline (opcional)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Descomentado para implementação futura
        // navigator.serviceWorker.register('/sw.js')
        //     .then(function(registration) {
        //         console.log('ServiceWorker registrado com sucesso:', registration.scope);
        //     })
        //     .catch(function(error) {
        //         console.log('Falha ao registrar ServiceWorker:', error);
        //     });
    });
}

// Exporta as funções principais para uso global
window.showGame = showGame;
window.GameUtils = GameUtils;

