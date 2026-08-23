/**
 * Página de curso estilo W3Schools: sidebar com lições + área principal clara.
 * Usa a API quando disponível; senão, conteúdo estático por linguagem para já poder usar os cursos.
 */

const API = "/api";

/* Conteúdo padrão por linguagem (uso sem backend) */
const FALLBACK_COURSES = {
  python: { id: "fallback-python", codigo: "python", titulo: "Curso de Python", descricao: "Aprenda Python do zero, passo a passo." },
  java: { id: "fallback-java", codigo: "java", titulo: "Curso de Java", descricao: "Aprenda Java do zero, passo a passo." },
  javascript: { id: "fallback-js", codigo: "javascript", titulo: "Curso de JavaScript", descricao: "Aprenda JavaScript do zero, passo a passo." },
  typescript: { id: "fallback-ts", codigo: "typescript", titulo: "Curso de TypeScript", descricao: "Aprenda TypeScript do zero, passo a passo." },
  html: { id: "fallback-html", codigo: "html", titulo: "Curso de HTML", descricao: "Aprenda HTML do zero, passo a passo." },
  cpp: { id: "fallback-cpp", codigo: "cpp", titulo: "Curso de C++", descricao: "Aprenda C++ do zero, passo a passo." },
};

/* Códigos de exemplo por linguagem e tópico */
const EXAMPLE_CODES = {
  python: {
    hello: 'print("Olá, mundo!")\nprint("Bem-vindo ao curso de Python!")',
    vars: "nome = \"Maria\"\nidade = 25\nprint(\"Nome:\", nome, \"| Idade:\", idade)",
    numbers: "a = 10\nb = 3\nprint(\"Soma:\", a + b)\nprint(\"Multiplicação:\", a * b)",
    if: "idade = 18\nif idade >= 18:\n    print(\"Maior de idade\")\nelse:\n    print(\"Menor de idade\")",
    for: "for i in range(1, 4):\n    print(\"Número\", i)",
    list: "frutas = [\"maçã\", \"banana\", \"laranja\"]\nfor f in frutas:\n    print(f)",
    try: "nome = \"Quebra Código\"\nprint(\"Olá,\", nome)",
  },
  javascript: {
    hello: 'console.log("Olá, mundo!");\nconsole.log("Bem-vindo ao curso de JavaScript!");',
    vars: 'let nome = "Maria";\nlet idade = 25;\nconsole.log("Nome:", nome, "| Idade:", idade);',
    numbers: "let a = 10, b = 3;\nconsole.log(\"Soma:\", a + b);\nconsole.log(\"Multiplicação:\", a * b);",
    if: "let idade = 18;\nif (idade >= 18) console.log(\"Maior de idade\");\nelse console.log(\"Menor de idade\");",
    for: "for (let i = 1; i <= 3; i++) console.log(\"Número\", i);",
    list: "let frutas = [\"maçã\", \"banana\", \"laranja\"];\nfrutas.forEach(f => console.log(f));",
    try: 'let nome = "Quebra Código";\nconsole.log("Olá,", nome);',
  },
  typescript: {
    hello: 'console.log("Olá, mundo!");\nconsole.log("Bem-vindo ao curso de TypeScript!");',
    vars: 'let nome: string = "Maria";\nlet idade: number = 25;\nconsole.log("Nome:", nome, "| Idade:", idade);',
    numbers: "let a = 10, b = 3;\nconsole.log(\"Soma:\", a + b);\nconsole.log(\"Multiplicação:\", a * b);",
    if: "let idade = 18;\nif (idade >= 18) console.log(\"Maior de idade\");\nelse console.log(\"Menor de idade\");",
    for: "for (let i = 1; i <= 3; i++) console.log(\"Número\", i);",
    list: "let frutas: string[] = [\"maçã\", \"banana\", \"laranja\"];\nfrutas.forEach(f => console.log(f));",
    try: 'let nome = "Quebra Código";\nconsole.log("Olá,", nome);',
  },
  java: {
    hello: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Olá, mundo!");\n  }\n}',
    vars: 'public class Main {\n  public static void main(String[] args) {\n    String nome = "Maria";\n    int idade = 25;\n    System.out.println("Nome: " + nome + " | Idade: " + idade);\n  }\n}',
    numbers: "public class Main {\n  public static void main(String[] args) {\n    int a = 10, b = 3;\n    System.out.println(\"Soma: \" + (a+b));\n  }\n}",
    if: "public class Main {\n  public static void main(String[] args) {\n    int idade = 18;\n    if (idade >= 18) System.out.println(\"Maior de idade\");\n    else System.out.println(\"Menor de idade\");\n  }\n}",
    for: "public class Main {\n  public static void main(String[] args) {\n    for (int i = 1; i <= 3; i++) System.out.println(\"Número \" + i);\n  }\n}",
    list: "public class Main {\n  public static void main(String[] args) {\n    String[] frutas = {\"maçã\", \"banana\", \"laranja\"};\n    for (String f : frutas) System.out.println(f);\n  }\n}",
    try: 'public class Main {\n  public static void main(String[] args) {\n    String nome = "Quebra Código";\n    System.out.println("Olá, " + nome);\n  }\n}',
  },
  html: {
    hello: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Olá, mundo!</h1>\n</body>\n</html>",
    tags: "<!DOCTYPE html>\n<html>\n<body>\n  <p>Um parágrafo.</p>\n  <p>Outro parágrafo.</p>\n</body>\n</html>",
    links: '<!DOCTYPE html>\n<html>\n<body>\n  <a href="https://example.com">Clique aqui</a>\n</body>\n</html>',
    list: "<!DOCTYPE html>\n<html>\n<body>\n  <ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n  </ul>\n</body>\n</html>",
    try: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Seu título</h1>\n  <p>Seu texto.</p>\n</body>\n</html>",
  },
  cpp: {
    hello: '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Olá, mundo!";\n  return 0;\n}',
    vars: '#include <iostream>\nusing namespace std;\nint main() {\n  string nome = "Maria";\n  int idade = 25;\n  cout << "Nome: " << nome << " | Idade: " << idade;\n  return 0;\n}',
    numbers: '#include <iostream>\nusing namespace std;\nint main() {\n  int a = 10, b = 3;\n  cout << "Soma: " << (a+b);\n  return 0;\n}',
    if: '#include <iostream>\nusing namespace std;\nint main() {\n  int idade = 18;\n  if (idade >= 18) cout << "Maior de idade";\n  else cout << "Menor de idade";\n  return 0;\n}',
    for: '#include <iostream>\nusing namespace std;\nint main() {\n  for (int i = 1; i <= 3; i++) cout << "Número " << i << "\\n";\n  return 0;\n}',
    try: '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Olá, Quebra Codigo!";\n  return 0;\n}',
  },
};

