package br.com.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class UsernameFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PATHS = new HashSet<>(List.of(
            "/",              // login controller
            "/login",
            "/login.html",
            "/cadastro.html",
            "/forgot-password.html",
            "/reset-password.html",
            "/favicon.ico",
            "/error",
            "/auth/username", // api antiga
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password"
    ));

    private boolean isPublic(String uri) {
        if (uri == null) return true;
        if (PUBLIC_PATHS.contains(uri)) return true;
        if (uri.startsWith("/auth/")) return true;

        if (uri.startsWith("/css")) return true;
        if (uri.startsWith("/js")) return true;
        if (uri.startsWith("/img")) return true;
        if (uri.startsWith("/webjars")) return true;

        // Assets do build React (html, js, css, ícones)
        if (uri.startsWith("/react/assets/")) return true;
        if (uri.equals("/react/index.html")) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String uri = req.getRequestURI();

        // se rota é permitida, passa direto
        if (isPublic(uri)) {
            chain.doFilter(req, res);
            return;
        }

        Object sessionUser = req.getSession().getAttribute("userId");

        // se não existe sessão e nem cookie válido → NÃO deixa passar
        if (sessionUser == null) {

            // REMOVE o cookie automaticamente
            Cookie remove = new Cookie("username", "");
            remove.setPath("/");
            remove.setMaxAge(0); // apaga imediatamente
            res.addCookie(remove);

            // APIs protegidas recebem 401; páginas redirecionam para login
            if (uri.startsWith("/api/")) {
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            res.sendRedirect("/login.html");
            return;
        }

        // caso normal: continua o fluxo
        chain.doFilter(req, res);
    }
}