package br.com.user.service;

import br.com.user.model.Usuario;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthSessionService {

    private static final int COOKIE_MAX_AGE_SECONDS = (int) Duration.ofDays(30).getSeconds();

    public void establishSession(Usuario u, HttpSession session, HttpServletResponse resp) {
        session.setAttribute("username", u.getNome());
        session.setAttribute("userId", u.getId());
        addUsernameCookie(u.getNome(), resp);
    }

    /** Quando o nome do usuário muda no perfil; userId na sessão permanece o mesmo. */
    public void refreshUsernameInSession(Usuario u, HttpSession session, HttpServletResponse resp) {
        session.setAttribute("username", u.getNome());
        addUsernameCookie(u.getNome(), resp);
    }

    private void addUsernameCookie(String nome, HttpServletResponse resp) {
        Cookie c = new Cookie("username", nome);
        c.setHttpOnly(false);
        c.setPath("/");
        c.setMaxAge(COOKIE_MAX_AGE_SECONDS);
        resp.addCookie(c);
    }

    /** Invalida a sessão HTTP e remove o cookie de exibição do username. */
    public void invalidateSession(HttpSession session, HttpServletResponse resp) {
        if (session != null) {
            try {
                session.invalidate();
            } catch (IllegalStateException ignored) {
                // já invalidada
            }
        }
        Cookie c = new Cookie("username", "");
        c.setPath("/");
        c.setMaxAge(0);
        resp.addCookie(c);
    }
}
