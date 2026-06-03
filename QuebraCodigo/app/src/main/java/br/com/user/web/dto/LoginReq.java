package br.com.user.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record LoginReq(
        @JsonProperty("usuario") @NotBlank String usuario,
        @JsonProperty("senha") @NotBlank String senha
) {}
