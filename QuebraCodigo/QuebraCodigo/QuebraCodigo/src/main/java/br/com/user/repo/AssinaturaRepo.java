package br.com.user.repo;
import br.com.user.model.Assinatura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AssinaturaRepo extends JpaRepository<Assinatura, Long> {
    List<Assinatura> findByUsuarioId(Long usuarioId);
}
