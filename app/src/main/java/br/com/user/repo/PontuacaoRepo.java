package br.com.user.repo;

import br.com.user.model.Pontuacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PontuacaoRepo extends JpaRepository<Pontuacao, Long> {

    Optional<Pontuacao> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM Pontuacao p JOIN FETCH p.usuario ORDER BY p.saldo DESC, p.usuario.id ASC")
    List<Pontuacao> findAllByOrderBySaldoDescUsuarioIdAsc();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Pontuacao p SET p.saldo = p.saldo + :quantidade WHERE p.id = :id")
    int adicionarSaldo(@Param("id") Long id, @Param("quantidade") int quantidade);
}
