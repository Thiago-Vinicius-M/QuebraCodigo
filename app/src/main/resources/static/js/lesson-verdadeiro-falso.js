/**
 * Flip do card da Lição → ícone do Verdadeiro/Falso → página HTML.
 */
(function () {
    const panel = document.getElementById("lesson-panel");
    const startBtn = document.getElementById("btn-start-lesson");
    const backBtn = document.getElementById("btn-back-lesson");
    const backFace = document.getElementById("lesson-back");
    if (!panel || !startBtn) return;

    function flip(toBack) {
        panel.classList.toggle("is-flipped", toBack);
        if (backFace) backFace.setAttribute("aria-hidden", toBack ? "false" : "true");
    }

    startBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        flip(true);
    });

    backBtn?.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        flip(false);
    });
})();
