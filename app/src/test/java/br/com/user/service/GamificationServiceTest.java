package br.com.user.service;

import br.com.user.model.Usuario;
import br.com.user.repo.PontuacaoHistoricoRepo;
import br.com.user.repo.PontuacaoRepo;
import br.com.user.repo.UsuarioRepo;
import br.com.user.support.AbstractPostgresIntegrationTest;
import br.com.user.support.PontuacaoTestFixtures;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Sprint 7 — integração Gamification ↔ PontuacaoService.
 */
class GamificationServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private GamificationService gamificationService;

    @Autowired
    private PontuacaoService pontuacaoService;

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
    void award_deveRegistrarPontosEHistorico() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "gami_" + System.nanoTime());

        Usuario atualizado = gamificationService.award(Map.of(
                "nome", usuario.getNome(),
                "addPontos", 50,
                "addMoedas", 2,
                "motivo", "Completou Memory"
        ));

        assertThat(atualizado.getPontos()).isEqualTo(50);
        assertThat(atualizado.getMoedas()).isEqualTo(2);
        assertThat(pontuacaoService.obterSaldo(usuario.getId())).isEqualTo(50);
        assertThat(pontuacaoService.historico(usuario.getId())).hasSize(1);
        assertThat(pontuacaoService.historico(usuario.getId()).getFirst().getMotivo())
                .isEqualTo("Completou Memory");
    }

    @Test
    void award_pontosNegativosDevemSerRejeitados() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "neg_" + System.nanoTime());

        assertThatThrownBy(() -> gamificationService.award(Map.of(
                "nome", usuario.getNome(),
                "addPontos", -10,
                "addMoedas", 0
        ))).isInstanceOf(PontuacaoInvalidaException.class);
    }

    @Test
    void ranking_deveUsarSaldoDePontuacao() {
        Usuario a = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "rankA_" + System.nanoTime());
        Usuario b = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "rankB_" + System.nanoTime());

        gamificationService.award(Map.of("nome", a.getNome(), "addPontos", 500, "addMoedas", 0));
        gamificationService.award(Map.of("nome", b.getNome(), "addPontos", 100, "addMoedas", 0));

        var ranking = gamificationService.rankingTop50();
        assertThat(ranking.getFirst().getNome()).isEqualTo(a.getNome());
    }
}
