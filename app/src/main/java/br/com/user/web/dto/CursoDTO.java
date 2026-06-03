package br.com.user.web.dto;

import java.math.BigDecimal;

public record CursoDTO(Long id, String codigo, String titulo, String descricao, Long autorId, BigDecimal preco, boolean publicado) {}
