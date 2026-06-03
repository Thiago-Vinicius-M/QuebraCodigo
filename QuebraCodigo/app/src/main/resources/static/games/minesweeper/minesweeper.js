const { useState, useEffect, useRef, useCallback } = React;

const DIFFICULTIES = {
  easy:   { rows: 8,  cols: 8,  mines: 10 },
  medium: { rows: 14, cols: 14, mines: 30 },
  hard:   { rows: 20, cols: 20, mines: 80 },
};

function createGrid(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
    }))
  );
}

function placeMines(grid, rows, cols, mines, exRow, exCol) {
  const g = grid.map(r => r.map(c => ({ ...c })));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if ((r === exRow && c === exCol) || g[r][c].isMine) continue;
    g[r][c].isMine = true;
    placed++;
  }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      if (g[i][j].isMine) continue;
      let count = 0;
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) {
          const ni = i + di, nj = j + dj;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && g[ni][nj].isMine) count++;
        }
      g[i][j].adjacentMines = count;
    }
  return g;
}

function revealCells(grid, rows, cols, row, col) {
  const g = grid.map(r => r.map(c => ({ ...c })));
  const stack = [[row, col]];
  let revealed = 0;
  while (stack.length) {
    const [r, c] = stack.pop();
    if (g[r][c].isRevealed || g[r][c].isFlagged) continue;
    g[r][c].isRevealed = true;
    revealed++;
    if (g[r][c].adjacentMines === 0) {
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) {
          const ni = r + di, nj = c + dj;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && !g[ni][nj].isRevealed)
            stack.push([ni, nj]);
        }
    }
  }
  return { grid: g, revealed };
}

function Minesweeper() {
  const [difficulty, setDifficulty] = useState('easy');
  const [grid, setGrid] = useState(() => createGrid(8, 8));
  const [firstClick, setFirstClick] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [msg, setMsg] = useState(null);
  const timerRef = useRef(null);

  const stopTimer = () => { clearInterval(timerRef.current); timerRef.current = null; };

  const init = useCallback((diff) => {
    stopTimer();
    const { rows, cols } = DIFFICULTIES[diff];
    setGrid(createGrid(rows, cols));
    setFirstClick(true);
    setRevealedCount(0);
    setFlagCount(0);
    setGameOver(false);
    setGameWon(false);
    setTimeElapsed(0);
    setMsg(null);
  }, []);

  useEffect(() => { init('easy'); return stopTimer; }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000);
  };

  const handleLeftClick = useCallback((row, col) => {
    if (gameOver || gameWon) return;
    const cell = grid[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    let currentGrid = grid;

    if (firstClick) {
      currentGrid = placeMines(grid, rows, cols, mines, row, col);
      setFirstClick(false);
      startTimer();
    }

    if (currentGrid[row][col].isMine) {
      const g = currentGrid.map(r => r.map(c => ({ ...c })));
      g[row][col].isRevealed = true;
      setGrid(g);
      setGameOver(true);
      stopTimer();
      setMsg({ icon: '💥', title: 'Game Over!', text: `Você pisou em uma mina! Tempo: ${timeElapsed}s` });
      return;
    }

    const { grid: newGrid, revealed } = revealCells(currentGrid, rows, cols, row, col);
    const totalRevealed = revealedCount + revealed;
    setGrid(newGrid);
    setRevealedCount(totalRevealed);

    const safeCells = rows * cols - mines;
    if (totalRevealed === safeCells) {
      stopTimer();
      setGameWon(true);
      setMsg({ icon: '🎉', title: 'Você Venceu!', text: `Parabéns! Tempo: ${timeElapsed}s` });
    }
  }, [gameOver, gameWon, grid, firstClick, difficulty, revealedCount, timeElapsed]);

  const handleRightClick = useCallback((e, row, col) => {
    e.preventDefault();
    if (gameOver || gameWon) return;
    const cell = grid[row][col];
    if (cell.isRevealed) return;
    const { mines } = DIFFICULTIES[difficulty];
    if (!cell.isFlagged && flagCount >= mines) return;

    const g = grid.map(r => r.map(c => ({ ...c })));
    g[row][col].isFlagged = !g[row][col].isFlagged;
    setGrid(g);
    setFlagCount(fc => fc + (g[row][col].isFlagged ? 1 : -1));
  }, [gameOver, gameWon, grid, difficulty, flagCount]);

  const giveHint = useCallback(() => {
    if (gameOver || gameWon) return;
    const { rows, cols } = DIFFICULTIES[difficulty];
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++) {
        const c = grid[i][j];
        if (!c.isRevealed && !c.isMine && !c.isFlagged) {
          handleLeftClick(i, j);
          return;
        }
      }
  }, [gameOver, gameWon, grid, difficulty, handleLeftClick]);

  const changeDifficulty = (diff) => {
    setDifficulty(diff);
    init(diff);
  };

  const { rows, cols, mines } = DIFFICULTIES[difficulty];

  return (
    <div className="game-shell">
      <header className="game-header">
        <a
          href="/index.html"
          className="go-back"
          aria-label="Voltar"
          onClick={e => { e.preventDefault(); window.location.href = '/index.html'; }}
        >
          <img src="../img/topbar/setaVoltar.png" alt="Botão retornar para a Home" />
        </a>
        <h1 className="game-title" style={{ pointerEvents: 'none' }}>Minesweeper</h1>
        <div className="controls">
          {Object.keys(DIFFICULTIES).map(d => (
            <button
              key={d}
              className={`difficulty-btn${difficulty === d ? ' active' : ''}`}
              onClick={() => changeDifficulty(d)}
            >
              {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : 'Difícil'}
            </button>
          ))}
          <button className="btn" onClick={() => init(difficulty)}>Reiniciar</button>
          <button className="btn" onClick={giveHint}>Dica</button>
          <span>💣 {mines - flagCount}</span>
          <span>⏱ {timeElapsed}s</span>
        </div>
      </header>

      <div className="game-container">
        <div
          className="grid-container"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {grid.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              let cls = 'cell';
              if (cell.isRevealed) cls += ' revealed';
              if (cell.isFlagged) cls += ' flagged';
              if (cell.isRevealed && cell.isMine) cls += ' mine';

              return (
                <div
                  key={`${r}-${c}`}
                  className={cls}
                  data-count={cell.isRevealed && cell.adjacentMines > 0 ? cell.adjacentMines : undefined}
                  onClick={() => handleLeftClick(r, c)}
                  onContextMenu={e => handleRightClick(e, r, c)}
                >
                  {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
                    ? cell.adjacentMines
                    : null}
                </div>
              );
            })
          )}
        </div>

        {msg && (
          <div className="game-message show">
            <div className="message-icon">{msg.icon}</div>
            <div className="message-title">{msg.title}</div>
            <div className="message-text">{msg.text}</div>
            <button className="btn-action" onClick={() => init(difficulty)}>Jogar Novamente</button>
          </div>
        )}
      </div>

      <div className="instructions">
        <p><strong>Clique esquerdo:</strong> Revelar célula</p>
        <p><strong>Clique direito:</strong> Marcar/desmarcar bandeira 🚩</p>
        <p><strong>Objetivo:</strong> Revelar todas as células sem minas!</p>
        <p><strong>Números:</strong> Mostram quantas minas estão ao redor</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Minesweeper />);
