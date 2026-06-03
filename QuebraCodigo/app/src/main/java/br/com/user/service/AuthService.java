package br.com.user.service;

import br.com.user.model.Usuario;
import br.com.user.repo.UsuarioRepo;
import br.com.user.web.dto.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepo repo;
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    public AuthService(UsuarioRepo repo) {
        this.repo = repo;
    }

    public Optional<MeDto> getMe(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return repo.findById(userId).map(this::toMeDto);
    }

    public AuthProfileResult updateProfile(Long userId, ProfileUpdateReq req) {
        if (userId == null) {
            return new AuthProfileResult.Unauthenticated();
        }
        Usuario u = repo.findById(userId).orElse(null);
        if (u == null) {
            return new AuthProfileResult.Unauthenticated();
        }
        String novoNome = req.nome().trim();
        if (!u.getNome().equals(novoNome) && repo.findByNome(novoNome).isPresent()) {
            return new AuthProfileResult.BadRequest("Este usuário já está em uso");
        }
        u.setNome(novoNome);
        if (req.email() != null && !req.email().isBlank()) {
            String em = req.email().trim().toLowerCase(Locale.ROOT);
            Optional<Usuario> donoEmail = repo.findByEmailIgnoreCase(em);
            if (donoEmail.isPresent() && !donoEmail.get().getId().equals(userId)) {
                return new AuthProfileResult.BadRequest("Este e-mail já está em uso");
            }
            u.setEmail(em);
        } else {
            u.setEmail(null);
        }
        if (req.novaSenha() != null && !req.novaSenha().isBlank()) {
            u.setSenhaHash(PASSWORD_ENCODER.encode(req.novaSenha()));
        }
        repo.save(u);
        return new AuthProfileResult.Ok(u);
    }

    public AuthSetUsernameResult setUsername(String nome) {
        if (nome.isEmpty()) {
            return new AuthSetUsernameResult.BadRequest("username obrigatório");
        }
        Usuario u = repo.findByNome(nome).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setNome(nome);
            novo.setEmail(nome.toLowerCase() + "@example.local");
            return repo.save(novo);
        });
        return new AuthSetUsernameResult.Success(u);
    }

    public AuthLoginResult login(String usuario, String senha) {
        String nome = usuario.trim();
        if (nome.isEmpty() || senha.isEmpty()) {
            return new AuthLoginResult.BadRequest("Usuário e senha são obrigatórios");
        }
        Usuario u = repo.findByNome(nome).orElse(null);
        if (u == null || u.getSenhaHash() == null || u.getSenhaHash().isBlank()) {
            return new AuthLoginResult.Unauthorized("Usuário ou senha inválidos");
        }
        if (!PASSWORD_ENCODER.matches(senha, u.getSenhaHash())) {
            return new AuthLoginResult.Unauthorized("Usuário ou senha inválidos");
        }
        return new AuthLoginResult.Success(u);
    }

    public AuthRegisterResult register(RegisterReq req) {
        String nome = req.usuario().trim();
        String emailNorm = req.email().trim().toLowerCase(Locale.ROOT);
        String senha = req.senha();

        if (repo.findByNome(nome).isPresent()) {
            return new AuthRegisterResult.BadRequest("Este usuário já está em uso");
        }
        if (repo.findByEmailIgnoreCase(emailNorm).isPresent()) {
            return new AuthRegisterResult.BadRequest("Este e-mail já está cadastrado");
        }

        LocalDate nascimento;
        try {
            var fmt = DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(ResolverStyle.STRICT);
            nascimento = LocalDate.parse(req.dataNascimento().trim(), fmt);
        } catch (DateTimeParseException e) {
            return new AuthRegisterResult.BadRequest("Data de nascimento inválida. Use dd/mm/aaaa.");
        }

        Usuario novo = new Usuario();
        novo.setNome(nome);
        novo.setPrimeiroNome(req.primeiroNome().trim());
        novo.setUltimoNome(req.ultimoNome().trim());
        novo.setEmail(emailNorm);
        novo.setDataNascimento(nascimento);
        novo.setSenhaHash(PASSWORD_ENCODER.encode(senha));

        novo = repo.save(novo);
        return new AuthRegisterResult.Success(novo);
    }

    private MeDto toMeDto(Usuario u) {
        return new MeDto(
                u.getId(),
                u.getNome(),
                u.getEmail() != null ? u.getEmail() : "",
                u.getPrimeiroNome() != null ? u.getPrimeiroNome() : "",
                u.getUltimoNome() != null ? u.getUltimoNome() : "",
                u.getDataNascimento() != null ? u.getDataNascimento().toString() : ""
        );
    }
}
