import { useCallback, useEffect, useState } from "react";

// Duração padrão de ".page-out" em css/animate.css — espera a animação de
// saída terminar antes de navegar, igual ao comportamento original
// (animateAndGo nas páginas de auth).
const DEFAULT_DELAY_MS = 600;

export function useExitNavigation(delayMs = DEFAULT_DELAY_MS) {
  const [exiting, setExiting] = useState(false);

  const goTo = useCallback(
    (url) => {
      setExiting(true);
      window.setTimeout(() => {
        window.location.href = url;
      }, delayMs);
    },
    [delayMs]
  );

  // Corrige tela em branco ao voltar: se o navegador restaura a página do
  // bfcache no meio de uma animação de saída, o estado "exiting" ainda
  // estaria ativo (React preserva o estado no bfcache). Resetamos ao mostrar
  // a página de novo, igual ao listener "pageshow" original.
  useEffect(() => {
    function handlePageShow() {
      setExiting(false);
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return { exiting, goTo };
}
