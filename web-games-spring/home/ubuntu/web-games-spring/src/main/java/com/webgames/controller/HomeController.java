package com.webgames.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller para servir a página inicial dos jogos.
 */
@Controller
public class HomeController {

    /**
     * Serve a página inicial dos jogos.
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/index.html";
    }


}