const EXPECTED_OUTPUTS = {
  python: {
    hello: "Olá, mundo!\nBem-vindo ao curso de Python!",
    vars: "Nome: Maria | Idade: 25",
    numbers: "Soma: 13\nMultiplicação: 30",
    if: "Maior de idade",
    for: "Número 1\nNúmero 2\nNúmero 3",
    list: "maçã\nbanana\nlaranja",
    try: "Olá, Quebra Código",
  },
  javascript: {
    hello: "Olá, mundo!\nBem-vindo ao curso de JavaScript!",
    vars: "Nome: Maria | Idade: 25",
    numbers: "Soma: 13\nMultiplicação: 30",
    if: "Maior de idade",
    for: "Número 1\nNúmero 2\nNúmero 3",
    list: "maçã\nbanana\nlaranja",
    try: "Olá, Quebra Código",
  },
  typescript: {
    hello: "Olá, mundo!\nBem-vindo ao curso de TypeScript!",
    vars: "Nome: Maria | Idade: 25",
    numbers: "Soma: 13\nMultiplicação: 30",
    if: "Maior de idade",
    for: "Número 1\nNúmero 2\nNúmero 3",
    list: "maçã\nbanana\nlaranja",
    try: "Olá, Quebra Código",
  },
  java: {
    hello: "Olá, mundo!",
    vars: "Nome: Maria | Idade: 25",
    numbers: "Soma: 13",
    if: "Maior de idade",
    for: "Número 1\nNúmero 2\nNúmero 3",
    list: "maçã\nbanana\nlaranja",
    try: "Olá, Quebra Código",
  },
  html: {
    hello: "Renderiza um título: Olá, mundo!",
    tags: "Renderiza dois parágrafos.",
    links: "Renderiza um link clicável: Clique aqui",
    list: "Renderiza uma lista com Item 1 e Item 2.",
    try: "Renderiza o conteúdo HTML digitado.",
  },
  cpp: {
    hello: "Olá, mundo!",
    vars: "Nome: Maria | Idade: 25",
    numbers: "Soma: 13",
    if: "Maior de idade",
    for: "Número 1\nNúmero 2\nNúmero 3",
    try: "Olá, Quebra Codigo!",
  },
};

