const { useState, useEffect, useRef, useCallback } = React;

const SIZE = 4;
const PADDING = 15;
const GAP = 15;

/* ---------------------------------------------------------------------------
   Modelo baseado em PEÇAS com identidade (id) persistente.
   Cada peça é { id, r, c, value, isNew, merged }. Como a key do React é o id
   (e não a posição), a MESMA célula do DOM é reaproveitada entre jogadas:
   só mudam left/top -> a transition do CSS faz o deslize. Sem isso o React
   trocava o elemento e a peça apenas aparecia/sumia no destino.
--------------------------------------------------------------------------- */

let _tileId = 0;
const nextId = () => ++_tileId;

const VECTORS = {
  up:    { r: -1, c: 0 },
  down:  { r: 1,  c: 0 },
  left:  { r: 0,  c: -1 },
  right: { r: 0,  c: 1 },
};

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function tilesToGrid(tiles) {
  const g = emptyGrid();
  tiles.forEach(t => { g[t.r][t.c] = t; });
  return g;
}

function buildTraversals(vector) {
  const rs = [], cs = [];
  for (let i = 0; i < SIZE; i++) { rs.push(i); cs.push(i); }
  // processa primeiro as peças mais próximas da parede para onde estão indo
  if (vector.r === 1) rs.reverse();
  if (vector.c === 1) cs.reverse();
  return { rs, cs };
}

function findFarthest(grid, r, c, vector) {
  let pr = r, pc = c;
  let nr = r + vector.r, nc = c + vector.c;
  while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !grid[nr][nc]) {
    pr = nr; pc = nc;
    nr += vector.r; nc += vector.c;
  }
  return { farR: pr, farC: pc, nextR: nr, nextC: nc };
}

function addRandomTile(tiles) {
  const grid = tilesToGrid(tiles);
  const empty = [];
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE; j++)
      if (!grid[i][j]) empty.push([i, j]);
  if (!empty.length) return tiles;
  const [i, j] = empty[Math.floor(Math.random() * empty.length)];
  return [...tiles, { id: nextId(), r: i, c: j, value: Math.random() < 0.9 ? 2 : 4, isNew: true, merged: false }];
}

/* Aplica o movimento mantendo o id das peças que deslizam.
   No merge, a peça que se move (mais distante da parede) mantém o id e desliza
   até a célula de destino, dobrando de valor (animação "pop"); a peça que já
   estava lá é consumida (removida) — fica escondida sob a que chega. */
function moveTiles(prevTiles, dir) {
  const vector = VECTORS[dir];
  const grid = emptyGrid();
  prevTiles.forEach(t => { grid[t.r][t.c] = { ...t, isNew: false, merged: false }; });

  const { rs, cs } = buildTraversals(vector);
  let moved = false;
  let scoreGain = 0;

  rs.forEach(r => cs.forEach(c => {
    const tile = grid[r][c];
    if (!tile) return;
    const { farR, farC, nextR, nextC } = findFarthest(grid, r, c, vector);
    const inBounds = nextR >= 0 && nextR < SIZE && nextC >= 0 && nextC < SIZE;
    const next = inBounds ? grid[nextR][nextC] : null;

    if (next && next.value === tile.value && !next.merged) {
      // merge: a peça atual desliza para a célula de `next` e dobra
      grid[nextR][nextC] = { id: tile.id, r: nextR, c: nextC, value: tile.value * 2, isNew: false, merged: true };
      grid[r][c] = null;
      scoreGain += tile.value * 2;
      moved = true;
    } else {
      grid[r][c] = null;
      grid[farR][farC] = { ...tile, r: farR, c: farC };
      if (farR !== r || farC !== c) moved = true;
    }
  }));

  const tiles = [];
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE; j++)
      if (grid[i][j]) tiles.push(grid[i][j]);

  return { tiles, moved, scoreGain };
}

function detectState(tiles, alreadyWon) {
  const grid = tilesToGrid(tiles);
  if (!alreadyWon)
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE; j++)
        if (grid[i][j] && grid[i][j].value === 2048) return 'won';
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE; j++) {
      if (!grid[i][j]) return 'playing';
      const v = grid[i][j].value;
      if (j + 1 < SIZE && grid[i][j + 1] && grid[i][j + 1].value === v) return 'playing';
      if (i + 1 < SIZE && grid[i + 1][j] && grid[i + 1][j].value === v) return 'playing';
    }
  return 'over';
}

