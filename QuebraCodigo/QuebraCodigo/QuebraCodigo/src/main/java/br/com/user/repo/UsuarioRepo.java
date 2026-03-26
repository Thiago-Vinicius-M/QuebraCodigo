package br.com.user.repo;
import br.com.user.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UsuarioRepo extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByNome(String nome);

    Optional<Usuario> findByEmailIgnoreCase(String email);

    List<Usuario> findTop50ByOrderByPontosDesc();
}