let expectedSnippetSeq = 0;
const EXPECTED_SNIPPETS = {};

function registerExpectedSnippet(expectedCode, expectedOutput) {
  expectedSnippetSeq += 1;
  const key = `exp_${expectedSnippetSeq}`;
  EXPECTED_SNIPPETS[key] = {
    code: expectedCode || "",
    output: expectedOutput || "",
  };
  return key;
}

function getExampleCode(lang, key) {
  const k = key || "hello";
  const langCodes = EXAMPLE_CODES[lang] || EXAMPLE_CODES.javascript;
  return langCodes[k] || langCodes.hello || "";
}

function getExpectedOutput(lang, key) {
  const k = key || "hello";
  const outputs = EXPECTED_OUTPUTS[lang] || EXPECTED_OUTPUTS.javascript;
  return outputs[k] || outputs.hello || "(Sem saída definida)";
}

/** Placeholder por linguagem (sem dar a resposta) */
function getPlaceholder(lang) {
  const placeholders = {
    python: "# Digite seu código aqui",
    javascript: "// Digite seu código aqui",
    typescript: "// Digite seu código aqui",
    java: "// Digite seu código aqui",
    html: "<!-- Digite seu código aqui -->",
    cpp: "// Digite seu código aqui",
  };
  return placeholders[lang] || "// Digite seu código aqui";
}

/** Texto inicial ainda não substituído — não conta como resposta válida */
function isPlaceholderOnly(code, lang) {
  const n = normalizeCode(code);
  if (!n) return true;
  const ph = normalizeCode(getPlaceholder(lang));
  if (n === ph) return true;
  if (n.toLowerCase() === ph.toLowerCase()) return true;
  return false;
}

/** Gera um bloco "Experimente você mesmo": textarea editável + Executar. Se startEmpty, não vem com a resposta. */
function tryItBlock(lang, initialCode, title, startEmpty, expectedCode, expectedOutput) {
  const code = startEmpty ? getPlaceholder(lang) : (initialCode || getExampleCode(lang, "try"));
  const codeEscaped = escapeHtml(code);
  const t = title || "Experimente você mesmo";
  const expectedKey = registerExpectedSnippet(expectedCode, expectedOutput);
  return `
    <div class="course-try-block">
      <div class="course-example-title">${escapeHtml(t)}</div>
      <textarea class="course-code-editor course-try-editor" data-lang="${escapeHtml(lang)}" data-expected-key="${escapeHtml(expectedKey)}" rows="6" placeholder="${escapeHtml(getPlaceholder(lang))}">${codeEscaped}</textarea>
      <div class="course-exercise-actions">
        <button type="button" class="course-run-btn" data-run-try>Executar</button>
      </div>
      <div class="course-output" data-output></div>
    </div>`;
}

/** Gera um bloco de exemplo (código fixo + Executar) */
function exampleBlock(lang, code, title, expectedOutput) {
  const t = title || "Exemplo";
  return `
    <div class="course-example">
      <div class="course-example-title">${escapeHtml(t)}</div>
      <div class="course-code" data-lang="${escapeHtml(lang)}">${escapeHtml(code)}</div>
      <button type="button" class="course-run-btn" data-run-inline data-expected-output="${escapeHtml(expectedOutput || "")}">Executar</button>
      <div class="course-output" data-output></div>
    </div>`;
}

