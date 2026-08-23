package br.com.user.web.dto;

import br.com.user.model.Usuario;

public sealed interface AuthSetUsernameResult permits AuthSetUsernameResult.Success, AuthSetUsernameResult.BadRequest {
    record Success(Usuario usuario) implements AuthSetUsernameResult {}
    record BadRequest(String message) implements AuthSetUsernameResult {}
}
