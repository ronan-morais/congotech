/* CongoTech — sincroniza o HTML a partir da fonte única (js/projects.js)
 *
 *   node tools/sync.mjs
 *
 * 1. Regenera os cards estáticos do portfólio no index.html (entre os
 *    marcadores <!-- portfolio:start/end -->). São HTML puro: aparecem
 *    mesmo sem JavaScript e sem depender de nenhum outro arquivo.
 * 2. Versiona css/js com o hash do conteúdo (?v=…) para o navegador não
 *    misturar HTML novo com CSS/JS antigo em cache.
 *
 * Rode sempre que editar js/projects.js, css/styles.css ou js/*.js.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const write = (f, s) => writeFileSync(join(root, f), s);

/* ---------- 1. fonte única ---------- */
const src = read("js/projects.js");
const PROJECTS = new Function("window", src + "\nreturn window.PROJECTS;")({});

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const summary = (p) => p.services.map((s) => s.short).join(" · ") + " · " + p.year;

/* ---------- 2. cards estáticos no index.html ---------- */
const cards = PROJECTS.map(
  (p) => `        <a class="project reveal" data-reveal href="projeto.html?p=${encodeURIComponent(p.slug)}">
          <div class="project__cover">
            <img src="${esc(p.images[0])}" alt="${esc(p.title + " — " + p.type)}" loading="lazy" />
          </div>
          <div class="project__body">
            <span class="project__cat">${esc(p.category)}</span>
            <h3>${esc(p.title)}</h3>
            <span class="project__tag">${esc(summary(p))}</span>
          </div>
        </a>`
).join("\n");

const index = read("index.html");
const patched = index.replace(
  /<!-- portfolio:start -->[\s\S]*?<!-- portfolio:end -->/,
  `<!-- portfolio:start -->\n${cards}\n<!-- portfolio:end -->`
);
if (patched === index && !index.includes(cards)) {
  throw new Error("marcadores <!-- portfolio:start --> / <!-- portfolio:end --> não encontrados em index.html");
}
write("index.html", patched);

/* ---------- 3. cache-busting por hash de conteúdo ---------- */
const assets = ["css/styles.css", "js/projects.js", "js/main.js", "js/projeto.js"];
const versions = Object.fromEntries(
  assets.map((a) => [a, createHash("sha1").update(read(a)).digest("hex").slice(0, 8)])
);

for (const page of ["index.html", "projeto.html"]) {
  let html = read(page);
  for (const [asset, v] of Object.entries(versions)) {
    const path = asset.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    html = html.replace(
      new RegExp(`((?:src|href)=")${path}(?:\\?v=[0-9a-f]+)?(")`, "g"),
      `$1${asset}?v=${v}$2`
    );
  }
  write(page, html);
}

console.log(`cards: ${PROJECTS.length}`);
for (const [a, v] of Object.entries(versions)) console.log(`  ${a}?v=${v}`);
