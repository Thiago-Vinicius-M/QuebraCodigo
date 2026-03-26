// memory.js v5 — emojis de frutas + verso liso + grid centralizado
// Stub Achievements para não quebrar se a API não estiver carregada
window.Achievements = window.Achievements || {
    syncUser: async () => {},
    award: async () => {},
    toast: () => {}
};

(function () {
    console.log("memory.js carregado");

    let gridEl, movesEl, timeEl, msgEl, sizeSel, btnStart, btnReset; 

    let cols = 4,
        rows = 4,
        deck = [],
        first = null,
        lock = false,
        moves = 0,
        start = 0,
        timer = null,
        matched = 0,
        running = false;
        
    const images = [
    'img/cartas/1.png', 
    'img/cartas/2.png',
    'img/cartas/3.png',
    'img/cartas/4.png',
    'img/cartas/5.png',
    'img/cartas/6.png',
    'img/cartas/7.png',
    'img/cartas/8.png',
    'img/cartas/9.png',
    'img/cartas/10.png',
    'img/cartas/11.png',
    'img/cartas/12.png',
    'img/cartas/13.png',
    'img/cartas/14.png',
    'img/cartas/15.png',
    'img/cartas/16.png',
    'img/cartas/17.png',
    'img/cartas/18.png',
    'img/cartas/19.png'
];

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Escolhe 'pairsNeeded' frutas distintas quando possível; se faltar, recicla.
    function makeIconList(pairsNeeded) {
        const pool = [...new Set(images)]; // únicos
        const icons = [];
        if (pairsNeeded <= pool.length) {
            shuffle(pool);
            return pool.slice(0, pairsNeeded);
        }
        // mais pares do que frutas disponíveis → usa todas e recicla o necessário
        shuffle(pool);
        let i = 0;
        while (icons.length < pairsNeeded) {
            icons.push(pool[i % pool.length]);
            i++;
        }
        return icons;
    }

    /* --------- Utilidades --------- */
    const pad = n => n < 10 ? '0' + n : '' + n;

    const tick = () => {
        const s = Math.floor((Date.now() - start) / 1000);
        timeEl.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    };

    function setSizeFromSelect() {
        // compatível com valores "4", "5", "6"
        const v = parseInt(sizeSel.value, 10) || 4;
        cols = v;
        rows = 4; // sempre 4 linhas no seu layout atual
    }

    function buildDeck() {
        const total = cols * rows;
        const pairs = total / 2;
        const icons = makeIconList(pairs);
        const vals = icons.flatMap(e => [e, e]); // duplica p/ formar pares
        shuffle(vals);
        deck = vals;
    }

    function applyGridClass() { 
        gridEl.classList.remove('cols-4', 'cols-5', 'cols-6');
        gridEl.classList.add(`cols-${cols}`);
    }

    function card(emoji, idx) {
        const c = document.createElement('div');
        c.className = 'card3d';
        c.dataset.idx = idx;
        c.dataset.hash = emoji; // o próprio emoji é o "id" do par

        const inner = document.createElement('div');
        inner.className = 'card3d-inner';

        // frente (virada para baixo) — lisa
        const front = document.createElement('div');
        front.className = 'face front';

        // verso (revelado) — mostra emoji grande
        const back = document.createElement('div');
        back.className = 'face back';
        back.innerHTML = `<img src="${emoji}" class="card-image">`;

        inner.append(front, back);
        c.append(inner);

        c.addEventListener('click', () => reveal(c));
        return c;
    }

    function draw() {
        applyGridClass();
        gridEl.innerHTML = '';
        deck.forEach((emoji, i) => gridEl.appendChild(card(emoji, i)));
        moves = 0;
        movesEl.textContent = '0';
        matched = 0;
        msgEl.textContent = '';
        first = null;
        lock = false;
    }

    function flipOn(c, ok = false) {
        c.classList.add('flipped');
        if (ok) c.classList.add('matched');
    }

    function flipOff(c) {
        c.classList.remove('flipped');
    }

    function reveal(c) {
        if (!running || lock) return;
        if (c.classList.contains('matched')) return;
        if (c === first) return;
        if (c.classList.contains('flipped')) return;

        flipOn(c);

        if (!first) {
            first = c;
            return;
        }

        moves++;
        movesEl.textContent = moves;
        lock = true;

        setTimeout(() => {
            if (first.dataset.hash === c.dataset.hash) {
                flipOn(first, true);
                flipOn(c, true);
                matched += 2;
                if (matched === deck.length) win();
            } else {
                flipOff(first);
                flipOff(c);
            }
            first = null;
            lock = false;
        }, 380);
    }

    async function win() {
        running = false;
        clearInterval(timer);
        const sec = Math.floor((Date.now() - start) / 1000);
        const total = cols * rows;
        const base = (total <= 16) ? 80 : (total <= 20) ? 110 : 140;
        const bonus = Math.max(0, 60 - Math.floor(sec / 5)) + Math.max(0, 24 - moves);
        await Achievements.award({ addPoints: base + bonus, addCoins: 6 });
        Achievements.toast(`Memória concluída! +${base + bonus} pts`);
        // mostrar popup de vitória
        document.getElementById("win-overlay").classList.remove("hidden");

        // reduzir interatividade das cartas
        document.querySelector(".memory-grid").style.opacity = "0.35";
        document.querySelector(".memory-grid").style.pointerEvents = "none";    
        }

    function startGame() {
        // Garante que o popup de vitória esteja escondido
        const winOverlay = document.getElementById("win-overlay");
        if (winOverlay) winOverlay.classList.add("hidden");

        running = true;
        clearInterval(timer); 
        setSizeFromSelect();
        buildDeck();
        draw();
                
        // Início do Timer
        start = Date.now();
        timer = setInterval(tick, 1000);
        tick(); // Chama uma vez para exibir 00:00 imediatamente
    }

    function resetGame() {
        // reset agora simplesmente recomeça o jogo atual
        startGame();
    }

/* --------- Eventos --------- */
            
    window.addEventListener('DOMContentLoaded', async () => {
    gridEl   = document.getElementById('mGrid');
    movesEl  = document.getElementById('mMoves');
    timeEl   = document.getElementById('mTime');
    msgEl    = document.getElementById('mMsg');
    sizeSel  = document.getElementById('mSize');
    btnStart = document.getElementById('mStart');
    btnReset = document.getElementById('mReset');
    
    if (btnStart) btnStart.addEventListener('click', startGame);
    if (btnReset) btnReset.addEventListener('click', resetGame);

    if (sizeSel) {
        sizeSel.addEventListener('change', () => {
            startGame();
        });
    }
    
    const playAgain = document.getElementById("play-again");
    if (playAgain) {
        playAgain.addEventListener("click", () => {
            location.reload(); 
        });
    }

    await Achievements.syncUser('Jogador');
    // Chamamos setSizeFromSelect e startGame após as atribuições
    setSizeFromSelect();
    startGame();
});
})();