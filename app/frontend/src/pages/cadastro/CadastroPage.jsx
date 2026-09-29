import { useState } from "react";
import { register } from "../../lib/api.js";
import { useExitNavigation } from "../../lib/useExitNavigation.js";
import { formatBRDateDigits, isValidBirthDateStr, sanitizeBirthDigits } from "../../lib/birthDate.js";

function handleBirthDateChange(e, setDataNascimento) {
  const input = e.target;
  const start = input.selectionStart;
  const before = input.value;
  const countDigitsLeftOfCursor = before.slice(0, start).replace(/\D/g, "").length;
  const digits = sanitizeBirthDigits(before);
  const formatted = formatBRDateDigits(digits);

  setDataNascimento(formatted);

  requestAnimationFrame(() => {
    let pos = formatted.length;
    if (countDigitsLeftOfCursor > 0) {
      let seen = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          seen++;
          if (seen === countDigitsLeftOfCursor) {
            pos = i + 1;
            break;
          }
        }
      }
    }
    input.setSelectionRange(pos, pos);
  });
}

function handleBirthDateBlur(e, setDataNascimento) {
  const d = e.target.value.replace(/\D/g, "");
  if (d.length === 8) {
    setDataNascimento(formatBRDateDigits(sanitizeBirthDigits(d)));
  } else if (d.length > 0 && d.length < 8) {
    setDataNascimento(formatBRDateDigits(d));
  }
}

export default function CadastroPage() {
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [ultimoNome, setUltimoNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { exiting, goTo } = useExitNavigation();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!primeiroNome.trim() || !ultimoNome.trim()) {
      alert("Preencha nome e sobrenome.");
      return;
    }
    if (!email.trim()) {
      alert("Preencha o e-mail.");
      return;
    }
    if (!dataNascimento.trim()) {
      alert("Preencha a data de nascimento (dd/mm/aaaa).");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimento.trim())) {
      alert("Use a data completa no formato dd/mm/aaaa (ex.: 17/09/1999).");
      return;
    }
    if (!isValidBirthDateStr(dataNascimento)) {
      alert("Data de nascimento inválida. Confira dia, mês e ano (idade máxima 120 anos).");
      return;
    }
    if (usuario.length < 2) {
      alert("O usuário deve ter pelo menos 2 caracteres.");
      return;
    }
    if (senha.length < 4) {
      alert("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await register({
        primeiroNome: primeiroNome.trim(),
        ultimoNome: ultimoNome.trim(),
        email: email.trim(),
        dataNascimento: dataNascimento.trim(),
        usuario: usuario.trim(),
        senha,
      });
      goTo("/index.html");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className={`page-container ${exiting ? "page-out" : "page-in"}`}>
      <header className="form-header">
        <a
          href="/login.html"
          className="go-back slide-left delay-2"
          aria-label="Voltar"
          onClick={(e) => {
            e.preventDefault();
            goTo("/login.html");
          }}
        >
          <img src="/img/games/sidebar-topbar/setaVoltar.png" alt="Botão retornar para a Home" />
        </a>
        <h1 className="form-title zoom-blur delay-2">Faça seu cadastro</h1>
      </header>

      <form className="register-form glass-rise delay-3" onSubmit={handleSubmit}>
        <div className="name-group">
          <div className="input-wrapper slide-left delay-3">
            <input
              type="text"
              placeholder="Primeiro nome"
              value={primeiroNome}
              onChange={(e) => setPrimeiroNome(e.target.value)}
            />
          </div>

          <div className="input-wrapper slide-left delay-3">
            <input
              type="text"
              placeholder="Último nome"
              value={ultimoNome}
              onChange={(e) => setUltimoNome(e.target.value)}
            />
          </div>
        </div>

        <div className="input-wrapper icon-left slide-left delay-3">
          <span className="icon">📅</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            placeholder="dd/mm/aaaa"
            spellCheck="false"
            data-lpignore="true"
            value={dataNascimento}
            onChange={(e) => handleBirthDateChange(e, setDataNascimento)}
            onBlur={(e) => handleBirthDateBlur(e, setDataNascimento)}
          />
        </div>

        <div className="input-wrapper icon-left slide-left delay-3">
          <span className="icon">✉️</span>
          <input
            type="email"
            placeholder="Email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-wrapper icon-left slide-left delay-3">
          <span className="icon">👤</span>
          <input
            type="text"
            placeholder="Usuário"
            required
            minLength={2}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>

        <div className="input-wrapper icon-left slide-left delay-3">
          <span className="icon">🔒</span>
          <input
            type="password"
            placeholder="Senha"
            required
            minLength={4}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <div className="social-section fade-in delay-7">
          <p>Continuar com</p>

          <div className="social-icons zoom-blur delay-8">
            <img src="/img/login/Google Logo 1.png" alt="Google" />
          </div>

          {error && (
            <p id="cadastro-msg" style={{ color: "#e74c3c", marginTop: "0.5rem" }} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="submit-button zoom-blur delay-9" disabled={submitting}>
            {submitting ? "Criando..." : "Criar conta"}
          </button>
        </div>
      </form>
    </main>
  );
}
