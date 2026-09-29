const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { ...JSON_HEADERS, ...(options.headers || {}) },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || "Erro de conexão. Tente novamente.";
    throw new Error(message);
  }

  return data;
}

export function login(usuario, senha) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ usuario, senha }),
  });
}

export function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, novaSenha) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, novaSenha }),
  });
}

// Não autenticado (ou back-end fora do ar) é um estado normal aqui
// (visitante), não um erro — por isso não usa o request() genérico, que
// lançaria em qualquer resposta !ok, e engole falha de rede também.
export async function me() {
  try {
    const res = await fetch("/auth/me", { credentials: "same-origin" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function updateProfile(payload) {
  return request("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
