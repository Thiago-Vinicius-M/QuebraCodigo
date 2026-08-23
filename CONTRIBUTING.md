# Guia de Colaboracao - QuebraCodigo

Este documento define um fluxo simples para o grupo trabalhar no projeto sem conflitos.

## Pasta principal do projeto

- O modulo principal da aplicacao fica em `app/`.
- Sempre execute comandos de build/run dentro dessa pasta (onde esta o `pom.xml`).

## Objetivo

- Manter a `main` sempre funcionando.
- Facilitar a colaboracao entre os integrantes.
- Padronizar mensagens de commit para historico claro.

## Fluxo rapido (dia a dia)

1. Atualize seu repositorio local:
   - `git pull origin main`
2. Faca suas alteracoes.
3. Confira o que mudou:
   - `git status`
4. Adicione os arquivos:
   - `git add .`
5. Crie o commit com mensagem padronizada:
   - `git commit -m "tipo: descricao curta"`
6. Envie para o remoto:
   - `git push origin main`

## Padrao de mensagens de commit

Formato:

`tipo: descricao curta no imperativo`

Tipos recomendados:

- `feat`: nova funcionalidade
- `fix`: correcao de bug
- `docs`: alteracao de documentacao
- `refactor`: refatoracao sem mudar comportamento
- `style`: ajuste de formatacao/estilo (sem logica)
- `test`: criacao ou ajuste de testes
- `chore`: tarefa tecnica/manutencao

Exemplos:

- `feat: adiciona tela de cadastro`
- `fix: corrige validacao de senha no login`
- `docs: atualiza instrucoes de execucao`
- `refactor: simplifica servico de autenticacao`
- `chore: organiza estrutura de pastas`

## Boas praticas para evitar conflitos

- Sempre rode `git pull origin main` antes de comecar.
- Evite editar o mesmo arquivo ao mesmo tempo que outro integrante.
- Faca commits pequenos e objetivos.
- Use mensagens claras para facilitar revisao e rastreabilidade.
- Avise o grupo quando subir alteracoes importantes.

## Quando o push for rejeitado

Se aparecer erro de branch atrasada, rode:

- `git pull --rebase origin main`
- Resolva conflitos, se houver.
- `git add .`
- `git rebase --continue`
- `git push origin main`

## Fluxo opcional com branch (mais seguro)

Para tarefas maiores, prefira branch por funcionalidade:

- `git checkout -b feature/nome-da-tarefa`
- Trabalhe normalmente (`add`, `commit`).
- `git push -u origin feature/nome-da-tarefa`
- Abra Pull Request para revisar antes de juntar na `main`.

## Duvidas comuns

- **Preciso pedir permissao para push?**
  - Apenas precisa ter acesso de escrita no repositorio.
- **Posso commitar direto na main?**
  - Sim, para fluxo simples do TCC. Para maior controle, usem branch + PR.
- **Como saber se subi com sucesso?**
  - Verifique com `git status -sb`; o ideal e nao estar `ahead`.
