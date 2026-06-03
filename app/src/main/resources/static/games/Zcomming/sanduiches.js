// Máquina de Sanduíches — com stub de Achievements para evitar erros
(function(){
    const Achievements=(window.Achievements)||{syncUser:async()=>{},award:async()=>{},toast:()=>{}};

    const progEl=document.getElementById('sProg');
    const viewEl=document.getElementById('sView');
    const msgEl=document.getElementById('sMsg');
    const scoreEl=document.getElementById('sScore');
    const recipeSel=document.getElementById('sRecipe');

    const RECIPES = {
        xb: ['PAO','QUEIJO','PRESUNTO','PAO'],
        xsalada: ['PAO','ALFACE','TOMATE','QUEIJO','PAO']
    };

    function render(stack){
        viewEl.innerHTML='';
        stack.forEach(x=>{
            const d=document.createElement('div');
            d.style.cssText='padding:6px 10px;border-radius:8px;background:#101826;min-width:160px;text-align:center';
            d.textContent=x; viewEl.appendChild(d);
        });
    }

    function parseAndRun(text){
        msgEl.textContent='';
        const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
        let pc=0; const stack=[]; const ops=[];
        while(pc<lines.length){
            const ln=lines[pc];
            const m = ln.match(/^LOOP\s+(\d+)\s*\{\s*$/i);
            if(m){
                const n=parseInt(m[1]); let body=[]; pc++;
                while(pc<lines.length && lines[pc]!=='}'){ body.push(lines[pc]); pc++; }
                if(lines[pc]!=='}'){ throw new Error('Bloco LOOP sem fechamento }'); }
                for(let i=0;i<n;i++) body.forEach(x=>ops.push(x));
            } else {
                ops.push(ln);
            }
            pc++;
        }

        for(const op of ops){
            if(/^RESET$/i.test(op)){ stack.length=0; }
            else if(/^ADD\s+(PAO|QUEIJO|PRESUNTO|ALFACE|TOMATE)$/i.test(op)){
                stack.push(op.split(/\s+/)[1].toUpperCase());
            } else {
                throw new Error('Comando inválido: '+op);
            }
        }
        return stack;
    }

    async function run(){
        let stack=[];
        try{
            stack = parseAndRun(progEl.value);
            render(stack);
            const target = RECIPES[recipeSel.value];
            const ok = JSON.stringify(stack)===JSON.stringify(target);
            if(ok){
                msgEl.textContent='Correto! Receita montada.';
                const base = 90; const eff = Math.max(0, 40 - progEl.value.split('\n').filter(Boolean).length);
                await Achievements.award({ addPoints: base+eff, addCoins: 5 });
                scoreEl.textContent = (parseInt(scoreEl.textContent,10)+base+eff);
                Achievements.toast(`Sanduíche perfeito! +${base+eff} pts`);
            }else{
                msgEl.textContent='Ainda não bate com a receita.';
            }
        }catch(e){ msgEl.textContent='Erro: '+e.message; }
    }

    document.getElementById('sRun').onclick=run;
    document.getElementById('sClear').onclick=()=>{ progEl.value=''; viewEl.innerHTML=''; msgEl.textContent=''; };

    window.addEventListener('DOMContentLoaded', async ()=>{ await Achievements.syncUser('Jogador'); });
})();
