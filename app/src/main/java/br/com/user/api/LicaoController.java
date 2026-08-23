package br.com.user.api;

import br.com.user.model.Curso;
import br.com.user.model.Jogo;
import br.com.user.model.Licao;
import br.com.user.repo.CursoRepo;
import br.com.user.repo.JogoRepo;
import br.com.user.repo.LicaoRepo;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/licoes")
public class LicaoController {
    private final LicaoRepo licoes; private final CursoRepo cursos; private final JogoRepo jogos;
    public LicaoController(LicaoRepo licoes, CursoRepo cursos, JogoRepo jogos){ this.licoes=licoes; this.cursos=cursos; this.jogos=jogos; }

    public record LicaoDTO(Long id, Long cursoId, String titulo, String conteudo, Integer ordem, Long jogoId){}

    @GetMapping public List<LicaoDTO> list(){ return licoes.findAll().stream().map(this::toDTO).toList(); }
    @GetMapping("/{id}") public LicaoDTO get(@PathVariable Long id){ return toDTO(licoes.findById(id).orElseThrow()); }
    @GetMapping("/curso/{cursoId}") public List<LicaoDTO> byCurso(@PathVariable Long cursoId){
        return licoes.findByCursoIdOrderByOrdemAsc(cursoId).stream().map(this::toDTO).toList();
    }

    @PostMapping public LicaoDTO create(@Valid @RequestBody LicaoDTO dto){
        Curso curso = cursos.findById(dto.cursoId()).orElseThrow();
        var l = new Licao(); l.setCurso(curso); l.setTitulo(dto.titulo());
        l.setConteudo(dto.conteudo()); l.setOrdem(dto.ordem()==null?1:dto.ordem());
        if(dto.jogoId()!=null) l.setJogo(jogos.findById(dto.jogoId()).orElseThrow());
        return toDTO(licoes.save(l));
    }
    @PutMapping("/{id}") public LicaoDTO update(@PathVariable Long id, @Valid @RequestBody LicaoDTO dto){
        var l = licoes.findById(id).orElseThrow();
        if(dto.cursoId()!=null) l.setCurso(cursos.findById(dto.cursoId()).orElseThrow());
        if(dto.titulo()!=null) l.setTitulo(dto.titulo());
        l.setConteudo(dto.conteudo());
        if(dto.ordem()!=null) l.setOrdem(dto.ordem());
        if(dto.jogoId()!=null) l.setJogo(jogos.findById(dto.jogoId()).orElse(null));
        return toDTO(licoes.save(l));
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ licoes.deleteById(id); }

    private LicaoDTO toDTO(Licao l){
        return new LicaoDTO(l.getId(),
                l.getCurso()==null?null:l.getCurso().getId(),
                l.getTitulo(), l.getConteudo(), l.getOrdem(),
                l.getJogo()==null?null:l.getJogo().getId());
    }
}