function getFallbackLessons(codigo) {
  const lang = String(codigo).toLowerCase();
  const codes = EXAMPLE_CODES[lang] || EXAMPLE_CODES.javascript;
  const ex = (key) => getExampleCode(lang, key);
  const out = (key) => getExpectedOutput(lang, key);
  const exBlock = (key, title) => exampleBlock(lang, ex(key), title || "Exemplo", out(key));
  const tryBlock = (key, title, startEmpty = true) => tryItBlock(
    lang,
    ex(key || "try"),
    title || "Experimente você mesmo",
    startEmpty,
    ex(key || "try"),
    out(key || "try")
  );

  const lessons = [
    {
      id: "intro",
      titulo: "Introdução",
      ordem: 1,
      conteudo: `<p>Bem-vindo ao curso de <strong>${FALLBACK_COURSES[lang]?.titulo || codigo}</strong>!</p>
        <p>Neste curso você verá os conceitos básicos da linguagem. Cada lição tem <strong>exemplos</strong> que você pode executar e blocos <strong>"Experimente você mesmo"</strong> para escrever e testar seu próprio código.</p>
        <p>Use o menu à esquerda para navegar e os botões <strong>Executar</strong> para ver o resultado.</p>`,
    },
    {
      id: "hello",
      titulo: "Seu primeiro programa",
      ordem: 2,
      conteudo: `<p>O primeiro programa em quase toda linguagem é exibir uma mensagem na tela.</p>
        ${exBlock("hello")}
        ${tryBlock("hello", "Altere a mensagem e execute", true)}`,
    },
    {
      id: "vars",
      titulo: "Variáveis",
      ordem: 3,
      conteudo: `<p>Variáveis guardam valores para usar no programa. ${lang === "javascript" || lang === "typescript" ? "Em JS/TS usamos <code>let</code> ou <code>const</code>." : ""}</p>
        ${exBlock("vars")}
        ${tryBlock("vars", "Crie suas próprias variáveis e execute", true)}`,
    },
    {
      id: "numbers",
      titulo: "Números e operações",
      ordem: 4,
      conteudo: `<p>Você pode fazer contas com números: soma, subtração, multiplicação e divisão.</p>
        ${exBlock("numbers")}
        ${tryBlock("numbers", "Faça outras operações e execute", true)}`,
    },
    {
      id: "if",
      titulo: "Condicionais (if)",
      ordem: 5,
      conteudo: `<p>Com <code>if</code> e <code>else</code> o programa toma decisões conforme as condições.</p>
        ${exBlock("if")}
        ${tryBlock("if", "Mude o valor da variável e execute", true)}`,
    },
    {
      id: "for",
      titulo: "Laços (repetição)",
      ordem: 6,
      conteudo: `<p>Laços repetem um bloco de código. Aqui usamos um <code>for</code>.</p>
        ${exBlock("for")}
        ${tryBlock("for", "Altere o intervalo e execute", true)}`,
    },
    {
      id: "list",
      titulo: lang === "html" ? "Listas em HTML" : "Listas e coleções",
      ordem: 7,
      conteudo: lang === "html"
        ? `<p>Em HTML usamos <code>&lt;ul&gt;</code> (não ordenada) e <code>&lt;ol&gt;</code> (ordenada) para listas.</p>${exBlock("list")}${tryBlock("list", "Adicione mais itens e execute", true)}`
        : `<p>Listas (ou arrays) guardam vários valores em sequência.</p>${exBlock("list")}${tryBlock("list", "Adicione mais itens à lista e execute", true)}`,
    },
    {
      id: "practice",
      titulo: "Exercício prático",
      ordem: 8,
      conteudo: `<p>Use o bloco abaixo para praticar: escreva um pequeno programa que use variáveis, um <code>if</code> e um laço, e execute para ver o resultado.</p>
        ${tryBlock("try", "Escreva seu código aqui", true)}`,
    },
  ];

  if (lang === "html") {
    return [
      lessons[0],
      lessons[1],
      { id: "tags", titulo: "Tags básicas", ordem: 3, conteudo: `<p>HTML usa tags para estruturar o conteúdo. <code>&lt;p&gt;</code> é parágrafo, <code>&lt;h1&gt;</code> é título.</p>${exBlock("tags")}${tryBlock("tags", "Adicione mais tags e execute", true)}` },
      { id: "links", titulo: "Links", ordem: 4, conteudo: `<p>O elemento <code>&lt;a&gt;</code> com <code>href</code> cria um link.</p>${exBlock("links")}${tryBlock("links", "Altere o link e o texto e execute", true)}` },
      lessons[6],
      lessons[7],
    ];
  }

  return lessons;
}

function parseQuery() {
  const p = new URLSearchParams(window.location.search);
  return {
    curso: p.get("curso") || undefined,
    cursoId: p.get("cursoId") ? Number(p.get("cursoId")) : undefined,
    licaoId: p.get("licaoId") || undefined,
  };
}

function setUrlParams(params) {
  const u = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") u.searchParams.set(k, String(v));
    else u.searchParams.delete(k);
  });
  window.history.replaceState({}, "", u);
}

async function getCourse(codigoOrId) {
  if (typeof codigoOrId === "number") {
    const r = await fetch(`${API}/cursos/${codigoOrId}`);
    if (!r.ok) return null;
    return r.json();
  }
  const codigo = String(codigoOrId).toLowerCase();
  try {
    const byCodigo = await fetch(`${API}/cursos/codigo/${encodeURIComponent(codigo)}`);
    if (byCodigo.ok) return await byCodigo.json();
  } catch (_) {}
  const listRes = await fetch(`${API}/cursos`);
  if (!listRes.ok) return null;
  const courses = await listRes.json();
  const found = courses.find(
    (c) =>
      (c.codigo || "").toLowerCase() === codigo ||
      (c.titulo || "").toLowerCase().includes(codigo)
  );
  return found || null;
}

