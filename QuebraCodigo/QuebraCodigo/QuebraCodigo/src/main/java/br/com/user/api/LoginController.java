package br.com.user.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    // Rota inicial → login.html em /static
    @GetMapping("/")
    public String loginPage() {
        return "forward:/login.html";
    }

    // Depois do "login fake" → index.html (home dos jogos/cursos)
    @GetMapping("/home")
    public String homePage() {
        return "forward:/index.html";
    }
}
