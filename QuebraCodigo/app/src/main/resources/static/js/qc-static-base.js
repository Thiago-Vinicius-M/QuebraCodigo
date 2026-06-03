/**
 * Live Server / Vite: HTML na porta X; API no Spring (8150).
 * Usa o mesmo hostname da página (localhost ou 127.0.0.1) para evitar falhas de CORS/cookie.
 * Nome do arquivo sem "api" para reduzir bloqueio por extensões.
 */
(function () {
    var p = window.location.port;
    var host = window.location.hostname;
    var base = "";
    if (p && p !== "8150") {
        if (p === "5500" || p === "5501" || p === "5173" || p === "3000") {
            if (host === "localhost" || host === "127.0.0.1") {
                base = window.location.protocol + "//" + host + ":8150";
            }
        }
    }
    window.QC_API_BASE = base;
    window.qcAuthUrl = function (path) {
        return base + path;
    };
    window.qcAuthFetchInit = function (init) {
        init = init || {};
        if (base) {
            init.credentials = "include";
        } else if (init.credentials === undefined) {
            init.credentials = "same-origin";
        }
        return init;
    };
})();
