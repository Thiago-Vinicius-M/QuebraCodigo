package br.com.user.web.dto;

public record MeDto(
        Long id,
        String username,
        String email,
        String primeiroNome,
        String ultimoNome,
        String dataNascimento
) {}
