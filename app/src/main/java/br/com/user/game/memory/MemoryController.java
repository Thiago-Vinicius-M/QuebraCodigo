package br.com.user.game.memory;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API do Jogo da Memória.
 *
 * Endpoints:
 *   POST   /api/games/memory/start?cols=4&rows=4  → nova partida
 *   POST   /api/games/memory/{id}/flip             → vira carta { "index": 5 }
 *   POST   /api/games/memory/{id}/reset-pending    → reverte cartas sem par (após animação)
 *   GET    /api/games/memory/{id}/state            → estado atual
 *   POST   /api/games/memory/score                 → calcula pontos { moves, seconds, totalCards }
 *   DELETE /api/games/memory/{id}                  → encerra partida
 *
 * Todos os endpoints exigem sessão autenticada (userId na sessão).
 */
@RestController
@RequestMapping("/api/games/memory")
public class MemoryController {

    private final MemoryService service;

    public MemoryController(MemoryService service) {
        this.service = service;
    }

    // ─── Endpoints ────────────────────────────────────────────────────────────

    @PostMapping("/start")
    public ResponseEntity<?> startGame(
            @RequestParam(defaultValue = "4") int cols,
            @RequestParam(defaultValue = "4") int rows,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.newGame(cols, rows));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/flip")
    public ResponseEntity<?> flip(
            @PathVariable String gameId,
            @RequestBody Map<String, Integer> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        Integer index = body.get("index");
        if (index == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'index' obrigatório."));
        }
        try {
            return ResponseEntity.ok(service.flip(gameId, index));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (IndexOutOfBoundsException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Índice de carta inválido."));
        }
    }

    @PostMapping("/{gameId}/reset-pending")
    public ResponseEntity<?> resetPending(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.resetPending(gameId));
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

    @PostMapping("/score")
    public ResponseEntity<?> score(@RequestBody Map<String, Integer> body, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            int moves = body.getOrDefault("moves", 0);
            int seconds = body.getOrDefault("seconds", 0);
            int totalCards = body.getOrDefault("totalCards", 16);
            MemoryService.ScoreResult result = service.calculateScore(moves, seconds, totalCards);
            return ResponseEntity.ok(Map.of(
                    "points", result.points(),
                    "coins", result.coins()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
