import { setUser, logout } from "./auth.js";

const form = document.getElementById("login-form");
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = e.target.elements["username"]?.value?.trim();
        if (!username) return;
        setUser(username);
        location.href = "games/sudoku.html?v=2025.11.06";
    });
}

const btnSair = document.getElementById("btn-sair");
if (btnSair) {
    btnSair.addEventListener("click", function (e) {
        e.preventDefault();
        void logout({ redirectTo: "login.html" });
    });
}

(function () {
    let isTransitioning = false;

    function shouldIgnoreClick(event, anchor) {
        return (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !anchor ||
            anchor.target === "_blank"
        );
    }

    function triggerHomeExit(href) {
        if (isTransitioning) return;
        isTransitioning = true;

        document.querySelectorAll("[data-exit]").forEach((elemento) => {
            const anim = elemento.dataset.exit;
            if (anim) elemento.classList.add(anim);
        });

        setTimeout(() => {
            window.location.href = href;
        }, 800);
    }

    document.querySelectorAll("a.card-button[href]").forEach((link) => {
        link.addEventListener("click", function (event) {
            if (shouldIgnoreClick(event, link)) return;
            event.preventDefault();
            triggerHomeExit(link.href);
        });
    });
})();

(function () {
    const el = document.getElementById("user-display");
    if (!el) return;
    fetch("auth/me", { credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : { username: null }))
        .then((data) => {
            el.textContent = data?.username || "Visitante";
        })
        .catch(() => {
            el.textContent = "Visitante";
        });
})();

(function () {
    const modal = document.getElementById("profile-modal");
    const profileBtn = document.querySelector(".profile-button");
    const closeBtn = document.getElementById("profile-modal-close");
    const cancelBtn = document.getElementById("profile-cancel");
    const backdrop = modal?.querySelector(".profile-modal-backdrop");
    const form = document.getElementById("profile-form");
    const msgEl = document.getElementById("profile-msg");
    const userDisplay = document.getElementById("user-display");
    function openModal() {
        if (!modal) return;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        msgEl.textContent = "";
        fetch("auth/me", { credentials: "same-origin" })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data) {
                    document.getElementById("profile-nome").value =
                        data.username || "";
                    document.getElementById("profile-email").value =
                        data.email || "";
                    document.getElementById("profile-nova-senha").value = "";
                }
            })
            .catch(() => {});
    }
    function closeModal() {
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
    }
    profileBtn?.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
    });
    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);
    form?.addEventListener("submit", async function (e) {
        e.preventDefault();
        msgEl.textContent = "";
        msgEl.classList.remove("error", "success");
        const nome = document.getElementById("profile-nome").value.trim();
        const email = document.getElementById("profile-email").value.trim();
        const novaSenha = document.getElementById("profile-nova-senha").value;
        if (nome.length < 2) {
            msgEl.textContent = "O nome deve ter pelo menos 2 caracteres.";
            msgEl.classList.add("error");
            return;
        }
        try {
            const body = { nome, email };
            if (novaSenha && novaSenha.length >= 4) body.novaSenha = novaSenha;
            const res = await fetch("auth/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                if (userDisplay) userDisplay.textContent = data.username || nome;
                msgEl.textContent = "Perfil atualizado!";
                msgEl.classList.add("success");
                setTimeout(closeModal, 800);
            } else {
                msgEl.textContent = data.error || "Erro ao atualizar.";
                msgEl.classList.add("error");
            }
        } catch (_) {
            msgEl.textContent = "Erro de conexão. Tente novamente.";
            msgEl.classList.add("error");
        }
    });
})();

