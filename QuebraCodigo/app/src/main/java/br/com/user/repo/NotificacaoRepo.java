package br.com.user.repo;
import br.com.user.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificacaoRepo extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findByUsuarioIdAndLidaFalse(Long usuarioId);
}
