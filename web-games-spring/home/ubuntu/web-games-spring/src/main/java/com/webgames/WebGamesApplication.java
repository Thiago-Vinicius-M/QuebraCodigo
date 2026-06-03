package com.webgames;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal da aplicação Spring Boot para os jogos web.
 */
@SpringBootApplication
public class WebGamesApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebGamesApplication.class, args);
        
        System.out.println("=================================");
        System.out.println("🎮 Web Games Application Started!");
        System.out.println("=================================");
        System.out.println("📱 Acesse: http://localhost:8080");
        System.out.println("🎯 Jogos disponíveis:");
        System.out.println("   • Sudoku");
        System.out.println("   • Jogo da Memória");
        System.out.println("   • Connect 4");
        System.out.println("=================================");
    }
}

