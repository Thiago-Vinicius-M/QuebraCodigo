/**
 * Ajusta a escala do conteúdo da home para caber na tela sem scroll,
 * mantendo a aparência original (proporções e tamanhos).
 */
(function () {
  var viewport = document.querySelector(".content-viewport");
  var scalable = document.querySelector(".content-scalable");
  if (!viewport || !scalable) return;

  function fit() {
    var content = scalable.querySelector(".content");
    if (!content) return;

    var vw = viewport.clientWidth;
    var vh = viewport.clientHeight;
    if (vw <= 0 || vh <= 0) return;

    /* Largura fixa = viewport para os cards de Jogos e Cursos irem até o fim da tela */
    scalable.style.width = vw + "px";
    scalable.style.height = "auto";
    var h = content.scrollHeight;
    if (h <= 0) return;

    var scale = Math.min(vh / h, 1);
    scalable.style.height = h + "px";
    scalable.style.transform = "scale(" + scale + ")";
  }

  fit();
  window.addEventListener("resize", fit);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fit);
  }
  setTimeout(fit, 100);
  setTimeout(fit, 400);
})();
