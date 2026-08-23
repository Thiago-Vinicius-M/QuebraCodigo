package br.com.user.repo;

import br.com.user.model.PontuacaoHistorico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PontuacaoHistoricoRepo extends JpaRepository<PontuacaoHistorico, Long> {

    List<PontuacaoHistorico> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
}
