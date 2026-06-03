package br.com.user.web.dto;

import br.com.user.model.enums.Role;

public record UsuarioDTO(Long id, String nome, String email, Role role, int pontos, int moedas) {}
