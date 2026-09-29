import { useState } from "react";
import { forgotPassword } from "../../lib/api.js";
import { useExitNavigation } from "../../lib/useExitNavigation.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { exiting, goTo } = useExitNavigation();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsError(true);
    setMessage("");

    const emailTrim = email.trim();
    if (!emailTrim) {
      setMessage("Informe o e-mail cadastrado.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await forgotPassword(emailTrim);
      setIsError(false);
      setMessage(data.message || "Se o e-mail estiver cadastrado, você receberá as instruções.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`container ${exiting ? "page-out" : "page-in"}`}>
      <header>
        <img className="logo" src="/img/login/LogoQuebraCodigo.png" alt="Logo do sistema" />
      </header>

      <section className="welcome-area">
        <h1 className="welcome-title fade-in">Recuperar acesso</h1>
        <p
          className="welcome-quote fade-in delay-1"
          style={{ fontStyle: "normal", maxWidth: "28rem" }}
        >
          Informe o <strong>e-mail cadastrado</strong> na sua conta. Enviaremos um link para você
          criar uma nova senha com segurança.
        </p>
      </section>

      <section className="form-area glass-rise" aria-labelledby="forgot-title">
        <h2 id="forgot-title" className="visually-hidden">Recuperação de senha</h2>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="input-box stagger delay-1">
            <img className="input-icon" src="/img/login/user.png" alt="" />
            <input
              type="email"
              autoComplete="email"
              placeholder="Seu e-mail cadastrado"
              required
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              minHeight: "1.25em",
              color: isError ? "#e74c3c" : "#2ecc71",
            }}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>

          <div className="login-actions fade-in delay-3">
            <button type="button" className="create-btn" onClick={() => goTo("/login.html")}>
              Voltar ao login
            </button>
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar link"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
