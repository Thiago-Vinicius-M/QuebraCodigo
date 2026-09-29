import { useEffect, useState } from "react";
import { SETTINGS_DEFAULTS } from "../../lib/settings.js";

export default function SettingsModal({ open, settings, onClose, onSave, onReset }) {
  const [draft, setDraft] = useState(settings);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setMsg("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function update(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(draft);
    setMsg("Configurações salvas com sucesso.");
    window.setTimeout(onClose, 700);
  }

  function handleReset() {
    setDraft(SETTINGS_DEFAULTS);
    onReset();
    setMsg("Configurações restauradas.");
  }

  return (
    <div className={`settings-modal${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="settings-modal-backdrop" onClick={onClose}></div>
      <div className="settings-modal-panel glass-rise">
        <div className="settings-modal-header">
          <h2>Configurações</h2>
          <button type="button" className="settings-modal-close" aria-label="Fechar" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>Aparência</h3>
            <label className="settings-field">
              <span>Tema visual</span>
              <select value={draft.theme} onChange={(e) => update({ theme: e.target.value })}>
                <option value="default">Padrão</option>
                <option value="contrast">Alto contraste</option>
              </select>
            </label>
            <label className="settings-field">
              <span>Tamanho da interface</span>
              <input
                type="range"
                min={90}
                max={115}
                step={5}
                value={draft.zoom}
                onChange={(e) => update({ zoom: Number(e.target.value) })}
              />
              <small>{draft.zoom}%</small>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={draft.glass}
                onChange={(e) => update({ glass: e.target.checked })}
              />
              <span>Efeito vidro nos cards</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={draft.compact}
                onChange={(e) => update({ compact: e.target.checked })}
              />
              <span>Modo compacto de cards</span>
            </label>
          </div>

          <div className="settings-section">
            <h3>Experiência</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={draft.animations}
                onChange={(e) => update({ animations: e.target.checked })}
              />
              <span>Animações da interface</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={draft.sound}
                onChange={(e) => update({ sound: e.target.checked })}
              />
              <span>Efeitos sonoros (salvo para futuras telas)</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={draft.showLesson}
                onChange={(e) => update({ showLesson: e.target.checked })}
              />
              <span>Mostrar card de lição principal</span>
            </label>
          </div>

          <div className="settings-section">
            <h3>Sistema</h3>
            <label className="settings-field">
              <span>Idioma</span>
              <select value={draft.language} onChange={(e) => update({ language: e.target.value })}>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English</option>
                <option value="es-ES">Español</option>
              </select>
            </label>
          </div>

          <p className="settings-msg">{msg}</p>
          <div className="settings-actions">
            <button type="button" className="settings-btn-secondary" onClick={handleReset}>
              Restaurar padrão
            </button>
            <button type="button" className="settings-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="settings-btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
