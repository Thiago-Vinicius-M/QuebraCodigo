package br.com.user.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permite testar telas estáticas (ex.: Live Server :5500) e acesso pela VPS (IP público).
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // localhost (dev) + qualquer host/IP na porta da app (VPS, LAN, etc.)
        String[] origins = {
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://*:*",
                "https://*:*",
                "http://*",
                "https://*"
        };

        registry.addMapping("/auth/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        registry.addMapping("/api/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
