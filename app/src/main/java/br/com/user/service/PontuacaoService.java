package br.com.user.service;

import br.com.user.model.Pontuacao;
import br.com.user.model.PontuacaoHistorico;
import br.com.user.model.Usuario;
import br.com.user.repo.PontuacaoHistoricoRepo;
import br.com.user.repo.PontuacaoRepo;
import br.com.user.repo.UsuarioRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PontuacaoService {

    private final PontuacaoRepo pontuacaoRepo;
    private final PontuacaoHistoricoRepo historicoRepo;
    private final UsuarioRepo usuarioRepo;

    public PontuacaoService(
            PontuacaoRepo pontuacaoRepo,
            PontuacaoHistoricoRepo historicoRepo,
            UsuarioRepo usuarioRepo
    ) {
        this.pontuacaoRepo = pontuacaoRepo;
        this.historicoRepo = historicoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @Transactional
    public Pontuacao criarParaUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(usuarioId));

        if (pontuacaoRepo.existsByUsuarioId(usuarioId)) {
            return pontuacaoRepo.findByUsuarioId(usuarioId).orElseThrow();
        }

        Pontuacao pontuacao = new Pontuacao();
        pontuacao.setUsuario(usuario);
        pontuacao.setSaldo(0);
        return pontuacaoRepo.save(pontuacao);
    }

    @Transactional
    public Pontuacao adicionarPontos(Long usuarioId, int quantidade, String motivo) {
        if (quantidade <= 0) {
            throw new PontuacaoInvalidaException("Pontos negativos ou zero não são aceitos");
        }

        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(usuarioId));

        Pontuacao pontuacao = pontuacaoRepo.findByUsuarioId(usuarioId)
                .orElseGet(() -> criarParaUsuario(usuarioId));

        int atualizado = pontuacaoRepo.adicionarSaldo(pontuacao.getId(), quantidade);
        if (atualizado == 0) {
            throw new IllegalStateException("Falha ao atualizar saldo de pontuação");
        }

        pontuacao = pontuacaoRepo.findById(pontuacao.getId()).orElseThrow();
        usuario.setPontos(pontuacao.getSaldo());
        usuarioRepo.save(usuario);

        PontuacaoHistorico historico = new PontuacaoHistorico();
        historico.setUsuario(usuario);
        historico.setPontuacao(pontuacao);
        historico.setQuantidade(quantidade);
        historico.setMotivo(motivo);
        historicoRepo.save(historico);

        return pontuacao;
    }

    @Transactional(readOnly = true)
    public int obterSaldo(Long usuarioId) {
        return pontuacaoRepo.findByUsuarioId(usuarioId)
                .map(Pontuacao::getSaldo)
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public List<Pontuacao> ranking() {
        return pontuacaoRepo.findAllByOrderBySaldoDescUsuarioIdAsc();
    }

    @Transactional(readOnly = true)
    public List<PontuacaoHistorico> historico(Long usuarioId) {
        return historicoRepo.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
    }
}
