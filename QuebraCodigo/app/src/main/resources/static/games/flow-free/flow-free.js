const { useState, useEffect, useRef, useCallback } = React;

const FLOW_COLORS = 6;

function levelFromSolution(size, ...paths) {
  const pairs = paths.map(p => [p[0], p[p.length - 1]]);
  return { size, pairs, solution: paths };
}

const LEVELS = [
  levelFromSolution(5,[[0,0],[0,1],[0,2],[0,3],[0,4]],[[1,0],[1,1],[1,2],[1,3],[1,4]],[[2,0],[2,1],[2,2],[2,3],[2,4]],[[3,0],[3,1],[3,2],[3,3],[3,4]],[[4,0],[4,1],[4,2],[4,3],[4,4]]),
  levelFromSolution(5,[[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,1],[1,1],[2,1],[3,1],[4,1]],[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,3],[1,3],[2,3],[3,3],[4,3]],[[0,4],[1,4],[2,4],[3,4],[4,4]]),
  levelFromSolution(5,[[0,0],[0,1],[1,1],[1,0],[2,0]],[[0,2],[0,3],[0,4],[1,4],[1,3]],[[1,2],[2,2],[2,3],[2,4]],[[2,1],[3,1],[3,0],[4,0],[4,1]],[[3,2],[3,3],[3,4],[4,4],[4,3],[4,2]]),
  levelFromSolution(5,[[0,0],[1,0],[2,0],[2,1],[1,1]],[[0,1],[0,2],[0,3],[0,4],[1,4]],[[1,2],[1,3],[2,3],[3,3],[3,2]],[[2,2],[3,1],[3,0],[4,0],[4,1]],[[4,2],[4,3],[4,4],[3,4],[2,4]]),
  levelFromSolution(5,[[0,0],[0,1],[1,1],[1,0],[2,0]],[[0,2],[0,3],[0,4],[1,4],[2,4]],[[1,2],[1,3],[2,3],[2,2],[2,1]],[[3,0],[3,1],[3,2],[3,3],[3,4]],[[4,0],[4,1],[4,2],[4,3],[4,4]]),
  levelFromSolution(6,[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]],[[1,0],[1,1],[1,2],[1,3],[1,4],[1,5]],[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]],[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]],[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]],[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5]]),
  levelFromSolution(6,[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],[[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]],[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]],[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]],[[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]],[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]]),
  levelFromSolution(6,[[0,0],[0,1],[0,2],[1,2],[1,1],[1,0]],[[0,3],[0,4],[0,5],[1,5],[1,4],[1,3]],[[2,0],[2,1],[2,2],[3,2],[3,1],[3,0]],[[2,3],[2,4],[2,5],[3,5],[3,4],[3,3]],[[4,0],[4,1],[4,2],[5,2],[5,1],[5,0]],[[4,3],[4,4],[4,5],[5,5],[5,4],[5,3]]),
  levelFromSolution(6,[[0,0],[1,0],[2,0],[2,1],[1,1],[0,1]],[[0,2],[0,3],[0,4],[0,5],[1,5],[2,5]],[[1,2],[1,3],[1,4],[2,4],[2,3],[2,2]],[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]],[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]],[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5]]),
  levelFromSolution(6,[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],[[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]],[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]],[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]],[[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]],[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]]),
];

function buildInitialGrid(level) {
  const { size, pairs } = level;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  const endpoints = [];
  pairs.forEach((pair, ci) => {
    const color = ci + 1;
    const [a, b] = pair;
    grid[a[0]][a[1]] = color;
    grid[b[0]][b[1]] = color;
    endpoints.push({ color, r: a[0], c: a[1] });
    endpoints.push({ color, r: b[0], c: b[1] });
  });
  return { grid, endpoints };
}

function isEndpoint(endpoints, r, c, color) {
  return endpoints.some(e => e.color === color && e.r === r && e.c === c);
}

function isAdjacent(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function isColorConnected(grid, endpoints, color, size) {
  const ends = endpoints.filter(e => e.color === color).map(e => [e.r, e.c]);
  if (ends.length < 2) return true;
  const [start, end] = ends;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const stack = [[start[0], start[1]]];
  visited[start[0]][start[1]] = true;
  while (stack.length) {
    const [r, c] = stack.pop();
    if (r === end[0] && c === end[1]) return true;
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === color && !visited[nr][nc]) {
        visited[nr][nc] = true;
        stack.push([nr, nc]);
      }
    }
  }
  return false;
}

function checkWin(grid, endpoints, level) {
  const { size, pairs } = level;
  for (let color = 1; color <= pairs.length; color++)
    if (!isColorConnected(grid, endpoints, color, size)) return false;
  for (let i = 0; i < size; i++)
    for (let j = 0; j < size; j++)
      if (grid[i][j] === 0) return false;
  return true;
}

function getHintCell(grid, endpoints, level) {
  if (!level.solution) return null;
  const { size, pairs } = level;
  for (let color = 1; color <= pairs.length; color++) {
    if (isColorConnected(grid, endpoints, color, size)) continue;
    const path = level.solution[color - 1];
    for (const [r, c] of path) {
      if (grid[r][c] === color) continue;
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === color)
          return { r, c, color };
      }
    }
  }
  return null;
}

