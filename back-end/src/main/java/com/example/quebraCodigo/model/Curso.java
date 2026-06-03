package com.example.quebraCodigo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;
    private boolean pago; // true = curso premium

    // Curso contém várias lições
    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL)
    private List<Licao> licoes;

    // getters e setters
}
