(function(){
    const cvs=document.getElementById('sfCanvas'), ctx=cvs.getContext('2d');
    const btnStart=document.getElementById('sfStart'), btnPause=document.getElementById('sfPause'), cycleEl=document.getElementById('sfCycle'), msgEl=document.getElementById('sfMsg');
    let running=false, t0=0, raf=null;

    function drawScene(){
        const {width:w, height:h}=cvs; ctx.clearRect(0,0,w,h);
        // fundo
        ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,w,h);

        // dimensões
        const roadW=Math.min(w,h)*0.26; // largura da via
        const laneMidW=2, dashLen=16, dashGap=10;

        // vias (cruz), centralizadas
        ctx.fillStyle='#1f2937';
        ctx.fillRect(0,(h-roadW)/2,w,roadW);     // horizontal
        ctx.fillRect((w-roadW)/2,0,roadW,h);     // vertical

        // tracejado central — perfeitamente alinhado ao centro
        ctx.save();
        ctx.setLineDash([dashLen,dashGap]);
        ctx.lineWidth=2;
        ctx.strokeStyle='rgba(255,255,255,0.35)';
        // horizontal
        ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke();
        // vertical
        ctx.beginPath(); ctx.moveTo(w/2,0); ctx.lineTo(w/2,h); ctx.stroke();
        ctx.restore();

        // caixas dos semáforos — 4 unidades, sem sobrepor
        const boxW=roadW*0.16, boxH=roadW*0.36, r=Math.min(boxW,boxH)/7;
        const offset=roadW*0.36;

        const boxes=[
            {x:w/2 - offset - boxW, y:h/2 - offset - boxH}, // noroeste
            {x:w/2 + offset,        y:h/2 - offset - boxH}, // nordeste
            {x:w/2 - offset - boxW, y:h/2 + offset},        // sudoeste
            {x:w/2 + offset,        y:h/2 + offset}         // sudeste
        ];

        boxes.forEach(b=>{
            // carcaça
            ctx.fillStyle='#0f1b33';
            ctx.strokeStyle='rgba(255,255,255,0.10)';
            ctx.lineWidth=2;
            roundRect(ctx,b.x,b.y,boxW,boxH,10); ctx.fill(); ctx.stroke();
            // três lâmpadas alinhadas
            const cx=b.x+boxW/2;
            const gaps=[-boxH*0.3,0,boxH*0.3];
            const state=lightsState();
            drawLight(cx, b.y+boxH/2+gaps[0], r, '#f87171', state.red);
            drawLight(cx, b.y+boxH/2+gaps[1], r, '#fde68a', state.yellow);
            drawLight(cx, b.y+boxH/2+gaps[2], r, '#86efac', state.green);
        });
    }

    function lightsState(){
        const cycle=Math.max(4, Math.min(20, parseInt(cycleEl.value,10)||6));
        const t=((performance.now()-t0)/1000)%cycle;
        const half=cycle/2, yellowTime=1;
        const inYellow = (t%half) > (half - yellowTime);
        const nsGreen = (t < half); // primeira metade N-S verde
        return {
            // desenhamos o mesmo estado em todos, mas as posições nas esquinas são simétricas (estético e simples)
            red: !nsGreen || inYellow,
            yellow: inYellow,
            green: nsGreen && !inYellow
        };
    }

    function drawLight(x,y,r,color,on){
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle = on ? color : '#0f172a';
        ctx.fill();
        ctx.lineWidth=3; ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.stroke();
        if(on){ ctx.beginPath(); ctx.arc(x,y,r*0.55,0,Math.PI*2); ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.stroke(); }
    }

    function roundRect(ctx,x,y,w,h,rad){
        ctx.beginPath();
        ctx.moveTo(x+rad,y);
        ctx.arcTo(x+w,y,x+w,y+h,rad);
        ctx.arcTo(x+w,y+h,x,y+h,rad);
        ctx.arcTo(x,y+h,x,y,rad);
        ctx.arcTo(x,y,x+w,y,rad);
        ctx.closePath();
    }

    function frame(){ drawScene(); if(running) raf=requestAnimationFrame(frame); }

    btnStart.onclick=()=>{ running=true; t0=performance.now(); frame(); msgEl.textContent='Rodando.'; };
    btnPause.onclick =()=>{ running=false; cancelAnimationFrame(raf); msgEl.textContent='Pausado.'; };
    cycleEl.onchange =()=>{ if(running){ t0=performance.now(); } drawScene(); };

    window.addEventListener('DOMContentLoaded', async()=>{ await Achievements.syncUser('Jogador'); drawScene(); });
})();