function getCourseOrFallback(codigo) {
  const c = FALLBACK_COURSES[String(codigo).toLowerCase()];
  if (c) return { ...c, id: c.id };
  return {
    id: "fallback",
    codigo: codigo,
    titulo: "Curso " + codigo,
    descricao: "Aprenda passo a passo.",
  };
}

async function getLessons(cursoId) {
  if (String(cursoId).startsWith("fallback")) return [];
  const r = await fetch(`${API}/licoes/curso/${cursoId}`);
  if (!r.ok) return [];
  return r.json();
}

async function getLesson(licaoId) {
  const r = await fetch(`${API}/licoes/${licaoId}`);
  if (!r.ok) throw new Error("Lição não encontrada.");
  return r.json();
}

async function getExercises(licaoId) {
  const r = await fetch(`${API}/exercicios/licao/${licaoId}`);
  if (!r.ok) return [];
  return r.json();
}

function getCourseCodigo(course) {
  return course.codigo || course.titulo?.toLowerCase().replace(/\s+/g, "-") || "curso";
}

function renderSidebar(course, lessons, currentLicaoId, codigo) {
  const navTitle = document.getElementById("course-nav-title");
  const nav = document.getElementById("course-nav");
  // topo da sidebar = NOME DO CURSO (com gradiente via .course-logo span)
  const courseLogo = document.getElementById("course-logo");
  if (courseLogo) courseLogo.innerHTML = "<span>" + escapeHtml(course.titulo || "Curso") + "</span>";
  // rótulo abaixo passa a ser apenas o título da seção de navegação
  navTitle.textContent = "Conteúdo";
  nav.innerHTML = "";
  lessons.forEach((l) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    const id = l.id;
    a.href = `course.html?curso=${encodeURIComponent(codigo)}&licaoId=${encodeURIComponent(id)}`;
    a.textContent = l.titulo || `Lição ${l.ordem}`;
    if (String(currentLicaoId) === String(id)) a.classList.add("active");
    li.appendChild(a);
    nav.appendChild(li);
  });
}

