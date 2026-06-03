package br.com.user.game.sudoku;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API do Sudoku.
 *
 * Endpoints:
 *   POST   /api/games/sudoku/start?difficulty=easy  → nova partida
 *   POST   /api/games/sudoku/{id}/place             → coloca número  { "index": 5, "value": 3 }
 *   POST   /api/games/sudoku/{id}/erase             → apaga célula   { "index": 5 }
 *   POST   /api/games/sudoku/{id}/solve             → revela solução
 *   POST   /api/games/sudoku/{id}/clear             → limpa entradas do jogador
 *   GET    /api/games/sudoku/{id}/state             → estado atual
 *   DELETE /api/games/sudoku/{id}                   → encerra partida
 */
@RestController
@RequestMapping("/api/games/sudoku")
public class SudokuController {

    private final SudokuService service;

    public SudokuController(SudokuService service) {
        this.service = service;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(
            @RequestParam(defaultValue = "easy") String difficulty,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();
        return ResponseEntity.ok(service.newGame(difficulty));
    }

    @PostMapping("/{gameId}/place")
    public ResponseEntity<?> place(
            @PathVariable String gameId,
            @RequestBody Map<String, Integer> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        Integer index = body.get("index");
        Integer value = body.get("value");
        if (index == null || value == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campos 'index' e 'value' são obrigatórios."));
        }
        try {
            return ResponseEntity.ok(service.place(gameId, index, value));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/erase")
    public ResponseEntity<?> erase(
            @PathVariable String gameId,
            @RequestBody Map<String, Integer> body,
            HttpSession session) {

        if (!isAuthenticated(session)) return unauthorized();

        Integer index = body.get("index");
        if (index == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'index' obrigatório."));
        }
        try {
            return ResponseEntity.ok(service.erase(gameId, index));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/solve")
    public ResponseEntity<?> solve(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.solve(gameId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/clear")
    public ResponseEntity<?> clear(@PathVariable String gameId, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        try {
            return ResponseEntity.ok(service.clear(gameId));
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
