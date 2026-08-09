package br.com.user.service;

import br.com.user.repo.PontuacaoHistoricoRepo;
import br.com.user.repo.PontuacaoRepo;
import br.com.user.repo.UsuarioRepo;
import br.com.user.support.AbstractPostgresIntegrationTest;
import br.com.user.web.dto.AuthLoginResult;
import br.com.user.web.dto.AuthRegisterResult;
import br.com.user.web.dto.RegisterReq;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Sprint 6 — regras de autenticação em JUnit.
 */
class AuthServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @Autowired
    private PontuacaoRepo pontuacaoRepo;

    @Autowired
    private PontuacaoHistoricoRepo historicoRepo;

    @AfterEach
    void limpar() {
        historicoRepo.deleteAll();
        pontuacaoRepo.deleteAll();
        usuarioRepo.deleteAll();
    }

    @Test
    void register_deveCriarUsuarioComSenhaHasheada() {
        RegisterReq req = new RegisterReq(
                "Ana", "Silva", "ana_" + System.nanoTime() + "@test.com",
                "12/08/2001", "ana_" + System.nanoTime(), "Senha123"
        );

        AuthRegisterResult result = authService.register(req);

        assertThat(result).isInstanceOf(AuthRegisterResult.Success.class);
        AuthRegisterResult.Success success = (AuthRegisterResult.Success) result;
        assertThat(success.usuario().getSenhaHash()).isNotBlank();
        assertThat(new BCryptPasswordEncoder().matches("Senha123", success.usuario().getSenhaHash())).isTrue();
    }

    @Test
    void register_usuarioDuplicadoDeveFalhar() {
        String nome = "dup_" + System.nanoTime();
        RegisterReq req = new RegisterReq(
                "Ana", "Silva", nome + "@test.com", "12/08/2001", nome, "Senha123"
        );
        authService.register(req);

        AuthRegisterResult second = authService.register(new RegisterReq(
                "Ana", "Silva", "outro_" + System.nanoTime() + "@test.com",
                "12/08/2001", nome, "Senha123"
        ));

        assertThat(second).isInstanceOf(AuthRegisterResult.BadRequest.class);
    }

    @Test
    void register_emailDuplicadoDeveFalhar() {
        String email = "email_" + System.nanoTime() + "@test.com";
        authService.register(new RegisterReq(
                "Ana", "Silva", email, "12/08/2001", "u1_" + System.nanoTime(), "Senha123"
        ));

        AuthRegisterResult second = authService.register(new RegisterReq(
                "Ana", "Silva", email, "12/08/2001", "u2_" + System.nanoTime(), "Senha123"
        ));

        assertThat(second).isInstanceOf(AuthRegisterResult.BadRequest.class);
    }

    @Test
    void register_dataInvalidaDeveFalhar() {
        AuthRegisterResult result = authService.register(new RegisterReq(
                "Ana", "Silva", "x_" + System.nanoTime() + "@test.com",
                "32/13/2000", "u_" + System.nanoTime(), "Senha123"
        ));

        assertThat(result).isInstanceOf(AuthRegisterResult.BadRequest.class);
    }

    @Test
    void login_credenciaisValidasDeveTerSucesso() {
        String nome = "login_" + System.nanoTime();
        authService.register(new RegisterReq(
                "Ana", "Silva", nome + "@test.com", "12/08/2001", nome, "Senha123"
        ));

        AuthLoginResult result = authService.login(nome, "Senha123");

        assertThat(result).isInstanceOf(AuthLoginResult.Success.class);
    }

    @Test
    void login_senhaIncorretaDeveFalhar() {
        String nome = "bad_" + System.nanoTime();
        authService.register(new RegisterReq(
                "Ana", "Silva", nome + "@test.com", "12/08/2001", nome, "Senha123"
        ));

        AuthLoginResult result = authService.login(nome, "errada");

        assertThat(result).isInstanceOf(AuthLoginResult.Unauthorized.class);
    }

    @Test
    void login_camposVaziosDeveSerBadRequest() {
        AuthLoginResult result = authService.login("  ", "");
        assertThat(result).isInstanceOf(AuthLoginResult.BadRequest.class);
    }
}
