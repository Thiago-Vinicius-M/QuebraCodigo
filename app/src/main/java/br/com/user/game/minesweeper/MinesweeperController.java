package br.com.user.game.minesweeper;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API do Campo Minado.
 *
 * Endpoints:
 *   POST   /api/games/minesweeper/start?difficulty=easy  → nova partida
 *   POST   /api/games/minesweeper/{id}/reveal            → revela célula  { "row": 2, "col": 3 }
 *   POST   /api/games/minesweeper/{id}/flag              → bandeira       { "row": 2, "col": 3 }
 *   POST   /api/games/minesweeper/{id}/hint              → dica (revela célula segura)
 *   GET    /api/games/minesweeper/{id}/state             → estado atual
 *   DELETE /api/games/minesweeper/{id}                   → encerra partida
 */
@RestController
@RequestMapping("/api/games/minesweeper")
public class MinesweeperController {

    private final MinesweeperService service;

    public MinesweeperController(MinesweeperService service) {
        this.service = service;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(
            @RequestParam(defaultValue = "easy") String difficulty,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();
        return ResponseEntity.ok(service.newGame(difficulty));
    }

    @PostMapping("/{gameId}/reveal")
    public ResponseEntity<?> reveal(
            @PathVariable String gameId,
            @RequestBody Map<String, Integer> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        Integer row = body.get("row");
        Integer col = body.get("col");
        if (row == null || col == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campos 'row' e 'col' são obrigatórios."));
        }
        try {
            return ResponseEntity.ok(service.reveal(gameId, row, col));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/flag")
    public ResponseEntity<?> flag(
            @PathVariable String gameId,
            @RequestBody Map<String, Integer> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        Integer row = body.get("row");
        Integer col = body.get("col");
        if (row == null || col == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campos 'row' e 'col' são obrigatórios."));
        }
        try {
            return ResponseEntity.ok(service.flag(gameId, row, col));
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
