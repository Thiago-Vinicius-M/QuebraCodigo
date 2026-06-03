package br.com.user.web.dto;

import br.com.user.model.Usuario;

public sealed interface AuthLoginResult permits AuthLoginResult.Success, AuthLoginResult.BadRequest, AuthLoginResult.Unauthorized {
    record Success(Usuario usuario) implements AuthLoginResult {}
    record BadRequest(String message) implements AuthLoginResult {}
    record Unauthorized(String message) implements AuthLoginResult {}
}
