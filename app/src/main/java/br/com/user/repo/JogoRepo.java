package br.com.user.repo;
import br.com.user.model.Jogo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface JogoRepo extends JpaRepository<Jogo, Long> {
    Optional<Jogo> findBySlug(String slug);
}
