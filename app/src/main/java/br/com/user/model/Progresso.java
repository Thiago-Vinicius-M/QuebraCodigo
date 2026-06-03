package br.com.user.model;

import br.com.user.model.enums.ProgressStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "progresso", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "licao_id"}))
public class Progresso extends BaseEntity {
    @ManyToOne(optional = false)
    private Usuario usuario;

    @ManyToOne(optional = false)
    private Licao licao;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ProgressStatus status = ProgressStatus.NOT_STARTED;

    @Column(nullable = false)
    private int percentual = 0; // 0..100

    @Column(nullable = false)
    private int pontuacao = 0; // pontos ganhos na lição

    private Instant ultimoAcesso;

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Licao getLicao() { return licao; }
    public void setLicao(Licao licao) { this.licao = licao; }
    public ProgressStatus getStatus() { return status; }
    public void setStatus(ProgressStatus status) { this.status = status; }
    public int getPercentual() { return percentual; }
    public void setPercentual(int p) { this.percentual = Math.max(0, Math.min(100, p)); }
    public int getPontuacao() { return pontuacao; }
    public void setPontuacao(int pontuacao) { this.pontuacao = Math.max(0, pontuacao); }
    public Instant getUltimoAcesso() { return ultimoAcesso; }
    public void setUltimoAcesso(Instant t) { this.ultimoAcesso = t; }
}
