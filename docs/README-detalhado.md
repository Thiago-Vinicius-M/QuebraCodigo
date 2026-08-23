# Quebra-Código

> 🇧🇷 Português | [🇺🇸 English below](#-quebra-código-1)

---

## 🇧🇷 Quebra Código

Plataforma web acadêmica com minijogos interativos e trilhas de programação, desenvolvida como projeto escolar para praticar lógica, desenvolvimento web e integração entre front-end e back-end. Inclui **cadastro e login** de usuários (sessão HTTP, senha com BCrypt), **perfil** (`/auth/me`) e persistência em **PostgreSQL** com migrações **Flyway** (schema `app`). O back-end expõe APIs REST para **cursos, lições, exercícios, jogos, progresso, ranking e gamificação**; há também endpoint de **IA** (`POST /api/ia`, Gemini) para o chat quando configurado.

### Jogos disponíveis

| Jogo | Descrição |
|------|-----------|
| 💣 Campo Minado | Clássico Minesweeper com dificuldades ajustáveis |
| 🔢 Sudoku | Puzzle numérico 9x9 |
| 🧠 Memória | Jogo de pares de cartas |
| 🔗 Connect 4 | Conecte 4 peças na vertical, horizontal ou diagonal |
| 🚦 Semáforo | Jogo de lógica com semáforos |
| ✅ Verdadeiro ou Falso | Quiz de verdadeiro/falso |
| 🥪 Sanduíches | Jogo de montagem de sanduíches |
| 2️⃣ 2048 | Junte números iguais até chegar em 2048 (setas do teclado) |
| 🌊 Flow Free | Conecte pares de cores preenchendo todo o tabuleiro; 10 níveis com dicas (2 por fase, acumuláveis) |
| ⚔️ Aventura RPG | Jogo de aventura em texto |

### Cursos

Além dos jogos, a plataforma oferece **cursos de programação** (HTML, CSS, JavaScript, Python, TypeScript, C++, Java, etc.). Cada curso tem lições em sequência, com navegação pela sidebar: nome do curso no topo, lista de lições e link **Home** no canto inferior esquerdo para voltar à página inicial. A área principal exibe o título da lição em destaque e o conteúdo.

### Tecnologias

- **Back-end:** Java **21**, Spring Boot **3.3**, Spring Web, Spring Data JPA, Validação, Actuator
- **Dados:** PostgreSQL, Hibernate, **Flyway** (migrações em `src/main/resources/db/migration`)
- **Segurança:** BCrypt (senhas), sessão HTTP para autenticação
- **Front-end:** HTML5, CSS3, JavaScript (Vanilla)
- **Estilização:** CSS com variáveis customizadas e design responsivo
- **Opcional no `pom`:** H2 (runtime), integração Google GenAI (Gemini no endpoint `/api/ia`)
- **Controle de versão:** Git / GitHub
- **Análise de código:** Qodana (JetBrains)

### API REST (visão geral)

| Prefixo / rota | Função |
|----------------|--------|
| `/auth/*` | Login, cadastro, sessão, perfil (`/auth/me`) |
| `/api/cursos`, `/api/licoes`, `/api/exercicios` | Catálogo de cursos, lições e exercícios |
| `/api/jogos` | Lista de jogos cadastrados |
| `/api/progresso` | Progresso do usuário |
| `/api/leaderboard` | Ranking |
| `/api/gamification/award`, `/api/ranking` | Pontuação e gamificação |
| `/api/ia` | Chat com IA (Gemini), uso opcional |

Erros de validação e negócio são tratados de forma centralizada (`GlobalExceptionHandler`).

### Como rodar o projeto

#### Pré-requisitos

- [Java 21](https://www.oracle.com/java/technologies/downloads/) (alinhado ao `pom.xml`)
- [Maven](https://maven.apache.org/) 3.8+
- [PostgreSQL](https://www.postgresql.org/) (acesso para criar banco e usuário)
- Git

#### Banco de dados (uma vez)

1. Crie o banco `quebra_codigo` e o usuário da aplicação (ex.: `qc_user` / `qc_pass`, como em `application.properties`).
2. Conectado como superusuário (`postgres`), execute o script **`scripts/postgres-setup.sql`** (cria o schema `app` com permissões adequadas no PostgreSQL 15+).

Ajuste `spring.datasource.*` em `src/main/resources/application.properties` se usar outro host, porta ou credenciais.

#### Passo a passo

Na raiz do repositório, o projeto Maven principal fica em **`app`** (pasta que contém o `pom.xml`).

```bash
# 1. Clone o repositório
git clone https://github.com/Thiago-Vinicius-M/QuebraCodigo.git
cd QuebraCodigo

# 2. Entre na pasta do modulo Spring Boot (onde esta o pom.xml)
cd app

# 3. Execute com Maven
mvn spring-boot:run
```

No **Windows** (PowerShell ou CMD), o passo 2 pode ser `cd app` dentro da pasta clonada; o importante e estar na pasta que contem o `pom.xml`.

> Após iniciar, acesse **http://localhost:8150**. **Login** e **cadastro:** `/login.html` e `/cadastro.html`. Página de **IA** (jogo/chat): `games/ia.html`.

#### Build para produção

```bash
mvn clean package
java -jar target/edu-platform-1.0.0.jar
```

(O artefato segue o `artifactId` **edu-platform** e a versão do `pom.xml`.)

### Estrutura do projeto

```
app/                              # modulo Maven (Spring Boot)
├── pom.xml
├── scripts/
│   └── postgres-setup.sql        # setup do schema app (PostgreSQL 15+)
├── src/main/
│   ├── java/                     # API REST, modelos, segurança
│   └── resources/
│       ├── application.properties
│       ├── db/migration/         # Flyway
│       └── static/
│           ├── index.html        # Página inicial
│           ├── login.html, cadastro.html
│           ├── css/, js/
│           ├── courses/          # Páginas de curso (sidebar + lições)
│           └── games/
│               ├── ia.html       # Chat com IA (consome /api/ia)
│               ├── minesweeper/
│               ├── sudoku/
│               ├── memory/
│               ├── connect4/
│               ├── 2048/
│               ├── flow-free/
│               └── Zcomming/     # semáforo, sanduíches, verdadeiro/falso, RPG, etc.
```

### Equipe

> Bryan Loyola
> Raphael Martins
> Thiago Vinicius
> Thomaz Arthur
> Victor Hugo

---
---

## 🇺🇸 Quebra-Código

An academic web platform with interactive mini-games and programming tracks, built as a school project to practice logic, web development, and front-end/back-end integration. It includes **sign-up and login** (HTTP session, BCrypt passwords), a **profile** endpoint (`/auth/me`), and **PostgreSQL** persistence with **Flyway** migrations (in the `app` schema). The back-end exposes REST APIs for **courses, lessons, exercises, games, progress, leaderboard, and gamification**, plus an optional **AI** endpoint (`POST /api/ia`, Gemini) for the chat when configured.

### Available Games

| Game | Description |
|------|-------------|
| 💣 Minesweeper | Classic Minesweeper with adjustable difficulty |
| 🔢 Sudoku | 9x9 number puzzle |
| 🧠 Memory | Card matching game |
| 🔗 Connect 4 | Connect 4 pieces vertically, horizontally or diagonally |
| 🚦 Traffic Light | Logic game with traffic lights |
| ✅ True or False | True/false quiz |
| 🥪 Sandwiches | Sandwich assembly game |
| 2️⃣ 2048 | Merge equal numbers to reach 2048 (keyboard arrows) |
| 🌊 Flow Free | Connect color pairs by filling the entire board; 10 levels with hints (2 per level, stackable) |
| ⚔️ RPG Adventure | Text-based adventure game |

### Courses

Besides the games, the platform includes **programming courses** (HTML, CSS, JavaScript, Python, TypeScript, C++, Java, etc.). Each course has sequential lessons, with sidebar navigation: course name at the top, lesson list, and **Home** link in the bottom-left corner to return to the main page. The main area shows the lesson title and content.

### Tech Stack

- **Back-end:** Java **21**, Spring Boot **3.3**, Spring Web, Spring Data JPA, Validation, Actuator
- **Data:** PostgreSQL, Hibernate, **Flyway** (migrations under `src/main/resources/db/migration`)
- **Security:** BCrypt (passwords), HTTP session authentication
- **Front-end:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** CSS with custom properties and responsive design
- **Optional in `pom`:** H2 (runtime), Google GenAI (Gemini at `/api/ia`)
- **Version control:** Git / GitHub
- **Code analysis:** Qodana (JetBrains)

### REST API (overview)

| Prefix / route | Purpose |
|----------------|---------|
| `/auth/*` | Login, sign-up, session, profile (`/auth/me`) |
| `/api/cursos`, `/api/licoes`, `/api/exercicios` | Courses, lessons, exercises |
| `/api/jogos` | Registered games |
| `/api/progresso` | User progress |
| `/api/leaderboard` | Leaderboard |
| `/api/gamification/award`, `/api/ranking` | Points and gamification |
| `/api/ia` | AI chat (Gemini), optional |

Validation and business errors are handled centrally (`GlobalExceptionHandler`).

### How to Run

#### Prerequisites

- [Java 21](https://www.oracle.com/java/technologies/downloads/) (matches `pom.xml`)
- [Maven](https://maven.apache.org/) 3.8+
- [PostgreSQL](https://www.postgresql.org/)
- Git

#### Database (one-time)

1. Create database `quebra_codigo` and the app user (e.g. `qc_user` / `qc_pass`, as in `application.properties`).
2. While connected as a superuser (`postgres`), run **`scripts/postgres-setup.sql`** (creates the `app` schema with correct privileges on PostgreSQL 15+).

Adjust `spring.datasource.*` in `src/main/resources/application.properties` if you use different host, port, or credentials.

#### Steps

From the repository root, the main Maven module is **`app`** (folder that contains `pom.xml`).

```bash
# 1. Clone the repository
git clone https://github.com/Thiago-Vinicius-M/QuebraCodigo.git
cd QuebraCodigo

# 2. Enter the Spring Boot module (folder with pom.xml)
cd app

# 3. Run with Maven
mvn spring-boot:run
```

On **Windows**, use `cd app` under the cloned folder; you must be in the directory that contains `pom.xml`.

> Open **http://localhost:8150**. **Login** and **sign-up:** `/login.html` and `/cadastro.html`. **AI** page: `games/ia.html`.

#### Production Build

```bash
mvn clean package
java -jar target/edu-platform-1.0.0.jar
```

(The artifact follows **edu-platform** and the version from `pom.xml`.)

### Project Structure

```
app/                              # Maven module (Spring Boot)
├── pom.xml
├── scripts/
│   └── postgres-setup.sql        # app schema setup (PostgreSQL 15+)
├── src/main/
│   ├── java/                     # REST API, models, security
│   └── resources/
│       ├── application.properties
│       ├── db/migration/         # Flyway
│       └── static/
│           ├── index.html        # Home page
│           ├── login.html, cadastro.html
│           ├── css/, js/
│           ├── courses/          # Course pages (sidebar + lessons)
│           └── games/
│               ├── ia.html       # AI chat (calls /api/ia)
│               ├── minesweeper/
│               ├── sudoku/
│               ├── memory/
│               ├── connect4/
│               ├── 2048/
│               ├── flow-free/
│               └── Zcomming/     # traffic light, sandwiches, true/false, RPG, etc.
```

### 👥 Team

> Bryan Loyola
> Raphael Martins
> Thiago Vinicius
> Thomaz Arthur
> Victor Hugo
