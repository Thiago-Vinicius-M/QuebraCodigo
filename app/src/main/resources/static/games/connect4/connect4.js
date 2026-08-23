window.Achievements = window.Achievements || {
  syncUser: async () => {},
  award: async () => {},
  toast: () => {}
};

const { useState, useEffect, useRef, useCallback } = React;

const COLS = 7, ROWS = 6;

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function checkWin(grid, p) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS - 3; c++)
      if (grid[r][c] === p && grid[r][c+1] === p && grid[r][c+2] === p && grid[r][c+3] === p) return true;
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS - 3; r++)
      if (grid[r][c] === p && grid[r+1][c] === p && grid[r+2][c] === p && grid[r+3][c] === p) return true;
  for (let r = 0; r < ROWS - 3; r++)
    for (let c = 0; c < COLS - 3; c++)
      if (grid[r][c] === p && grid[r+1][c+1] === p && grid[r+2][c+2] === p && grid[r+3][c+3] === p) return true;
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c < COLS - 3; c++)
      if (grid[r][c] === p && grid[r-1][c+1] === p && grid[r-2][c+2] === p && grid[r-3][c+3] === p) return true;
  return false;
}

function validCols(grid) {
  return Array.from({ length: COLS }, (_, c) => c).filter(c => grid[0][c] === 0);
}

function simWin(grid, col, player) {
  const g = grid.map(r => [...r]);
  for (let r = ROWS - 1; r >= 0; r--) {
    if (g[r][col] === 0) { g[r][col] = player; break; }
  }
  return checkWin(g, player);
}

function dropPiece(grid, col, player) {
  const g = grid.map(r => [...r]);
  for (let r = ROWS - 1; r >= 0; r--) {
    if (g[r][col] === 0) { g[r][col] = player; return { grid: g, row: r }; }
  }
  return null;
}

function cpuMove(grid) {
  const moves = validCols(grid);
  for (const c of moves) if (simWin(grid, c, 2)) return c;
  for (const c of moves) if (simWin(grid, c, 1)) return c;
  const pref = [3, 2, 4, 1, 5, 0, 6].filter(c => moves.includes(c));
  return pref.length ? pref[0] : moves[0];
}

const CHIP_COLORS = { 1: '#006666', 2: '#660066' };

