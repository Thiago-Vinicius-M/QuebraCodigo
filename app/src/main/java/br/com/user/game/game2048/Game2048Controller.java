package br.com.user.game.game2048;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API do 2048.
 *
 * Endpoints:
 *   POST   /api/games/2048/start          → nova partida
 *   POST   /api/games/2048/{id}/move      → movimento { "direction": "UP|DOWN|LEFT|RIGHT" }
 *   POST   /api/games/2048/{id}/undo      → desfaz último movimento
 *   GET    /api/games/2048/{id}/state     → estado atual
 *   DELETE /api/games/2048/{id}           → encerra partida
 *
 * Todos os endpoints exigem sessão autenticada (userId na sessão).
 */
@RestController
@RequestMapping("/api/games/2048")
public class Game2048Controller {

    private final Game2048Service service;

    public Game2048Controller(Game2048Service service) {
        this.service = service;
    }

    // ─── Endpoints ────────────────────────────────────────────────────────────

    @PostMapping("/start")
    public ResponseEntity<?> startGame(HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        return ResponseEntity.ok(service.newGame());
    }

    @PostMapping("/{gameId}/move")
    public ResponseEntity<?> move(
            @PathVariable String gameId,
            @RequestBody Map<String, String> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        String direction = body.getOrDefault("direction", "");
        try {
            return ResponseEntity.ok(service.move(gameId, direction));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/undo")
    public ResponseEntity<?> undo(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.undo(gameId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{gameId}/state")
    public ResponseEntity<?> getState(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.getState(gameId));
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<?> endGame(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        service.removeGame(gameId);
        return ResponseEntity.ok(Map.of("message", "Partida encerrada."));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private boolean isAuthenticated(HttpSession session) {
        return session.getAttribute("userId") != null;
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Não autenticado."));
    }
}
