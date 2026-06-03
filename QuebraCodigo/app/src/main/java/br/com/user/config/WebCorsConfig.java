package br.com.user.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permite testar telas estáticas (ex.: Live Server :5500) chamando a API no Spring (:8150).
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] devOrigins = { "http://localhost:*", "http://127.0.0.1:*" };

        registry.addMapping("/auth/**")
                .allowedOriginPatterns(devOrigins)
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Permite o dev server do Vite (:5173) acessar a API de jogos
        registry.addMapping("/api/games/**")
                .allowedOriginPatterns(devOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
