# Inventário Final de Redundâncias (por arquivo/tipo)

Este inventário consolida redundâncias com evidências curtas observáveis no código atual.

## 1) Imports/recursos duplicados ou não utilizados

- `app/src/main/resources/static/index.html` — **recurso duplicado**
  - Evidência: duas entradas `preconnect` para o mesmo host `https://fonts.googleapis.com` (linhas com `<link rel="preconnect" ...>` repetidas).

- `app/src/main/java/br/com/user/api/LicaoController.java` — **import não utilizado**
  - Evidência: `import br.com.user.model.Jogo;` sem uso no corpo do controller.

- `app/src/main/java/br/com/user/api/ExercicioController.java` — **import não utilizado**
  - Evidência: `import br.com.user.model.Jogo;` sem uso no corpo do controller.

## 2) Código/lógica duplicada

- `app/src/main/java/br/com/user/api/LicaoController.java` — **mapeamento DTO repetido**
  - Evidência: método `toDTO(Licao l)` com padrão `entity -> new DTO(...)`.

- `app/src/main/java/br/com/user/api/ExercicioController.java` — **mapeamento DTO repetido**
  - Evidência: método `toDTO(Exercicio e)` com padrão equivalente aos demais controllers/services.

- `app/src/main/java/br/com/user/api/JogoController.java` — **mapeamento DTO repetido**
  - Evidência: método `toDTO(Jogo j)` com mesmo formato estrutural.

- `app/src/main/java/br/com/user/api/ProgressoController.java` — **mapeamento DTO repetido**
  - Evidência: método `toDTO(Progresso p)` mantendo o mesmo padrão de transformação.

- `app/src/main/java/br/com/user/service/CursoService.java` — **mapeamento DTO repetido**
  - Evidência: método `toDTO(Curso c)` com regra local semelhante aos demais.

- `app/src/main/java/br/com/user/service/UsuarioService.java` — **mapeamento DTO repetido**
  - Evidência: método `toDTO(Usuario u)` análogo aos outros mapeamentos.

- `app/src/main/java/br/com/user/api/AuthController.java` — **respostas repetidas**
  - Evidência: múltiplas ocorrências de `Map.of("error", ...)` e payload de sucesso repetido com `Map.of("id", u.getId(), "username", u.getNome())`.

- `app/src/main/resources/static/login.html` e `app/src/main/resources/static/cadastro.html` — **fluxo auth frontend repetido**
  - Evidência: ambos os arquivos têm validação/form submit + `fetch(...)` + tratamento de erro em sequência equivalente (`/auth/login` e `/auth/register`).

## 3) Responsabilidades sobrepostas

- `app/src/main/java/br/com/user/service/UsuarioService.java` — **find-or-create por nome**
  - Evidência: `repo.findByNome(...).orElseGet(() -> new Usuario())`.

- `app/src/main/java/br/com/user/service/GamificationService.java` — **find-or-create por nome**
  - Evidência: `usuarios.findByNome(...).orElseGet(() -> new Usuario())`.

- `app/src/main/java/br/com/user/service/AuthService.java` — **find-or-create por nome**
  - Evidência: `repo.findByNome(nome).orElseGet(() -> { Usuario novo = new Usuario(); ... })`.

- `app/src/main/java/br/com/user/api/GamificationController.java` e `app/src/main/java/br/com/user/api/LeaderboardController.java` — **sobreposição de endpoint**
  - Evidência: ambos retornam `gamificationService.rankingTop50()` para rotas diferentes (`/api/ranking` e `/api/leaderboard`).

## 4) Declarações redundantes (defaults/literais)

- `app/src/main/java/br/com/user/model/Licao.java` e `app/src/main/java/br/com/user/api/LicaoController.java` — **default duplicado**
  - Evidência: entidade define default de `ordem`; controller também aplica fallback `dto.ordem()==null?1:dto.ordem()`.

- `app/src/main/java/br/com/user/model/Exercicio.java` e `app/src/main/java/br/com/user/api/ExercicioController.java` — **defaults duplicados**
  - Evidência: controller reaplica defaults (`tipo`, `dificuldade`, `pontos`), ex.: `dto.pontos()==null?10:dto.pontos()`.

- `app/src/main/java/br/com/user/service/AuthSessionService.java`, `app/src/main/java/br/com/user/security/UsernameFilter.java` e `app/src/main/java/br/com/user/api/AuthController.java` — **literais repetidas**
  - Evidência: repetição de `"username"` e `"userId"` em sessão/cookie/response.

## 5) CSS repetido, sobrescrito e HTML repetido

- `app/src/main/resources/static/games/css/global.css` — **redundância intra-regra**
  - Evidência: `.game-title` com `white-space: nowrap` repetido; `.go-back` com `padding` declarado mais de uma vez no mesmo bloco.

- `app/src/main/resources/static/css/cadastro.css` — **redundância intra-regra**
  - Evidência: seletor `.go-back` contém `padding` duplicado (`padding: 0 0.75rem;` e depois `padding: 0;`).

- `app/src/main/resources/static/css/home.css` — **padrões de classe paralelos**
  - Evidência: regras muito similares para `.nav-button`, `.nav-button-settings` e `.nav-button-ia` em blocos repetidos.

