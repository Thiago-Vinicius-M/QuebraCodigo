// achievements.js — sincroniza usuário e envia pontuação.
// Tem fallback silencioso se a API não estiver disponível (funciona offline).
window.Achievements = (function(){
    let currentUser = 'Jogador';

    async function post(url, data){
        try{
            const r = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data || {})
            });
            if(!r.ok) throw new Error('HTTP '+r.status);
            return await r.json().catch(()=> ({}));
        }catch(e){
            // fallback silencioso
            console.debug('[Achievements] offline/fallback:', e.message);
            return {};
        }
    }

    async function syncUser(nome){
        currentUser = (nome || 'Jogador');
        return post('/api/usuarios/sync', { nome: currentUser });
    }

    async function award({ addPoints=0, addCoins=0, badges={} }){
        return post('/api/gamification/award', {
            nome: currentUser,
            addPontos: addPoints,
            addMoedas: addCoins,
            badges
        });
    }

    function toast(text){
        const t=document.createElement('div');
        t.textContent=text;
        t.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#0b1220;color:#e6eef8;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 24px rgba(0,0,0,.35);z-index:9999';
        document.body.appendChild(t);
        setTimeout(()=>t.remove(), 2200);
    }

    return { syncUser, award, toast };
})();
