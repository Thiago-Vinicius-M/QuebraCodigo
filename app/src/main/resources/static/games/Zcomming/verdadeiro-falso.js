(function(){
    const modeSel = document.getElementById('vfMode');
    const qEl = document.getElementById('vfQ');
    const expEl = document.getElementById('vfExplain');
    const hitsEl = document.getElementById('vfHits');
    const timeEl = document.getElementById('vfTime');
    let timer=null, start=0, hits=0, current=null, mode='classico', competitive=false, remaining=60;

    const classic = [
        { q:'Se todos os mamíferos respiram e cães são mamíferos, então cães respiram.', a:true,  e:'Modus Ponens.' },
        { q:'Se chove então a rua molha. Não chove. Logo, a rua não molha.', a:false, e:'Negação do antecedente (falácia).' },
        { q:'(P ∧ Q) ⇒ P é sempre verdadeiro.', a:true, e:'Tautologia.' },
    ];
    const conectivos = [
        { q:'P ∨ ¬P é uma tautologia.', a:true, e:'Lei do terceiro excluído.'},
        { q:'Se P ⇒ Q e P é verdadeiro, então Q é verdadeiro.', a:true, e:'Modus Ponens.'},
        { q:'Se P ⇒ Q e Q é verdadeiro, então P é verdadeiro.', a:false, e:'Afirmação do consequente (falácia).'},
    ];
    const tabela = [
        { q:'(P ↔ Q) é verdadeira quando P e Q têm o mesmo valor.', a:true, e:'Definição da bicondicional.'},
        { q:'(P ⇒ Q) é falsa apenas quando P=V e Q=V.', a:false, e:'É falsa quando P=V e Q=F.'},
    ];

    const bankFor = () => mode==='classico'? classic : mode==='conectivos'? conectivos : tabela;
    const sample = arr => arr[Math.floor(Math.random()*arr.length)];
    const pad=n=>n<10?'0'+n:n;

    function next(){ expEl.textContent=''; current = sample(bankFor()); qEl.textContent = current.q; }
    function tick(){
        if(competitive){ remaining--; if(remaining<=0){ endCompetitive(); return; } timeEl.textContent=`00:${pad(remaining)}`; }
        else{ const s=Math.floor((Date.now()-start)/1000); timeEl.textContent=`${pad(Math.floor(s/60))}:${pad(s%60)}`; }
    }
    function answer(val){
        if(!current) return;
        const ok=(val===current.a);
        expEl.textContent = (ok?'✔ Correto! ':'✖ Ops... ')+current.e;
        if(ok){ hits++; hitsEl.textContent=hits; }
        next();
    }
    async function endCompetitive(){
        clearInterval(timer);
        const base = hits*10;
        await Achievements.award({ addPoints: base, addCoins: Math.floor(hits/5) });
        Achievements.toast(`Competitivo: +${base} pts`);
    }
    function reset(){
        clearInterval(timer); hits=0; hitsEl.textContent=0;
        start=Date.now(); competitive=(mode==='competitivo'); remaining=60;
        timer=setInterval(tick,1000); tick(); next();
    }

    document.getElementById('btnTrue').onclick = ()=>answer(true);
    document.getElementById('btnFalse').onclick = ()=>answer(false);
    document.getElementById('vfNew').onclick = reset;
    modeSel.onchange = ()=>{ mode=modeSel.value; reset(); };

    window.addEventListener('DOMContentLoaded', async ()=>{ await Achievements.syncUser('Jogador'); reset(); });
})();
