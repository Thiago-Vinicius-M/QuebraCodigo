package br.com.user.model;

import br.com.user.model.enums.SubscriptionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "assinaturas")
public class Assinatura extends BaseEntity {
    @ManyToOne(optional = false)
    private Usuario usuario;

    @NotBlank @Size(max = 40)
    private String plano; // ex: "BASICO", "PRO"

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    private LocalDate inicio;
    private LocalDate fim;

    private BigDecimal preco;

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario u) { this.usuario = u; }
    public String getPlano() { return plano; }
    public void setPlano(String plano) { this.plano = plano; }
    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }
    public LocalDate getInicio() { return inicio; }
    public void setInicio(LocalDate inicio) { this.inicio = inicio; }
    public LocalDate getFim() { return fim; }
    public void setFim(LocalDate fim) { this.fim = fim; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
}