- `app/src/main/resources/static/games/connect4/connect4.html`, `app/src/main/resources/static/games/sudoku/sudoku.html`, `app/src/main/resources/static/games/memory/memory.html`, `app/src/main/resources/static/games/minesweeper/minesweeper.html`, `app/src/main/resources/static/games/2048/2048.html`, `app/src/main/resources/static/games/flow-free/flow-free.html`, `app/src/main/resources/static/games/ia.html` — **estrutura/JS repetidos**
  - Evidência: presença recorrente de `<a ... id="go-back" ...>` + script com `const backLink = document.querySelector('#go-back');`.

- `app/src/main/resources/static/courses/python.html`, `app/src/main/resources/static/courses/java.html`, `app/src/main/resources/static/courses/javascript.html`, `app/src/main/resources/static/courses/typescript.html`, `app/src/main/resources/static/courses/html.html`, `app/src/main/resources/static/courses/cpp.html` — **páginas ponte duplicadas**
  - Evidência: todas repetem `meta refresh` para `course.html?curso=...`, variando apenas o valor de `curso`.

## Resumo por tipo

- **Imports/recursos duplicados ou não usados:** 3 ocorrências principais.
- **Código/lógica duplicada:** 8 grupos recorrentes.
- **Responsabilidades sobrepostas:** 4 pontos de sobreposição.
- **Declarações redundantes (defaults/literais):** 3 grupos.
- **CSS/HTML repetidos:** 5 grupos com maior volume no frontend estático.

## Sequência de execução em ondas (baixo risco primeiro)

Esta ordem prioriza mudanças mecânicas, com efeito local e baixo potencial de regressão.

1. **Onda 1 - Higiene mecânica (baixíssimo risco)**
   - Remover imports não usados em controllers.
   - Eliminar duplicações intra-regra no CSS (mesma propriedade declarada mais de uma vez no seletor).
   - Consolidar `preconnect` duplicado no `index.html`.
   - **Critério de saída:** build passa e navegação principal abre sem erro visual evidente.

2. **Onda 2 - Padronização de literais e respostas locais (baixo risco)**
   - Centralizar chaves de auth (`username`, `userId`) em constantes compartilhadas.
   - Extrair helpers privados no `AuthController` para respostas repetidas, sem alterar contrato JSON.
   - **Critério de saída:** endpoints de auth mantêm o mesmo payload de sucesso/erro.

3. **Onda 3 - Extração de padrões frontend repetidos (baixo-médio risco)**
   - Centralizar script de botão "voltar" das páginas de jogos.
   - Introduzir classe base para botões da home com modificadores.
   - **Critério de saída:** fluxos de navegação dos jogos e home equivalentes ao comportamento atual.

4. **Onda 4 - Consolidação estrutural interna (médio risco controlado)**
   - Unificar mapeamentos `toDTO` por agregado (mapper/fábrica).
   - Definir fonte única de defaults para entidade/controller.
   - Consolidar padrão `findOrCreateByNome` em ponto único.
   - **Critério de saída:** cobertura dos fluxos de CRUD e gamificação sem divergência de campos/defaults.

5. **Onda 5 - Simplificação de superfície pública e páginas ponte (médio risco)**
   - Canonicalizar ranking com rota preferencial e alias explícito por compatibilidade.
   - Substituir páginas ponte de cursos por links diretos para `course.html?curso=...`.
   - **Critério de saída:** compatibilidade de rotas legadas validada e navegação de cursos preservada.

## Regras de previsibilidade por onda

- Entregar em PRs pequenos e temáticos (uma onda por PR).
- Evitar mistura de refatoração estrutural com mudança de regra de negócio.
- Validar contratos HTTP e fluxos críticos ao fim de cada onda.
- Só avançar para a próxima onda após checklist mínimo de regressão visual e funcional.

## Estimativa de ganho por etapa

As estimativas abaixo consideram apenas simplificação estrutural (sem mudança de regra de negocio) e representam faixas esperadas para facilitar planejamento de PRs pequenos.

| Onda | Foco principal | Reducao estimada de linhas | Ganho de manutencao | Ganho de legibilidade |
|---|---|---:|---|---|
| 1 | Higiene mecanica (imports, duplicacao CSS intra-regra, `preconnect`) | ~0.5% a 1.5% | Baixo para moderado (menos ruido mecanico) | Moderado (arquivos mais limpos) |
| 2 | Constantes de auth + helpers locais de resposta | ~0.5% a 1.0% | Moderado (menos repeticao de literais/payloads) | Moderado (padrao de resposta mais previsivel) |
| 3 | Extracao de padroes frontend (botao voltar + base de botoes home) | ~2% a 4% | Moderado para alto (menos manutencao paralela) | Alto (estrutura visual e JS mais uniformes) |
| 4 | Unificacao de mapeamentos/defaults/find-or-create | ~2% a 5% | Alto (menos drift entre camadas) | Moderado para alto (fonte unica por regra) |
| 5 | Canonicalizacao de rotas e remocao de paginas ponte | ~3% a 6% | Moderado para alto (menor superficie publica/arquivos ponte) | Alto (navegacao e rotas mais diretas) |
| **Total acumulado** | **Ondas 1 a 5** | **~8% a 18%** | **Alta melhoria de previsibilidade de mudancas** | **Melhoria moderada-alta global** |

### Notas de calibracao

- As faixas de linhas podem oscilar por efeito de centralizacao: algumas ondas adicionam utilitarios compartilhados antes de reduzir duplicacao em massa.
- O maior ganho de manutencao ocorre quando a mesma regra deixa de existir em mais de uma camada (controller + service + frontend).
- Para confirmar o ganho real por etapa, comparar `git diff --stat` por PR e registrar numero de arquivos tocados e pontos de alteracao evitados.
