package br.com.user.repository;

import br.com.user.model.Pontuacao;
import br.com.user.model.Usuario;
import br.com.user.repo.PontuacaoRepo;
import br.com.user.repo.UsuarioRepo;
import br.com.user.support.AbstractPostgresIntegrationTest;
import br.com.user.support.PontuacaoTestFixtures;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PontuacaoRepositoryTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private PontuacaoRepo pontuacaoRepo;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @AfterEach
    @Transactional
    void limparDados() {
        pontuacaoRepo.deleteAll();
        usuarioRepo.deleteAll();
    }

    @Test
    @Transactional
    void deveAdicionarPontosParaUsuarioExistente() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "repo_user_1");
        Pontuacao pontuacao = new Pontuacao();
        pontuacao.setUsuario(usuario);
        pontuacao.setSaldo(0);
        pontuacaoRepo.save(pontuacao);

        pontuacaoRepo.adicionarSaldo(pontuacao.getId(), 50);
        Pontuacao atualizada = pontuacaoRepo.findById(pontuacao.getId()).orElseThrow();

        assertThat(atualizada.getSaldo()).isEqualTo(50);
    }

    @Test
    @Transactional
    void deveValidarSomaCorretaDosPontos() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "repo_user_2");
        Pontuacao pontuacao = new Pontuacao();
        pontuacao.setUsuario(usuario);
        pontuacao.setSaldo(100);
        pontuacao = pontuacaoRepo.save(pontuacao);

        pontuacaoRepo.adicionarSaldo(pontuacao.getId(), 30);
        Pontuacao atualizada = pontuacaoRepo.findById(pontuacao.getId()).orElseThrow();

        assertThat(atualizada.getSaldo()).isEqualTo(130);
    }

    @Test
    void deveImpedirInsercaoParaUsuarioInexistente() {
        Usuario usuarioFantasma = usuarioRepo.getReferenceById(999_999L);

        Pontuacao pontuacao = new Pontuacao();
        pontuacao.setUsuario(usuarioFantasma);
        pontuacao.setSaldo(10);

        assertThatThrownBy(() -> pontuacaoRepo.saveAndFlush(pontuacao))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveRejeitarSaldoNegativoNoBanco() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "repo_user_3");
        Pontuacao pontuacao = new Pontuacao();
        pontuacao.setUsuario(usuario);
        pontuacao.setSaldo(-20);

        assertThatThrownBy(() -> pontuacaoRepo.saveAndFlush(pontuacao))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void naoDevePermitirPontuacaoDuplicadaParaMesmoUsuario() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "repo_user_4");

        Pontuacao primeira = new Pontuacao();
        primeira.setUsuario(usuario);
        primeira.setSaldo(10);
        pontuacaoRepo.saveAndFlush(primeira);

        Pontuacao duplicada = new Pontuacao();
        duplicada.setUsuario(usuario);
        duplicada.setSaldo(20);

        assertThatThrownBy(() -> pontuacaoRepo.saveAndFlush(duplicada))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveRejeitarValoresNulosObrigatorios() {
        Pontuacao pontuacao = new Pontuacao();
        pontuacao.setSaldo(10);

        assertThatThrownBy(() -> pontuacaoRepo.saveAndFlush(pontuacao))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
