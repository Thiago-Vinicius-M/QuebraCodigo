import { useCallback, useEffect, useState } from "react";
import { me } from "../../lib/api.js";
import { useExitNavigation } from "../../lib/useExitNavigation.js";
import { loadSettings, saveSettings, SETTINGS_DEFAULTS } from "../../lib/settings.js";
import Sidebar from "./Sidebar.jsx";
import ProfileModal from "./ProfileModal.jsx";
import SettingsModal from "./SettingsModal.jsx";

// Duração de ".fade-out"/".zoom-out"/".slide-right-out" em css/animate.css —
// mesmo delay usado no listener global de saída da index.html original.
const EXIT_DELAY_MS = 800;

const GAMES = [
  { href: "/games/memory/memory.html", img: "/img/home/jogos/memory.png", label: "Jogo da memória" },
  { href: "/games/connect4/connect4.html", img: "/img/home/jogos/connect4.png", label: "Connect 4" },
  { href: "/games/sudoku/sudoku.html", img: "/img/home/jogos/sudoku.png", label: "Sudoku" },
  { href: "/games/minesweeper/minesweeper.html", img: "/img/home/jogos/MINESWEEPER.png", label: "Minesweeper" },
  {
    href: "/games/2048/2048.html",
    img: "/img/home/jogos/2048.png",
    label: "2048",
    imgStyle: { transform: "scale(1.4)" },
  },
  { href: "/games/flow-free/flow-free.html", img: "/img/home/jogos/FLOW FREE.png", label: "Flow Free" },
];

const COURSES = [
  { href: "/courses/course.html?curso=python", img: "/img/home/cursos/PYTHON.png", label: "Python" },
  { href: "/courses/course.html?curso=cpp", img: "/img/home/cursos/C++.png", label: "C++" },
  { href: "/courses/course.html?curso=html", img: "/img/home/cursos/HTML.png", label: "HTML" },
  {
    href: "/courses/course.html?curso=java",
    img: "/img/home/cursos/JAVA.png",
    label: "Java",
    imgStyle: { transform: "scale(1.4)" },
  },
  { href: "/courses/course.html?curso=javascript", img: "/img/home/cursos/JAVASCRIPT.png", label: "JavaScript" },
  { href: "/courses/course.html?curso=typescript", img: "/img/home/cursos/TYPESCRIPT.png", label: "TypeScript" },
];

export default function HomePage() {
  const { exiting, goTo } = useExitNavigation(EXIT_DELAY_MS);
  const [username, setUsername] = useState("Carregando...");
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    me().then((data) => setUsername(data?.username || "Visitante"));
  }, []);

  useEffect(() => {
    document.body.style.zoom = (settings.zoom / 100).toString();
    document.body.classList.toggle("theme-contrast", settings.theme === "contrast");
    document.body.classList.toggle("glass-off", !settings.glass);
    document.body.classList.toggle("compact-cards", settings.compact);
    document.body.classList.toggle("animations-off", !settings.animations);
    document.body.classList.toggle("hide-lesson", !settings.showLesson);
    document.documentElement.lang = settings.language;
  }, [settings]);

  const applyAndSaveSettings = useCallback((next) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  function handleThemeQuickToggle() {
    applyAndSaveSettings({
      ...settings,
      theme: settings.theme === "contrast" ? "default" : "contrast",
    });
  }

  function handleSair(e) {
    e.preventDefault();
    goTo("/login.html");
  }

  function handleCardClick(e, href) {
    e.preventDefault();
    goTo(href);
  }

  const themeLabel = settings.theme === "contrast" ? "Tema: Escuro" : "Tema: Claro";
  const themeIconSrc =
    settings.theme === "contrast" ? "/img/home/temaEscuroLogo.svg" : "/img/home/temaClaroLogo.svg";

  return (
    <div className="container">
      <Sidebar
        exiting={exiting}
        onProfileClick={() => setProfileOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onSair={handleSair}
        onThemeToggle={handleThemeQuickToggle}
        themeLabel={themeLabel}
        themeIconSrc={themeIconSrc}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} onUsernameChange={setUsername} />
      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={applyAndSaveSettings}
        onReset={() => applyAndSaveSettings(SETTINGS_DEFAULTS)}
      />

      <div className="content-viewport">
        <div className="content-scalable">
          <main className={`content fade-in${exiting ? " fade-out" : ""}`}>
            <span className="slide-left delay-2">
              Bem vindo, <t>{username}</t>
            </span>

            <section className={`welcome-section fade-in${exiting ? " fade-out" : ""}`}>
              <img src="/img/home/iconeLicao.png" alt="Lição" className="zoom-blur delay-1" />
              <div className="lesson-info">
                <h2 className="zoom-blur delay-1">
                  <span>Lição 2</span> - Lógica
                </h2>
                <p className="zoom-blur delay-2">Verdadeiro ou falso?</p>

                <a1 className="zoom-blur delay-2">
                  Dê um superpoder para o seu cérebro! Nossa academia de lógica é o lugar para treinar a
                  sua mente de um jeito muito legal. <br />
                  Falso ou Verdadeiro? <br />
                  Pense rápido e responda para passar de fase. Quanto mais você joga, mais rápido você
                  aprende a desvendar todos os segredos da lógica.
                  <br /> Vamos lá, o seu QI vai agradecer!
                </a1>

                <footer>
                  <div className="progress-container zoom-blur delay-3">
                    <div className="progress-bar" style={{ width: "60%" }}></div>
                  </div>
                  <button type="button" className={`continue-button zoom-blur delay-3${exiting ? " zoom-out" : ""}`}>
                    Continuar
                  </button>
                </footer>
              </div>
            </section>

            <section className={`cards-section fade-in${exiting ? " fade-out" : ""}`}>
              <h2 className="zoom-blur delay-1">Jogos</h2>

              <div className="cards-grid">
                {GAMES.map((game, i) => (
                  <a
                    key={game.href}
                    className={`card-button glass-rise stagger${exiting ? " zoom-out" : ""}`}
                    style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                    href={game.href}
                    onClick={(e) => handleCardClick(e, game.href)}
                  >
                    <img src={game.img} alt={game.label} style={game.imgStyle} />
                    <p>{game.label}</p>
                  </a>
                ))}
              </div>
            </section>

            <h2 className="zoom-blur delay-2">Cursos</h2>

            <div className="cards-grid">
              {COURSES.map((course, i) => (
                <a
                  key={course.href}
                  className={`card-button course-zoom${exiting ? " fade-out" : ""}`}
                  style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                  href={course.href}
                  onClick={(e) => handleCardClick(e, course.href)}
                >
                  <img src={course.img} alt={course.label} style={course.imgStyle} />
                  <p>{course.label}</p>
                </a>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
