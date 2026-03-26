// ===== FLOW FREE - Conecte os pares de cores =====

const FLOW_COLORS = 6;

// Níveis: { size, pairs, solution }. solution[i] = path (array de [r,c]) da cor i+1.
// Cada par de células consecutivas no path deve ser vizinha (cima/baixo/esquerda/direita).
// Os caminhos são disjuntos e preenchem todo o grid (size*size).
function levelFromSolution(size, ...paths) {
    const pairs = paths.map(p => [p[0], p[p.length - 1]]);
    return { size, pairs, solution: paths };
}

const LEVELS = [
    // Nível 1 - 5x5: cada linha é uma cor (solução trivial, sempre válida)
    levelFromSolution(5,
        [[0,0],[0,1],[0,2],[0,3],[0,4]],
        [[1,0],[1,1],[1,2],[1,3],[1,4]],
        [[2,0],[2,1],[2,2],[2,3],[2,4]],
        [[3,0],[3,1],[3,2],[3,3],[3,4]],
        [[4,0],[4,1],[4,2],[4,3],[4,4]]
    ),
    // Nível 2 - 5x5: cada coluna é uma cor
    levelFromSolution(5,
        [[0,0],[1,0],[2,0],[3,0],[4,0]],
        [[0,1],[1,1],[2,1],[3,1],[4,1]],
        [[0,2],[1,2],[2,2],[3,2],[4,2]],
        [[0,3],[1,3],[2,3],[3,3],[4,3]],
        [[0,4],[1,4],[2,4],[3,4],[4,4]]
    ),
    // Nível 3 - 5x5: caminhos em L e retas, todos conectados
    levelFromSolution(5,
        [[0,0],[0,1],[1,1],[1,0],[2,0]],
        [[0,2],[0,3],[0,4],[1,4],[1,3]],
        [[1,2],[2,2],[2,3],[2,4]],
        [[2,1],[3,1],[3,0],[4,0],[4,1]],
        [[3,2],[3,3],[3,4],[4,4],[4,3],[4,2]]
    ),
    // Nível 4 - 5x5 (caminhos todos conectados, sem pular células)
    levelFromSolution(5,
        [[0,0],[1,0],[2,0],[2,1],[1,1]],
        [[0,1],[0,2],[0,3],[0,4],[1,4]],
        [[1,2],[1,3],[2,3],[3,3],[3,2]],
        [[2,2],[3,1],[3,0],[4,0],[4,1]],
        [[4,2],[4,3],[4,4],[3,4],[2,4]]
    ),
    // Nível 5 - 5x5
    levelFromSolution(5,
        [[0,0],[0,1],[1,1],[1,0],[2,0]],
        [[0,2],[0,3],[0,4],[1,4],[2,4]],
        [[1,2],[1,3],[2,3],[2,2],[2,1]],
        [[3,0],[3,1],[3,2],[3,3],[3,4]],
        [[4,0],[4,1],[4,2],[4,3],[4,4]]
    ),
    // Nível 6 - 6x6: cada linha é uma cor
    levelFromSolution(6,
        [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]],
        [[1,0],[1,1],[1,2],[1,3],[1,4],[1,5]],
        [[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]],
        [[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]],
        [[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]],
        [[5,0],[5,1],[5,2],[5,3],[5,4],[5,5]]
    ),
    // Nível 7 - 6x6: cada coluna é uma cor
    levelFromSolution(6,
        [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],
        [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]],
        [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]],
        [[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]],
        [[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]],
        [[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]]
    ),
    // Nível 8 - 6x6: blocos 2x3
    levelFromSolution(6,
        [[0,0],[0,1],[0,2],[1,2],[1,1],[1,0]],
        [[0,3],[0,4],[0,5],[1,5],[1,4],[1,3]],
        [[2,0],[2,1],[2,2],[3,2],[3,1],[3,0]],
        [[2,3],[2,4],[2,5],[3,5],[3,4],[3,3]],
        [[4,0],[4,1],[4,2],[5,2],[5,1],[5,0]],
        [[4,3],[4,4],[4,5],[5,5],[5,4],[5,3]]
    ),
    // Nível 9 - 6x6: serpentina
    levelFromSolution(6,
        [[0,0],[1,0],[2,0],[2,1],[1,1],[0,1]],
        [[0,2],[0,3],[0,4],[0,5],[1,5],[2,5]],
        [[1,2],[1,3],[1,4],[2,4],[2,3],[2,2]],
        [[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]],
        [[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]],
        [[5,0],[5,1],[5,2],[5,3],[5,4],[5,5]]
    ),
    // Nível 10 - 6x6: colunas (solução sempre válida)
    levelFromSolution(6,
        [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],
        [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]],
        [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]],
        [[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]],
        [[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]],
        [[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]]
    ),
];