(function () {
    const SETTINGS_KEY = "qc:settings:v1";
    const defaults = {
        theme: "default",
        zoom: 100,
        glass: true,
        compact: false,
        animations: true,
        sound: false,
        showLesson: true,
        language: "pt-BR",
    };
    const modal = document.getElementById("settings-modal");
    const openBtn = document.getElementById("settings-button");
    const closeBtn = document.getElementById("settings-modal-close");
    const cancelBtn = document.getElementById("settings-cancel");
    const resetBtn = document.getElementById("settings-reset");
    const backdrop = modal?.querySelector(".settings-modal-backdrop");
    const form = document.getElementById("settings-form");
    const msg = document.getElementById("settings-msg");
    const zoomInput = document.getElementById("cfg-zoom");
    const zoomValue = document.getElementById("cfg-zoom-value");
    const quickThemeBtn = document.getElementById("btn-theme-toggle");
    const quickThemeLabel = document.getElementById("theme-toggle-label");
    const quickThemeSvg = quickThemeBtn?.querySelector("svg.home-lucide-icon");
    function getThemeToggleSvgInner(isDark) {
        const sun =
            '<circle cx="12" cy="12" r="4"/>' +
            '<path d="M12 2v2"/>' +
            '<path d="M12 20v2"/>' +
            '<path d="m4.93 4.93 1.41 1.41"/>' +
            '<path d="m17.66 17.66 1.41 1.41"/>' +
            '<path d="M2 12h2"/>' +
            '<path d="M20 12h2"/>' +
            '<path d="m6.34 17.66-1.41 1.41"/>' +
            '<path d="m19.07 4.93-1.41 1.41"/>';
        const moon = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
        return isDark ? moon : sun;
    }
    function updateThemeToggleUi(isDark) {
        if (quickThemeSvg) {
            quickThemeSvg.innerHTML = getThemeToggleSvgInner(isDark);
            quickThemeSvg.setAttribute(
                "aria-label",
                isDark ? "Alternar para tema claro" : "Alternar para tema escuro",
            );
        }
        if (quickThemeLabel) {
            quickThemeLabel.textContent = isDark
                ? "Tema: Escuro"
                : "Tema: Claro";
        }
    }
    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
        } catch (_) {
            return { ...defaults };
        }
    }
    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    function setFormValues(settings) {
        document.getElementById("cfg-theme").value = settings.theme;
        document.getElementById("cfg-zoom").value = settings.zoom;
        document.getElementById("cfg-glass").checked = settings.glass;
        document.getElementById("cfg-compact").checked = settings.compact;
        document.getElementById("cfg-animations").checked =
            settings.animations;
        document.getElementById("cfg-sound").checked = settings.sound;
        document.getElementById("cfg-show-lesson").checked =
            settings.showLesson;
        document.getElementById("cfg-language").value = settings.language;
        zoomValue.textContent = settings.zoom + "%";
    }
    function readFormValues() {
        return {
            theme: document.getElementById("cfg-theme").value,
            zoom: Number(document.getElementById("cfg-zoom").value),
            glass: document.getElementById("cfg-glass").checked,
            compact: document.getElementById("cfg-compact").checked,
            animations: document.getElementById("cfg-animations").checked,
            sound: document.getElementById("cfg-sound").checked,
            showLesson: document.getElementById("cfg-show-lesson").checked,
            language: document.getElementById("cfg-language").value,
        };
    }
    function applySettings(settings) {
        document.body.style.zoom = (settings.zoom / 100).toString();
        document.body.classList.toggle(
            "theme-contrast",
            settings.theme === "contrast",
        );
        document.body.classList.toggle("glass-off", !settings.glass);
        document.body.classList.toggle("compact-cards", settings.compact);
        document.body.classList.toggle(
            "animations-off",
            !settings.animations,
        );
        document.body.classList.toggle("hide-lesson", !settings.showLesson);
        document.documentElement.lang = settings.language;
        document.documentElement.classList.toggle(
            "dark",
            settings.theme === "contrast",
        );
        updateThemeToggleUi(settings.theme === "contrast");
    }
    function openModal() {
        if (!modal) return;
        const current = loadSettings();
        setFormValues(current);
        msg.textContent = "";
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
    }
    function closeModal() {
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
    }
    zoomInput?.addEventListener("input", function () {
        zoomValue.textContent = this.value + "%";
    });
    openBtn?.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
    });
    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);
    resetBtn?.addEventListener("click", function () {
        setFormValues(defaults);
        applySettings(defaults);
        saveSettings(defaults);
        msg.textContent = "Configurações restauradas.";
        msg.classList.remove("error");
        msg.classList.add("success");
    });
    form?.addEventListener("submit", function (e) {
        e.preventDefault();
        const values = readFormValues();
        applySettings(values);
        saveSettings(values);
        msg.textContent = "Configurações salvas com sucesso.";
        msg.classList.remove("error");
        msg.classList.add("success");
        setTimeout(closeModal, 700);
    });
    quickThemeBtn?.addEventListener("click", function () {
        document.documentElement.classList.toggle("dark");
        const isDark =
            document.documentElement.classList.contains("dark");
        const current = loadSettings();
        const next = {
            ...current,
            theme: isDark ? "contrast" : "default",
        };
        saveSettings(next);
        applySettings(next);
    });
    applySettings(loadSettings());
})();
