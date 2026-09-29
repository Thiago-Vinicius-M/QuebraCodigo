import { useMemo, useState } from "react";
import { resetPassword } from "../../lib/api.js";

const REDIRECT_DELAY_MS = 1800;

export default function ResetPasswordPage() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token"), []);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [message, setMessage] = useState(
    token ? "" : "Link inválido. Solicite uma nova recuperação de senha."
  );
  const [isError, setIsError] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsError(true);

    if (novaSenha.length < 4) {
      setMessage("A senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setMessage("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, novaSenha);
      setIsError(false);
      setDone(true);
      setMessage("Senha atualizada com sucesso. Redirecionando para o login...");
      window.setTimeout(() => {
        window.location.href = "/login.html";
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      setMessage(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="container page-in" style={{ maxWidth: "520px" }}>
      <section className="form-area glass-rise">
        <h1 style={{ marginBottom: "1rem" }}>Criar nova senha</h1>
        <form onSubmit={handleSubmit}>
          <label className="input-box">
            <img className="input-icon" src="/img/login/padlock.png" alt="" />
            <input
              type="password"
              placeholder="Nova senha"
              minLength={4}
              required
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </label>
          <label className="input-box" style={{ marginTop: ".7rem" }}>
            <img className="input-icon" src="/img/login/padlock.png" alt="" />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              minLength={4}
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </label>
          <div className="login-actions" style={{ marginTop: "1rem" }}>
            <button type="submit" className="login-btn" disabled={!token || submitting || done}>
              {submitting ? "Salvando..." : "Salvar nova senha"}
            </button>
          </div>
          <p style={{ marginTop: ".7rem", color: isError ? "#e74c3c" : "#2ecc71" }}>{message}</p>
        </form>
      </section>
    </main>
  );
}
