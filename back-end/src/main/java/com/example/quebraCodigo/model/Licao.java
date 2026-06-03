package com.example.quebraCodigo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "licoes")
public class Licao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String conteudo; // pode ser texto, ou link para conteúdo externo
    private int ordem; // posição dentro do curso

    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;

    // getter e setters
}
