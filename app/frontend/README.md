# Frontend React (migração em andamento)

Migração incremental das páginas estáticas do QuebraCodigo para React + Vite.
Cada página vira uma entrada própria do Vite; o build sobrescreve o `.html`
equivalente direto em `app/src/main/resources/static/`, então as URLs não mudam
e nada no back-end precisa ser alterado.

**Status:** migradas — `login.html`, `cadastro.html`, `forgot-password.html`,
`reset-password.html`, `index.html` (home). Ainda falta `courses/*`, que
continua como está, em HTML/JS puro. Os jogos (`games/*`) não fazem parte do
escopo desta migração.

A home (`index.html`) busca as fotos de jogos/cursos e `/auth/me` no
back-end — sem ele rodando, essas imagens não carregam e o usuário aparece
como "Visitante", mas o resto (sidebar, modais de perfil/configurações,
navegação) funciona normalmente.

## Rodando só o front (sem back-end)

Para revisar a tela `login.html` visualmente, dá pra rodar só o Vite:

```bash
cd app/frontend
npm install
npm run dev
```

Abra `http://localhost:5173/login.html`. CSS, animações e imagens funcionam
normalmente (copiados para `public/`). **Só o envio do formulário não vai
funcionar de verdade** — sem back-end, o `POST /auth/login` falha e aparece a
mensagem de erro de conexão na tela, o que é esperado.

## Rodando front + back juntos (fluxo completo, com login funcionando)

```bash
# terminal 1 — na pasta app/
mvn spring-boot:run

# terminal 2 — na pasta app/frontend/
npm install
npm run dev
```

Abra `http://localhost:5173/login.html` e teste o login de verdade.

## Build para produção

```bash
npm install
npm run build
```

Isso gera os arquivos direto em `app/src/main/resources/static/`, sobrescrevendo
`login.html` e adicionando os bundles em `static/assets/`. Depois é só rodar o
Spring Boot normalmente (`mvn spring-boot:run`) — ele serve tudo junto.

> Ainda não integrado ao `mvn spring-boot:run` automaticamente (ex.: via
> frontend-maven-plugin). Por enquanto o `npm run build` é um passo manual antes
> de empacotar/rodar o back-end.
