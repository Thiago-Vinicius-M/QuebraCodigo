package br.com.user.service;

import br.com.user.model.Usuario;
import br.com.user.repo.UsuarioRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GamificationService {

    private final UsuarioRepo usuarios;
    private final PontuacaoService pontuacaoService;

    public GamificationService(UsuarioRepo usuarios, PontuacaoService pontuacaoService) {
        this.usuarios = usuarios;
        this.pontuacaoService = pontuacaoService;
    }

    /** Soma pontos e moedas ao usuário informado (cria se não existir). */
    public Usuario award(Map<String, Object> body) {
        String nome = String.valueOf(body.getOrDefault("nome", "Jogador")).trim();
        int addPontos = ((Number) body.getOrDefault("addPontos", 0)).intValue();
        int addMoedas = ((Number) body.getOrDefault("addMoedas", 0)).intValue();
        String motivo = String.valueOf(body.getOrDefault("motivo", "Gamificação"));

        Usuario u = usuarios.findByNome(nome).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setNome(nome);
            return usuarios.save(novo);
        });

        if (addPontos > 0) {
            pontuacaoService.adicionarPontos(u.getId(), addPontos, motivo);
            u = usuarios.findById(u.getId()).orElseThrow();
        } else if (addPontos < 0) {
            throw new PontuacaoInvalidaException("Pontos negativos ou zero não são aceitos");
        }

        if (addMoedas != 0) {
            u.setMoedas(Math.max(0, u.getMoedas() + addMoedas));
            u = usuarios.save(u);
        }
        return u;
    }

    public List<Usuario> rankingTop50() {
        return pontuacaoService.ranking().stream()
                .limit(50)
                .map(p -> p.getUsuario())
                .toList();
    }
}
