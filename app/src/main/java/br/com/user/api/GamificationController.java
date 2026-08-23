package br.com.user.api;

import br.com.user.model.Pontuacao;
import br.com.user.model.Usuario;
import br.com.user.repo.UsuarioRepo;
import br.com.user.service.PontuacaoInvalidaException;
import br.com.user.service.PontuacaoService;
import br.com.user.service.UsuarioNaoEncontradoException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller de gamificação:
 * - award: soma pontos/moedas e registra histórico em pontuacao
 * - ranking: lista top por saldo de pontuação
 */
@RestController
@RequestMapping("/api")
public class GamificationController {

    private final UsuarioRepo usuarios;
    private final PontuacaoService pontuacaoService;

    public GamificationController(UsuarioRepo usuarios, PontuacaoService pontuacaoService) {
        this.usuarios = usuarios;
        this.pontuacaoService = pontuacaoService;
    }

    /** Soma pontos e moedas ao usuário informado (cria se não existir). */
    @PostMapping("/gamification/award")
    public ResponseEntity<?> award(@RequestBody Map<String, Object> body) {
        String nome = String.valueOf(body.getOrDefault("nome", "Jogador")).trim();
        int addPontos = ((Number) body.getOrDefault("addPontos", 0)).intValue();
        int addMoedas = ((Number) body.getOrDefault("addMoedas", 0)).intValue();
        String motivo = String.valueOf(body.getOrDefault("motivo", "Gamificação"));

        Usuario u = usuarios.findByNome(nome).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setNome(nome);
            return usuarios.save(novo);
        });

        try {
            if (addPontos > 0) {
                pontuacaoService.adicionarPontos(u.getId(), addPontos, motivo);
            } else if (addPontos < 0) {
                throw new PontuacaoInvalidaException("Pontos negativos ou zero não são aceitos");
            }

            u = usuarios.findById(u.getId()).orElseThrow();
            if (addMoedas != 0) {
                u.setMoedas(Math.max(0, u.getMoedas() + addMoedas));
                u = usuarios.save(u);
            }

            return ResponseEntity.ok(u);
        } catch (PontuacaoInvalidaException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (UsuarioNaoEncontradoException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /** Ranking por saldo de pontuação. */
    @GetMapping("/ranking")
    public ResponseEntity<?> ranking() {
        List<Pontuacao> ranking = pontuacaoService.ranking();
        return ResponseEntity.ok(ranking.stream().limit(50).map(p -> Map.of(
                "id", p.getUsuario().getId(),
                "nome", p.getUsuario().getNome(),
                "pontos", p.getSaldo(),
                "moedas", p.getUsuario().getMoedas()
        )).toList());
    }
}
