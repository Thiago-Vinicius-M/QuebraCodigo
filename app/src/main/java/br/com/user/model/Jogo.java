package br.com.user.model;

import br.com.user.model.enums.GameType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "jogos", indexes = @Index(columnList = "slug", unique = true))
public class Jogo extends BaseEntity {
    @NotBlank @Size(max = 120)
    private String nome;

    @NotBlank @Size(max = 160)
    @Column(nullable = false, unique = true)
    private String slug; // ex: "verdadeiro-falso"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameType tipo = GameType.QUIZ;

    @Size(max = 255)
    private String urlPath; // ex: "/novos/verdadeiro-falso.html"

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public GameType getTipo() { return tipo; }
    public void setTipo(GameType tipo) { this.tipo = tipo; }
    public String getUrlPath() { return urlPath; }
    public void setUrlPath(String urlPath) { this.urlPath = urlPath; }
}
