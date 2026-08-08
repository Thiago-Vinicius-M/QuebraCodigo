package br.com.user.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pontuacao_historico")
public class PontuacaoHistorico extends BaseEntity {

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "pontuacao_id", nullable = false)
    private Pontuacao pontuacao;

    @Column(nullable = false)
    private int quantidade;

    @Column(nullable = false, length = 255)
    private String motivo;

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Pontuacao getPontuacao() {
        return pontuacao;
    }

    public void setPontuacao(Pontuacao pontuacao) {
        this.pontuacao = pontuacao;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
