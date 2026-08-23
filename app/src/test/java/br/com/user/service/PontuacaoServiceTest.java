package br.com.user.service;

import br.com.user.model.Pontuacao;
import br.com.user.model.PontuacaoHistorico;
import br.com.user.model.Usuario;
import br.com.user.repo.PontuacaoHistoricoRepo;
import br.com.user.repo.PontuacaoRepo;
import br.com.user.repo.UsuarioRepo;
import br.com.user.support.AbstractPostgresIntegrationTest;
import br.com.user.support.PontuacaoTestFixtures;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PontuacaoServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private PontuacaoService pontuacaoService;

    @Autowired
    private PontuacaoRepo pontuacaoRepo;

    @Autowired
    private PontuacaoHistoricoRepo historicoRepo;

    @Autowired
    private UsuarioRepo usuarioRepo;

    @AfterEach
    void limparDados() {
        historicoRepo.deleteAll();
        pontuacaoRepo.deleteAll();
        usuarioRepo.deleteAll();
    }

    @Test
    void deveCriarPontuacaoParaUsuario() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_user_1");

        Pontuacao pontuacao = pontuacaoService.criarParaUsuario(usuario.getId());

        assertThat(pontuacao.getId()).isNotNull();
        assertThat(pontuacao.getSaldo()).isZero();
        assertThat(pontuacao.getUsuario().getId()).isEqualTo(usuario.getId());
    }

    @Test
    void deveAdicionarPontosPositivos() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_user_2");
        pontuacaoService.criarParaUsuario(usuario.getId());

        Pontuacao resultado = pontuacaoService.adicionarPontos(usuario.getId(), 50, "Completou desafio");

        assertThat(resultado.getSaldo()).isEqualTo(50);
        assertThat(pontuacaoService.obterSaldo(usuario.getId())).isEqualTo(50);

        Usuario atualizado = usuarioRepo.findById(usuario.getId()).orElseThrow();
        assertThat(atualizado.getPontos()).isEqualTo(50);
    }

    @Test
    void deveRejeitarPontosNegativos() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_user_3");
        pontuacaoService.criarParaUsuario(usuario.getId());

        assertThatThrownBy(() -> pontuacaoService.adicionarPontos(usuario.getId(), -20, "Tentativa inválida"))
                .isInstanceOf(PontuacaoInvalidaException.class);

        assertThat(pontuacaoService.obterSaldo(usuario.getId())).isZero();
    }

    @Test
    void deveRejeitarPontosParaUsuarioInexistente() {
        assertThatThrownBy(() -> pontuacaoService.adicionarPontos(999_999L, 10, "Usuário fantasma"))
                .isInstanceOf(UsuarioNaoEncontradoException.class);
    }

    @Test
    void deveAtualizarSaldoCorretamente() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_user_4");
        pontuacaoService.criarParaUsuario(usuario.getId());
        pontuacaoService.adicionarPontos(usuario.getId(), 100, "Saldo inicial");

        pontuacaoService.adicionarPontos(usuario.getId(), 30, "Bônus de trilha");

        assertThat(pontuacaoService.obterSaldo(usuario.getId())).isEqualTo(130);
    }

    @Test
    void devePersistirAtualizacaoAposCommit() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_user_5");
        pontuacaoService.criarParaUsuario(usuario.getId());
        pontuacaoService.adicionarPontos(usuario.getId(), 75, "Jogo concluído");

        Pontuacao recarregada = pontuacaoRepo.findByUsuarioId(usuario.getId()).orElseThrow();
        assertThat(recarregada.getSaldo()).isEqualTo(75);
    }

    @Test
    void deveRegistrarHistoricoComMotivoDataEUsuario() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_user_6");
        pontuacaoService.criarParaUsuario(usuario.getId());

        pontuacaoService.adicionarPontos(usuario.getId(), 40, "Completou desafio");

        List<PontuacaoHistorico> historico = pontuacaoService.historico(usuario.getId());
        assertThat(historico).hasSize(1);
        assertThat(historico.getFirst().getQuantidade()).isEqualTo(40);
        assertThat(historico.getFirst().getMotivo()).isEqualTo("Completou desafio");
        assertThat(historico.getFirst().getUsuario().getId()).isEqualTo(usuario.getId());
        assertThat(historico.getFirst().getCreatedAt()).isNotNull();
    }

    @Test
    void ranking_deveOrdenarPorMaiorPontuacaoPrimeiro() {
        Usuario usuarioA = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "ranking_a");
        Usuario usuarioB = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "ranking_b");

        pontuacaoService.criarParaUsuario(usuarioA.getId());
        pontuacaoService.criarParaUsuario(usuarioB.getId());
        pontuacaoService.adicionarPontos(usuarioA.getId(), 500, "Desafio A");
        pontuacaoService.adicionarPontos(usuarioB.getId(), 300, "Desafio B");

        List<Pontuacao> ranking = pontuacaoService.ranking()
                .stream()
                .filter(p -> List.of(usuarioA.getId(), usuarioB.getId()).contains(p.getUsuario().getId()))
                .toList();

        assertThat(ranking).hasSize(2);
        assertThat(ranking.get(0).getUsuario().getNome()).isEqualTo("ranking_a");
        assertThat(ranking.get(1).getUsuario().getNome()).isEqualTo("ranking_b");
    }

    @Test
    void ranking_deveTratarEmpatesPorIdDoUsuario() {
        Usuario usuarioA = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "empate_a");
        Usuario usuarioB = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "empate_b");

        pontuacaoService.criarParaUsuario(usuarioA.getId());
        pontuacaoService.criarParaUsuario(usuarioB.getId());
        pontuacaoService.adicionarPontos(usuarioA.getId(), 200, "Empate");
        pontuacaoService.adicionarPontos(usuarioB.getId(), 200, "Empate");

        List<Pontuacao> ranking = pontuacaoService.ranking()
                .stream()
                .filter(p -> List.of(usuarioA.getId(), usuarioB.getId()).contains(p.getUsuario().getId()))
                .toList();

        assertThat(ranking).hasSize(2);
        assertThat(ranking.get(0).getSaldo()).isEqualTo(200);
        assertThat(ranking.get(1).getSaldo()).isEqualTo(200);
        assertThat(ranking.get(0).getUsuario().getId()).isLessThan(ranking.get(1).getUsuario().getId());
    }

    @Test
    void integridade_naoDeveExcluirUsuarioComPontuacao() {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_user_7");
        pontuacaoService.criarParaUsuario(usuario.getId());
        pontuacaoService.adicionarPontos(usuario.getId(), 10, "Pontos iniciais");

        assertThatThrownBy(() -> {
            usuarioRepo.delete(usuario);
            usuarioRepo.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void concorrencia_multiplasAtualizacoesDevemManterSaldoCorreto() throws Exception {
        Usuario usuario = PontuacaoTestFixtures.criarUsuario(usuarioRepo, "svc_concorrencia");
        pontuacaoService.criarParaUsuario(usuario.getId());

        ExecutorService executor = Executors.newFixedThreadPool(5);
        List<Callable<Pontuacao>> tarefas = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            tarefas.add(() -> pontuacaoService.adicionarPontos(usuario.getId(), 10, "Concorrência"));
        }

        List<Future<Pontuacao>> resultados = executor.invokeAll(tarefas);
        executor.shutdown();

        for (Future<Pontuacao> resultado : resultados) {
            assertThat(resultado.get().getSaldo()).isGreaterThan(0);
        }

        assertThat(pontuacaoService.obterSaldo(usuario.getId())).isEqualTo(100);
        assertThat(pontuacaoService.historico(usuario.getId())).hasSize(10);
    }
}
