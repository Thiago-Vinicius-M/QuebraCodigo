package br.com.user.repo;
import br.com.user.model.Licao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface LicaoRepo extends JpaRepository<Licao, Long> {
    List<Licao> findByCursoIdOrderByOrdemAsc(Long cursoId);
}
