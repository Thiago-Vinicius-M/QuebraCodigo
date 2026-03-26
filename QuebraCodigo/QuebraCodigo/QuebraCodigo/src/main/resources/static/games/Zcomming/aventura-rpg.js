/* Aventura RPG – JS */
window.addEventListener("DOMContentLoaded", () => {
    window.__rpgBootOk = true;

    // ===== elementos =====
    const canvas = document.getElementById("rpgCanvas");
    const ctx    = canvas.getContext("2d");
    const msg    = document.getElementById("rpgMsg");
    const btnRun = document.getElementById("rpgRun");
    const btnStep= document.getElementById("rpgStep");
    const btnStop= document.getElementById("rpgStop");
    const btnReset=document.getElementById("rpgReset");
    const txt    = document.getElementById("rpgProg");

    // ===== tema (cores vindas das CSS vars) =====
    const css = getComputedStyle(document.documentElement);
    const COLORS = {
        floor : (css.getPropertyValue("--bg-0")   || "#0f172a").trim(),
        wall  : (css.getPropertyValue("--pri-600")|| "#7c3aed").trim(),
        goal  : (css.getPropertyValue("--goal")   || "#facc15").trim(),
        player: (css.getPropertyValue("--pri")    || "#a855f7").trim(),
        grid  : (css.getPropertyValue("--grid")   || "#334155").trim(),
    };

    // ===== tabuleiro =====
    const SIZE = 8;             // 8x8
    let TILE  = 40;             // recalculado pelo fitCanvas
    const SPEED_MS = 250;

    const MAP = [
        "........",
        ".###....",
        ".#..#..G",
        ".#..#...",
        ".#..###.",
        ".#......",
        ".###.##.",
        "S......."
    ];

    // encontra o S (start)
    let start = {x:0, y:7};
    for (let y=0; y<SIZE; y++)
        for (let x=0; x<SIZE; x++)
            if (MAP[y][x] === "S") start = {x,y};

    // ===== estado =====
    let player  = {x:start.x, y:start.y};
    let program = [];
    let pc = 0;
    let timer = null;
    let running = false;

    function setStatus(t, cls=""){ msg.className = cls; msg.textContent = t; }
    function setButtonsState(state){
        if (state === "running"){
            btnRun.disabled = true; btnStep.disabled = true; btnStop.disabled = false; btnReset.disabled = true; txt.disabled = true;
        } else {
            btnRun.disabled = false; btnStep.disabled = false; btnStop.disabled = true; btnReset.disabled = false; txt.disabled = false;
        }
    }

    // ===== canvas proporcional e nítido (DPR) =====
    function fitCanvas(){
        const parent = canvas.parentElement;   // .board
        // tamanho em px CSS do quadrado (já limitado pelo CSS)
        const rect = parent.getBoundingClientRect();
        const sizeCss = Math.floor(Math.min(rect.width, rect.height));
        // encaixa no múltiplo exato do grid para não “comer” linha
        const tileCss = Math.floor(sizeCss / SIZE);
        const snapCss = tileCss * SIZE;

        // aplica tamanho visual
        canvas.style.width  = snapCss + "px";
        canvas.style.height = snapCss + "px";

        // resolução interna em DPR
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = Math.floor(snapCss * dpr);
        canvas.height = Math.floor(snapCss * dpr);

        // desenhar em px CSS (transform corrige DPR)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // cada tile (em px CSS)
        TILE = tileCss;
    }

    // ===== helpers =====
    function isWall(x,y){
        if (x<0||y<0||x>=SIZE||y>=SIZE) return true;
        const c = MAP[y][x] === "S" ? "." : MAP[y][x];
        return c === "#";
    }
    function isGoal(x,y){ return !(x<0||y<0||x>=SIZE||y>=SIZE) && MAP[y][x] === "G"; }

    // ===== desenho =====
    function drawGrid(){
        ctx.clearRect(0,0, canvas.width, canvas.height);

        for (let y=0; y<SIZE; y++){
            for (let x=0; x<SIZE; x++){
                const cell = MAP[y][x] === "S" ? "." : MAP[y][x];
                let fill = COLORS.floor;
                if (cell === "#") fill = COLORS.wall;
                if (cell === "G") fill = COLORS.goal;

                ctx.fillStyle = fill;
                ctx.fillRect(x*TILE, y*TILE, TILE, TILE);

                // grade nítida
                ctx.strokeStyle = COLORS.grid;
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    Math.floor(x*TILE) + 0.5,
                    Math.floor(y*TILE) + 0.5,
                    Math.floor(TILE)  - 1,
                    Math.floor(TILE)  - 1
                );
            }
        }

        // player
        ctx.fillStyle = COLORS.player;
        const r = Math.max(10, TILE/2 - 6);
        ctx.beginPath();
        ctx.arc(player.x*TILE + TILE/2, player.y*TILE + TILE/2, r, 0, Math.PI*2);
        ctx.fill();
    }

    // ===== parser =====
    const VALID = new Set(["UP","DOWN","LEFT","RIGHT"]);

    function tokenize(s){
        return (s||"")
            .split("\n").map(l => l.replace(/\/\/.*$/,"")).join("\n")
            .replace(/\{/g," { ").replace(/\}/g," } ")
            .split(/\s+/).filter(Boolean);
    }
    function parseBlock(t,i){
        const out=[];
        while(i<t.length){
            const x=t[i];
            if (x === "}") return [out, i+1];

            if (x.toUpperCase() === "LOOP"){
                const n = Number(t[i+1]);
                if (!Number.isInteger(n) || n < 0) throw new Error(`Valor inválido para LOOP: "${t[i+1]}"`);
                if (t[i+2] !== "{") throw new Error('Faltou "{" após LOOP n');
                const [inner, j] = parseBlock(t, i+3);
                for (let k=0; k<n; k++) out.push(...inner);
                i = j; continue;
            }

            if (x === "{") throw new Error('Bloco "{" sem LOOP antes.');
            const cmd = x.toUpperCase();
            if (VALID.has(cmd)){ out.push(cmd); i++; continue; }
            throw new Error(`Token desconhecido: "${x}"`);
        }
        return [out, i];
    }
    function parseProgram(src){
        const tok = tokenize(src);
        const [exp, idx] = parseBlock(tok, 0);
        if (idx !== tok.length) throw new Error("Sobrou conteúdo após o fim do programa (verifique chaves).");
        if (exp.length > 2000) throw new Error(`Programa expandiu para ${exp.length} passos (limite 2000).`);
        return exp;
    }

    // ===== execução =====
    function resetGame(){ stopRun(); player={x:start.x, y:start.y}; pc=0; setStatus(""); fitCanvas(); drawGrid(); }
    function compile(){ program = parseProgram(txt.value || ""); pc=0; }
    function runTick(){
        if (pc >= program.length){ setStatus("✅ Programa concluído.", "ok"); stopRun(); return; }
        stepMove(program[pc++]);
    }
    function stepMove(cmd){
        let nx=player.x, ny=player.y;
        if (cmd==="UP") ny--; if (cmd==="DOWN") ny++; if (cmd==="LEFT") nx--; if (cmd==="RIGHT") nx++;
        if (!isWall(nx,ny)){
            player.x=nx; player.y=ny;
            if (isGoal(nx,ny)){ setStatus("🎉 Objetivo alcançado!", "ok"); stopRun(); }
            drawGrid(); return true;
        } else { drawGrid(); return false; }
    }
    function runProgram(){
        try{ compile(); }catch(e){ setStatus("Erro: "+e.message, "err"); return; }
        if (!program.length){ setStatus("Nada para executar.", "err"); return; }
        setStatus("Executando…"); running=true; setButtonsState("running");
        timer = setInterval(runTick, SPEED_MS);
    }
    function stepOnce(){
        if (!running && pc===0){ try{ compile(); }catch(e){ setStatus("Erro: "+e.message, "err"); return; } }
        if (pc >= program.length){ setStatus("Programa já terminou. Clique Resetar.", "err"); return; }
        runTick();
    }
    function stopRun(){ if (timer){ clearInterval(timer); timer=null; } running=false; setButtonsState("idle"); }

    // eventos
    btnRun.addEventListener("click", runProgram);
    btnStep.addEventListener("click", stepOnce);
    btnStop.addEventListener("click", stopRun);
    btnReset.addEventListener("click", resetGame);

    window.addEventListener("keydown", (ev)=>{
        if (running) return;
        const k = ev.key;
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k)) ev.preventDefault();
        if (k==="ArrowUp") stepMove("UP");
        if (k==="ArrowDown") stepMove("DOWN");
        if (k==="ArrowLeft") stepMove("LEFT");
        if (k==="ArrowRight") stepMove("RIGHT");
    });

    window.addEventListener("resize", () => { fitCanvas(); drawGrid(); });

    // start
    resetGame();
});