class FlowFreeGame {
    constructor() {
        this.gridContainer = document.getElementById('gridContainer');
        this.levelDisplay = document.getElementById('levelDisplay');
        this.hintsDisplay = document.getElementById('hintsDisplay');
        this.gameMessage = document.getElementById('gameMessage');
        this.messageTitle = document.getElementById('messageTitle');
        this.messageText = document.getElementById('messageText');

        document.getElementById('hintBtn').addEventListener('click', () => this.useHint());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('prevLevelBtn').addEventListener('click', () => this.prevLevel());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('nextLevelMsgBtn').addEventListener('click', () => this.nextLevel());

        this.currentLevelIndex = 0;
        this.hintsRemaining = 2;
        this.hintsCarryOver = 0;
        this.grid = [];
        this.drawingColor = null;
        this.drawingFrom = null;
        this.currentPath = [];
        this.endpoints = [];

        this.init();
    }

    init() {
        const level = LEVELS[this.currentLevelIndex];
        if (!level) return;

        this.hintsRemaining = 2 + this.hintsCarryOver;

        const size = level.size;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(0));
        this.endpoints = [];

        level.pairs.forEach((pair, colorIndex) => {
            const color = colorIndex + 1;
            const [a, b] = pair;
            this.grid[a[0]][a[1]] = color;
            this.grid[b[0]][b[1]] = color;
            this.endpoints.push({ color, r: a[0], c: a[1] });
            this.endpoints.push({ color, r: b[0], c: b[1] });
        });

