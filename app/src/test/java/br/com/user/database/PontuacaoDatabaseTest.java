package br.com.user.database;

import br.com.user.support.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class PontuacaoDatabaseTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void deveExistirTabelaPontuacao() {
        int count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = 'app' AND table_name = 'pontuacao'
                """,
                Integer.class
        );
        assertThat(count).isEqualTo(1);
    }

    @Test
    void deveExistirTabelaHistorico() {
        int count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = 'app' AND table_name = 'pontuacao_historico'
                """,
                Integer.class
        );
        assertThat(count).isEqualTo(1);
    }

    @Test
    void pontuacao_deveTerCamposObrigatoriosChavePrimariaEstrangeiraEConstraints() {
        List<Map<String, Object>> colunas = jdbcTemplate.queryForList(
                """
                SELECT column_name, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'app' AND table_name = 'pontuacao'
                ORDER BY column_name
                """
        );

        assertThat(colunas).extracting(row -> row.get("column_name"))
                .contains("id", "usuario_id", "saldo", "created_at", "updated_at");

        assertThat(colunas.stream()
                .filter(row -> "NO".equals(row.get("is_nullable")))
                .map(row -> row.get("column_name"))
                .toList()).contains("usuario_id", "saldo");

        assertThat(constraintExiste("pontuacao_pkey")).isTrue();
        assertThat(constraintExiste("uq_pontuacao_usuario")).isTrue();
        assertThat(constraintExiste("fk_pontuacao_usuario")).isTrue();
        assertThat(constraintExiste("chk_pontuacao_saldo_nonneg")).isTrue();
    }

    @Test
    void historico_deveTerCamposObrigatoriosChavePrimariaEstrangeiras() {
        List<Map<String, Object>> colunas = jdbcTemplate.queryForList(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'app' AND table_name = 'pontuacao_historico'
                ORDER BY column_name
                """
        );

        assertThat(colunas).extracting(row -> row.get("column_name"))
                .contains("id", "usuario_id", "pontuacao_id", "quantidade", "motivo", "created_at");

        assertThat(constraintExiste("pontuacao_historico_pkey")).isTrue();
        assertThat(constraintExiste("fk_hist_usuario")).isTrue();
        assertThat(constraintExiste("fk_hist_pontuacao")).isTrue();
        assertThat(constraintExiste("chk_hist_quantidade_pos")).isTrue();
    }

    @Test
    void usuarioDevePossuirRegistroDePontuacao_aposCriacaoPeloServico() {
        Long usuarioId = jdbcTemplate.queryForObject(
                "INSERT INTO app.usuarios (nome) VALUES ('db_test_user') RETURNING id",
                Long.class
        );

        jdbcTemplate.update(
                "INSERT INTO app.pontuacao (usuario_id, saldo) VALUES (?, 0)",
                usuarioId
        );

        Integer registros = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app.pontuacao WHERE usuario_id = ?",
                Integer.class,
                usuarioId
        );

        assertThat(registros).isEqualTo(1);
    }

    @Test
    void naoDeveExistirPontuacaoSemUsuarioAssociado() {
        Integer violacoes = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM app.pontuacao p
                LEFT JOIN app.usuarios u ON u.id = p.usuario_id
                WHERE u.id IS NULL
                """,
                Integer.class
        );

        assertThat(violacoes).isZero();
    }

    private boolean constraintExiste(String nome) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.table_constraints
                WHERE table_schema = 'app' AND constraint_name = ?
                """,
                Integer.class,
                nome
        );
        return count != null && count > 0;
    }
}
