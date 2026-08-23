package br.com.user.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record UsernameReq(@JsonProperty("username") @NotBlank String username) {}