function escapeHtml(s) {
  if (s == null) return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function runCodeInBrowser(code, lang) {
  const out = { output: "", error: null, errorLine: null, errorColumn: null };
  if (lang !== "javascript" && lang !== "typescript") {
    out.output = "Execução simulada no navegador não disponível para esta linguagem.";
    return out;
  }
  try {
    const log = [];
    const fn = new Function("console", code);
    fn({ log: (...a) => log.push(a.map(String).join(" ")) });
    out.output = log.length ? log.join("\n") : "(Nenhuma saída)";
  } catch (e) {
    out.error = true;
    out.output = "Erro: " + (e.message || String(e));
    if (typeof e?.lineNumber === "number") out.errorLine = e.lineNumber;
    if (typeof e?.columnNumber === "number") out.errorColumn = e.columnNumber;
    const stack = String(e?.stack || "");
    const m = stack.match(/<anonymous>:(\d+):(\d+)/);
    if (m) {
      out.errorLine = Number(m[1]);
      out.errorColumn = Number(m[2]);
    }
  }
  return out;
}

function normalizeCode(code) {
  return String(code || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim();
}

function findFirstDifference(actual, expected) {
  const aLines = normalizeCode(actual).split("\n");
  const eLines = normalizeCode(expected).split("\n");
  const max = Math.max(aLines.length, eLines.length);
  for (let i = 0; i < max; i += 1) {
    const a = aLines[i] ?? "";
    const e = eLines[i] ?? "";
    if (a !== e) {
      let col = 1;
      const common = Math.min(a.length, e.length);
      for (let c = 0; c < common; c += 1) {
        if (a[c] !== e[c]) {
          col = c + 1;
          break;
        }
        col = common + 1;
      }
      return { line: i + 1, col, actualLine: a, expectedLine: e };
    }
  }
  return null;
}

/**
 * Preenche a área de resultado do aluno: acerto mostra a saída esperada;
 * erro destaca linha/coluna e trechos (quando houver diff ou comparação de saída).
 */
function applyStudentRunResult(el, result) {
  if (!el) return;
  el.classList.toggle("course-output--ok", !!result.ok);
  el.classList.toggle("error", !!result.error);

  if (result.ok) {
    const out = result.output != null ? String(result.output) : "";
    el.innerHTML =
      '<div class="course-run-feedback course-run-feedback--ok"><strong>Correto.</strong> Resultado esperado desta etapa:</div>' +
      `<pre class="course-run-pre course-run-pre--out">${escapeHtml(out)}</pre>`;
    return;
  }

  if (result.diff) {
    const d = result.diff;
    el.innerHTML =
      '<div class="course-run-feedback course-run-feedback--err"><strong>Incorreto.</strong> Ajuste o código na posição indicada.</div>' +
      `<p class="course-run-loc"><strong>Onde corrigir:</strong> linha <span class="course-run-loc-num">${d.line}</span>, coluna <span class="course-run-loc-num">${d.col}</span></p>` +
      '<div class="course-run-diff-label">Trecho esperado nesta linha (referência)</div>' +
      `<pre class="course-run-pre course-run-pre--ref">${escapeHtml(d.expectedLine ?? "(vazio)")}</pre>` +
      '<div class="course-run-diff-label">O que você tem nesta linha</div>' +
      `<pre class="course-run-pre course-run-pre--yours">${escapeHtml(d.actualLine ?? "(vazio)")}</pre>`;
    return;
  }

  if (result.outputCompare) {
    const exp = result.outputCompare.expected != null ? String(result.outputCompare.expected) : "";
    const act = result.outputCompare.actual != null ? String(result.outputCompare.actual) : "";
    el.innerHTML =
      '<div class="course-run-feedback course-run-feedback--err"><strong>Saída incorreta.</strong> O programa rodou, mas o resultado não bate com o esperado.</div>' +
      '<div class="course-run-diff-label">Saída esperada</div>' +
      `<pre class="course-run-pre course-run-pre--ref">${escapeHtml(exp)}</pre>` +
      '<div class="course-run-diff-label">Saída obtida com seu código</div>' +
      `<pre class="course-run-pre course-run-pre--yours">${escapeHtml(act)}</pre>`;
    return;
  }

  const msg = result.output != null ? String(result.output) : "";
  el.innerHTML =
    '<div class="course-run-feedback course-run-feedback--err"><strong>Revise o código ou a saída.</strong></div>' +
    `<pre class="course-run-pre">${escapeHtml(msg)}</pre>`;
}

function validateStudentCode(code, lang, expectedCode, expectedOutput) {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) {
    return { ok: false, output: "Digite algum código antes de executar.", error: true };
  }

  if (isPlaceholderOnly(code, lang)) {
    return {
      ok: false,
      output:
        "Substitua o texto de exemplo (placeholder) pelo código da lição. O que está na caixa ainda é só a dica inicial, não uma resposta.",
      error: true,
    };
  }

  const hasExpectedCode = String(expectedCode || "").trim().length > 0;
  const hasExpectedOut = String(expectedOutput || "").trim().length > 0;
  if (!hasExpectedCode && !hasExpectedOut) {
    return {
      ok: false,
      output:
        "Este exercício não tem resposta esperada configurada. Não é possível validar automaticamente.",
      error: true,
    };
  }

  if (lang === "javascript" || lang === "typescript") {
    const ran = runCodeInBrowser(code, lang);
    if (ran.error) {
      const loc = ran.errorLine ? ` (linha ${ran.errorLine}${ran.errorColumn ? `, coluna ${ran.errorColumn}` : ""})` : "";
      return { ok: false, output: `${ran.output}${loc}`, error: true };
    }
    if (hasExpectedOut && normalizeCode(ran.output) !== normalizeCode(expectedOutput)) {
      return {
        ok: false,
        error: true,
        output: "Saída incorreta.",
        outputCompare: { expected: expectedOutput || "", actual: ran.output || "" },
      };
    }
    if (hasExpectedCode && normalizeCode(code) !== normalizeCode(expectedCode)) {
      const diff = findFirstDifference(code, expectedCode || "");
      return {
        ok: false,
        error: true,
        output: "Código diferente do esperado.",
        diff: diff
          ? {
              line: diff.line,
              col: diff.col,
              expectedLine: diff.expectedLine,
              actualLine: diff.actualLine,
            }
          : undefined,
      };
    }
    const okOut = hasExpectedOut ? expectedOutput || "" : ran.output || "";
    return { ok: true, output: okOut || "(sem saída a exibir)", error: false };
  }

  if (normalizeCode(code) === normalizeCode(expectedCode)) {
    return { ok: true, output: expectedOutput || "Resposta correta.", error: false };
  }

  const diff = findFirstDifference(code, expectedCode || "");
  return {
    ok: false,
    error: true,
    output: "Código diferente do esperado.",
    diff: diff
      ? {
          line: diff.line,
          col: diff.col,
          expectedLine: diff.expectedLine,
          actualLine: diff.actualLine,
        }
      : undefined,
  };
}

function bindRunButtons(container, courseCodigo) {
  const lang = courseCodigo || "javascript";
  container.querySelectorAll("[data-run-inline]").forEach((btn) => {
    if (btn._bound) return;
    btn._bound = true;
    const codeEl = btn.closest(".course-example")?.querySelector(".course-code");
    const outEl = btn.closest(".course-example")?.querySelector("[data-output]");
    const expectedOutput = btn.getAttribute("data-expected-output") || "";
    btn.addEventListener("click", () => {
      if (!codeEl || !outEl) return;
      outEl.textContent = expectedOutput || "Saída esperada não definida para este exemplo.";
      outEl.classList.remove("error");
    });
  });
  container.querySelectorAll("[data-run-try]").forEach((btn) => {
    if (btn._boundTry) return;
    btn._boundTry = true;
    const block = btn.closest(".course-try-block");
    const textarea = block?.querySelector(".course-try-editor, .course-code-editor");
    const outEl = block?.querySelector("[data-output]");
    const codeLang = (textarea && textarea.getAttribute("data-lang")) || lang;
    const expectedKey = (textarea && textarea.getAttribute("data-expected-key")) || "";
    btn.addEventListener("click", () => {
      if (!textarea || !outEl) return;
      const key = textarea.getAttribute("data-expected-key") || expectedKey;
      const expectedNow = EXPECTED_SNIPPETS[key] || { code: "", output: "" };
      const langNow = (textarea.getAttribute("data-lang") || codeLang || lang).toLowerCase();
      const code = textarea.value;
      const result = validateStudentCode(code, langNow, expectedNow.code, expectedNow.output);
      applyStudentRunResult(outEl, result);
    });
  });
}

function renderLessonContent(lesson, exercises, courseCodigo, isFallback) {
  const area = document.getElementById("lesson-area");
  area.innerHTML = "";

  const titleEl = document.createElement("h2");
  titleEl.className = "course-lesson-title";
  titleEl.textContent = lesson.titulo || "Lição";
  area.appendChild(titleEl);

  if (lesson.conteudo) {
    const contentEl = document.createElement("div");
    contentEl.className = "course-lesson-content";
    contentEl.innerHTML = lesson.conteudo;
    area.appendChild(contentEl);
    bindRunButtons(contentEl, courseCodigo);
  }

  if (!isFallback && exercises && exercises.length) {
    const codeEx = exercises.filter((e) => e.tipo === "CODE");
    codeEx.forEach((ex) => {
      let initialCode = "";
      try {
        if (ex.dados) {
          const d = JSON.parse(ex.dados);
          initialCode = d.codigoInicial || d.code || "";
        }
      } catch (_) {}
      if (!initialCode && ex.respostaEsperada) initialCode = ex.respostaEsperada;

      const box = document.createElement("div");
      box.className = "course-example course-exercise-code";
      const exerciseLang =
        courseCodigo === "javascript" || courseCodigo === "typescript" ? courseCodigo : String(courseCodigo || "plaintext").toLowerCase();
      const expectedOutput = ex.respostaEsperada || "";
      const expectedKey = registerExpectedSnippet(initialCode, expectedOutput);
      box.innerHTML = `
        <div class="course-example-title">${escapeHtml(ex.enunciado || "Escreva o código")}</div>
        <textarea class="course-code-editor course-try-editor" data-lang="${escapeHtml(exerciseLang)}" data-expected-key="${escapeHtml(expectedKey)}" rows="6" placeholder="${escapeHtml(getPlaceholder(exerciseLang))}">${escapeHtml(initialCode)}</textarea>
        <div class="course-exercise-actions">
          <button type="button" class="course-run-btn run-exercise-btn">Executar</button>
        </div>
        <div class="course-output exercise-output"></div>
      `;
      area.appendChild(box);
      const runBtn = box.querySelector(".run-exercise-btn");
      const outputEl = box.querySelector(".exercise-output");
      const textarea = box.querySelector(".course-code-editor");
      runBtn.addEventListener("click", () => {
        const expectedKeyFromBox = textarea.getAttribute("data-expected-key") || "";
        const expected = EXPECTED_SNIPPETS[expectedKeyFromBox] || { code: "", output: "" };
        const langNow = (textarea.getAttribute("data-lang") || exerciseLang).toLowerCase();
        const result = validateStudentCode(textarea.value, langNow, expected.code, expected.output);
        applyStudentRunResult(outputEl, result);
      });
    });
  }
}

function showLoading(show) {
  document.getElementById("course-loading").style.display = show ? "block" : "none";
}

function showError(msg) {
  const el = document.getElementById("course-error");
  el.textContent = msg || "";
  el.style.display = msg ? "block" : "none";
}

function showContent(show) {
  document.getElementById("course-content").style.display = show ? "block" : "none";
}

function showPrevNext(prev, next) {
  const wrap = document.getElementById("prev-next");
  wrap.style.display = "block";
  document.getElementById("btn-prev").style.visibility = prev ? "visible" : "hidden";
  document.getElementById("btn-next").style.visibility = next ? "visible" : "hidden";
  document.getElementById("btn-prev").disabled = !prev;
  document.getElementById("btn-next").disabled = !next;
}

async function loadAndShowLesson(lessonId, course, lessons, codigo, isFallback) {
  let lesson;
  if (isFallback) {
    lesson = lessons.find((l) => String(l.id) === String(lessonId));
    if (!lesson) lesson = lessons[0];
  } else {
    lesson = await getLesson(lessonId);
  }
  const exercises = isFallback ? [] : await getExercises(lesson.id);
  renderLessonContent(lesson, exercises, codigo, isFallback);

  // Ao trocar de lição, volta para o topo da página
  window.scrollTo({ top: 0, behavior: "smooth" });
  const mainArea = document.querySelector(".course-main");
  if (mainArea) mainArea.scrollTo({ top: 0, behavior: "smooth" });

  // Atualiza qual item da sidebar está ativo (sem precisar re-renderizar tudo)
  const navLinks = document.querySelectorAll("#course-nav a");
  navLinks.forEach((a) => {
    const url = new URL(a.href, window.location.href);
    const linkLicaoId = url.searchParams.get("licaoId");
    if (String(linkLicaoId) === String(lessonId)) {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });

  const idx = lessons.findIndex((l) => String(l.id) === String(lessonId));
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < lessons.length - 1;
  showPrevNext(hasPrev, hasNext);

  document.getElementById("btn-prev").onclick = () => {
    if (idx > 0) {
      const prev = lessons[idx - 1];
      setUrlParams({ curso: codigo, licaoId: prev.id });
      loadAndShowLesson(prev.id, course, lessons, codigo, isFallback);
    }
  };
  document.getElementById("btn-next").onclick = () => {
    if (idx < lessons.length - 1) {
      const next = lessons[idx + 1];
      setUrlParams({ curso: codigo, licaoId: next.id });
      loadAndShowLesson(next.id, course, lessons, codigo, isFallback);
    }
  };
}

async function init() {
  const { curso, cursoId, licaoId } = parseQuery();
  const codigoParam = (cursoId ?? curso ?? "").toString().toLowerCase();
  showError("");
  showContent(false);
  showLoading(true);

  try {
    let course = await getCourse(cursoId ?? curso ?? "");
    let isFallback = false;
    if (!course) {
      course = getCourseOrFallback(codigoParam);
      isFallback = true;
    }

    let lessons = await getLessons(course.id);
    if (lessons.length === 0) {
      lessons = getFallbackLessons(getCourseCodigo(course));
      isFallback = true;
    }

    const codigo = getCourseCodigo(course);

    document.title = `${course.titulo || "Curso"} - Quebra Código`;

    renderSidebar(course, lessons, licaoId, codigo);

    const firstLesson = lessons[0];
    const toShowId = licaoId ?? (firstLesson && firstLesson.id);

    if (toShowId && firstLesson) {
      setUrlParams({ curso: codigo, licaoId: toShowId });
      await loadAndShowLesson(toShowId, course, lessons, codigo, isFallback);
    } else {
      document.getElementById("lesson-area").innerHTML =
        "<p class='course-no-lessons'>Nenhuma lição disponível. Use o menu ao lado ou volte à home.</p>";
      document.getElementById("prev-next").style.display = "none";
    }

    showLoading(false);
    showContent(true);
  } catch (e) {
    showLoading(false);
    showError(e.message || "Erro ao carregar o curso.");
  }
}

init();
