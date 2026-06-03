const KEY = "qc:session:user";
(() => {
    const legacy = localStorage.getItem(KEY);
    if (legacy && !sessionStorage.getItem(KEY)) {
        localStorage.removeItem(KEY);
    }
})();

export function setUser(username) {
    sessionStorage.setItem(KEY, JSON.stringify({ username, ts: Date.now() }));
}

export function getUser() {
    const raw = sessionStorage.getItem(KEY);
    try {
        return raw ? JSON.parse(raw).username : null;
    } catch {
        return null;
    }
}

export function clearUser() {
    sessionStorage.removeItem(KEY);
}