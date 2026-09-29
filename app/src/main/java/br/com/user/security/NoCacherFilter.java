package br.com.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(2) // deixe seu UsernameFilter com @Order(1) se precisar vir antes
public class NoCacherFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // só aplica em rotas dinâmicas. Ajuste conforme seu projeto.
        return !(path.startsWith("/api/")
                || path.startsWith("/app/")
                || "/".equals(path)
                || path.endsWith(".html"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse resp, FilterChain chain)
            throws ServletException, IOException {
        HttpServletResponseWrapper wrapper = new HttpServletResponseWrapper(resp) {
            private void noStore() {
                super.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                super.setHeader("Pragma", "no-cache");
                super.setDateHeader("Expires", 0);
            }

            @Override
            public void setHeader(String name, String value) {
                if ("Cache-Control".equalsIgnoreCase(name) || "Pragma".equalsIgnoreCase(name)) {
                    noStore();
                    return;
                }
                super.setHeader(name, value);
            }

            @Override
            public void addHeader(String name, String value) {
                if ("Cache-Control".equalsIgnoreCase(name) || "Pragma".equalsIgnoreCase(name)) {
                    noStore();
                    return;
                }
                super.addHeader(name, value);
            }
        };
        wrapper.setHeader("Cache-Control", "no-store");
        chain.doFilter(req, wrapper);
    }
}
