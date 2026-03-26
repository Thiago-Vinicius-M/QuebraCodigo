package br.com.user.api;

import br.com.user.model.Usuario;
import br.com.user.repo.UsuarioRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller de gamificação:
 * - award: soma pontos/moedas
 * - ranking: lista top por pontos
 *
 * ATENÇÃO: NÃO expõe /api/usuarios/sync para evitar colisão com UsuarioController.
 */
@RestController
@RequestMapping("/api")
public class GamificationController {

    private final UsuarioRepo usuarios;

    public GamificationController(UsuarioRepo usuarios) {
        this.usuarios = usuarios;
    }

    /** Soma pontos e moedas ao usuário informado (cria se não existir). */
    @PostMapping("/gamification/award")
    public ResponseEntity<Usuario> award(@RequestBody Map<String,Object> body){
        String nome = String.valueOf(body.getOrDefault("nome", "Jogador")).trim();
        int addPontos = ((Number) body.getOrDefault("addPontos", 0)).intValue();
        int addMoedas = ((Number) body.getOrDefault("addMoedas", 0)).intValue();

        Usuario u = usuarios.findByNome(nome).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setNome(nome);
            return usuarios.save(novo);
        });

        u.setPontos(u.getPontos() + addPontos);
        u.setMoedas(u.getMoedas() + addMoedas);
        u = usuarios.save(u);
        return ResponseEntity.ok(u);
    }

    /** Ranking por pontos (top 50). */
    @GetMapping("/ranking")
    public ResponseEntity<?> ranking(){
        return ResponseEntity.ok(usuarios.findTop50ByOrderByPontosDesc());
    }
}