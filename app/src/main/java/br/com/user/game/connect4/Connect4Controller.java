package br.com.user.game.connect4;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API do Connect 4.
 *
 * Endpoints:
 *   POST   /api/games/connect4/start          → nova partida
 *   POST   /api/games/connect4/{id}/move      → jogada { "col": 0-6 }
 *   GET    /api/games/connect4/{id}/state     → estado atual
 *   DELETE /api/games/connect4/{id}           → encerra partida
 *
 * Todos os endpoints exigem sessão autenticada (userId na sessão).
 */
@RestController
@RequestMapping("/api/games/connect4")
public class Connect4Controller {

    private final Connect4Service service;

    public Connect4Controller(Connect4Service service) {
        this.service = service;
    }

    // ─── Endpoints ────────────────────────────────────────────────────────────

    @PostMapping("/start")
    public ResponseEntity<?> startGame(HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        Connect4State state = service.newGame();
        return ResponseEntity.ok(state);
    }

    @PostMapping("/{gameId}/move")
    public ResponseEntity<?> makeMove(
            @PathVariable String gameId,
            @RequestBody Map<String, Integer> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        int col = body.getOrDefault("col", -1);
        try {
            Connect4State state = service.makeMove(gameId, col);
            return ResponseEntity.ok(state);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
