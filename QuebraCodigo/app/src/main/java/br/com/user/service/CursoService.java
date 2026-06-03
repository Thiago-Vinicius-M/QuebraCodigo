package br.com.user.service;

import br.com.user.model.Curso;
import br.com.user.model.Usuario;
import br.com.user.repo.CursoRepo;
import br.com.user.repo.UsuarioRepo;
import br.com.user.web.dto.CursoDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CursoService {

    private final CursoRepo cursos;
    private final UsuarioRepo usuarios;

    public CursoService(CursoRepo cursos, UsuarioRepo usuarios) {
        this.cursos = cursos;
        this.usuarios = usuarios;
    }

    public List<CursoDTO> listAll() {
        return cursos.findAll().stream().map(this::toDTO).toList();
    }

    public CursoDTO getById(Long id) {
        return toDTO(cursos.findById(id).orElseThrow());
    }

    public CursoDTO getByCodigo(String codigo) {
        return toDTO(cursos.findByCodigo(codigo).orElseThrow());
    }

    public CursoDTO create(CursoDTO dto) {
        Usuario autor = usuarios.findById(dto.autorId()).orElseThrow();
        var c = new Curso();
        c.setCodigo(dto.codigo());
        c.setTitulo(dto.titulo());
        c.setDescricao(dto.descricao());
        c.setAutor(autor);
        c.setPreco(dto.preco());
        c.setPublicado(dto.publicado());
        return toDTO(cursos.save(c));
    }

    public CursoDTO update(Long id, CursoDTO dto) {
        var c = cursos.findById(id).orElseThrow();
        if (dto.codigo() != null) {
            c.setCodigo(dto.codigo());
        }
        if (dto.titulo() != null) {
            c.setTitulo(dto.titulo());
        }
        c.setDescricao(dto.descricao());
        if (dto.autorId() != null) {
            c.setAutor(usuarios.findById(dto.autorId()).orElseThrow());
        }
        c.setPreco(dto.preco());
        c.setPublicado(dto.publicado());
        return toDTO(cursos.save(c));
    }

    public void delete(Long id) {
        cursos.deleteById(id);
    }

    private CursoDTO toDTO(Curso c) {
        return new CursoDTO(
                c.getId(),
                c.getCodigo(),
                c.getTitulo(),
                c.getDescricao(),
                c.getAutor() == null ? null : c.getAutor().getId(),
                c.getPreco(),
                c.isPublicado()
        );
    }
}
