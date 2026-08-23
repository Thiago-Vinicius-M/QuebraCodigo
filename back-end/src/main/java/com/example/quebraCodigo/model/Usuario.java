package com.example.quebraCodigo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String senha;

    // Um usuário pode estar em vários cursos
    @ManyToMany
    @JoinTable(
            name = "usuario_curso",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "curso_id")
    )
    private List<Curso> cursos;

    // Relacionamento com lições concluídas
    @ManyToMany
    @JoinTable(
            name = "usuario_licao",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "licao_id")
    )
    private List<Licao> licoesConcluidas;

    // Relacionamento com jogos jogados
    @ManyToMany
    @JoinTable(
            name = "usuario_jogo",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "jogo_id")
    )
    private List<Jogo> jogos;

    // getters e setters
}
