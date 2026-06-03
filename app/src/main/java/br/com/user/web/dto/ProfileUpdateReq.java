package br.com.user.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateReq(
        @JsonProperty("nome") @NotBlank @Size(min = 2, max = 64) String nome,
        @JsonProperty("email") @Size(max = 120) String email,
        @JsonProperty("novaSenha") @Size(min = 4) String novaSenha
) {}
