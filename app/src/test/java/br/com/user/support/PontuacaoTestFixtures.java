package br.com.user.support;

import br.com.user.model.Usuario;
import br.com.user.repo.UsuarioRepo;

public final class PontuacaoTestFixtures {

    private PontuacaoTestFixtures() {
    }

    public static Usuario criarUsuario(UsuarioRepo usuarioRepo, String nome) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        return usuarioRepo.save(usuario);
    }
}
