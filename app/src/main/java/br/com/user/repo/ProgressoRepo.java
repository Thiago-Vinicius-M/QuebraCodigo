package br.com.user.repo;
import br.com.user.model.Progresso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ProgressoRepo extends JpaRepository<Progresso, Long> {
    Optional<Progresso> findByUsuarioIdAndLicaoId(Long usuarioId, Long licaoId);
    List<Progresso> findByUsuarioId(Long usuarioId);
}
