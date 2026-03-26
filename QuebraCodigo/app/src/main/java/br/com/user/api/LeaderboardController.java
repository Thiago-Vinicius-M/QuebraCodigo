package br.com.user.api;

import br.com.user.repo.UsuarioRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard") // <-- rota distinta
public class LeaderboardController {

    private final UsuarioRepo usuarios;
    public LeaderboardController(UsuarioRepo usuarios) { this.usuarios = usuarios; }

    @GetMapping
    public ResponseEntity<?> top() {
        return ResponseEntity.ok(usuarios.findTop50ByOrderByPontosDesc());
    }
}
