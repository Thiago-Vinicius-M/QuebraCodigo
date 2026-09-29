export default function Sidebar({
  exiting,
  onProfileClick,
  onSettingsClick,
  onSair,
  onThemeToggle,
  themeLabel,
  themeIconSrc,
}) {
  return (
    <aside className={`sidebar slide-left${exiting ? " slide-right-out" : ""}`}>
      <button type="button" className="profile-button" onClick={onProfileClick}>
        <div className="icon-wrapper">
          <div className="nav-bg-editarPerfil"></div>
          <img src="/img/home/editarPerfilLogo.svg" alt="Editar Perfil" />
        </div>
        <span className="neon-text-light">
          Editar
          <br />
          Perfil
        </span>
      </button>

      <button type="button" className="nav-button">
        <div className="icon-wrapper">
          <div className="nav-bg"></div>
          <img src="/img/home/homeLogo.svg" alt="HomeLogo" />
        </div>
        <span className="neon-text-light">Home</span>
      </button>

      <button type="button" className="nav-button-settings" onClick={onSettingsClick}>
        <div className="icon-wrapper">
          <div className="nav-bg"></div>
          <img src="/img/home/settingsLogo.svg" alt="Configuração" />
        </div>
        <span className="neon-text-light">Configuração</span>
      </button>

      <a href="/games/ia.html" className="nav-link" target="_blank" rel="noopener noreferrer">
        <button type="button" className="nav-button-ia">
          <div className="icon-wrapper">
            <div className="nav-bg"></div>
            <img src="/img/home/logoIA.svg" alt="IA" />
          </div>
          <span className="neon-text-light">Assistente interativo</span>
        </button>
      </a>

      <a href="/login.html" className="nav-button" onClick={onSair}>
        <div className="icon-wrapper">
          <div className="nav-bg"></div>
          <img src="/img/home/sairLogo.svg" alt="Sair" />
        </div>
        <span className="neon-text-light">Sair</span>
      </a>

      <button type="button" className="nav-button" onClick={onThemeToggle}>
        <div className="icon-wrapper">
          <div className="nav-bg"></div>
          <img src={themeIconSrc} alt="Alternar tema" />
        </div>
        <span className="neon-text-light">{themeLabel}</span>
      </button>
    </aside>
  );
}
