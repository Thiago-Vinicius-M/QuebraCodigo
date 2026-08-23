package br.com.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "conquistas", indexes = @Index(columnList = "codigo"))
public class Conquista extends BaseEntity {
    @ManyToOne(optional = false)
    private Usuario usuario;

    @NotBlank @Size(max = 60)
    private String codigo; // ex: "vf_combo10"

    @NotBlank @Size(max = 120)
    private String titulo; // ex: "Lógico Rápido"

    @Size(max = 300)
    private String descricao;

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario u) { this.usuario = u; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
