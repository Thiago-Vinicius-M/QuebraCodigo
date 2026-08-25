package br.com.user.repo;
import br.com.user.model.Aula;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AulaRepo extends JpaRepository<Aula, Long> {
    List<Aula> findByCursoIdOrderByOrdemAsc(Long cursoId);
}
