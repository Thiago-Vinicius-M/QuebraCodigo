import { useState } from "react";
import { login } from "../../lib/api.js";
import { useExitNavigation } from "../../lib/useExitNavigation.js";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { exiting, goTo } = useExitNavigation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const usuarioTrim = usuario.trim();
    if (!usuarioTrim || !senha) {
      setError("Preencha usuário e senha.");
      return;
    }

    setSubmitting(true);
    try {
      await login(usuarioTrim, senha);
      goTo("/index.html");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className={`container ${exiting ? "page-out" : "page-in"}`}>
      <header>
        <img className="logo" src="/img/login/LogoQuebraCodigo.png" alt="Logo do sistema" />
      </header>

      <section className="welcome-area">
        <h1 className="welcome-title fade-in">Bem vindo!</h1>

        <blockquote className="welcome-quote fade-in delay-1">
          “A <a>mente</a> que se abre a uma nova <span>ideia</span> jamais voltará ao seu
          tamanho original.” <br />– Albert Einstein
        </blockquote>
      </section>

      <section className="form-area glass-rise" aria-labelledby="login-title">
        <h2 id="login-title" className="visually-hidden">Área de Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="input-box stagger delay-1">
            <img className="input-icon" src="/img/login/user.png" alt="" />
            <input
              type="text"
              name="usuario"
              placeholder="Usuário"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </label>

          <label className="input-box stagger delay-2">
            <img className="input-icon" src="/img/login/padlock.png" alt="" />
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          <div className="actions-row fade-in delay-2">
            <nav className="action-list" aria-label="Ações rápidas">
              <img src="/img/login/Google Logo 1.png" alt="Ação 1" />
            </nav>
            <a href="/forgot-password.html" className="forgot-btn slide-left">
              Esqueci minha senha
            </a>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <div className="login-actions fade-in delay-3">
            <button type="button" className="create-btn" onClick={() => goTo("/cadastro.html")}>
              Criar conta
            </button>
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
