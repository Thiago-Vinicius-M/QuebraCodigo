(function () {
    const modeSel = document.getElementById("vfMode");
    const qEl = document.getElementById("vfQ");
    const expEl = document.getElementById("vfExplain");
    const hitsEl = document.getElementById("vfHits");
    const pointsEl = document.getElementById("vfPoints");
    const timeEl = document.getElementById("vfTime");
    const btnTrue = document.getElementById("btnTrue");
    const btnFalse = document.getElementById("btnFalse");
    const btnNext = document.getElementById("btnNext");
    const POINTS_PER_HIT = 10;

    let timer = null;
    let start = 0;
    let timerRunning = false;
    let hits = 0;
    let points = 0;
    let current = null;
    let mode = "classico";
    let competitive = false;
    let remaining = 60;
    let waitingNext = false;

    const classic = [
        {
            q: "Se todos os mamíferos respiram e cães são mamíferos, então cães respiram.",
            a: true,
            eOk: "Correto! É o Modus Ponens: se A→B e A é verdade, B também é.",
            eBad: "Errado. Se todos os mamíferos respiram e cães são mamíferos, segue que cães respiram (Modus Ponens)."
        },
        {
            q: "Se chove então a rua molha. Não chove. Logo, a rua não molha.",
            a: false,
            eOk: "Correto! Negar o antecedente não prova a conclusão — a rua pode molhar por outra causa.",
            eBad: "Errado. “Não chove” não garante que a rua não molhe. Isso é a falácia da negação do antecedente."
        },
        {
            q: "(P ∧ Q) ⇒ P é sempre verdadeiro.",
            a: true,
            eOk: "Correto! Se P e Q são verdadeiros juntos, P sozinho também é — é uma tautologia.",
            eBad: "Errado. (P ∧ Q) ⇒ P é sempre verdadeiro: se ambos valem, P vale."
        },
        {
            q: "Se P é falso, então (P ⇒ Q) é verdadeiro.",
            a: true,
            eOk: "Correto! Implicação com antecedente falso é verdadeira (vacuamente).",
            eBad: "Errado. Quando P é falso, (P ⇒ Q) é verdadeiro, qualquer que seja Q."
        }
    ];
    const conectivos = [
        {
            q: "P ∨ ¬P é uma tautologia.",
            a: true,
            eOk: "Correto! Lei do terceiro excluído: P é verdadeiro ou falso.",
            eBad: "Errado. P ∨ ¬P cobre todos os casos — é sempre verdadeiro."
        },
        {
            q: "Se P ⇒ Q e P é verdadeiro, então Q é verdadeiro.",
            a: true,
            eOk: "Correto! Modus Ponens.",
            eBad: "Errado. De P⇒Q e P verdadeiro segue Q (Modus Ponens)."
        },
        {
            q: "Se P ⇒ Q e Q é verdadeiro, então P é verdadeiro.",
            a: false,
            eOk: "Correto! Afirmar o consequente não prova o antecedente (falácia).",
            eBad: "Errado. Q verdadeiro não implica P. Ex.: “se chove, rua molha” e rua molha ≠ choveu."
        }
    ];
    const tabela = [
        {
            q: "(P ↔ Q) é verdadeira quando P e Q têm o mesmo valor.",
            a: true,
            eOk: "Correto! A bicondicional vale quando ambos são V ou ambos são F.",
            eBad: "Errado. P ↔ Q é verdadeira justamente quando P e Q têm o mesmo valor."
        },
        {
            q: "(P ⇒ Q) é falsa apenas quando P=V e Q=V.",
            a: false,
            eOk: "Correto! (P ⇒ Q) é falsa só quando P=V e Q=F.",
            eBad: "Errado. (P ⇒ Q) é falsa apenas quando P=V e Q=F — não quando ambos são V."
        }
    ];

    const bankFor = () => (mode === "classico" ? classic : mode === "conectivos" ? conectivos : tabela);
    const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pad = (n) => (n < 10 ? "0" + n : "" + n);

    function setAnswerEnabled(on) {
        btnTrue.disabled = !on;
        btnFalse.disabled = !on;
    }

    function renderStats() {
        hitsEl.textContent = String(hits);
        if (pointsEl) pointsEl.textContent = String(points);
    }

    function startTimerIfNeeded() {
        if (timerRunning) return;
        timerRunning = true;
        start = Date.now();
        competitive = mode === "competitivo";
        remaining = 60;
        clearInterval(timer);
        timer = setInterval(tick, 1000);
        tick();
    }

    function next() {
        waitingNext = false;
        expEl.textContent = "";
        expEl.className = "vf-explain";
        btnNext.hidden = true;
        setAnswerEnabled(true);
        current = sample(bankFor());
        qEl.textContent = current.q;
    }

    function tick() {
        if (!timerRunning) return;
        if (competitive) {
            remaining--;
            if (remaining <= 0) {
                endCompetitive();
                return;
            }
            timeEl.textContent = "00:" + pad(remaining);
        } else {
            const s = Math.floor((Date.now() - start) / 1000);
            timeEl.textContent = pad(Math.floor(s / 60)) + ":" + pad(s % 60);
        }
    }

    function answer(val) {
        if (!current || waitingNext) return;
        startTimerIfNeeded();

        const ok = val === current.a;
        waitingNext = true;
        setAnswerEnabled(false);

        if (ok) {
            hits++;
            points += POINTS_PER_HIT;
            renderStats();
            expEl.className = "vf-explain vf-ok";
            expEl.textContent = "✔ " + (current.eOk || "Correto!");
        } else {
            expEl.className = "vf-explain vf-bad";
            expEl.textContent = "✖ " + (current.eBad || current.eOk || "Resposta incorreta.");
        }

        btnNext.hidden = false;
        btnNext.focus();
    }

    async function endCompetitive() {
        clearInterval(timer);
        timerRunning = false;
        setAnswerEnabled(false);
        btnNext.hidden = true;
        expEl.className = "vf-explain";
        const msg = "Tempo esgotado! Acertos: " + hits + " · Pontos: " + points;
        if (window.Achievements && typeof Achievements.award === "function") {
            await Achievements.award({ addPoints: points, addCoins: Math.floor(hits / 5) });
            Achievements.toast("Competitivo: +" + points + " pts");
        }
        expEl.textContent = msg;
    }

    function reset() {
        clearInterval(timer);
        timer = null;
        timerRunning = false;
        waitingNext = false;
        hits = 0;
        points = 0;
        competitive = mode === "competitivo";
        remaining = 60;
        timeEl.textContent = competitive ? "00:60" : "00:00";
        renderStats();
        next();
    }

    btnTrue.onclick = () => answer(true);
    btnFalse.onclick = () => answer(false);
    btnNext.onclick = () => {
        if (competitive && remaining <= 0) return;
        next();
    };
    document.getElementById("vfNew").onclick = reset;
    modeSel.onchange = () => {
        mode = modeSel.value;
        reset();
    };

    window.addEventListener("DOMContentLoaded", async () => {
        if (window.Achievements && typeof Achievements.syncUser === "function") {
            await Achievements.syncUser("Jogador");
        }
        reset();
    });
})();
