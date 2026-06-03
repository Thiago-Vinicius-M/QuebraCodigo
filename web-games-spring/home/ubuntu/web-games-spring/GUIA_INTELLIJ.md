# 🚀 Guia Completo: IntelliJ IDEA + Web Games

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Importando o Projeto](#importando-o-projeto)
3. [Configurações Essenciais](#configurações-essenciais)
4. [Executando o Projeto](#executando-o-projeto)
5. [Debugging e Desenvolvimento](#debugging-e-desenvolvimento)
6. [Plugins Recomendados](#plugins-recomendados)
7. [Atalhos Úteis](#atalhos-úteis)
8. [Troubleshooting](#troubleshooting)

## 🛠️ Configuração Inicial

### Pré-requisitos

Antes de começar, certifique-se de ter:

- **IntelliJ IDEA** (Community ou Ultimate)
- **Java 11 JDK** ou superior
- **Maven** (pode usar o wrapper incluído no projeto)
- **Git** (opcional, para controle de versão)

### Verificando o Java

1. Abra o terminal/prompt de comando
2. Execute: `java -version`
3. Deve mostrar Java 11 ou superior

```bash
openjdk version "11.0.28" 2025-07-15
OpenJDK Runtime Environment (build 11.0.28+6-post-Ubuntu-1ubuntu122.04.1)
OpenJDK 64-Bit Server VM (build 11.0.28+6-post-Ubuntu-1ubuntu122.04.1, mixed mode, sharing)
```

## 📂 Importando o Projeto

### Método 1: Abrir Projeto Existente

1. **Inicie o IntelliJ IDEA**
2. Na tela inicial, clique em **"Open"**
3. Navegue até a pasta `web-games-spring`
4. Selecione a pasta (não o arquivo `pom.xml`)
5. Clique em **"OK"**

### Método 2: Importar via Maven

1. **File → Open**
2. Selecione o arquivo `pom.xml` na pasta do projeto
3. Escolha **"Open as Project"**
4. Aguarde o IntelliJ importar as dependências

### Primeira Importação

Quando importar pela primeira vez, o IntelliJ irá:

1. **Detectar o projeto Maven** automaticamente
2. **Baixar dependências** (pode demorar alguns minutos)
3. **Indexar arquivos** para busca e navegação
4. **Configurar o SDK** automaticamente

## ⚙️ Configurações Essenciais

### 1. Configurar Java SDK

**File → Project Structure → Project**

- **Project SDK**: Selecione Java 11 ou superior
- **Project Language Level**: 11 - Local variable syntax for lambda parameters
- **Project Compiler Output**: `out` (padrão)

### 2. Configurar Maven

**File → Settings → Build, Execution, Deployment → Build Tools → Maven**

- **Maven Home Directory**: Use bundled (Maven 3)
- **User Settings File**: Deixe padrão
- **Local Repository**: Deixe padrão
- ✅ **Import Maven projects automatically**
- ✅ **Automatically download sources**
- ✅ **Automatically download documentation**

### 3. Configurar Spring Boot

**File → Settings → Build, Execution, Deployment → Spring Boot**

- ✅ **Enable Spring Boot support**
- **Default run configuration**: WebGamesApplication

### 4. Configurar Encoding

**File → Settings → Editor → File Encodings**

- **Global Encoding**: UTF-8
- **Project Encoding**: UTF-8
- **Default encoding for properties files**: UTF-8
- ✅ **Transparent native-to-ascii conversion**

## 🏃‍♂️ Executando o Projeto

### Método 1: Via Classe Principal

1. Navegue até `src/main/java/com/webgames/WebGamesApplication.java`
2. Clique com o botão direito na classe
3. Selecione **"Run 'WebGamesApplication'"**
4. Aguarde a aplicação iniciar
5. Acesse `http://localhost:8080` no navegador

### Método 2: Via Maven

1. Abra o painel **Maven** (View → Tool Windows → Maven)
2. Expanda **web-games-spring → Plugins → spring-boot**
3. Clique duas vezes em **spring-boot:run**

### Método 3: Via Terminal Integrado

1. Abra o terminal integrado (**View → Tool Windows → Terminal**)
2. Execute: `mvn spring-boot:run`

### Configuração de Execução

O IntelliJ cria automaticamente uma configuração de execução. Para editá-la:

1. **Run → Edit Configurations**
2. Selecione **WebGamesApplication**
3. Configure conforme necessário:
   - **Main class**: `com.webgames.WebGamesApplication`
   - **VM options**: `-Dspring.profiles.active=dev` (opcional)
   - **Program arguments**: (deixe vazio)
   - **Working directory**: pasta do projeto

## 🐛 Debugging e Desenvolvimento

### Colocando Breakpoints

1. **Clique na margem esquerda** do editor (ao lado do número da linha)
2. Um **círculo vermelho** aparecerá indicando o breakpoint
3. Execute em modo debug: **Run → Debug 'WebGamesApplication'**

### Debugging Avançado

**Atalhos úteis durante debug:**
- **F8**: Step Over (próxima linha)
- **F7**: Step Into (entrar na função)
- **Shift+F8**: Step Out (sair da função)
- **F9**: Resume (continuar execução)
- **Ctrl+F8**: Toggle breakpoint

### Hot Reload com DevTools

O projeto inclui Spring Boot DevTools para hot reload:

1. **Faça alterações** no código Java
2. **Compile** com **Ctrl+F9** (Build Project)
3. A aplicação **reinicia automaticamente**
4. **Não precisa parar** e iniciar manualmente

### Debugging Frontend

Para debugar JavaScript:

1. Abra **Developer Tools** no navegador (F12)
2. Vá para a aba **Sources**
3. Encontre os arquivos `.js` em `localhost:8080`
4. Coloque breakpoints clicando nos números das linhas

## 🔌 Plugins Recomendados

### Plugins Essenciais (já incluídos)

- **Maven Helper**: Gerenciamento de dependências
- **Spring Boot**: Suporte completo ao Spring
- **Git**: Integração com controle de versão

### Plugins Adicionais Úteis

1. **SonarLint**: Análise de qualidade de código
   - **File → Settings → Plugins → Marketplace**
   - Busque "SonarLint" e instale

2. **Rainbow Brackets**: Colorir parênteses/chaves
   - Facilita leitura de código aninhado

3. **GitToolBox**: Melhorias para Git
   - Mostra informações de commit inline

4. **String Manipulation**: Manipulação de strings
   - Útil para formatação de código

### Instalando Plugins

1. **File → Settings → Plugins**
2. Aba **Marketplace**
3. **Busque o plugin** desejado
4. Clique em **Install**
5. **Reinicie o IntelliJ** se solicitado

## ⌨️ Atalhos Úteis

### Navegação
- **Ctrl+N**: Buscar classe
- **Ctrl+Shift+N**: Buscar arquivo
- **Ctrl+Shift+A**: Buscar ação
- **Ctrl+E**: Arquivos recentes
- **Ctrl+B**: Ir para declaração
- **Alt+F7**: Encontrar usos

### Edição
- **Ctrl+D**: Duplicar linha
- **Ctrl+Y**: Deletar linha
- **Ctrl+Shift+Up/Down**: Mover linha
- **Ctrl+/**: Comentar/descomentar linha
- **Ctrl+Shift+/**: Comentar/descomentar bloco
- **Alt+Insert**: Gerar código (getters, setters, etc.)

### Execução e Debug
- **Shift+F10**: Executar
- **Shift+F9**: Debug
- **Ctrl+F2**: Parar execução
- **Ctrl+F9**: Build projeto
- **Ctrl+Shift+F10**: Executar contexto atual

### Maven
- **Ctrl+Shift+A** → "Maven" → **Maven Reload Project**
- **Ctrl+Shift+A** → "Maven" → **Execute Maven Goal**

## 🔧 Troubleshooting

### Problema: "Cannot resolve symbol 'SpringApplication'"

**Solução:**
1. **File → Invalidate Caches and Restart**
2. Aguarde reindexação completa
3. Se persistir: **Maven → Reload Project**

### Problema: "Port 8080 already in use"

**Soluções:**
1. **Pare outras aplicações** na porta 8080
2. **Altere a porta** em `application.properties`:
   ```properties
   server.port=8081
   ```
3. **Mate processos** Java em execução

### Problema: Dependências não baixam

**Soluções:**
1. **Verifique conexão** com internet
2. **Maven → Reload Project**
3. **File → Settings → Maven** → Verifique configurações
4. **Delete pasta** `.m2/repository` e reimporte

### Problema: "Java version not supported"

**Solução:**
1. **File → Project Structure → Project**
2. **Altere Project SDK** para Java 11+
3. **File → Project Structure → Modules**
4. **Altere Language Level** para 11

### Problema: Hot reload não funciona

**Soluções:**
1. **Verifique DevTools** no `pom.xml`
2. **Build → Build Project** após alterações
3. **File → Settings → Build → Compiler**
   - ✅ **Build project automatically**

### Problema: CSS/JS não carregam

**Soluções:**
1. **Verifique pasta** `src/main/resources/static`
2. **Limpe cache** do navegador (Ctrl+F5)
3. **Restart aplicação** completamente
4. **Verifique console** do navegador para erros

## 📁 Estrutura de Arquivos no IntelliJ

### Visão do Project Explorer

```
📁 web-games-spring
├── 📁 .idea/                           # Configurações do IntelliJ
│   ├── 📄 compiler.xml                 # Configurações do compilador
│   ├── 📄 encodings.xml               # Configurações de encoding
│   ├── 📄 misc.xml                    # Configurações gerais
│   └── 📄 workspace.xml               # Workspace atual
├── 📁 src/
│   ├── 📁 main/
│   │   ├── 📁 java/
│   │   │   └── 📁 com.webgames/       # Pacote principal
│   │   │       ├── 📄 WebGamesApplication.java
│   │   │       ├── 📁 controller/
│   │   │       └── 📁 model/
│   │   └── 📁 resources/
│   │       ├── 📁 static/             # Arquivos web estáticos
│   │       ├── 📄 application.properties
│   │       └── 📄 banner.txt
│   └── 📁 test/                       # Testes unitários
├── 📁 target/                         # Arquivos compilados
├── 📄 pom.xml                         # Configuração Maven
└── 📄 README.md                       # Documentação
```

### Cores e Ícones

- 📁 **Pastas azuis**: Diretórios normais
- 📁 **Pastas verdes**: Source roots (src/main/java)
- 📁 **Pastas laranjas**: Resource roots (src/main/resources)
- ☕ **Ícone Java**: Arquivos .java
- 🌐 **Ícone HTML**: Arquivos .html
- 🎨 **Ícone CSS**: Arquivos .css
- ⚡ **Ícone JS**: Arquivos .js

## 🎯 Dicas de Produtividade

### 1. Live Templates

Crie templates para código repetitivo:
1. **File → Settings → Editor → Live Templates**
2. Clique em **"+"** → **Template Group**
3. Adicione templates personalizados

**Exemplo - Controller REST:**
```java
@RestController
@RequestMapping("/api/$NAME$")
public class $CLASS$Controller {
    
    @GetMapping
    public ResponseEntity<String> get$CLASS$() {
        return ResponseEntity.ok("$CLASS$ endpoint");
    }
}
```

### 2. Code Inspection

Configure inspeções de código:
1. **File → Settings → Editor → Inspections**
2. ✅ **Java → Probable bugs**
3. ✅ **Java → Performance issues**
4. ✅ **Spring → Spring Boot**

### 3. TODO Comments

Use comentários TODO para lembrar de tarefas:
```java
// TODO: Implementar validação de entrada
// FIXME: Corrigir bug na geração de Sudoku
// NOTE: Este método pode ser otimizado
```

Visualize TODOs: **View → Tool Windows → TODO**

### 4. Database Integration

Para projetos futuros com banco de dados:
1. **View → Tool Windows → Database**
2. **"+"** → **Data Source** → **MySQL/PostgreSQL**
3. Configure conexão e explore dados

## 🚀 Próximos Passos

### Expandindo o Projeto

1. **Adicionar testes unitários**:
   ```java
   @Test
   public void testSudokuGeneration() {
       SudokuBoard board = new SudokuBoard();
       board.generateNewPuzzle(45);
       assertTrue(board.isBoardValid());
   }
   ```

2. **Implementar APIs REST**:
   ```java
   @RestController
   @RequestMapping("/api/sudoku")
   public class SudokuController {
       @PostMapping("/new")
       public ResponseEntity<SudokuBoard> newGame() {
           // Implementar lógica
       }
   }
   ```

3. **Adicionar banco de dados**:
   - Spring Data JPA
   - H2 Database (desenvolvimento)
   - MySQL/PostgreSQL (produção)

### Deploy e Produção

1. **Gerar JAR executável**:
   ```bash
   mvn clean package
   ```

2. **Executar em produção**:
   ```bash
   java -jar target/web-games-spring-1.0.0.jar
   ```

3. **Deploy em cloud**:
   - Heroku
   - AWS Elastic Beanstalk
   - Google Cloud Platform
   - Azure App Service

---

**🎉 Parabéns!** Agora você tem um guia completo para desenvolver jogos web com Java e Spring Boot no IntelliJ IDEA.

Para dúvidas específicas, consulte a [documentação oficial do IntelliJ](https://www.jetbrains.com/help/idea/) ou a [documentação do Spring Boot](https://spring.io/projects/spring-boot).

