CREATE TABLE IF NOT EXISTS pontuacao (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT       NOT NULL,
    saldo           INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pontuacao_usuario UNIQUE (usuario_id),
    CONSTRAINT fk_pontuacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT,
    CONSTRAINT chk_pontuacao_saldo_nonneg CHECK (saldo >= 0)
);

CREATE TABLE IF NOT EXISTS pontuacao_historico (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT       NOT NULL,
    pontuacao_id    BIGINT       NOT NULL,
    quantidade      INTEGER      NOT NULL,
    motivo          VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_hist_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT,
    CONSTRAINT fk_hist_pontuacao FOREIGN KEY (pontuacao_id) REFERENCES pontuacao (id) ON DELETE RESTRICT,
    CONSTRAINT chk_hist_quantidade_pos CHECK (quantidade > 0)
);

INSERT INTO pontuacao (usuario_id, saldo, created_at, updated_at)
SELECT id, pontos, created_at, updated_at
FROM usuarios
ON CONFLICT (usuario_id) DO NOTHING;
