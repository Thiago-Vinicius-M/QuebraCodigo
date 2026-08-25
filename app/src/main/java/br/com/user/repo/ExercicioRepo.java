package br.com.user.repo;
import br.com.user.model.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ExercicioRepo extends JpaRepository<Exercicio, Long> {
    List<Exercicio> findByAulaId(Long aulaId);
}
