package br.com.user.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    // Mesma home do front (app/frontend). Login fica em /login.html.
    @GetMapping({"/", "/home"})
    public String homePage() {
        return "forward:/index.html";
    }
}
