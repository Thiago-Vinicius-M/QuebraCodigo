package br.com.user.service;

import br.com.user.model.Usuario;
import br.com.user.repo.UsuarioRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GamificationService {

    private final UsuarioRepo usuarios;

    public GamificationService(UsuarioRepo usuarios) {
        this.usuarios = usuarios;
    }

    /** Soma pontos e moedas ao usuário informado (cria se não existir). */
    public Usuario award(Map<String, Object> body) {
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
        return usuarios.save(u);
    }

    public List<Usuario> rankingTop50() {
        return usuarios.findTop50ByOrderByPontosDesc();
    }
}
