package br.com.user.api;

import br.com.user.model.Curso;
import br.com.user.model.Jogo;
import br.com.user.model.Aula;
import br.com.user.repo.CursoRepo;
import br.com.user.repo.JogoRepo;
import br.com.user.repo.AulaRepo;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/aulas")
public class AulaController {
    private final AulaRepo aulas; private final CursoRepo cursos; private final JogoRepo jogos;
    public AulaController(AulaRepo aulas, CursoRepo cursos, JogoRepo jogos){ this.aulas=aulas; this.cursos=cursos; this.jogos=jogos; }

    public record AulaDTO(Long id, Long cursoId, String titulo, String conteudo, Integer ordem, Long jogoId){}

    @GetMapping public List<AulaDTO> list(){ return aulas.findAll().stream().map(this::toDTO).toList(); }
    @GetMapping("/{id}") public AulaDTO get(@PathVariable Long id){ return toDTO(aulas.findById(id).orElseThrow()); }
    @GetMapping("/curso/{cursoId}") public List<AulaDTO> byCurso(@PathVariable Long cursoId){
        return aulas.findByCursoIdOrderByOrdemAsc(cursoId).stream().map(this::toDTO).toList();
    }

    @PostMapping public AulaDTO create(@Valid @RequestBody AulaDTO dto){
        Curso curso = cursos.findById(dto.cursoId()).orElseThrow();
        var a = new Aula(); a.setCurso(curso); a.setTitulo(dto.titulo());
        a.setConteudo(dto.conteudo()); a.setOrdem(dto.ordem()==null?1:dto.ordem());
        if(dto.jogoId()!=null) a.setJogo(jogos.findById(dto.jogoId()).orElseThrow());
        return toDTO(aulas.save(a));
    }
    @PutMapping("/{id}") public AulaDTO update(@PathVariable Long id, @Valid @RequestBody AulaDTO dto){
        var a = aulas.findById(id).orElseThrow();
        if(dto.cursoId()!=null) a.setCurso(cursos.findById(dto.cursoId()).orElseThrow());
        if(dto.titulo()!=null) a.setTitulo(dto.titulo());
        a.setConteudo(dto.conteudo());
        if(dto.ordem()!=null) a.setOrdem(dto.ordem());
        if(dto.jogoId()!=null) a.setJogo(jogos.findById(dto.jogoId()).orElse(null));
        return toDTO(aulas.save(a));
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ aulas.deleteById(id); }

    private AulaDTO toDTO(Aula a){
        return new AulaDTO(a.getId(),
                a.getCurso()==null?null:a.getCurso().getId(),
                a.getTitulo(), a.getConteudo(), a.getOrdem(),
                a.getJogo()==null?null:a.getJogo().getId());
    }
}
