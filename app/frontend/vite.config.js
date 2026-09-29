import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// "type": "module" no package.json faz este arquivo rodar em ESM puro,
// onde __dirname não existe nativamente — recriamos a partir de import.meta.url.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Back-end Spring Boot (mvn spring-boot:run) precisa estar rodando em paralelo
// durante "npm run dev" para servir a API, o CSS/imagens legados e as páginas
// que ainda não foram migradas.
const backendTarget = "http://localhost:8150";

export default defineConfig({
  plugins: [react()],

  build: {
    // Sobrescreve os .html correspondentes direto na pasta de recursos
    // estáticos do Spring Boot, sem apagar o restante (jogos, cursos, css, img).
    outDir: resolve(__dirname, "../src/main/resources/static"),
    emptyOutDir: false,
    // outDir É a pasta static/ original — sem isso, o Vite copia public/
    // (cópias só pra dev standalone) por cima dela a cada build, sobrescrevendo
    // arquivos legados que não fazem parte desta migração.
    copyPublicDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        cadastro: resolve(__dirname, "cadastro.html"),
        "forgot-password": resolve(__dirname, "forgot-password.html"),
        "reset-password": resolve(__dirname, "reset-password.html"),
      },
    },
  },

  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: !!process.env.PORT,
    proxy: {
      // API — sem o back-end rodando, chamadas de login/cadastro/etc falham
      // (erro de conexão tratado na tela), mas o resto da página funciona.
      "/auth": backendTarget,
      "/api": backendTarget,

      // Assets legados usados por páginas ainda não migradas, e fotos de
      // jogos/cursos (pesadas demais pra duplicar em public/, ficam só no
      // back-end mesmo). O restante que a home já usa (css/home.css,
      // ícones do sidebar, etc.) foi copiado para public/.
      "/js": backendTarget,
      "/games": backendTarget,
      "/courses": backendTarget,
      "/img/home/jogos": backendTarget,
      "/img/home/cursos": backendTarget,
    },
  },
});
