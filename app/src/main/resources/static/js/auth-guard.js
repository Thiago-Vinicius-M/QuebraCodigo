import { checkAuth } from "./auth.js";

/**
 * Guard para páginas protegidas: mantém o body oculto até a sessão ser validada.
 * Deve ser usado em `<script type="module">` no `<head>` (com estilo `qc-auth-pending`).
 */
export async function runProtectedPageGuard(options = {}) {
    document.documentElement.classList.add("qc-auth-pending");
    const result = await checkAuth(options);
    if (result.authenticated) {
        document.documentElement.classList.remove("qc-auth-pending");
    }
    return result;
}
