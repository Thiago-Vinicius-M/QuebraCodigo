# QuebraCodigo

Plataforma educacional desenvolvida para o TCC, com jogos interativos, trilhas de programacao e back-end em Spring Boot.

## Estrutura do repositorio

```text
QuebraCodigo/
├── app/                          # modulo principal (Spring Boot)
│   ├── pom.xml
│   ├── scripts/
│   └── src/
├── back-end/                     # modulo legado/apoio
├── web-games-spring/             # modulo legado/apoio
├── docs/
│   └── README-detalhado.md       # documentacao completa do produto
├── CONTRIBUTING.md               # padrao de colaboracao e commits
└── README.md                     # apresentacao principal do repositorio
```

## Como executar

1. Entre no modulo principal:

```bash
cd app
```

2. Execute a aplicacao:

```bash
mvn spring-boot:run
```

3. Acesse:

- `http://localhost:8150`

## Colaboracao do time

Use `CONTRIBUTING.md` para o fluxo de trabalho, padrao de commits e boas praticas.

## Documentacao detalhada

Os detalhes tecnicos (funcionalidades, APIs, stack e equipe) estao em `docs/README-detalhado.md`.
