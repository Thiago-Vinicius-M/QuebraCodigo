// header-fit.js — mantém o título dos jogos no centro e espreme as ações.
// O header é um grid [voltar | título | ações] (games/css/header.css). Quando
// as ações não cabem na coluna da direita, aplica .gh-fit-1 a -4 no
// .game-header, uma etapa por vez, até caber. No mobile (<=768px) não faz nada:
// lá o header já quebra em linhas.
(function () {
    const MAX_LEVEL = 4;
    const MOBILE = window.matchMedia('(max-width: 768px)');

    function actionsOf(header) {
        return header.querySelector(':scope > .controls, :scope > .game-actions, :scope > .c4-controls');
    }

    function fit(header) {
        for (let i = 1; i <= MAX_LEVEL; i++) header.classList.remove('gh-fit-' + i);
        const actions = actionsOf(header);
        if (!actions || MOBILE.matches) return;

        // não cabe = transborda na largura ou (já em 2 linhas) passa da altura do header
        const overflows = () =>
            actions.scrollWidth > actions.clientWidth + 1 ||
            actions.offsetHeight > header.clientHeight;

        for (let i = 1; i <= MAX_LEVEL; i++) {
            if (!overflows()) return;
            header.classList.add('gh-fit-' + i);
        }
    }

    let scheduled = false;
    function fitAll() {
        if (scheduled) return;
        scheduled = true;
        // microtask (e não requestAnimationFrame, que pausa em abas em segundo plano)
        queueMicrotask(() => {
            scheduled = false;
            document.querySelectorAll('.game-header').forEach(fit);
        });
    }

    // jogos em React montam o header depois; textos (tempo, vez, placar) mudam de largura
    function start() {
        new MutationObserver(fitAll).observe(document.body, { childList: true, subtree: true, characterData: true });
        window.addEventListener('resize', fitAll);
        if (document.fonts) document.fonts.ready.then(fitAll);
        fitAll();
    }

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
})();
