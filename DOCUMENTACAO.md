# Documentação Técnica — QuebraCódigo
**TCC — Análise e Desenvolvimento de Sistemas**  
**Data:** 01/06/2025

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Migração dos Jogos para o Backend Java](#2-migração-dos-jogos-para-o-backend-java)
3. [Correção de Animação — 2048](#3-correção-de-animação--2048)
4. [Suite de Testes Automatizados](#4-suite-de-testes-automatizados)
5. [Como Executar](#5-como-executar)

---

## 1. Visão Geral do Projeto

**QuebraCódigo** é uma plataforma educacional web para ensino de programação com gamificação, cursos e mini-jogos interativos.

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 + Spring Boot 3.3 |
| Banco de dados | PostgreSQL 15 (schema `app`) + Flyway |
| Frontend | HTML5, CSS3, JavaScript puro |
| Autenticação | HTTP Session + BCrypt |
| Porta | 8150 |

---

## 2. Migração dos Jogos para o Backend Java

### 2.1 Objetivo

Os jogos **Sudoku**, **Jogo da Memória** e **Connect 4** tinham toda a lógica implementada em JavaScript no navegador. A migração transferiu as regras de negócio, geração de estado e IA para o backend Java, seguindo o princípio de separação de responsabilidades.

**Antes da migração:**
```
Navegador
└── Toda a lógica (geração, validação, IA, pontuação)
└── Renderização
└── Captura de input
```

**Depois da migração:**
```
Navegador                          Servidor Java
└── Renderização          ←────── └── Geração de tabuleiro
└── Captura de input      ──────► └── Validação de regras
└── Chamadas HTTP (fetch)          └── Lógica da IA (CPU)
                                   └── Cálculo de pontuação
```

---

### 2.2 Arquitetura Criada

```
app/src/main/java/br/com/user/games/
├── model/
│   ├── SudokuGame.java
│   ├── MemoryGame.java
│   └── Connect4Game.java
├── service/
│   ├── SudokuService.java
│   ├── MemoryService.java
│   └── Connect4Service.java
└── controller/
    ├── SudokuGameController.java
    ├── MemoryGameController.java
    └── Connect4GameController.java
```

> Os controllers (`@RestController`) são Servlets registrados automaticamente pelo Spring Boot, equivalentes funcionais de `HttpServlet` no padrão Jakarta EE.

---

### 2.3 Models

#### `SudokuGame.java`
Representa o estado completo de uma partida de Sudoku.

| Campo | Tipo | Descrição |
|---|---|---|
| `board` | `int[81]` | Estado atual do tabuleiro (0 = vazio) |
| `solution` | `int[81]` | Solução completa (usada pelo endpoint Resolver) |
| `fixed` | `boolean[81]` | Células pré-preenchidas (não editáveis) |
| `difficulty` | `String` | `easy` / `medium` / `hard` |

#### `MemoryGame.java`
Resultado de uma nova partida do Jogo da Memória.

| Campo | Tipo | Descrição |
|---|---|---|
| `deck` | `List<String>` | Caminhos das imagens embaralhados (cada imagem aparece 2×) |
| `cols` | `int` | Número de colunas do grid |
| `rows` | `int` | Número de linhas do grid |

#### `Connect4Game.java`
Estado completo de uma partida de Connect 4.

| Campo | Tipo | Descrição |
|---|---|---|
| `grid` | `int[6][7]` | Tabuleiro (0=vazio, 1=P1, 2=P2/CPU) |
| `turn` | `int` | Jogador da vez (1 ou 2) |
| `done` | `boolean` | Partida encerrada |
| `winner` | `int` | 0=empate / 1 / 2 / -1=em andamento |
| `lastRow/Col/Player` | `int` | Última peça jogada (para animação no frontend) |

---

### 2.4 Services

#### `SudokuService.java`

| Método | Lógica migrada do JS |
|---|---|
| `newGame(difficulty)` | `baseBoard()` — geração por backtracking com números aleatórios + `carve()` — escavação de células |
| `validate(board[])` | `isValid()` — verificação de conflitos em linha, coluna e bloco 3×3 |
| `solve(board[])` | `solveSudoku()` — resolução do estado atual por backtracking |

**Quantidade de células removidas por dificuldade:**

| Dificuldade | Células removidas | Células fixas |
|---|---|---|
| Fácil | 40 | 41 |
| Médio | 50 | 31 |
| Difícil | 58 | 23 |

#### `MemoryService.java`

| Método | Lógica migrada do JS |
|---|---|
| `newGame(size)` | `makeIconList()` + `buildDeck()` + `shuffle()` — seleção de imagens únicas e embaralhamento de pares |
| `calculateScore(moves, seconds, totalCards)` | Fórmula de `win()`: `base + max(0, 60 - seconds/5) + max(0, 24 - moves)` |

**Tabela de pontuação base:**

| Grid | Cartas | Pontuação base |
|---|---|---|
| 4×4 | 16 | 80 pts |
| 5×4 | 20 | 110 pts |
| 6×4 | 24 | 140 pts |

#### `Connect4Service.java`

| Método | Lógica migrada do JS |
|---|---|
| `newGame(mode)` | Inicialização do grid 6×7 vazio; em PvE, CPU tem 33% de chance de começar |
| `drop(grid, turn, col, mode)` | `drop()` — inserção com gravidade + `checkWin()` — verificação de 4 em linha/coluna/diagonal + `finish()` — detecção de vitória/empate |
| `cpuMove(grid)` | `cpu()` — IA: (1) vencer se possível → (2) bloquear jogador → (3) preferência de coluna central |

**Estratégia da IA (CPU):**
```
1ª prioridade: existe coluna que faz CPU vencer agora?     → joga lá
2ª prioridade: existe coluna que faz P1 vencer se não bloquear? → bloqueia
3ª prioridade: ordem de preferência [3, 2, 4, 1, 5, 0, 6]  → coluna central
```

**Design stateless:** o cliente envia o estado completo (grid + turno + modo) a cada requisição. O servidor não armazena nenhum estado de partida em sessão.

**Em PvE, um único `POST /drop` processa tudo:**
```
Cliente envia: { grid, turn:1, col:3, mode:"pve" }
Servidor:      1. Insere peça do jogador
               2. Verifica vitória/empate
               3. Calcula jogada da CPU
               4. Insere peça da CPU
               5. Verifica vitória/empate novamente
Cliente recebe: estado final com ambas as jogadas
```

---

### 2.5 Endpoints REST

#### Sudoku

| Método | Rota | Body | Retorno |
|---|---|---|---|
| `POST` | `/api/games/sudoku/new?difficulty=easy` | — | `{ board[81], fixed[81], solution[81], difficulty }` |
| `POST` | `/api/games/sudoku/validate` | `{ board[81] }` | `{ conflicts[81], complete: bool }` |
| `POST` | `/api/games/sudoku/solve` | `{ board[81] }` | `{ solved[81] }` |

#### Jogo da Memória

| Método | Rota | Body | Retorno |
|---|---|---|---|
| `POST` | `/api/games/memory/new?size=4x4` | — | `{ deck[], cols, rows }` |
| `POST` | `/api/games/memory/score` | `{ moves, seconds, totalCards }` | `{ points, coins }` |

#### Connect 4

| Método | Rota | Body | Retorno |
|---|---|---|---|
| `POST` | `/api/games/connect4/new?mode=pve` | — | `{ grid[][], turn, done, winner }` |
| `POST` | `/api/games/connect4/drop` | `{ grid[][], turn, col, mode }` | `{ grid[][], turn, done, winner, lastRow, lastCol, lastPlayer }` |

---

### 2.6 Arquivos Frontend Modificados

#### `games/sudoku/sudoku.js`

| Removido (foi para Java) | Mantido (UI) |
|---|---|
| `baseBoard()` — geração do tabuleiro | `draw()` — renderização do grid |
| `isValid()` — validação de conflitos | `highlightCell()` — destaque de linha/coluna/bloco |
| `carve()` — escavação por dificuldade | `clearHighlight()` — limpeza de destaque |
| `solveSudoku()` — resolução | Captura de `input` e chamadas `fetch` |

#### `games/memory/memory.js`

| Removido (foi para Java) | Mantido (UI) |
|---|---|
| `makeIconList()` — seleção de imagens | Animação flip 3D (CSS + classes JS) |
| `buildDeck()` — criação de pares | Verificação de par (igualdade de `dataset.hash`) |
| `shuffle()` — embaralhamento | Timer e contador de movimentos |
| Cálculo de score em `win()` | Chamadas `fetch` à API |

#### `games/connect4/connect4.js`

| Removido (foi para Java) | Mantido (UI) |
|---|---|
| `drop()` — inserção com gravidade | `draw()` — renderização do tabuleiro |
| `check()` / `newCheck()` — verificação de vitória | Hover rail e animação de queda |
| `cpu()` — inteligência artificial | Captura de clique de coluna |
| `simWin()` / `valid()` — simulação da CPU | Chamadas `fetch` à API |
| `finish()` — lógica de fim de jogo | |

---

### 2.7 Fluxo de Comunicação

```
[Usuário clica "Novo Jogo"]
        │
        ▼
[Frontend: POST /api/games/sudoku/new?difficulty=easy]
        │
        ▼
[SudokuGameController recebe requisição]
        │
        ▼
[SudokuService.newGame("easy"):
  1. generateSolved() — backtracking com números aleatórios
  2. carve(board, "easy") — remove 40 células aleatórias
  3. Monta SudokuGame com board[], solution[], fixed[]]
        │
        ▼
[Controller serializa em JSON e retorna 200]
        │
        ▼
[Frontend: draw(board, fixed) — renderiza os 81 inputs]
        │
        ▼
[Usuário digita número → POST /api/games/sudoku/validate]
        │
        ▼
[SudokuService.validate(board):
  Para cada célula preenchida:
    Remove temporariamente → isValid() checa linha/coluna/bloco
    Retorna conflicts[81] + complete: boolean]
        │
        ▼
[Frontend: pinta células vermelhas/verdes conforme conflicts[]]
```

---

## 3. Correção de Animação — 2048

### 3.1 Problema

O jogo 2048 já possuía infraestrutura de animação (`_animating`, `_renderTilesAnimated`, classes CSS), mas apresentava um comportamento visual incorreto ao fundir peças:

**Comportamento incorreto:**
```
[2]  [0]  [0]  [2]   ← pressiona ←

[0]  [0]  [0]  [4]   ← as duas peças [2] desaparecem instantaneamente
                        e o [4] aparece no lugar com apenas um "pop"
```

**Comportamento esperado:**
```
[2] ────────────────► [2]   ← ambas deslizam até se encontrar
                      [4]   ← aí o pop acontece
```

### 3.2 Causa Raiz

Em `move()`, quando duas peças se fundiam, `_anim.merges` registrava apenas o **destino** da fusão — sem guardar de onde vieram as duas peças originais.

```javascript
// ANTES — só o destino
this._anim.merges.push({ row: d.row, col: d.col });

// DEPOIS — destino + origens das duas peças
this._anim.merges.push({
    row: d.row, col: d.col,
    srcValue: rowEntries[j].value,
    src1: s1,   // posição da primeira peça
    src2: s2    // posição da segunda peça
});
```

### 3.3 Solução

**Arquivo modificado:** `games/2048/2048.js`  
**Alterações:** duas cirurgias cirúrgicas

**Mudança 1 — `move()` (+4 linhas):**  
Adicionado registro de `src1`, `src2` e `srcValue` ao objeto de fusão.

**Mudança 2 — `_renderTilesAnimated()` (reescrita do método):**

| Elemento | Papel |
|---|---|
| `movingEls` | Tiles não-merge que deslizaram (comportamento anterior, mantido) |
| `ghostEls` | **Novo** — dois tiles temporários por fusão, posicionados nas origens, que deslizam até o destino |
| `mergeEls` | Tiles fundidos — ficam invisíveis durante a fase 1, revelados com pop na fase 2 |
| `newEls` | Spawn de nova peça (comportamento anterior, mantido) |

**Fase 1 (0–150 ms):** todos os tiles deslizam simultaneamente  
**Fase 2 (após 150 ms):** ghosts são removidos → tile fundido aparece em `scale(1.15)` → retorna a `scale(1)`

**HTML e CSS: zero alterações** — todas as classes (`.tile-moving`, `.tile-merge`, `.tile-new`) já existiam.

---

## 4. Suite de Testes Automatizados

### 4.1 Tecnologia

| Item | Detalhe |
|---|---|
| Framework | Playwright `^1.49.1` + `@playwright/test` |
| Linguagem | JavaScript (ESM) |
| Browsers | Chromium (desktop) + Pixel 5 (mobile) |
| Localização | `QuebraCodigo.last/scripts/` |

### 4.2 Estrutura de Arquivos

```
scripts/
├── playwright.config.js          # Configuração central
├── package.json                  # Scripts e dependências
├── TESTES.md                     # Instruções de uso
├── screenshots/                  # Screenshots automáticos
│
├── fixtures/
│   └── auth.fixture.js           # Fixture de autenticação reutilizável
│
├── pages/                        # Page Object Model
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── HomePage.js
│   ├── SudokuPage.js
│   ├── MemoryPage.js
│   ├── Connect4Page.js
│   ├── Game2048Page.js
│   └── MinesweeperPage.js
│
└── tests/
    ├── auth/
    │   ├── login.spec.js         # 9 testes
    │   ├── register.spec.js      # 9 testes
    │   └── logout.spec.js        # 4 testes
    ├── navigation/
    │   └── pages.spec.js         # 10 testes
    ├── regression/
    │   └── smoke.spec.js         # 7 testes
    └── games/
        ├── sudoku.spec.js        # 12 testes
        ├── memory.spec.js        # 12 testes
        ├── connect4.spec.js      # 11 testes
        ├── 2048.spec.js          # 12 testes
        └── minesweeper.spec.js   # 14 testes
```

**Total: 100 testes**

---

### 4.3 Padrões de Projeto Aplicados

#### Page Object Model (POM)

Cada tela do sistema tem uma classe correspondente em `pages/`. Os seletores CSS ficam **apenas** nos Page Objects — se o HTML mudar, só o PO é atualizado.

```javascript
// SEM POM — frágil e difícil de manter
await page.click('#login-btn');

// COM POM — legível e manutenível
const loginPage = new LoginPage(page);
await loginPage.loginBtn.click();
```

#### Fixture de Autenticação

Testes que precisam de usuário logado não repetem o login a cada teste. O `auth.fixture.js` centraliza esse comportamento:

```
Para cada suite autenticada:
  1. Registra usuário único via API (Date.now() garante unicidade)
  2. Faz login via UI (browser recebe cookie de sessão HTTP)
  3. Executa o teste com page já autenticado
  4. Faz logout via API no teardown (invalida sessão)
```

#### Dados de teste isolados

Usuários de teste usam `Date.now()` no nome e e-mail, garantindo que cada execução use credenciais únicas — sem conflito entre rodadas consecutivas.

---

### 4.4 Tipos de Testes Implementados

| Tipo | Descrição | Onde está |
|---|---|---|
| **E2E (End-to-End)** | Simula fluxo completo do usuário do início ao fim | `smoke.spec.js`, specs de jogos |
| **Funcional** | Valida comportamento esperado de funcionalidades | Todos os specs |
| **API / Contrato** | Valida estrutura e regras de negócio direto no endpoint | `sudoku.spec.js`, `memory.spec.js`, `connect4.spec.js` |
| **Validação de campos** | Campos obrigatórios, formatos, limites | `register.spec.js`, `login.spec.js` |
| **Regressão / Smoke** | Garante que funcionalidades críticas não quebraram | `smoke.spec.js` (tag `@smoke`) |
| **UI / Interface** | Verifica renderização, estados visuais, responsividade | Todos os specs de jogos |
| **Segurança / Sessão** | Valida que rotas protegidas bloqueiam usuários não autenticados | `logout.spec.js`, `pages.spec.js` |

---

### 4.5 Cobertura por Módulo

#### Autenticação (22 testes)

| Arquivo | Cenários cobertos |
|---|---|
| `login.spec.js` | Login válido, senha errada, usuário inexistente, campos vazios, "Lembrar-me", feedback visual, navegação para cadastro |
| `register.spec.js` | Cadastro completo, usuário duplicado, e-mail duplicado, data inválida, senha < 4 chars, usuário < 2 chars, formato de data errado, botão voltar |
| `logout.spec.js` | Sessão invalidada após logout, redirect para login, proteção de páginas de jogos, contexto limpo sem cookies |

#### Navegação e Segurança (10 testes)

| Cenário | Comportamento esperado |
|---|---|
| Páginas públicas sem auth | Carregam normalmente |
| 5 rotas protegidas sem auth | Redirecionam para `/login.html` |
| Jogos com auth | Carregam sem redirecionamento |
| Botão Voltar nos jogos | Retorna para `/index.html` |
| Login responsivo mobile 390px | Elementos visíveis e funcionais |

#### Regressão Smoke (7 testes)

| Teste | O que garante |
|---|---|
| Fluxo completo cadastro → jogo → logout | Caminho principal do usuário funciona |
| Sessão entre múltiplos jogos | Cookie não expira entre navegações |
| Retry de login após falha | Formulário não trava |
| `POST /api/games/sudoku/new` | board[81] com valores 0-9 |
| `POST /api/games/memory/new` | deck com pares exatos |
| `POST /api/games/connect4/new` | grid 6×7 zerado |
| `POST /api/games/sudoku/validate` | conflicts[] correto |

#### Jogos (61 testes)

**Sudoku (12 testes)**

| Categoria | Testes |
|---|---|
| API | 3 dificuldades retornam estrutura correta; conflito em linha detectado; conflito em coluna detectado; solver retorna sem zeros |
| UI | 81 células renderizadas; células fixas readonly; filtro de caracteres inválidos; botão Resolver → win overlay; botão Limpar; troca de dificuldade; screenshot de conflito |

**Jogo da Memória (12 testes)**

| Categoria | Testes |
|---|---|
| API | Tamanho correto para 4×4, 5×4, 6×4; pares exatos; fórmula de score 4×4; mais movimentos = menos pontos |
| UI | 16 cartas em 4×4; cartas iniciam fechadas; clicar vira; par correto fica `.matched`; par errado vira de volta após 380ms; contador de movimentos; troca de tamanho para 24 cartas |

> **Técnica-chave:** `dataset.hash` de cada `.card3d` contém o caminho da imagem, permitindo localizar pares deterministicamente via `page.evaluate()` sem depender da posição aleatória do deck.

**Connect 4 (11 testes)**

| Categoria | Testes |
|---|---|
| API | Grid 6×7 vazio; gravidade na inserção; vitória horizontal; vitória vertical; CPU responde no mesmo request; coluna cheia retorna 400 |
| UI | 42 células renderizadas; chip aparece após clique; cores alternam em PvP; vitória P1 com overlay; reiniciar limpa tabuleiro |

> **Técnica-chave:** vitória determinística em PvP — P1 constrói linha nos cols 0-3 enquanto P2 joga nos cols 4-6 (7 jogadas exatas, sem aleatoriedade).

**2048 (12 testes)**

| Categoria | Testes |
|---|---|
| Estado inicial | 16 células de fundo; 2 tiles iniciais; score=0; `data-row/col` válidos; Undo desabilitado |
| Movimentos | Seta gera nova peça; Undo habilita; Undo restaura estado |
| Controles | Reiniciar → 2 tiles + score=0; Undo desabilitado após restart; setas sem scroll da página |

> **Limitação documentada:** atingir 2048 ou Game Over não são testáveis deterministicamente (estado aleatório). O flag `_animating` (150ms) exige `waitForTimeout(250)` entre teclas.

**Minesweeper (14 testes)**

| Categoria | Testes |
|---|---|
| Estrutura | 64/196/400 células por dificuldade; contadores de minas corretos |
| Primeiro clique | 5 posições diferentes nunca explodem; ao menos 1 célula revelada; timer inicia |
| Bandeiras | Right-click coloca flag; duplo remove flag; contador decrementa/incrementa |
| Controles | Dica revela célula segura; reiniciar zera timer e grid |

> **Técnica-chave:** o código de `placeMines()` exclui a célula do primeiro clique — invariante verificável sem conhecer posição das minas. `#hintBtn` garante revelação de célula segura.

---

### 4.6 Configuração do Playwright

```javascript
// playwright.config.js — principais configurações
{
  baseURL:      'http://localhost:8150',
  timeout:      30_000,        // 30s por teste
  workers:      1,             // serial (evita conflitos no banco)
  retries:      1,             // 1 retry automático
  screenshot:   'only-on-failure',
  video:        'retain-on-failure',
  reporter:     'html'         // relatório em playwright-report/
}
```

---

## 5. Como Executar

### Pré-requisitos
- Java 21 + Maven
- PostgreSQL 15 rodando com o banco `quebra_codigo`
- Node.js 18+

### Iniciar o servidor

```bash
cd app
mvn spring-boot:run
# Servidor disponível em http://localhost:8150
```

### Instalar dependências dos testes

```bash
cd scripts
npm install
npx playwright install chromium
```

### Rodar os testes

```bash
# Todos os testes (100)
npm test

# Apenas testes dos jogos (61)
npm run test:games

# Apenas testes de autenticação (22)
npm run test:auth

# Apenas testes críticos @smoke (~20)
npm run test:smoke

# Com janela visível (para demonstração)
npm run test:headed

# Abrir relatório HTML após rodar
npm run test:report
```

### Rodar um jogo específico

```bash
npx playwright test tests/games/sudoku.spec.js
npx playwright test tests/games/memory.spec.js
npx playwright test tests/games/connect4.spec.js
npx playwright test tests/games/2048.spec.js
npx playwright test tests/games/minesweeper.spec.js
```

---

## Resumo Executivo

| Entrega | Arquivos | Detalhes |
|---|---|---|
| Migração Java — Models | 3 arquivos | `SudokuGame`, `MemoryGame`, `Connect4Game` |
| Migração Java — Services | 3 arquivos | Toda lógica de negócio dos 3 jogos |
| Migração Java — Controllers | 3 arquivos | 8 endpoints REST no total |
| Frontend refatorado | 3 arquivos | `sudoku.js`, `memory.js`, `connect4.js` |
| Correção animação 2048 | 1 arquivo | `2048.js` — ghost tiles para fusão |
| Configuração de testes | 2 arquivos | `playwright.config.js`, `package.json` |
| Page Objects | 8 arquivos | Um por tela/jogo |
| Fixture de auth | 1 arquivo | Usuário único por suite, teardown automático |
| Specs de auth/navegação | 4 arquivos | 39 testes |
| Specs dos jogos | 5 arquivos | 61 testes |
| **Total** | **33 arquivos** | **100 testes automatizados** |
