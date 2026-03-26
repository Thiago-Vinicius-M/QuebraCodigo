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

    private static final Set<String> EXCLUDED = new HashSet<>(List.of(
            "/",              // login controller
            "/login",
            "/login.html",
            "/cadastro.html",
            "/home",          // rota home → index.html
            "/index.html",    // homepage
            "/favicon.ico",
            "/error",
            "/auth/username", // api antiga
            "/auth/login",
            "/auth/register"
    ));

    private boolean isExcluded(String uri) {

        if (uri == null) return true;

        if (EXCLUDED.contains(uri)) return true;

        if (uri.startsWith("/css")) return true;
        if (uri.startsWith("/js")) return true;
        if (uri.startsWith("/img")) return true;
        if (uri.startsWith("/games")) return true;
        if (uri.startsWith("/courses")) return true;

        if (uri.startsWith("/webjars")) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String uri = req.getRequestURI();

        // se rota é permitida, passa direto
        if (isExcluded(uri)) {
            chain.doFilter(req, res);
            return;
        }

        Object sessionUser = req.getSession().getAttribute("username");
        boolean hasCookie = false;
        Cookie[] cookies = req.getCookies();

        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("username".equals(c.getName()) &&
                        c.getValue() != null &&
                        !c.getValue().isBlank()) {
                    hasCookie = true;
                    break;
                }
            }
        }

        // se não existe sessão e nem cookie válido → NÃO deixa passar
        if (sessionUser == null && !hasCookie) {

            // REMOVE o cookie automaticamente
            Cookie remove = new Cookie("username", "");
            remove.setPath("/");
            remove.setMaxAge(0); // apaga imediatamente
            res.addCookie(remove);

            // redireciona pro login
            res.sendRedirect("/login.html");
            return;
        }

        // caso normal: continua o fluxo
        chain.doFilter(req, res);
    }
}