        this.drawingColor = null;
        this.currentPath = [];
        this.render();
        this.setupInput();
        this.updateLevelButtons();
        this.updateHintsDisplay();
        this.levelDisplay.textContent = this.currentLevelIndex + 1;
        this.hideMessage();
    }

    updateHintsDisplay() {
        this.hintsDisplay.textContent = this.hintsRemaining;
        document.getElementById('hintBtn').disabled = this.hintsRemaining <= 0;
    }

    updateLevelButtons() {
        document.getElementById('prevLevelBtn').disabled = this.currentLevelIndex <= 0;
        document.getElementById('nextLevelBtn').disabled = this.currentLevelIndex >= LEVELS.length - 1;
    }

    restart() {
        this.init();
    }

    prevLevel() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            this.init();
        }
    }

    nextLevel() {
        this.hideMessage();
        this.hintsCarryOver = this.hintsRemaining;
        if (this.currentLevelIndex < LEVELS.length - 1) {
            this.currentLevelIndex++;
            this.init();
        } else {
            this.hintsRemaining = 2 + this.hintsCarryOver;
            this.updateHintsDisplay();
        }
    }

    getEndpointsForColor(color) {
        return this.endpoints.filter(e => e.color === color).map(e => [e.r, e.c]);
    }

    isEndpoint(r, c, color) {
        return this.endpoints.some(e => e.color === color && e.r === r && e.c === c);
    }

    isAdjacent(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
    }

    isColorConnected(color) {
        const level = LEVELS[this.currentLevelIndex];
        const size = level.size;
        const ends = this.getEndpointsForColor(color);
        if (ends.length < 2) return true;
        const [start, end] = ends;
        const visited = Array(size).fill(null).map(() => Array(size).fill(false));
        const stack = [[start[0], start[1]]];
        visited[start[0]][start[1]] = true;
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            if (r === end[0] && c === end[1]) return true;
            for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && this.grid[nr][nc] === color && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    stack.push([nr, nc]);
                }
            }
        }
        return false;
    }

    getHintCell() {
        const level = LEVELS[this.currentLevelIndex];
        if (!level.solution) return null;
        const size = level.size;
        for (let color = 1; color <= level.pairs.length; color++) {
            if (this.isColorConnected(color)) continue;
            const path = level.solution[color - 1];
            const filled = new Set();
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (this.grid[i][j] === color) filled.add(`${i},${j}`);
                }
            }
            for (const [r, c] of path) {
                if (this.grid[r][c] === color) continue;
                for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size && this.grid[nr][nc] === color) {
                        return { r, c, color };
                    }
                }
            }
        }
        return null;
    }

    useHint() {
        if (this.hintsRemaining <= 0) return;
        const hint = this.getHintCell();
        if (!hint) return;
        this.hintsRemaining--;
        this.grid[hint.r][hint.c] = hint.color;
        this.updateHintsDisplay();
        this.render();
        this.checkWin();
    }

    indexInPath(path, r, c) {
        for (let i = 0; i < path.length; i++) {
            if (path[i][0] === r && path[i][1] === c) return i;
        }
        return -1;
    }

    clearPathForColor(color) {
        const size = this.grid.length;
        const ends = this.getEndpointsForColor(color);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (this.grid[i][j] === color) {
                    const isEnd = ends.some(([r, c]) => r === i && c === j);
                    if (!isEnd) this.grid[i][j] = 0;
                }
            }
        }
    }

    startDrawing(r, c) {
        const color = this.grid[r][c];
        if (!color) return;

        const ends = this.getEndpointsForColor(color);
        const which = ends.findIndex(([rr, cc]) => rr === r && cc === c);
        if (which < 0) return;

        this.drawingColor = color;
        this.drawingFrom = which;
        this.clearPathForColor(color);
        this.currentPath = [[r, c]];
        this.render();
    }

    extendPath(r, c) {
        if (!this.drawingColor || this.currentPath.length === 0) return;

        const last = this.currentPath[this.currentPath.length - 1];
        if (!this.isAdjacent(last, [r, c])) return;

        const ends = this.getEndpointsForColor(this.drawingColor);
        const otherEnd = ends[1 - this.drawingFrom];

        if (r === otherEnd[0] && c === otherEnd[1]) {
            for (const [rr, cc] of this.currentPath) {
                this.grid[rr][cc] = this.drawingColor;
            }
            this.grid[r][c] = this.drawingColor;
            this.drawingColor = null;
            this.currentPath = [];
            this.render();
            this.checkWin();
            return;
        }

        const idx = this.indexInPath(this.currentPath, r, c);
        if (idx >= 0) {
            this.currentPath = this.currentPath.slice(0, idx + 1);
            for (let i = 0; i < this.grid.length; i++) {
                for (let j = 0; j < this.grid.length; j++) {
                    if (this.grid[i][j] === this.drawingColor) {
                        const isInPath = this.currentPath.some(([rr, cc]) => rr === i && cc === j);
                        const isEnd = this.isEndpoint(i, j, this.drawingColor);
                        if (!isInPath && !isEnd) this.grid[i][j] = 0;
                    }
                }
            }
        } else if (this.grid[r][c] === 0) {
            this.currentPath.push([r, c]);
            this.grid[r][c] = this.drawingColor;
        }

        this.render();
    }

    stopDrawing() {
        if (this.drawingColor && this.currentPath.length > 0) {
            const ends = this.getEndpointsForColor(this.drawingColor);
            for (const [r, c] of this.currentPath) {
                const isEnd = ends.some(([rr, cc]) => rr === r && cc === c);
                if (!isEnd) this.grid[r][c] = 0;
            }
            const [r0, c0] = ends[this.drawingFrom];
            this.grid[r0][c0] = this.drawingColor;
            const [r1, c1] = ends[1 - this.drawingFrom];
            this.grid[r1][c1] = this.drawingColor;
        }
        this.drawingColor = null;
        this.currentPath = [];
        this.render();
    }

    checkWin() {
        const level = LEVELS[this.currentLevelIndex];
        const size = level.size;

        for (let color = 1; color <= level.pairs.length; color++) {
            if (!this.isColorConnected(color)) return;
        }

        // Só vale vitória se todos os espaços estiverem preenchidos
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (this.grid[i][j] === 0) return;
            }
        }

        this.hintsCarryOver = this.hintsRemaining;
        this.messageText.textContent = 'Você conectou todos os fluxos e preencheu o tabuleiro!';
        this.showMessage();
    }

    showMessage() {
        this.gameMessage.classList.add('show');
    }

    hideMessage() {
        this.gameMessage.classList.remove('show');
    }

    getCellFromPoint(clientX, clientY) {
        const el = document.elementFromPoint(clientX, clientY);
        if (!el || !el.classList.contains('cell')) return null;
        const r = parseInt(el.dataset.row, 10);
        const c = parseInt(el.dataset.col, 10);
        return { r, c };
    }

    setupInput() {
        const container = this.gridContainer;
        container.style.touchAction = 'none';

        const onStart = (x, y) => {
            const cell = this.getCellFromPoint(x, y);
            if (cell) this.startDrawing(cell.r, cell.c);
        };

        const onMove = (x, y) => {
            if (!this.drawingColor) return;
            const cell = this.getCellFromPoint(x, y);
            if (cell) this.extendPath(cell.r, cell.c);
        };

        const onEnd = () => {
            this.stopDrawing();
        };

        container.addEventListener('pointerdown', e => {
            e.preventDefault();
            onStart(e.clientX, e.clientY);
        });
        container.addEventListener('pointermove', e => {
            if (e.buttons !== 0) onMove(e.clientX, e.clientY);
        });
        container.addEventListener('pointerup', onEnd);
        container.addEventListener('pointerleave', onEnd);

        container.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0];
            if (t) onStart(t.clientX, t.clientY);
        }, { passive: false });
        container.addEventListener('touchmove', e => {
            e.preventDefault();
            const t = e.touches[0];
            if (t && this.drawingColor) onMove(t.clientX, t.clientY);
        }, { passive: false });
        container.addEventListener('touchend', e => {
            if (e.touches.length === 0) onEnd();
        });
    }

    render() {
        this.gridContainer.innerHTML = '';
        const size = this.grid.length;
        this.gridContainer.style.gridTemplateColumns = `repeat(${size}, var(--cell-size))`;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const color = this.grid[i][j];
                if (color) {
                    cell.classList.add(`color-${Math.min(color, FLOW_COLORS)}`);
                    if (this.isEndpoint(i, j, color)) cell.classList.add('endpoint');
                }
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gridContainer.appendChild(cell);
            }
        }
    }
}

const game = new FlowFreeGame();
