package br.com.user.api;

import br.com.user.model.Exercicio;
import br.com.user.model.Licao;
import br.com.user.model.Jogo;
import br.com.user.model.enums.Difficulty;
import br.com.user.model.enums.ExerciseType;
import br.com.user.repo.ExercicioRepo;
import br.com.user.repo.LicaoRepo;
import br.com.user.repo.JogoRepo;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/exercicios")
public class ExercicioController {
    private final ExercicioRepo repo; private final LicaoRepo licoes; private final JogoRepo jogos;
    public ExercicioController(ExercicioRepo repo, LicaoRepo licoes, JogoRepo jogos){ this.repo=repo; this.licoes=licoes; this.jogos=jogos; }

    public record ExDTO(Long id, Long licaoId, Long jogoId, ExerciseType tipo, Difficulty dificuldade, String enunciado, String dados, String respostaEsperada, Integer pontos){}

    @GetMapping public List<ExDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
    @GetMapping("/licao/{licaoId}") public List<ExDTO> byLicao(@PathVariable Long licaoId){ return repo.findByLicaoId(licaoId).stream().map(this::toDTO).toList(); }

    @PostMapping public ExDTO create(@Valid @RequestBody ExDTO dto){
        Licao l = licoes.findById(dto.licaoId()).orElseThrow();
        var e = new Exercicio(); e.setLicao(l); e.setTipo(dto.tipo()==null?ExerciseType.MULTIPLE_CHOICE:dto.tipo());
        e.setDificuldade(dto.dificuldade()==null?Difficulty.EASY:dto.dificuldade());
        e.setEnunciado(dto.enunciado()); e.setDados(dto.dados()); e.setRespostaEsperada(dto.respostaEsperada());
        e.setPontos(dto.pontos()==null?10:dto.pontos());
        if(dto.jogoId()!=null) e.setJogo(jogos.findById(dto.jogoId()).orElse(null));
        return toDTO(repo.save(e));
    }
    @PutMapping("/{id}") public ExDTO update(@PathVariable Long id, @Valid @RequestBody ExDTO dto){
        var e = repo.findById(id).orElseThrow();
        if(dto.licaoId()!=null) e.setLicao(licoes.findById(dto.licaoId()).orElseThrow());
        e.setJogo(dto.jogoId()==null?null:jogos.findById(dto.jogoId()).orElse(null));
        if(dto.tipo()!=null) e.setTipo(dto.tipo());
        if(dto.dificuldade()!=null) e.setDificuldade(dto.dificuldade());
        if(dto.enunciado()!=null) e.setEnunciado(dto.enunciado());
        e.setDados(dto.dados()); e.setRespostaEsperada(dto.respostaEsperada());
        if(dto.pontos()!=null) e.setPontos(dto.pontos());
        return toDTO(repo.save(e));
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ repo.deleteById(id); }

    private ExDTO toDTO(Exercicio e){
        return new ExDTO(e.getId(),
                e.getLicao()==null?null:e.getLicao().getId(),
                e.getJogo()==null?null:e.getJogo().getId(),
                e.getTipo(), e.getDificuldade(), e.getEnunciado(), e.getDados(), e.getRespostaEsperada(), e.getPontos());
    }
}
