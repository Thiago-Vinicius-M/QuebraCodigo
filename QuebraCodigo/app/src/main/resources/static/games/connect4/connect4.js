window.Achievements = window.Achievements || {
    syncUser: async () => {},
    award: async () => {},
    toast: () => {}
};

(function () {
    const COLS = 7, ROWS = 6;
    const boardEl   = document.getElementById('c4Board');
    const turnEl    = document.getElementById('c4Turn');
    const msgEl     = document.getElementById('c4Msg');
    const winnerEl  = document.getElementById('c4Winner');
    const modeSel   = document.getElementById('c4Mode');
    const rail      = document.getElementById('c4Rail');
    const dot       = document.getElementById('c4Dot');
    const btnStart  = document.getElementById('c4Start');
    const winOverlay = document.getElementById('win-overlay');
    const playAgainButton = document.getElementById('play-again');

    let grid, turn, done = false, lastMove = null, started = false;

    function empty() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function draw() {
        boardEl.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'c4-cell';

                cell.addEventListener('mouseenter', () => updateHover(c));
                cell.addEventListener('mouseleave', () => updateHover(-1));
                cell.addEventListener('click', () => tryDrop(c));

                if (grid[r][c] !== 0) {
                    const chip = document.createElement('div');
                    chip.className = 'chip';
                    chip.style.background = (grid[r][c] === 1) ? '#006666' : '#660066';
                    if (lastMove && lastMove.r === r && lastMove.c === c) {
                        chip.classList.add('fall');
                    }
                    cell.appendChild(chip);
                }

                boardEl.appendChild(cell);
            }
        }

        turnEl.textContent = started
            ? (turn === 1 ? 'Você' : (modeSel.value === 'pve' ? 'CPU' : 'Jogador 2'))
            : '—';
    }

    function updateHover(col) {
        const cell = boardEl.querySelector('.c4-cell');
        if (!cell) return;

        const rectB = boardEl.getBoundingClientRect();
        const rectC = cell.getBoundingClientRect();
        const gap = 6;

        rail.style.width = (COLS * rectC.width + (COLS - 1) * gap) + 'px';
        rail.style.left  = (rectB.left + window.scrollX) + 'px';
        rail.style.top   = (rectB.top + window.scrollY - rectC.height * 0.55) + 'px';

        if (col >= 0) {
            rail.classList.add('show');
            const x = col * (rectC.width + gap) + rectC.width / 2;
            dot.style.transform = `translateX(${x}px)`;
        } else {
            rail.classList.remove('show');
        }
    }

    function tryDrop(col) {
        if (done || !started) return;
        if (modeSel.value === 'pve' && turn === 2) return;
        drop(col);
    }

    function drop(col) {
        let rT = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r][col] === 0) {
                rT = r;
                break;
            }
        }
        if (rT === -1) return;

        grid[rT][col] = turn;
        lastMove = { r: rT, c: col, p: turn };
        draw();

        if (check(turn)) return finish(turn);
        if (grid[0].every(v => v !== 0)) return finish(0);

        turn = (turn === 1 ? 2 : 1);
        draw();

        if (modeSel.value === 'pve' && turn === 2) {
            setTimeout(cpu, 360);
        }
    }

    function check(w) {
        // linhas
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS - 3; c++)
                if (grid[r][c] === w && grid[r][c + 1] === w && grid[r][c + 2] === w && grid[r][c + 3] === w)
                    return true;

        // colunas
        for (let c = 0; c < COLS; c++)
            for (let r = 0; r < ROWS - 3; r++)
                if (grid[r][c] === w && grid[r + 1][c] === w && grid[r + 2][c] === w && grid[r + 3][c] === w)
                    return true;

        // diagonal principal
        for (let r = 0; r < ROWS - 3; r++)
            for (let c = 0; c < COLS - 3; c++)
                if (grid[r][c] === w && grid[r + 1][c + 1] === w && grid[r + 2][c + 2] === w && grid[r + 3][c + 3] === w)
                    return true;

        // diagonal secundária
        for (let r = 3; r < ROWS; r++)
            for (let c = 0; c < COLS - 3; c++)
                if (grid[r][c] === w && grid[r - 1][c + 1] === w && grid[r - 2][c + 2] === w && grid[r - 3][c + 3] === w)
                    return true;

        return false;
    }

    function valid() {
        return Array.from({ length: COLS }, (_, c) => c)
            .filter(c => grid[0][c] === 0);
    }

    function simWin(c, w) {
        const g = grid.map(r => r.slice());
        for (let r = ROWS - 1; r >= 0; r--) {
            if (g[r][c] === 0) {
                g[r][c] = w;
                break;
            }
        }
        return newCheck(g, w);
    }

    function newCheck(g, w) {
        // mesmas verificações, mas no grid simulado
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS - 3; c++)
                if (g[r][c] === w && g[r][c + 1] === w && g[r][c + 2] === w && g[r][c + 3] === w)
                    return true;

        for (let c = 0; c < COLS; c++)
            for (let r = 0; r < ROWS - 3; r++)
                if (g[r][c] === w && g[r + 1][c] === w && g[r + 2][c] === w && g[r + 3][c] === w)
                    return true;

        for (let r = 0; r < ROWS - 3; r++)
            for (let c = 0; c < COLS - 3; c++)
                if (g[r][c] === w && g[r + 1][c + 1] === w && g[r + 2][c + 2] === w && g[r + 3][c + 3] === w)
                    return true;

        for (let r = 3; r < ROWS; r++)
            for (let c = 0; c < COLS - 3; c++)
                if (g[r][c] === w && g[r - 1][c + 1] === w && g[r - 2][c + 2] === w && g[r - 3][c + 3] === w)
                    return true;

        return false;
    }

    async function finish(w) {
        started = false;
        done = true;

        winnerEl.textContent =
            (w === 0
                ? 'Empate'
                : (w === 1 ? 'Você' : (modeSel.value === 'pve' ? 'CPU' : 'Jogador 2')));


        const winOverlay = document.getElementById('win-overlay');
        const winBoxTitle = winOverlay.querySelector('h2');
        const winBoxMessage = winOverlay.querySelector('p');

        if (w === 0) {
            winBoxTitle.textContent = 'Fim de Jogo!';
            winBoxMessage.textContent = 'O tabuleiro está cheio. Empate!';
        } else {
            const vencedor = winnerEl.textContent; // 'Você', 'CPU' ou 'Jogador 2'

            // Customização baseada no vencedor
            if (vencedor === 'Você') {
                winBoxTitle.textContent = 'Parabéns!';
                winBoxMessage.textContent = 'O jogador 1 venceu!';

            } else if (vencedor === 'CPU') {
                winBoxTitle.textContent = 'Ohh, nooo';
                winBoxMessage.textContent = 'Não foi dessa vez. A CPU venceu!';

            } else if (vencedor === 'Jogador 2') {
                winBoxTitle.textContent = 'Parabéns!';
                winBoxMessage.textContent = 'O Jogador 2 venceu!';
            }
        }

        winOverlay.classList.remove('hidden');

        if (w === 1) {
            await Achievements.award({ addPoints: 140, addCoins: 7 });
            Achievements.toast('Connect 4: vitória! +140 pts');
        }
    }

    function cpu() {
        const moves = valid();
        for (const c of moves) if (simWin(c, 2)) return drop(c);
        for (const c of moves) if (simWin(c, 1)) return drop(c);

        const pref = [3, 2, 4, 1, 5, 0, 6].filter(c => moves.includes(c));
        drop(pref.length ? pref[0] : moves[0]);
    }

    function reiniciarJogo() {
        winOverlay.classList.add('hidden');
        start();
    }

    function start() {
        grid = empty();
        turn = 1;
        done = false;
        lastMove = null;
        started = true;
        msgEl.textContent = '';
        winnerEl.textContent = '—';
        draw();

        if (modeSel.value === 'pve' && Math.random() < 0.33) {
            turn = 2;
            draw();
            setTimeout(cpu, 360);
        }
    }

    btnStart.addEventListener('click', start);
    modeSel.addEventListener('change', () => { if (started) start(); });

    playAgainButton.addEventListener('click', reiniciarJogo);

    window.addEventListener('DOMContentLoaded', async () => {
        await Achievements.syncUser('Jogador');
        grid = empty();
        draw();
    });

    window.addEventListener('scroll', () => updateHover(-1));
    window.addEventListener('resize', () => updateHover(-1));
})();