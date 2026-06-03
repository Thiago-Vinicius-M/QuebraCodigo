package br.com.user.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterReq(
        @JsonProperty("primeiroNome") @NotBlank @Size(max = 64) String primeiroNome,
        @JsonProperty("ultimoNome") @NotBlank @Size(max = 64) String ultimoNome,
        @JsonProperty("email") @NotBlank @Email @Size(max = 120) String email,
        @JsonProperty("dataNascimento") @NotBlank String dataNascimento,
        @JsonProperty("usuario") @NotBlank @Size(min = 2, max = 64) String usuario,
        @JsonProperty("senha") @NotBlank @Size(min = 4) String senha
) {}
