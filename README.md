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

## Pre-requisitos

Cada maquina que for rodar o projeto precisa ter:

- **Java 21** (JDK)
- **Maven 3.9+**
- **PostgreSQL 14+** rodando em `localhost:5432`

## Setup do banco de dados (uma vez por maquina)

A aplicacao espera o banco `quebra_codigo`, o usuario `qc_user` (senha `qc_pass`)
e o schema `app` com `qc_user` como dono. Faca o setup antes do primeiro
`mvn spring-boot:run`:

1. Conecte-se ao PostgreSQL como o superusuario `postgres` (via psql, DBeaver
   ou pgAdmin) e crie o usuario e o banco:

```sql
CREATE ROLE qc_user LOGIN PASSWORD 'qc_pass';
CREATE DATABASE quebra_codigo OWNER qc_user;
```

2. Conecte-se ao banco `quebra_codigo` (ainda como `postgres`) e execute o
   script ja incluso no projeto:

```bash
psql -U postgres -d quebra_codigo -f app/scripts/postgres-setup.sql
```

   O script cria o schema `app` com `qc_user` como dono (necessario porque o
   PostgreSQL 15+ revoga `CREATE` no schema `public` para usuarios comuns).

3. Se quiser usar credenciais diferentes, ajuste as propriedades
   `spring.datasource.username` e `spring.datasource.password` em
   `app/src/main/resources/application.properties`.

## Troubleshooting (Windows)

Se ao rodar `mvn spring-boot:run` aparecer o erro:

```
Unable to establish loopback connection
java.net.SocketException: Invalid argument: connect
```

Isso e um problema do Winsock/loopback do Windows (nao e do projeto). Para
resolver:

1. Confira se `C:\Windows\System32\drivers\etc\hosts` contem as linhas
   (sem `#` no comeco):

   ```
   127.0.0.1       localhost
   ::1             localhost
   ```

2. Se o erro persistir, abra o **PowerShell como Administrador** e execute:

   ```powershell
   netsh winsock reset
   netsh int ip reset
   ```

3. **Reinicie o PC** e rode `mvn spring-boot:run` novamente.
