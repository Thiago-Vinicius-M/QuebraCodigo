import { useEffect, useState } from "react";
import { me, updateProfile } from "../../lib/api.js";

export default function ProfileModal({ open, onClose, onUsernameChange }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMsg("");
    setMsgType("");
    me().then((data) => {
      if (data) {
        setNome(data.username || "");
        setEmail(data.email || "");
        setNovaSenha("");
      }
    });
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setMsgType("");

    if (nome.trim().length < 2) {
      setMsg("O nome deve ter pelo menos 2 caracteres.");
      setMsgType("error");
      return;
    }

    setSubmitting(true);
    try {
      const body = { nome: nome.trim(), email: email.trim() };
      if (novaSenha && novaSenha.length >= 4) body.novaSenha = novaSenha;
      const data = await updateProfile(body);
      onUsernameChange(data.username || nome);
      setMsg("Perfil atualizado!");
      setMsgType("success");
      window.setTimeout(onClose, 800);
    } catch (err) {
      setMsg(err.message);
      setMsgType("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`profile-modal${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="profile-modal-backdrop" onClick={onClose}></div>
      <div className="profile-modal-panel glass-rise">
        <div className="profile-modal-header">
          <h2>Editar perfil</h2>
          <button type="button" className="profile-modal-close" aria-label="Fechar" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="profile-field">
            <span>Nome de usuário</span>
            <input
              type="text"
              required
              minLength={2}
              maxLength={64}
              placeholder="Seu usuário"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
          <label className="profile-field">
            <span>Email</span>
            <input
              type="email"
              maxLength={120}
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="profile-field">
            <span>Nova senha (opcional)</span>
            <input
              type="password"
              minLength={4}
              placeholder="Deixe em branco para não alterar"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </label>
          <p className={`profile-msg${msgType ? ` ${msgType}` : ""}`}>{msg}</p>
          <div className="profile-actions">
            <button type="button" className="profile-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="profile-btn-save" disabled={submitting}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