function initTiles() {
  let t = [];
  t = addRandomTile(t);
  t = addRandomTile(t);
  return t;
}

function Game2048() {
  const [tiles, setTiles] = useState(initTiles);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('best2048')) || 0);
  const [prevState, setPrevState] = useState(null);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState(null);
  const [containerW, setContainerW] = useState(0);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const obs = new ResizeObserver(() => {
      if (gridRef.current) setContainerW(gridRef.current.offsetWidth);
    });
    obs.observe(gridRef.current);
    setContainerW(gridRef.current.offsetWidth);
    return () => obs.disconnect();
  }, []);

  const handleMove = useCallback((direction) => {
    if (msg && msg.type === 'over') return;
    const { tiles: movedTiles, moved, scoreGain } = moveTiles(tiles, direction);
    if (!moved) return;

    setPrevState({ tiles, score });

    const withTile = addRandomTile(movedTiles);
    const newScore = score + scoreGain;
    setScore(newScore);
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('best2048', newScore);
    }
    setTiles(withTile);

    const state = detectState(withTile, won);
    if (state === 'won' && !won) {
      setWon(true);
      setMsg({ type: 'won', title: 'Você Venceu! 🎉', text: `Parabéns! Pontuação: ${newScore}` });
    } else if (state === 'over') {
      setMsg({ type: 'over', title: 'Game Over!', text: `Pontuação final: ${newScore}` });
    }
  }, [msg, tiles, score, bestScore, won]);

  useEffect(() => {
    const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const handler = e => {
      if (dirs[e.key]) { e.preventDefault(); handleMove(dirs[e.key]); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleMove]);

  const restart = () => {
    setTiles(initTiles());
    setScore(0);
    setPrevState(null);
    setWon(false);
    setMsg(null);
  };

  const undo = () => {
    if (!prevState) return;
    setTiles(prevState.tiles.map(t => ({ ...t, isNew: false, merged: false })));
    setScore(prevState.score);
    setPrevState(null);
    setMsg(null);
  };

  const cellSize = containerW > 0
    ? (containerW - 2 * PADDING - (SIZE - 1) * GAP) / SIZE
    : 0;

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
        <h1 className="game-title" style={{ pointerEvents: 'none' }}>2048</h1>
        <div className="controls">
          <div className="score-container">
            <div className="score-label">Pontos</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-container">
            <div className="score-label">Melhor</div>
            <div className="score-value">{bestScore}</div>
          </div>
          <button className="btn" onClick={undo} disabled={!prevState}>↶ Desfazer</button>
          <button className="btn" onClick={restart}>⟳ Reiniciar</button>
        </div>
      </header>

      <div className="game-container">
        <div className="grid-container" ref={gridRef}>
          {Array(SIZE * SIZE).fill(0).map((_, k) => <div key={k} className="grid-cell" />)}
          {cellSize > 0 && tiles.map(({ id, r, c, value, isNew, merged }) => (
            <div
              key={id}
              className={`tile tile-${value}${isNew ? ' tile-new' : ''}${merged ? ' merged' : ''}`}
              style={{
                width: cellSize,
                height: cellSize,
                left: PADDING + c * (cellSize + GAP),
                top: PADDING + r * (cellSize + GAP),
              }}
            >
              {value}
            </div>
          ))}
        </div>

        {msg && (
          <div className="game-message show">
            <div className="message-title">{msg.title}</div>
            <div className="message-text">{msg.text}</div>
            <button className="btn-action" onClick={restart}>Jogar Novamente</button>
          </div>
        )}
      </div>

      <div className="instructions">
        <p>Use as setas <span className="key-hint">↑</span> <span className="key-hint">↓</span> <span className="key-hint">←</span> <span className="key-hint">→</span> para mover</p>
        <p>Quando você pressiona uma seta, <strong>TODAS as peças</strong> se movem naquela direção!</p>
        <p>Junte números iguais para somar e chegar em <strong>2048</strong>!</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Game2048 />);
