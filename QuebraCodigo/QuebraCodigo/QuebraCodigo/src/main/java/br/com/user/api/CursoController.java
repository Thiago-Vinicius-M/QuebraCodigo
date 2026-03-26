package br.com.user.api;

import br.com.user.model.Curso;
import br.com.user.model.Usuario;
import br.com.user.repo.CursoRepo;
import br.com.user.repo.UsuarioRepo;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController @RequestMapping("/api/cursos")
public class CursoController {
    private final CursoRepo cursos; private final UsuarioRepo usuarios;
    public CursoController(CursoRepo cursos, UsuarioRepo usuarios){ this.cursos=cursos; this.usuarios=usuarios; }

    public record CursoDTO(Long id, String codigo, String titulo, String descricao, Long autorId, BigDecimal preco, boolean publicado){}
    @GetMapping public List<CursoDTO> list(){ return cursos.findAll().stream().map(this::toDTO).toList(); }
    @GetMapping("/{id}") public CursoDTO get(@PathVariable Long id){ return toDTO(cursos.findById(id).orElseThrow()); }
    @GetMapping("/codigo/{codigo}") public CursoDTO byCodigo(@PathVariable String codigo){ return toDTO(cursos.findByCodigo(codigo).orElseThrow()); }

    @PostMapping public CursoDTO create(@Valid @RequestBody CursoDTO dto){
        Usuario autor = usuarios.findById(dto.autorId()).orElseThrow();
        var c = new Curso(); c.setCodigo(dto.codigo()); c.setTitulo(dto.titulo()); c.setDescricao(dto.descricao()); c.setAutor(autor);
        c.setPreco(dto.preco()); c.setPublicado(dto.publicado());
        return toDTO(cursos.save(c));
    }
    @PutMapping("/{id}") public CursoDTO update(@PathVariable Long id, @Valid @RequestBody CursoDTO dto){
        var c = cursos.findById(id).orElseThrow();
        if(dto.codigo()!=null) c.setCodigo(dto.codigo());
        if(dto.titulo()!=null) c.setTitulo(dto.titulo());
        c.setDescricao(dto.descricao()); if(dto.autorId()!=null) c.setAutor(usuarios.findById(dto.autorId()).orElseThrow());
        c.setPreco(dto.preco()); c.setPublicado(dto.publicado());
        return toDTO(cursos.save(c));
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ cursos.deleteById(id); }

    private CursoDTO toDTO(Curso c){
        return new CursoDTO(c.getId(), c.getCodigo(), c.getTitulo(), c.getDescricao(),
                c.getAutor()==null?null:c.getAutor().getId(), c.getPreco(), c.isPublicado());
    }
}
