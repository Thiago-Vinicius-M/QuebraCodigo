window.Achievements = window.Achievements || {
  syncUser: async () => {},
  award: async () => {},
  toast: () => {}
};

const { useState, useEffect, useCallback } = React;

function isValid(board, index, num) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const blockRow = Math.floor(row / 3) * 3;
  const blockCol = Math.floor(col / 3) * 3;
  for (let c = 0; c < 9; c++) if (board[row * 9 + c] === num) return false;
  for (let r = 0; r < 9; r++) if (board[r * 9 + col] === num) return false;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[(blockRow + r) * 9 + (blockCol + c)] === num) return false;
  return true;
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

function baseBoard() {
  const board = Array(81).fill(0);
  function solve(b) {
    for (let i = 0; i < 81; i++) {
      if (b[i] === 0) {
        const nums = [1,2,3,4,5,6,7,8,9];
        for (let j = nums.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [nums[j], nums[k]] = [nums[k], nums[j]];
        }
        for (const n of nums) {
          if (isValid(b, i, n)) {
            b[i] = n;
            if (solve(b)) return true;
            b[i] = 0;
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

function carve(full, diff) {
  const removeCount = { easy: 40, medium: 50, hard: 58 }[diff] || 40;
  const board = [...full];
  const indices = [...Array(81).keys()];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  for (let i = 0; i < Math.min(removeCount, indices.length); i++) {
    board[indices[i]] = 0;
  }
  return board;
}

function generateGame(diff) {
  const solved = baseBoard();
  const puzzle = carve(solved, diff);
  const fixed = new Set(puzzle.map((v, i) => v !== 0 ? i : -1).filter(i => i !== -1));
  return { puzzle, fixed };
}

function getCellClasses(index, board, fixed, activeIndex) {
  const classes = ['sudoku-cell'];
  if (fixed.has(index)) return classes;

  if (activeIndex !== -1) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const aRow = Math.floor(activeIndex / 9);
    const aCol = activeIndex % 9;
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;
    const aBlockRow = Math.floor(aRow / 3) * 3;
    const aBlockCol = Math.floor(aCol / 3) * 3;

    if (index === activeIndex) {
      classes.push('active');
    } else if (row === aRow || col === aCol || (blockRow === aBlockRow && blockCol === aBlockCol)) {
      classes.push('highlight');
    }
  }

  const val = board[index];
  if (val !== 0) {
    const tmp = [...board];
    tmp[index] = 0;
    if (!isValid(tmp, index, val)) {
      classes.push('invalid');
    } else {
      classes.push('correct');
    }
  }

  return classes;
}

function Sudoku() {
  const [diff, setDiff] = useState('easy');
  const [board, setBoard] = useState(Array(81).fill(0));
  const [fixed, setFixed] = useState(new Set());
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showWin, setShowWin] = useState(false);
  const [msg, setMsg] = useState('');

  const newGame = useCallback((d) => {
    const { puzzle, fixed: f } = generateGame(d);
    setBoard(puzzle);
    setFixed(f);
    setActiveIndex(-1);
    setShowWin(false);
    setMsg('');
  }, []);

  useEffect(() => {
    Achievements.syncUser('Jogador');
    newGame('easy');
  }, []);

  const handleInput = (index, value) => {
    if (fixed.has(index)) return;
    const cleaned = value.replace(/[^1-9]/g, '');
    const num = cleaned ? parseInt(cleaned.slice(-1)) : 0;
    const newBoard = [...board];
    newBoard[index] = num;
    setBoard(newBoard);

    const hasConflict = newBoard.some((v, i) => {
      if (v === 0) return false;
      const tmp = [...newBoard]; tmp[i] = 0;
      return !isValid(tmp, i, v);
    });

    if (!hasConflict && !newBoard.includes(0)) {
      setShowWin(true);
      Achievements.toast('Sudoku concluído!');
    } else {
      setMsg('');
    }
  };

  const handleSolve = () => {
    const b = [...board];
    if (solveSudoku(b)) {
      setBoard(b);
      setMsg('');
    } else {
      setMsg('Sem solução para o estado atual.');
    }
  };

  const handleClear = () => {
    setBoard(prev => prev.map((v, i) => fixed.has(i) ? v : 0));
    setMsg('');
    setActiveIndex(-1);
  };

  const handleDiffChange = (e) => {
    const d = e.target.value;
    setDiff(d);
    newGame(d);
  };

  return (
    <div className="game-shell">
      <header className="game-header">
        <a
          href="../../index.html"
          className="go-back"
          aria-label="Voltar"
          onClick={e => { e.preventDefault(); window.location.href = '../../index.html'; }}
        >
          <img src="../img/topbar/setaVoltar.png" alt="Botão retornar para a Home" />
        </a>
        <h1 className="game-title" style={{ pointerEvents: 'none' }}>Sudoku</h1>
        <div className="controls">
          <button id="sNew" onClick={() => newGame(diff)}>Novo Jogo</button>
          <label>
            Dificuldade:
            <select value={diff} onChange={handleDiffChange}>
              <option value="easy">Fácil</option>
              <option value="medium">Médio</option>
              <option value="hard">Difícil</option>
            </select>
          </label>
          <button id="sSolve" onClick={handleSolve}>Resolver</button>
          <button id="sClear" onClick={handleClear}>Limpar</button>
        </div>
      </header>

      <div className="panel">
        <div className="sudoku-wrap">
          <div id="sGrid" className="sudoku-grid">
            {board.map((val, i) => {
              const isFixed = fixed.has(i);
              const classes = getCellClasses(i, board, fixed, activeIndex);
              return (
                <div key={i} className={classes.join(' ')}>
                  <input
                    maxLength={1}
                    inputMode="numeric"
                    value={val !== 0 ? val : ''}
                    readOnly={isFixed}
                    className={isFixed ? 'fixed' : ''}
                    onFocus={() => setActiveIndex(i)}
                    onBlur={() => setActiveIndex(-1)}
                    onChange={e => handleInput(i, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {msg && <div id="sMsg" className="muted" style={{ textAlign: 'center', color: '#ef4444' }}>{msg}</div>}
      </div>

      {showWin && (
        <div className="win-overlay">
          <div className="win-content">
            <h2>🏆 Parabéns! 🏆</h2>
            <p>Você conseguiu o Sudoku</p>
            <button onClick={() => { setShowWin(false); newGame(diff); }}>Novo Jogo</button>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Sudoku />);
