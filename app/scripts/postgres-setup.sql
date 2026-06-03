-- =============================================================================
-- Execute no DBeaver (ou psql) conectado como usuario POSTGRES (superusuario).
-- Selecione o banco: quebra_codigo
-- =============================================================================
--
-- PostgreSQL 15+ revogou CREATE no schema "public" para usuarios comuns.
-- Por isso o projeto usa o schema "app", com DONO = qc_user: o Flyway e o
-- Hibernate podem criar tabelas sem "permission denied for schema public".
--
-- Rode UMA VEZ por banco de dados. Depois suba o Spring normalmente.
-- =============================================================================

-- Garante login no banco
GRANT CONNECT ON DATABASE quebra_codigo TO qc_user;

-- Schema dedicado da aplicacao: qc_user e dono e pode criar tabelas
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION qc_user;

-- (Opcional) Se preferir continuar no public em vez do schema app, comente o
-- bloco acima e use no PostgreSQL 15+:
-- GRANT USAGE, CREATE ON SCHEMA public TO qc_user;
