package br.com.user.support;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.util.StreamUtils;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@SpringBootTest
@ActiveProfiles("test")
public abstract class AbstractPostgresIntegrationTest {

    private static final String LOCAL_URL = "jdbc:postgresql://localhost:5432/quebra_codigo?currentSchema=app";
    private static final String LOCAL_USER = "qc_user";
    private static final String LOCAL_PASSWORD = "qc_pass";

    private static final PostgreSQLContainer<?> POSTGRES;
    private static final boolean USING_TESTCONTAINERS;
    private static final String UNAVAILABLE_REASON;

    static {
        PostgreSQLContainer<?> container = null;
        String unavailable = null;
        boolean dockerAvailable = false;

        try {
            dockerAvailable = DockerClientFactory.instance().isDockerAvailable();
        } catch (RuntimeException ignored) {
            dockerAvailable = false;
        }

        if (dockerAvailable) {
            try {
                container = new PostgreSQLContainer<>("postgres:14-alpine")
                        .withDatabaseName("quebra_codigo")
                        .withUsername("qc_user")
                        .withPassword("qc_pass")
                        .withInitScript("test-init.sql");
                container.start();
            } catch (RuntimeException ex) {
                unavailable = "Docker disponível, mas o container PostgreSQL não iniciou: " + ex.getMessage();
                container = null;
            }
        } else {
            try {
                ensureLocalPontuacaoSchema();
            } catch (Exception ex) {
                unavailable = "Docker indisponível e PostgreSQL local inacessível (" + LOCAL_URL + "): " + ex.getMessage();
            }
        }

        POSTGRES = container;
        USING_TESTCONTAINERS = container != null;
        UNAVAILABLE_REASON = unavailable;
    }

    @BeforeAll
    static void requirePostgres() {
        Assumptions.assumeTrue(
                UNAVAILABLE_REASON == null,
                () -> "Testes de integração ignorados: " + UNAVAILABLE_REASON
                        + ". Suba o Docker Desktop ou o PostgreSQL local (quebra_codigo / qc_user)."
        );
    }

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        if (USING_TESTCONTAINERS) {
            registry.add("spring.datasource.url",
                    () -> POSTGRES.getJdbcUrl() + "?currentSchema=app");
            registry.add("spring.datasource.username", POSTGRES::getUsername);
            registry.add("spring.datasource.password", POSTGRES::getPassword);
            return;
        }

        registry.add("spring.datasource.url", () -> envOrDefault("TEST_DATASOURCE_URL", LOCAL_URL));
        registry.add("spring.datasource.username", () -> envOrDefault("TEST_DATASOURCE_USERNAME", LOCAL_USER));
        registry.add("spring.datasource.password", () -> envOrDefault("TEST_DATASOURCE_PASSWORD", LOCAL_PASSWORD));
    }

    private static void ensureLocalPontuacaoSchema() throws Exception {
        try (Connection connection = DriverManager.getConnection(LOCAL_URL, LOCAL_USER, LOCAL_PASSWORD)) {
            if (!tableExists(connection, "pontuacao")) {
                runMigration(connection, "db/migration/V2__create_pontuacao.sql");
            }
            if (tableExists(connection, "pontuacao_historico") && !columnExists(connection, "pontuacao_historico", "updated_at")) {
                runMigration(connection, "db/migration/V3__add_updated_at_pontuacao_historico.sql");
            }
        }
    }

    private static void runMigration(Connection connection, String classpathLocation) throws Exception {
        String migration = StreamUtils.copyToString(
                new ClassPathResource(classpathLocation).getInputStream(),
                StandardCharsets.UTF_8
        );

        try (Statement statement = connection.createStatement()) {
            for (String sql : migration.split(";")) {
                String trimmed = sql.trim();
                if (!trimmed.isEmpty()) {
                    statement.execute(trimmed);
                }
            }
        }
    }

    private static boolean columnExists(Connection connection, String tableName, String columnName) throws Exception {
        try (ResultSet resultSet = connection.getMetaData().getColumns(null, "app", tableName, columnName)) {
            return resultSet.next();
        }
    }

    private static boolean tableExists(Connection connection, String tableName) throws Exception {
        try (ResultSet resultSet = connection.getMetaData().getTables(null, "app", tableName, new String[]{"TABLE"})) {
            return resultSet.next();
        }
    }

    private static String envOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
