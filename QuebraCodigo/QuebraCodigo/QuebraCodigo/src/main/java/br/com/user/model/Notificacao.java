package br.com.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "notificacoes")
public class Notificacao extends BaseEntity {
    @ManyToOne(optional = false)
    private Usuario usuario;

    @NotBlank @Size(max = 140)
    private String titulo;

    @NotBlank @Size(max = 1000)
    private String mensagem;

    @Column(nullable = false)
    private boolean lida = false;

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario u) { this.usuario = u; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String t) { this.titulo = t; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String m) { this.mensagem = m; }
    public boolean isLida() { return lida; }
    public void setLida(boolean lida) { this.lida = lida; }
}
