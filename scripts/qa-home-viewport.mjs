/**
 * Validação rápida: desktop sem scroll na área principal; mobile com rolagem no documento.
 * Uso: servir static em http://127.0.0.1:8765/ e executar: node scripts/qa-home-viewport.mjs
 */
import { chromium } from "playwright";

const base = process.env.HOME_QA_URL || "http://127.0.0.1:8765/index.html";

async function measure(page) {
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 600));
  return page.evaluate(() => {
    const cv = document.querySelector(".content-viewport");
    const doc = document.documentElement;
    const body = document.body;
    const scalable = document.querySelector(".content-scalable");
    const t = scalable?.style?.transform || "";
    return {
      innerH: window.innerHeight,
      innerW: window.innerWidth,
      docScrollH: doc.scrollHeight,
      bodyScrollH: body.scrollHeight,
      viewportClientH: cv?.clientHeight ?? -1,
      viewportScrollH: cv?.scrollHeight ?? -1,
      viewportOverflowY: cv ? cv.scrollHeight - cv.clientHeight : -1,
      scalableTransform: t,
    };
  });
}

const browser = await chromium.launch();

const desktopSizes = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
];

const desktopResults = [];
for (const size of desktopSizes) {
  const ctx = await browser.newContext({ viewport: size });
  const page = await ctx.newPage();
  desktopResults.push({ size, ...(await measure(page)) });
  await page.close();
  await ctx.close();
}

// Mobile 390×844
const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 } });
const pageM = await ctxM.newPage();
const m = await measure(pageM);
await pageM.close();
await ctxM.close();

await browser.close();

const desktopOk = desktopResults.every(
  (d) =>
    d.viewportOverflowY <= 0 &&
    d.docScrollH <= d.innerH + 2 &&
    d.bodyScrollH <= d.innerH + 2
);

const mobileScrollsDoc = m.docScrollH > m.innerH + 10 || m.bodyScrollH > m.innerH + 10;

console.log(JSON.stringify({ desktop: desktopResults, mobile: m }, null, 2));
console.log(
  desktopOk
    ? "OK desktop: sem overflow vertical em .content-viewport e documento sem scroll extra (1920×1080 e 1366×768)."
    : "FALHA desktop: verificar overflow ou altura do documento."
);
console.log(
  mobileScrollsDoc
    ? "OK mobile: documento permite rolagem (conteúdo maior que viewport)."
    : "AVISO mobile: documento não mostrou scroll esperado (pode ser OK se conteúdo for curto)."
);

process.exit(desktopOk ? 0 : 1);
