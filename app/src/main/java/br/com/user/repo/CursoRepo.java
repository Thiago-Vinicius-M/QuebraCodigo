package br.com.user.repo;
import br.com.user.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CursoRepo extends JpaRepository<Curso, Long> {
    java.util.Optional<Curso> findByCodigo(String codigo);
}
