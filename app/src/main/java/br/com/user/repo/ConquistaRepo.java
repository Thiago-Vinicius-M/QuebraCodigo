package br.com.user.repo;
import br.com.user.model.Conquista;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ConquistaRepo extends JpaRepository<Conquista, Long> {
    List<Conquista> findByUsuarioId(Long usuarioId);
    boolean existsByUsuarioIdAndCodigo(Long usuarioId, String codigo);
}
