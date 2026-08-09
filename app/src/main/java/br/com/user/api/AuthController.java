package br.com.user.api;

import br.com.user.model.Usuario;
import br.com.user.repo.UsuarioRepo;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Locale;
import java.util.Map;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UsuarioRepo repo;
    private final JavaMailSender mailSender;
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();
    private final String appBaseUrl;

    public AuthController(UsuarioRepo repo,
                          JavaMailSender mailSender,
                          @Value("${app.base-url:http://localhost:8150}") String appBaseUrl) {
        this.repo = repo;
        this.mailSender = mailSender;
        this.appBaseUrl = appBaseUrl;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        Object username = session.getAttribute("username");
        if (userId == null || username == null || username.toString().isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "não autenticado"));
        }
        Usuario u = repo.findById(userId).orElse(null);
        if (u == null) {
            return ResponseEntity.status(401).body(Map.of("error", "não autenticado"));
        }
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getNome(),
                "email", u.getEmail() != null ? u.getEmail() : "",
                "primeiroNome", u.getPrimeiroNome() != null ? u.getPrimeiroNome() : "",
                "ultimoNome", u.getUltimoNome() != null ? u.getUltimoNome() : "",
                "dataNascimento", u.getDataNascimento() != null ? u.getDataNascimento().toString() : ""
        ));
    }

    public record ProfileUpdateReq(
            @JsonProperty("nome") @NotBlank @Size(min = 2, max = 64) String nome,
            @JsonProperty("email") @Size(max = 120) String email,
            @JsonProperty("novaSenha") @Size(min = 4) String novaSenha
    ) {}

    @PatchMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody @Valid ProfileUpdateReq req, HttpSession session, HttpServletResponse resp) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "não autenticado"));
        }
        Usuario u = repo.findById(userId).orElse(null);
        if (u == null) {
            return ResponseEntity.status(401).body(Map.of("error", "não autenticado"));
        }
        String novoNome = req.nome().trim();
        if (!u.getNome().equals(novoNome) && repo.findByNome(novoNome).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Este usuário já está em uso"));
        }
        u.setNome(novoNome);
        if (req.email() != null && !req.email().isBlank()) {
            String em = req.email().trim().toLowerCase(Locale.ROOT);
            Optional<Usuario> donoEmail = repo.findByEmailIgnoreCase(em);
            if (donoEmail.isPresent() && !donoEmail.get().getId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Este e-mail já está em uso"));
            }
            u.setEmail(em);
        } else {
            u.setEmail(null);
        }
        if (req.novaSenha() != null && !req.novaSenha().isBlank()) {
            u.setSenhaHash(PASSWORD_ENCODER.encode(req.novaSenha()));
        }
        repo.save(u);
        session.setAttribute("username", u.getNome());
        Cookie c = new Cookie("username", u.getNome());
        c.setHttpOnly(false);
        c.setPath("/");
        c.setMaxAge((int) Duration.ofDays(30).getSeconds());
        resp.addCookie(c);
        return ResponseEntity.ok(Map.of("id", u.getId(), "username", u.getNome()));
    }

    public record UsernameReq(@JsonProperty("username") @NotBlank String username) {}
    public record LoginReq(
            @JsonProperty("usuario") @NotBlank String usuario,
            @JsonProperty("senha") @NotBlank String senha
    ) {}
    public record RegisterReq(
            @JsonProperty("primeiroNome") @NotBlank @Size(max = 64) String primeiroNome,
            @JsonProperty("ultimoNome") @NotBlank @Size(max = 64) String ultimoNome,
            @JsonProperty("email") @NotBlank @Email @Size(max = 120) String email,
            @JsonProperty("dataNascimento") @NotBlank String dataNascimento,
            @JsonProperty("usuario") @NotBlank @Size(min = 2, max = 64) String usuario,
            @JsonProperty("senha") @NotBlank @Size(min = 4) String senha
    ) {}
    public record ForgotPasswordReq(
            @JsonProperty("email") @NotBlank @Email @Size(max = 120) String email
    ) {}
    public record ResetPasswordReq(
            @JsonProperty("token") @NotBlank String token,
            @JsonProperty("novaSenha") @NotBlank @Size(min = 4) String novaSenha
    ) {}

    @PostMapping("/username")
    public ResponseEntity<?> setUsername(@RequestBody @Valid UsernameReq req, HttpSession session, HttpServletResponse resp) {
        String nome = req.username().trim();
        if (nome.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "username obrigatório"));
        }

        Usuario u = repo.findByNome(nome).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setNome(nome);
            novo.setEmail(nome.toLowerCase() + "@example.local");
            return repo.save(novo);
        });

        session.setAttribute("username", u.getNome());
        session.setAttribute("userId", u.getId());

        Cookie c = new Cookie("username", u.getNome());
        c.setHttpOnly(false);
        c.setPath("/");
        c.setMaxAge((int) Duration.ofDays(30).getSeconds());
        resp.addCookie(c);

        return ResponseEntity.ok(Map.of("id", u.getId(), "username", u.getNome()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginReq req, HttpSession session, HttpServletResponse resp) {
        String nome = req.usuario().trim();
        String senha = req.senha();

        if (nome.isEmpty() || senha.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuário e senha são obrigatórios"));
        }

        Usuario u = repo.findByNome(nome).orElse(null);
        if (u == null || u.getSenhaHash() == null || u.getSenhaHash().isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuário ou senha inválidos"));
        }

        if (!PASSWORD_ENCODER.matches(senha, u.getSenhaHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuário ou senha inválidos"));
        }

        session.setAttribute("username", u.getNome());
        session.setAttribute("userId", u.getId());
        u.setResetToken(null);
        u.setResetTokenExpiraEm(null);
        repo.save(u);

        Cookie c = new Cookie("username", u.getNome());
        c.setHttpOnly(false);
        c.setPath("/");
        c.setMaxAge((int) Duration.ofDays(30).getSeconds());
        resp.addCookie(c);

        return ResponseEntity.ok(Map.of("id", u.getId(), "username", u.getNome()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordReq req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        Optional<Usuario> userOpt = repo.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            Usuario user = userOpt.get();
            String token = UUID.randomUUID().toString() + UUID.randomUUID().toString().replace("-", "");
            user.setResetToken(token);
            user.setResetTokenExpiraEm(LocalDateTime.now().plusMinutes(30));
            repo.save(user);

            String link = appBaseUrl + "/reset-password.html?token=" + token;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Recuperacao de senha - QuebraCodigo");
            message.setText(
                    "Ola, " + user.getNome() + "!\n\n" +
                    "Recebemos uma solicitacao para redefinir sua senha.\n" +
                    "Clique no link abaixo para criar uma nova senha:\n\n" +
                    link + "\n\n" +
                    "Este link expira em 30 minutos.\n" +
                    "Se voce nao solicitou a troca, ignore este e-mail."
            );
            try {
                mailSender.send(message);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of(
                        "error", "Nao foi possivel enviar o e-mail de recuperacao no momento."
                ));
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Se o e-mail estiver cadastrado, voce recebera as instrucoes de recuperacao."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordReq req) {
        String token = req.token().trim();
        Optional<Usuario> userOpt = repo.findByResetToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token de recuperacao invalido."));
        }

        Usuario user = userOpt.get();
        if (user.getResetTokenExpiraEm() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiraEm())) {
            user.setResetToken(null);
            user.setResetTokenExpiraEm(null);
            repo.save(user);
            return ResponseEntity.badRequest().body(Map.of("error", "Token expirado. Solicite uma nova recuperacao."));
        }

        user.setSenhaHash(PASSWORD_ENCODER.encode(req.novaSenha()));
        user.setResetToken(null);
        user.setResetTokenExpiraEm(null);
        repo.save(user);

        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterReq req, HttpSession session, HttpServletResponse resp) {
        String nome = req.usuario().trim();
        String emailNorm = req.email().trim().toLowerCase(Locale.ROOT);
        String senha = req.senha();

        if (repo.findByNome(nome).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Este usuário já está em uso"));
        }
        if (repo.findByEmailIgnoreCase(emailNorm).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Este e-mail já está cadastrado"));
        }

        LocalDate nascimento;
        try {
            var fmt = DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(ResolverStyle.STRICT);
            nascimento = LocalDate.parse(req.dataNascimento().trim(), fmt);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Data de nascimento inválida. Use dd/mm/aaaa."));
        }

        Usuario novo = new Usuario();
        novo.setNome(nome);
        novo.setPrimeiroNome(req.primeiroNome().trim());
        novo.setUltimoNome(req.ultimoNome().trim());
        novo.setEmail(emailNorm);
        novo.setDataNascimento(nascimento);
        novo.setSenhaHash(PASSWORD_ENCODER.encode(senha));

        novo = repo.save(novo);

        session.setAttribute("username", novo.getNome());
        session.setAttribute("userId", novo.getId());

        Cookie c = new Cookie("username", novo.getNome());
        c.setHttpOnly(false);
        c.setPath("/");
        c.setMaxAge((int) Duration.ofDays(30).getSeconds());
        resp.addCookie(c);

        return ResponseEntity.ok(Map.of("id", novo.getId(), "username", novo.getNome()));
    }

    /** Invalida a sessão HTTP e remove o cookie de username. */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, HttpServletResponse resp) {
        if (session != null) {
            try {
                session.invalidate();
            } catch (IllegalStateException ignored) {
                // já invalidada
            }
        }
        Cookie c = new Cookie("username", "");
        c.setPath("/");
        c.setMaxAge(0);
        resp.addCookie(c);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}