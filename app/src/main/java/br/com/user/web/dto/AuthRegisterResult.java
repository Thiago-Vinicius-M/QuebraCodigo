package br.com.user.web.dto;

import br.com.user.model.Usuario;

public sealed interface AuthRegisterResult permits AuthRegisterResult.Success, AuthRegisterResult.BadRequest {
    record Success(Usuario usuario) implements AuthRegisterResult {}
    record BadRequest(String message) implements AuthRegisterResult {}
}
