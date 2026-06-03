window.Achievements = window.Achievements || {
  syncUser: async () => {},
  award: async () => {},
  toast: () => {}
};

const { useState, useEffect, useRef, useCallback } = React;

const ALL_IMAGES = [
  'img/cartas/1.png','img/cartas/2.png','img/cartas/3.png','img/cartas/4.png',
  'img/cartas/5.png','img/cartas/6.png','img/cartas/7.png','img/cartas/8.png',
  'img/cartas/9.png','img/cartas/10.png','img/cartas/11.png','img/cartas/12.png',
  'img/cartas/13.png','img/cartas/14.png','img/cartas/15.png','img/cartas/16.png',
  'img/cartas/17.png','img/cartas/18.png','img/cartas/19.png',
];

const pad = n => n < 10 ? '0' + n : '' + n;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(cols, rows) {
  const pairs = (cols * rows) / 2;
  const pool = shuffle([...new Set(ALL_IMAGES)]);
  const icons = pairs <= pool.length
    ? pool.slice(0, pairs)
    : Array.from({ length: pairs }, (_, i) => pool[i % pool.length]);
  return shuffle([...icons, ...icons]);
}

function MemoryGame() {
  const [cols, setCols] = useState(4);
  const rows = 4;
  const [deck, setDeck] = useState(() => buildDeck(4, 4));
  const [flipped, setFlipped] = useState(new Set());
  const [matched, setMatched] = useState(new Set());
  const [firstIdx, setFirstIdx] = useState(null);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startGame = useCallback((newCols) => {
    const c = newCols ?? cols;
    stopTimer();
    const newDeck = buildDeck(c, rows);
    setDeck(newDeck);
    setFlipped(new Set());
    setMatched(new Set());
    setFirstIdx(null);
    setLock(false);
    setMoves(0);
    setTime(0);
    setShowWin(false);
    setRunning(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [cols, rows]);

  useEffect(() => {
    Achievements.syncUser('Jogador');
    startGame(4);
    return () => stopTimer();
  }, []);

  useEffect(() => () => stopTimer(), []);

  const handleCardClick = useCallback((idx) => {
    if (!running || lock) return;
    if (matched.has(idx) || flipped.has(idx)) return;
    if (firstIdx === idx) return;

    if (firstIdx === null) {
      setFlipped(prev => new Set([...prev, idx]));
      setFirstIdx(idx);
      return;
    }

    const second = idx;
    setFlipped(prev => new Set([...prev, second]));
    setMoves(m => m + 1);
    setLock(true);

    setTimeout(() => {
      setFlipped(prev => {
        const next = new Set(prev);
        if (deck[firstIdx] === deck[second]) {
          setMatched(prevMatched => {
            const nm = new Set([...prevMatched, firstIdx, second]);
            if (nm.size === deck.length) {
              stopTimer();
              setRunning(false);
              const sec = Math.floor((Date.now() - startTimeRef.current) / 1000);
              const total = cols * rows;
              const base = total <= 16 ? 80 : total <= 20 ? 110 : 140;
              const bonus = Math.max(0, 60 - Math.floor(sec / 5));
              Achievements.award({ addPoints: base + bonus, addCoins: 6 });
              Achievements.toast(`Memória concluída! +${base + bonus} pts`);
              setShowWin(true);
            }
            return nm;
          });
        } else {
          next.delete(firstIdx);
          next.delete(second);
        }
        return next;
      });
      setFirstIdx(null);
      setLock(false);
    }, 380);
  }, [running, lock, matched, flipped, firstIdx, deck, cols, rows]);

  const handleSizeChange = (e) => {
    const c = parseInt(e.target.value);
    setCols(c);
    startGame(c);
  };

  const timeStr = `${pad(Math.floor(time / 60))}:${pad(time % 60)}`;

  return (
    <div className="game-shell">
      <header className="game-header">
        <a href="/index.html" className="go-back" aria-label="Voltar">
          <img src="../img/topbar/setaVoltar.png" alt="Botão retornar para a Home" />
        </a>
        <h1 className="game-title" style={{ pointerEvents: 'none' }}>Jogo da Memória</h1>
        <div className="controls">
          <div className="ctrl-group">
            <button id="mStart" onClick={() => startGame()}>Iniciar</button>
            <button id="mReset" onClick={() => startGame()}>Resetar</button>
          </div>
          <label className="ctrl-label">
            <span className="muted">Tamanho:</span>
            <select value={cols} onChange={handleSizeChange}>
              <option value="4">4 × 4</option>
              <option value="5">5 × 4</option>
              <option value="6">6 × 4</option>
            </select>
          </label>
          <div className="controls">
            <span className="muted">Movimentos: <strong>{moves}</strong></span>
            <span className="muted">Tempo: <strong>{timeStr}</strong></span>
          </div>
        </div>
      </header>

      <main className="game-content" style={{ width: '100%' }}>
        <div className="memory-wrap">
          <div
            className={`memory-grid cols-${cols}`}
            style={showWin ? { opacity: 0.35, pointerEvents: 'none' } : {}}
          >
            {deck.map((img, idx) => {
              const isFlipped = flipped.has(idx) || matched.has(idx);
              const isMatched = matched.has(idx);
              return (
                <div
                  key={idx}
                  className={`card3d${isFlipped ? ' flipped' : ''}${isMatched ? ' matched' : ''}`}
                  onClick={() => handleCardClick(idx)}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  <div className="card3d-inner">
                    <div className="face front" />
                    <div className="face back">
                      <img src={img} className="card-image" alt="carta" draggable={false} style={{ pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {showWin && (
            <div className="win-overlay">
              <div className="win-box">
                <h2>Parabéns!</h2>
                <p>Você concluiu o desafio da memória!</p>
                <button id="play-again" onClick={() => startGame()}>Jogar novamente</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MemoryGame />);
