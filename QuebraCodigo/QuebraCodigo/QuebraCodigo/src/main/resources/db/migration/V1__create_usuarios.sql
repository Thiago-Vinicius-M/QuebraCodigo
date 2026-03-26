-- Tabela no schema "app" (search_path definido pelo Flyway para este schema).
CREATE TABLE IF NOT EXISTS usuarios (
    id              BIGSERIAL PRIMARY KEY,
    nome            VARCHAR(64)  NOT NULL,
    email           VARCHAR(120),
    primeiro_nome   VARCHAR(64),
    ultimo_nome     VARCHAR(64),
    data_nascimento DATE,
    senha_hash      VARCHAR(120),
    user_role       VARCHAR(32)  NOT NULL DEFAULT 'USER',
    pontos          INTEGER      NOT NULL DEFAULT 0,
    moedas          INTEGER      NOT NULL DEFAULT 0,
    assinatura      VARCHAR(32)  NOT NULL DEFAULT 'NONE',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuarios_nome UNIQUE (nome),
    CONSTRAINT uq_usuarios_email UNIQUE (email)
);
