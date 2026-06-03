package br.com.user.game.flowfree;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API do Flow Free.
 *
 * Endpoints:
 *   POST   /api/games/flow-free/start?level=1     → nova partida
 *   POST   /api/games/flow-free/{id}/set-path     → define caminho { "color": 1, "path": [[r,c],...] }
 *   POST   /api/games/flow-free/{id}/hint         → dica
 *   POST   /api/games/flow-free/{id}/restart      → reinicia nível atual
 *   POST   /api/games/flow-free/{id}/level        → muda nível { "level": 3 }
 *   GET    /api/games/flow-free/{id}/state        → estado atual
 *   DELETE /api/games/flow-free/{id}              → encerra partida
 */
@RestController
@RequestMapping("/api/games/flow-free")
public class FlowFreeController {

    private final FlowFreeService service;

    public FlowFreeController(FlowFreeService service) {
        this.service = service;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(
            @RequestParam(defaultValue = "1") int level,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();
        return ResponseEntity.ok(service.newGame(level));
    }

    @PostMapping("/{gameId}/set-path")
    public ResponseEntity<?> setPath(
            @PathVariable String gameId,
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        Integer color = (Integer) body.get("color");
        @SuppressWarnings("unchecked")
        List<List<Integer>> rawPath = (List<List<Integer>>) body.get("path");

        if (color == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'color' obrigatório."));
        }

        List<int[]> path = rawPath == null ? List.of()
                : rawPath.stream().map(p -> new int[]{p.get(0), p.get(1)}).toList();

        try {
            return ResponseEntity.ok(service.setPath(gameId, color, path));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/hint")
    public ResponseEntity<?> hint(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.hint(gameId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/restart")
    public ResponseEntity<?> restart(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.restart(gameId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/level")
    public ResponseEntity<?> goToLevel(
            @PathVariable String gameId,
            @RequestBody Map<String, Integer> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        Integer level = body.get("level");
        if (level == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'level' obrigatório."));
        }
        try {
            return ResponseEntity.ok(service.goToLevel(gameId, level));
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

    private boolean isAuthenticated(HttpSession session) {
        return session.getAttribute("userId") != null;
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(401).body(Map.of("error", "Não autenticado."));
    }
}
