package br.com.user.api;

import br.com.user.model.Usuario;
import br.com.user.model.enums.Role;
import br.com.user.repo.UsuarioRepo;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioRepo repo;
    public UsuarioController(UsuarioRepo repo){ this.repo = repo; }

    public record UsuarioDTO(Long id, String nome, String email, Role role, int pontos, int moedas){}

    // Lista geral
    @GetMapping public List<UsuarioDTO> list(){
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    // Cria ou atualiza (sync) por nome — usado pelos jogos na primeira conexão
    public record SyncReq(String nome, Integer pontos, Integer moedas){}
    @PostMapping("/sync")
    public UsuarioDTO sync(@RequestBody @Valid SyncReq req){
        if(req.nome()==null || req.nome().isBlank()) throw new IllegalArgumentException("nome obrigatório");
        var u = repo.findByNome(req.nome()).orElseGet(()->{
            var nu = new Usuario(); nu.setNome(req.nome()); nu.setRole(Role.USER); return nu;
        });
        if(req.pontos()!=null && req.pontos()>u.getPontos()) u.setPontos(req.pontos()); // mantém o maior
        if(req.moedas()!=null && req.moedas()>u.getMoedas()) u.setMoedas(req.moedas());
        return toDTO(repo.save(u));
    }

    // CRUD básico
    @PostMapping public UsuarioDTO create(@Valid @RequestBody UsuarioDTO dto){
        var u = new Usuario();
        u.setNome(dto.nome()); u.setEmail(dto.email());
        u.setRole(dto.role()==null?Role.USER:dto.role());
        u.setPontos(dto.pontos()); u.setMoedas(dto.moedas());
        return toDTO(repo.save(u));
    }

    @PutMapping("/{id}") public UsuarioDTO update(@PathVariable Long id, @Valid @RequestBody UsuarioDTO dto){
        var u = repo.findById(id).orElseThrow();
        u.setNome(dto.nome()); u.setEmail(dto.email());
        if(dto.role()!=null) u.setRole(dto.role());
        u.setPontos(dto.pontos()); u.setMoedas(dto.moedas());
        return toDTO(repo.save(u));
    }

    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ repo.deleteById(id); }

    private UsuarioDTO toDTO(Usuario u){
        return new UsuarioDTO(u.getId(), u.getNome(), u.getEmail(), u.getRole(), u.getPontos(), u.getMoedas());
    }
}
