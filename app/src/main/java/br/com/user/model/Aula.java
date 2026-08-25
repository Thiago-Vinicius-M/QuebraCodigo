package br.com.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.*;

@Entity
@Table(name = "aulas")
public class Aula extends BaseEntity{
    @ManyToOne(optional = false)
    private Curso curso;

    @NotBlank @Size(max = 120)
    private String titulo;

    @Lob
    private String conteudo; // markdown/HTML

    @Column(nullable = false)
    private int ordem = 1;

    @OneToMany(mappedBy = "aula", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Exercicio> exercicios = new ArrayList<>();

    @OneToOne
    private Jogo jogo; // link para um jogo dessa aula - opcional

    public Curso getCurso() { return curso; }
    public void setCurso(Curso curso) { this.curso = curso; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    public int getOrdem() { return ordem; }
    public void setOrdem(int ordem) { this.ordem = ordem; }
    public List<Exercicio> getExercicios() { return exercicios; }
    public Jogo getJogo() { return jogo; }
    public void setJogo(Jogo jogo) { this.jogo = jogo; }
}
