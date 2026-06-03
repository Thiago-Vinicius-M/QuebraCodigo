import { getUser } from "./auth";

const user = getUser();
if (!user) {
    // sem sessão = retorna pro login
    location.replace("/index.html?v=2025.11.06");
} else {
    // opcional: mostra nome em qualquer elemento com data-username
    document.querySelectorAll("[data-username]").forEach(el => el.textContent = user);
}