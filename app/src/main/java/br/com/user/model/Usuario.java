package br.com.user.model;

import br.com.user.model.enums.Role;
import br.com.user.model.enums.SubscriptionStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "usuarios")
public class Usuario extends BaseEntity {

    @NotBlank @Size(max = 64)
    @Column(nullable = false, unique = true)
    private String nome; // login único (nickname)

    @Email @Size(max = 120)
    @Column(unique = true)
    private String email;

    @Size(max = 64)
    @Column(name = "primeiro_nome")
    private String primeiroNome;

    @Size(max = 64)
    @Column(name = "ultimo_nome")
    private String ultimoNome;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Size(max = 120)
    @Column(name = "senha_hash")
    private String senhaHash;

    @Size(max = 120)
    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expira_em")
    private LocalDateTime resetTokenExpiraEm;

    /** Nome da coluna evita "role", palavra reservada no PostgreSQL. */
    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private Role role = Role.USER; // adm = Role.ADMIN

    @Column(nullable = false)
    private int pontos = 0;

    @Column(nullable = false)
    private int moedas = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus assinatura = SubscriptionStatus.NONE;

    // getters / setters
    public String getNome() {return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}
    public String getPrimeiroNome() { return primeiroNome; }
    public void setPrimeiroNome(String primeiroNome) { this.primeiroNome = primeiroNome; }
    public String getUltimoNome() { return ultimoNome; }
    public void setUltimoNome(String ultimoNome) { this.ultimoNome = ultimoNome; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public LocalDateTime getResetTokenExpiraEm() { return resetTokenExpiraEm; }
    public void setResetTokenExpiraEm(LocalDateTime resetTokenExpiraEm) { this.resetTokenExpiraEm = resetTokenExpiraEm; }
    public Role getRole() {return role;}
    public void setRole(Role role) {this.role = role;}
    public int getPontos() {return pontos;}
    public void setPontos(int pontos) {this.pontos = pontos;}
    public int getMoedas() {return moedas;}
    public void setMoedas(int moedas) {this.moedas = moedas;}
    public SubscriptionStatus getAssinatura() {return assinatura;}
    public void setAssinatura(SubscriptionStatus assinatura) {this.assinatura = assinatura;}
}