function clearPathForColor(grid, endpoints, color) {
  const g = grid.map(r => [...r]);
  const ends = endpoints.filter(e => e.color === color).map(e => [e.r, e.c]);
  for (let i = 0; i < g.length; i++)
    for (let j = 0; j < g.length; j++)
      if (g[i][j] === color && !ends.some(([r, c]) => r === i && c === j))
        g[i][j] = 0;
  return g;
}

function FlowFree() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [grid, setGrid] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [drawingColor, setDrawingColor] = useState(null);
  const [drawingFrom, setDrawingFrom] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [hintsCarryOver, setHintsCarryOver] = useState(0);
  const [showMsg, setShowMsg] = useState(false);
  const gridRef = useRef(null);

  // Mutable refs for pointer event handlers (avoid stale closures)
  const stateRef = useRef({});

  const initLevel = useCallback((idx, carryOver) => {
    const level = LEVELS[idx];
    if (!level) return;
    const { grid: g, endpoints: ep } = buildInitialGrid(level);
    const hints = 2 + (carryOver ?? 0);
    setGrid(g);
    setEndpoints(ep);
    setDrawingColor(null);
    setDrawingFrom(null);
    setCurrentPath([]);
    setHintsRemaining(hints);
    setShowMsg(false);
  }, []);

  useEffect(() => { initLevel(0, 0); }, []);

  // Keep stateRef in sync for pointer handlers
  useEffect(() => {
    stateRef.current = { grid, endpoints, drawingColor, drawingFrom, currentPath, levelIndex };
  });

  const getCellFromPoint = (x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el || el.dataset.row === undefined) return null;
    return { r: parseInt(el.dataset.row), c: parseInt(el.dataset.col) };
  };

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    el.style.touchAction = 'none';

    const onStart = (x, y) => {
      const cell = getCellFromPoint(x, y);
      if (!cell || !stateRef.current.grid) return;
      const { grid: g, endpoints: ep } = stateRef.current;
      const color = g[cell.r][cell.c];
      if (!color) return;
      const ends = ep.filter(e => e.color === color);
      const which = ends.findIndex(e => e.r === cell.r && e.c === cell.c);
      if (which < 0) return;

      const clearedGrid = clearPathForColor(g, ep, color);
      clearedGrid[cell.r][cell.c] = color;
      setGrid(clearedGrid);
      setDrawingColor(color);
      setDrawingFrom(which);
      setCurrentPath([[cell.r, cell.c]]);
    };

    const onMove = (x, y) => {
      const { drawingColor: dc, drawingFrom: df, currentPath: cp, grid: g, endpoints: ep, levelIndex: li } = stateRef.current;
      if (!dc || !cp.length) return;
      const cell = getCellFromPoint(x, y);
      if (!cell) return;
      const last = cp[cp.length - 1];
      if (!isAdjacent(last, [cell.r, cell.c])) return;

      const ends = ep.filter(e => e.color === dc).map(e => [e.r, e.c]);
      const otherEnd = ends[1 - df];

      if (cell.r === otherEnd[0] && cell.c === otherEnd[1]) {
        const newGrid = g.map(r => [...r]);
        for (const [r, c] of cp) newGrid[r][c] = dc;
        newGrid[cell.r][cell.c] = dc;
        setGrid(newGrid);
        setDrawingColor(null);
        setCurrentPath([]);
        if (checkWin(newGrid, ep, LEVELS[li])) {
          setHintsCarryOver(prev => { setHintsRemaining(h => { stateRef.current.carryOver = h; return h; }); return prev; });
          setShowMsg(true);
        }
        return;
      }

      const idx = cp.findIndex(([r, c]) => r === cell.r && c === cell.c);
      if (idx >= 0) {
        const newPath = cp.slice(0, idx + 1);
        const newGrid = g.map(r => [...r]);
        for (let i = 0; i < g.length; i++)
          for (let j = 0; j < g.length; j++)
            if (newGrid[i][j] === dc && !newPath.some(([r, c]) => r === i && c === j) && !ep.some(e => e.color === dc && e.r === i && e.c === j))
              newGrid[i][j] = 0;
        setGrid(newGrid);
        setCurrentPath(newPath);
      } else if (g[cell.r][cell.c] === 0) {
        const newGrid = g.map(r => [...r]);
        newGrid[cell.r][cell.c] = dc;
        setGrid(newGrid);
        setCurrentPath([...cp, [cell.r, cell.c]]);
      }
    };

    const onEnd = () => {
      const { drawingColor: dc, drawingFrom: df, currentPath: cp, grid: g, endpoints: ep } = stateRef.current;
      if (!dc || !cp.length) return;
      const ends = ep.filter(e => e.color === dc).map(e => [e.r, e.c]);
      const newGrid = g.map(r => [...r]);
      for (const [r, c] of cp) {
        const isEnd = ends.some(([er, ec]) => er === r && ec === c);
        if (!isEnd) newGrid[r][c] = 0;
      }
      const [r0, c0] = ends[df];
      newGrid[r0][c0] = dc;
      const [r1, c1] = ends[1 - df];
      newGrid[r1][c1] = dc;
      setGrid(newGrid);
      setDrawingColor(null);
      setCurrentPath([]);
    };

    const pd = e => { e.preventDefault(); onStart(e.clientX, e.clientY); };
    const pm = e => { if (e.buttons !== 0) onMove(e.clientX, e.clientY); };
    const pu = () => onEnd();
    const ts = e => { e.preventDefault(); const t = e.touches[0]; if (t) onStart(t.clientX, t.clientY); };
    const tm = e => { e.preventDefault(); const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); };
    const te = e => { if (e.touches.length === 0) onEnd(); };

    el.addEventListener('pointerdown', pd);
    el.addEventListener('pointermove', pm);
    el.addEventListener('pointerup', pu);
    el.addEventListener('pointerleave', pu);
    el.addEventListener('touchstart', ts, { passive: false });
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('touchend', te);

    return () => {
      el.removeEventListener('pointerdown', pd);
      el.removeEventListener('pointermove', pm);
      el.removeEventListener('pointerup', pu);
      el.removeEventListener('pointerleave', pu);
      el.removeEventListener('touchstart', ts);
      el.removeEventListener('touchmove', tm);
      el.removeEventListener('touchend', te);
    };
  }, [levelIndex]);

  const useHint = () => {
    if (hintsRemaining <= 0 || !grid) return;
    const hint = getHintCell(grid, endpoints, LEVELS[levelIndex]);
    if (!hint) return;
    const newGrid = grid.map(r => [...r]);
    newGrid[hint.r][hint.c] = hint.color;
    setGrid(newGrid);
    setHintsRemaining(h => h - 1);
    if (checkWin(newGrid, endpoints, LEVELS[levelIndex])) setShowMsg(true);
  };

  const prevLevel = () => {
    if (levelIndex <= 0) return;
    const ni = levelIndex - 1;
    setLevelIndex(ni);
    initLevel(ni, 0);
  };

  const nextLevel = () => {
    const carry = hintsRemaining;
    setHintsCarryOver(carry);
    const ni = levelIndex < LEVELS.length - 1 ? levelIndex + 1 : levelIndex;
    setLevelIndex(ni);
    initLevel(ni, carry);
  };

  const level = LEVELS[levelIndex];
  const size = level ? level.size : 5;
  // Apenas presentational: expõe N (tamanho da grade) ao CSS para o cálculo
  // responsivo de --cell-size. Não altera nenhuma lógica do jogo/drag.
  const shellStyle = { '--grid-n': size };

  return (
    <div className="game-shell" style={shellStyle}>
      <header className="game-header">
        <a
          href="/index.html"
          className="go-back"
          aria-label="Voltar"
          onClick={e => { e.preventDefault(); window.location.href = '/index.html'; }}
        >
          <img src="../img/topbar/setaVoltar.png" alt="Botão retornar para a Home" />
        </a>
        <h1 className="game-title" style={{ pointerEvents: 'none' }}>Flow Free</h1>
        <div className="controls">
          <span>Nível {levelIndex + 1}</span>
          <button className="btn" onClick={useHint} disabled={hintsRemaining <= 0}>Dica ({hintsRemaining})</button>
          <button className="btn" onClick={() => initLevel(levelIndex, hintsCarryOver)}>⟳ Reiniciar</button>
          <button className="btn" onClick={prevLevel} disabled={levelIndex <= 0}>← Anterior</button>
          <button className="btn" onClick={nextLevel} disabled={levelIndex >= LEVELS.length - 1}>Próximo →</button>
        </div>
      </header>

      <div className="game-container">
        <div
          className="grid-container"
          ref={gridRef}
          style={{ gridTemplateColumns: `repeat(${size}, var(--cell-size))` }}
        >
          {grid && grid.map((rowArr, r) =>
            rowArr.map((color, c) => {
              const ep = isEndpoint(endpoints, r, c, color);
              let cls = 'cell';
              if (color) cls += ` color-${Math.min(color, FLOW_COLORS)}`;
              if (ep) cls += ' endpoint';
              return (
                <div
                  key={`${r}-${c}`}
                  className={cls}
                  data-row={r}
                  data-col={c}
                />
              );
            })
          )}
        </div>

        {showMsg && (
          <div className="game-message show">
            <div className="message-title">Parabéns!</div>
            <div className="message-text">Você conectou todos os fluxos e preencheu o tabuleiro!</div>
            <button className="btn-action" onClick={nextLevel}>Próximo nível</button>
          </div>
        )}
      </div>

      <div className="instructions">
        <p><strong>Objetivo:</strong> Conecte cada par de pontos da mesma cor e preencha todo o tabuleiro.</p>
        <p><strong>Como jogar:</strong> Arraste a partir de um ponto para desenhar. Não cruze os caminhos.</p>
        <p><strong>Dicas:</strong> Cada fase dá 2 dicas. As que sobraram somam às 2 da próxima fase.</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<FlowFree />);
