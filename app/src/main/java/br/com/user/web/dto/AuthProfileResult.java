package br.com.user.web.dto;

import br.com.user.model.Usuario;

public sealed interface AuthProfileResult permits AuthProfileResult.Ok, AuthProfileResult.Unauthenticated, AuthProfileResult.BadRequest {
    record Ok(Usuario usuario) implements AuthProfileResult {}
    record Unauthenticated() implements AuthProfileResult {}
    record BadRequest(String message) implements AuthProfileResult {}
}
