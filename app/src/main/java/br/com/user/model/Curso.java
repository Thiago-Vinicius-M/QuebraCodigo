package br.com.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;

@Entity
@Table(name = "cursos")
public class Curso extends BaseEntity {
    @NotBlank @Size(max = 120)
    private String titulo;

    /** Código único do curso para URL (ex: python, java, javascript). */
    @Size(max = 40)
    @Column(unique = true)
    private String codigo;

    @Size(max = 1000)
    private String descricao;

    @ManyToOne(optional = false)
    private Usuario autor; // pode ser ADMIN ou futuro TEACHER

    private BigDecimal preco; // opcional

    @Column(nullable = false)
    private boolean publicado = false;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<Licao> licoes = new ArrayList<>();

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Usuario getAutor() { return autor; }
    public void setAutor(Usuario autor) { this.autor = autor; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public boolean isPublicado() { return publicado; }
    public void setPublicado(boolean publicado) { this.publicado = publicado; }
    public List<Licao> getLicoes() { return licoes; }
}
