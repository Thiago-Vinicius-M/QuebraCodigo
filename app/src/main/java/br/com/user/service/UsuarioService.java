package br.com.user.service;

import br.com.user.model.Usuario;
import br.com.user.model.enums.Role;
import br.com.user.repo.UsuarioRepo;
import br.com.user.web.dto.SyncReq;
import br.com.user.web.dto.UsuarioDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepo repo;

    public UsuarioService(UsuarioRepo repo) {
        this.repo = repo;
    }

    public List<UsuarioDTO> listAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public UsuarioDTO sync(SyncReq req) {
        if (req.nome() == null || req.nome().isBlank()) {
            throw new IllegalArgumentException("nome obrigatório");
        }
        var u = repo.findByNome(req.nome()).orElseGet(() -> {
            var nu = new Usuario();
            nu.setNome(req.nome());
            nu.setRole(Role.USER);
            return nu;
        });
        if (req.pontos() != null && req.pontos() > u.getPontos()) {
            u.setPontos(req.pontos());
        }
        if (req.moedas() != null && req.moedas() > u.getMoedas()) {
            u.setMoedas(req.moedas());
        }
        return toDTO(repo.save(u));
    }

    public UsuarioDTO create(UsuarioDTO dto) {
        var u = new Usuario();
        u.setNome(dto.nome());
        u.setEmail(dto.email());
        u.setRole(dto.role() == null ? Role.USER : dto.role());
        u.setPontos(dto.pontos());
        u.setMoedas(dto.moedas());
        return toDTO(repo.save(u));
    }

    public UsuarioDTO update(Long id, UsuarioDTO dto) {
        var u = repo.findById(id).orElseThrow();
        u.setNome(dto.nome());
        u.setEmail(dto.email());
        if (dto.role() != null) {
            u.setRole(dto.role());
        }
        u.setPontos(dto.pontos());
        u.setMoedas(dto.moedas());
        return toDTO(repo.save(u));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    private UsuarioDTO toDTO(Usuario u) {
        return new UsuarioDTO(u.getId(), u.getNome(), u.getEmail(), u.getRole(), u.getPontos(), u.getMoedas());
    }
}
