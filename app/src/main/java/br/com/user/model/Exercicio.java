package br.com.user.model;

import br.com.user.model.enums.Difficulty;
import br.com.user.model.enums.ExerciseType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "exercicios")
public class Exercicio extends BaseEntity {
    @ManyToOne(optional = false)
    private Aula aula;

    @ManyToOne
    private Jogo jogo; // se o exercício estiver acoplado a um jogo específico

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ExerciseType tipo = ExerciseType.MULTIPLE_CHOICE;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Difficulty dificuldade = Difficulty.EASY;

    @NotBlank @Size(max = 1000)
    private String enunciado;

    @Lob
    private String dados; // JSON com alternativas, testes, etc

    @Size(max = 500)
    private String respostaEsperada;

    @Column(nullable = false)
    private int pontos = 10;

    public Aula getAula() { return aula; }
    public void setAula(Aula aula) { this.aula = aula; }
    public Jogo getJogo() { return jogo; }
    public void setJogo(Jogo jogo) { this.jogo = jogo; }
    public ExerciseType getTipo() { return tipo; }
    public void setTipo(ExerciseType tipo) { this.tipo = tipo; }
    public Difficulty getDificuldade() { return dificuldade; }
    public void setDificuldade(Difficulty dificuldade) { this.dificuldade = dificuldade; }
    public String getEnunciado() { return enunciado; }
    public void setEnunciado(String enunciado) { this.enunciado = enunciado; }
    public String getDados() { return dados; }
    public void setDados(String dados) { this.dados = dados; }
    public String getRespostaEsperada() { return respostaEsperada; }
    public void setRespostaEsperada(String r) { this.respostaEsperada = r; }
    public int getPontos() { return pontos; }
    public void setPontos(int pontos) { this.pontos = pontos; }
}