function Connect4() {
  const [grid, setGrid] = useState(emptyGrid);
  const [turn, setTurn] = useState(1);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState('pve');
  const [lastMove, setLastMove] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [winnerLabel, setWinnerLabel] = useState('—');
  const [hoverCol, setHoverCol] = useState(-1);

  const mainRef = useRef(null);
  const boardRef = useRef(null);
  const cpuRef = useRef(null);

  const finish = useCallback(async (w, currentMode) => {
    setDone(true);
    setStarted(false);
    const label = w === 0 ? 'Empate' : w === 1 ? 'Você' : (currentMode === 'pve' ? 'CPU' : 'Jogador 2');
    setWinnerLabel(label);

    let title, message;
    if (w === 0) {
      title = 'Fim de Jogo!'; message = 'O tabuleiro está cheio. Empate!';
    } else if (label === 'Você') {
      title = 'Parabéns!'; message = 'O jogador 1 venceu!';
    } else if (label === 'CPU') {
      title = 'Ohh, nooo'; message = 'Não foi dessa vez. A CPU venceu!';
    } else {
      title = 'Parabéns!'; message = 'O Jogador 2 venceu!';
    }
    setOverlay({ title, message });

    if (w === 1) {
      await Achievements.award({ addPoints: 140, addCoins: 7 });
      Achievements.toast('Connect 4: vitória! +140 pts');
    }
  }, []);

  const drop = useCallback((col, currentGrid, currentTurn, currentMode) => {
    const result = dropPiece(currentGrid, col, currentTurn);
    if (!result) return;
    const { grid: newGrid, row } = result;
    setGrid(newGrid);
    setLastMove({ r: row, c: col, p: currentTurn });

    if (checkWin(newGrid, currentTurn)) {
      finish(currentTurn, currentMode);
      return;
    }
    if (newGrid[0].every(v => v !== 0)) {
      finish(0, currentMode);
      return;
    }

    const nextTurn = currentTurn === 1 ? 2 : 1;
    setTurn(nextTurn);

    if (currentMode === 'pve' && nextTurn === 2) {
      cpuRef.current = setTimeout(() => {
        const col = cpuMove(newGrid);
        drop(col, newGrid, 2, currentMode);
      }, 360);
    }
  }, [finish]);

  const tryDrop = useCallback((col) => {
    if (done || !started) return;
    if (mode === 'pve' && turn === 2) return;
    drop(col, grid, turn, mode);
  }, [done, started, mode, turn, grid, drop]);

  const start = useCallback((currentMode) => {
    clearTimeout(cpuRef.current);
    const newGrid = emptyGrid();
    let firstTurn = 1;
    setGrid(newGrid);
    setDone(false);
    setLastMove(null);
    setStarted(true);
    setOverlay(null);
    setWinnerLabel('—');
    setHoverCol(-1);

    if (currentMode === 'pve' && Math.random() < 0.33) {
      firstTurn = 2;
      setTurn(2);
      cpuRef.current = setTimeout(() => {
        const col = cpuMove(newGrid);
        drop(col, newGrid, 2, currentMode);
      }, 360);
    } else {
      setTurn(1);
    }
  }, [drop]);

  useEffect(() => {
    Achievements.syncUser('Jogador');
    return () => clearTimeout(cpuRef.current);
  }, []);

  const turnLabel = started ? (turn === 1 ? 'Você' : (mode === 'pve' ? 'CPU' : 'Jogador 2')) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="game-header">
<<<<<<< HEAD
        <a
          href="../../index.html"
          className="go-back"
          aria-label="Voltar"
          onClick={e => { e.preventDefault(); window.location.href = '../../index.html'; }}
        >
=======
        <a href="/index.html" className="go-back" aria-label="Voltar">
>>>>>>> d36c645b3978686bb1842d72ff0b10ab717f5fb2
          <img src="../img/topbar/setaVoltar.png" alt="Voltar" />
        </a>
        <h1 className="game-title" style={{ pointerEvents: 'none' }}>Connect 4</h1>
        <div className="controls">
          <button id="c4Start" onClick={() => start(mode)}>Iniciar</button>
          <label className="ctrl-label">
            Modo:
            <select value={mode} onChange={e => { setMode(e.target.value); if (started) start(e.target.value); }}>
              <option value="pve">Você vs CPU</option>
              <option value="pvp">2 Jogadores</option>
            </select>
          </label>
          <span>Vez: <strong>{turnLabel}</strong></span>
          <span>Vencedor: <strong>{winnerLabel}</strong></span>
        </div>
      </header>

      <main className="c4-main" ref={mainRef}>
        {/* Hover indicator row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, var(--cell, min(64px, calc((100vw - 96px) / 7))))`,
          gap: '5px',
          padding: '0 10px',
          marginBottom: 4,
          pointerEvents: 'none',
        }}>
          {Array.from({ length: COLS }, (_, c) => (
            <div key={c} style={{
              height: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {hoverCol === c && started && !done && !(mode === 'pve' && turn === 2) && (
                <div style={{
                  width: 14, height: 14,
                  borderRadius: '50%',
                  background: CHIP_COLORS[turn],
                  opacity: 0.85,
                }} />
              )}
            </div>
          ))}
        </div>

        <div
          className="c4-board"
          ref={boardRef}
          aria-label="Tabuleiro 7 por 6"
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const val = grid[r][c];
              const isFall = lastMove && lastMove.r === r && lastMove.c === c;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className="c4-cell"
                  onClick={() => tryDrop(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(-1)}
                >
                  {val !== 0 && (
                    <div
                      className={`chip${isFall ? ' fall' : ''}`}
                      style={{ background: CHIP_COLORS[val] }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </main>

      {overlay && (
        <div className="win-overlay">
          <div className="win-box">
            <h2>{overlay.title}</h2>
            <p>{overlay.message}</p>
            <button id="play-again" onClick={() => start(mode)}>Jogar novamente</button>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Connect4 />);
