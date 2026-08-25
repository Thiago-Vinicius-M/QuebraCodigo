package br.com.user.api;

import br.com.user.model.*;
import br.com.user.model.enums.ProgressStatus;
import br.com.user.repo.*;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController @RequestMapping("/api/progresso")
public class ProgressoController {

    private final ProgressoRepo repo; private final UsuarioRepo usuarios; private final AulaRepo aulas;
    public ProgressoController(ProgressoRepo repo, UsuarioRepo usuarios, AulaRepo aulas){ this.repo=repo; this.usuarios=usuarios; this.aulas=aulas; }

    public record ProgDTO(Long id, Long usuarioId, Long aulaId, ProgressStatus status, Integer percentual, Integer pontuacao){}

    @GetMapping("/usuario/{usuarioId}") public List<ProgDTO> byUsuario(@PathVariable Long usuarioId){
        return repo.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    // Sincroniza/atualiza progresso (chamável pelo front quando o aluno avança na aula)
    @PostMapping("/sync")
    public ProgDTO sync(@RequestBody ProgDTO dto){
        var u = usuarios.findById(dto.usuarioId()).orElseThrow();
        var a = aulas.findById(dto.aulaId()).orElseThrow();
        var p = repo.findByUsuarioIdAndAulaId(u.getId(), a.getId()).orElseGet(()->{
            var np = new Progresso(); np.setUsuario(u); np.setAula(a); return np;
        });
        if(dto.status()!=null) p.setStatus(dto.status());
        if(dto.percentual()!=null) p.setPercentual(dto.percentual());
        if(dto.pontuacao()!=null) p.setPontuacao(dto.pontuacao());
        p.setUltimoAcesso(Instant.now());
        return toDTO(repo.save(p));
    }

    private ProgDTO toDTO(Progresso p){
        return new ProgDTO(p.getId(), p.getUsuario().getId(), p.getAula().getId(),
                p.getStatus(), p.getPercentual(), p.getPontuacao());
    }
}
