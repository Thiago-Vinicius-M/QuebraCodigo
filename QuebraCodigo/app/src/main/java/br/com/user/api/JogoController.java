package br.com.user.api;

import br.com.user.model.Jogo;
import br.com.user.model.enums.GameType;
import br.com.user.repo.JogoRepo;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/jogos")
public class JogoController {
    private final JogoRepo repo;
    public JogoController(JogoRepo repo){ this.repo=repo; }

    public record JogoDTO(Long id, String nome, String slug, GameType tipo, String urlPath){}

    @GetMapping public List<JogoDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }

    @PostMapping public JogoDTO create(@Valid @RequestBody JogoDTO dto){
        var j = new Jogo(); j.setNome(dto.nome()); j.setSlug(dto.slug());
        j.setTipo(dto.tipo()==null?GameType.QUIZ:dto.tipo()); j.setUrlPath(dto.urlPath());
        return toDTO(repo.save(j));
    }
    @PutMapping("/{id}") public JogoDTO update(@PathVariable Long id, @Valid @RequestBody JogoDTO dto){
        var j = repo.findById(id).orElseThrow();
        if(dto.nome()!=null) j.setNome(dto.nome());
        if(dto.slug()!=null) j.setSlug(dto.slug());
        if(dto.tipo()!=null) j.setTipo(dto.tipo());
        j.setUrlPath(dto.urlPath());
        return toDTO(repo.save(j));
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ repo.deleteById(id); }

    private JogoDTO toDTO(Jogo j){
        return new JogoDTO(j.getId(), j.getNome(), j.getSlug(), j.getTipo(), j.getUrlPath());
    }
}
