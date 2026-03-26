package br.com.user.api;

import br.com.user.model.*;
import br.com.user.model.enums.ProgressStatus;
import br.com.user.repo.*;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController @RequestMapping("/api/progresso")
public class ProgressoController {

    private final ProgressoRepo repo; private final UsuarioRepo usuarios; private final LicaoRepo licoes;
    public ProgressoController(ProgressoRepo repo, UsuarioRepo usuarios, LicaoRepo licoes){ this.repo=repo; this.usuarios=usuarios; this.licoes=licoes; }

    public record ProgDTO(Long id, Long usuarioId, Long licaoId, ProgressStatus status, Integer percentual, Integer pontuacao){}

    @GetMapping("/usuario/{usuarioId}") public List<ProgDTO> byUsuario(@PathVariable Long usuarioId){
        return repo.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    // Sincroniza/atualiza progresso (chamável pelo front quando o aluno avança na lição)
    @PostMapping("/sync")
    public ProgDTO sync(@RequestBody ProgDTO dto){
        var u = usuarios.findById(dto.usuarioId()).orElseThrow();
        var l = licoes.findById(dto.licaoId()).orElseThrow();
        var p = repo.findByUsuarioIdAndLicaoId(u.getId(), l.getId()).orElseGet(()->{
            var np = new Progresso(); np.setUsuario(u); np.setLicao(l); return np;
        });
        if(dto.status()!=null) p.setStatus(dto.status());
        if(dto.percentual()!=null) p.setPercentual(dto.percentual());
        if(dto.pontuacao()!=null) p.setPontuacao(dto.pontuacao());
        p.setUltimoAcesso(Instant.now());
        return toDTO(repo.save(p));
    }

    private ProgDTO toDTO(Progresso p){
        return new ProgDTO(p.getId(), p.getUsuario().getId(), p.getLicao().getId(),
                p.getStatus(), p.getPercentual(), p.getPontuacao());
    }
}
