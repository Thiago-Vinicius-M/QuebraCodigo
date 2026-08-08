package br.com.user.service;

public class UsuarioNaoEncontradoException extends RuntimeException {

    public UsuarioNaoEncontradoException(Long usuarioId) {
        super("Usuário não encontrado: " + usuarioId);
    }
}
