// Sudoku – Lógica corrigida e sem botão verificar
window.Achievements = window.Achievements || {
    syncUser: async () => {},
    award: async () => {},
    toast: () => {}
};

(function () {
    const gridEl = document.getElementById('sGrid'),
        msgEl  = document.getElementById('sMsg'),
        diffSel = document.getElementById('sDiff');
    winOverlayEl = document.getElementById('winOverlay'),
        winNewGameBtn = document.getElementById('winNewGame');

    let fixed = new Set();
    let activeIndex = -1;

    // --- FUNÇÕES DE LÓGICA DO TABULEIRO (MANTIDAS IGUAIS) ---

    function baseBoard() {
        const board = Array(81).fill(0);
        function solve(board) {
            for (let i = 0; i < 81; i++) {
                if (board[i] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    for (let j = numbers.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [numbers[j], numbers[k]] = [numbers[k], numbers[j]];
                    }
                    for (const num of numbers) {
                        if (isValid(board, i, num)) {
                            board[i] = num;
                            if (solve(board)) return true;
                            board[i] = 0;
                        }
                    }
                    return false;
                }
            }
            return true;
        }
        solve(board);
        return board;
    }

    function isValid(board, index, num) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;

        for (let c = 0; c < 9; c++) if (board[row * 9 + c] === num) return false;
        for (let r = 0; r < 9; r++) if (board[r * 9 + col] === num) return false;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[(blockRow + r) * 9 + (blockCol + c)] === num) return false;
            }
        }
        return true;
    }

    function carve(full) {
        const diff = diffSel.value;
        const removeCount = { easy: 40, medium: 50, hard: 58 }[diff] || 40;
        const board = [...full];
        const indices = [...Array(81).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        let removed = 0;
        for (let i = 0; i < indices.length && removed < removeCount; i++) {
            const idx = indices[i];
            const temp = board[idx];
            board[idx] = 0;
            removed++;
        }
        return board;
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO E INTERAÇÃO ---

    function draw(board) {
        gridEl.innerHTML = '';
        fixed.clear();

        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';

            const input = document.createElement('input');
            input.maxLength = 1;
            input.inputMode = 'numeric';
            const value = board[i];

            // Listener de destaque para TODAS as células
            input.addEventListener('focus', () => highlightCell(i));
            input.addEventListener('blur', clearHighlight);

            if (value !== 0) {
                input.value = value;
                input.readOnly = true;
                input.classList.add('fixed');
                fixed.add(i);
            } else {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^1-9]/g, '');
                    verifyCell(i); // Validação imediata
                });
            }

            cell.appendChild(input);
            gridEl.appendChild(cell);
        }
    }

    function clearHighlight() {
        activeIndex = -1;
        gridEl.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('highlight', 'active');
        });
    }

    function highlightCell(index) {
        if (activeIndex === index) return;
        clearHighlight();
        activeIndex = index;

        const row = Math.floor(index / 9);
        const col = index % 9;
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;

        gridEl.children[index].classList.add('active');

        for (let i = 0; i < 81; i++) {
            const r = Math.floor(i / 9);
            const c = i % 9;
            if (r === row || c === col) {
                gridEl.children[i].classList.add('highlight');
            }
            const isSameBlock = Math.floor(r / 3) * 3 === blockRow && Math.floor(c / 3) * 3 === blockCol;
            if (isSameBlock) {
                gridEl.children[i].classList.add('highlight');
            }
        }
    }

    function verifyCell(index) {
        const board = read();
        let hasConflicts = false;

        // 1. Limpa as classes de feedback, incluindo 'correct'
        gridEl.querySelectorAll('.sudoku-cell').forEach(c => c.classList.remove('invalid', 'correct'));

        // 2. Itera para verificar conflitos e aplicar cor verde (correto)
        for (let i = 0; i < 81; i++) {
            const value = board[i];

            if (value === 0) continue;

            const tempBoard = [...board];
            tempBoard[i] = 0; // Remove temporariamente o valor para checagem de conflito

            if (!isValid(tempBoard, i, value)) {
                // Conflito: Aplica vermelho
                gridEl.children[i].classList.add('invalid');
                hasConflicts = true;
            } else {
                // Sem conflito: Se foi preenchido pelo usuário, aplica verde
                if (!fixed.has(i)) {
                    gridEl.children[i].classList.add('correct');
                }
            }
        }

        // 3. Atualiza o status do jogo
        if (!hasConflicts) {
            checkWin();
        } else {
            // Apenas removemos a mensagem de erro, mantendo o destaque visual
            msgEl.textContent = '';
        }
    }

    function checkWin() {
        const board = read();
        const hasZeros = board.includes(0);

        if (!hasZeros) {

            winOverlayEl.classList.remove('hidden');

            msgEl.style.color = '#10b981';
            Achievements.toast('Sudoku concluído!');

        } else {
            msgEl.textContent = '';
        }
    }

    function read() {
        return [...gridEl.querySelectorAll('input')].map(inp => parseInt(inp.value || '0') || 0);
    }

    function write(arr) {
        gridEl.querySelectorAll('input').forEach((inp, i) => {
            if (!fixed.has(i)) inp.value = arr[i] || '';
        });
    }

    function solve() {
        const board = read();
        if (solveSudoku(board)) {
            write(board);
            verifyCell(0); // Roda verificação final para atualizar status
        } else {
            msgEl.textContent = 'Sem solução para o estado atual.';
            msgEl.style.color = '#ef4444';
        }
    }

    function solveSudoku(board) {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, i, num)) {
                        board[i] = num;
                        if (solveSudoku(board)) return true;
                        board[i] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    function clearBoard() {
        gridEl.querySelectorAll('input').forEach((inp, i) => {
            if (!fixed.has(i)) inp.value = '';
        });
        gridEl.querySelectorAll('.invalid').forEach(c => c.classList.remove('invalid'));
        msgEl.textContent = '';
    }

    function newGame() {
        const solved = baseBoard();
        const game = carve(solved);
        draw(game);
    }


    document.getElementById('sNew').onclick = newGame;
    document.getElementById('sSolve').onclick = solve;
    document.getElementById('sClear').onclick = clearBoard;
    diffSel.onchange = newGame;

    window.addEventListener('DOMContentLoaded', async () => {
        await Achievements.syncUser('Jogador');
        newGame();
    });

    winNewGameBtn.onclick = () => {
        winOverlayEl.classList.add('hidden'); // Esconde o overlay
        newGame(); // Inicia novo jogo
    };

})();