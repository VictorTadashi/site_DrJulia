#!/usr/bin/env node
/*
 * tools/build.cjs — build do site Dra. Julia Amaral Brazil
 *
 * IMPORTANTE: este NÃO é o tools/build.cjs original (commit 2ec50cb), que gerou
 * a primeira versão do site e não acompanha este repositório. Depois daquele
 * build o site foi ajustado manualmente, e a pasta public/ passou a ser a fonte
 * da verdade.
 *
 * O que este script faz:
 *   1. Valida public/ (arquivos obrigatórios, referências locais, rotas, sitemap).
 *   2. Gera dist/ como cópia de public/ + dist/version.json.
 *
 * Uso:
 *   node tools/build.cjs           valida e gera dist/
 *   node tools/build.cjs --check   só valida
 *
 * Sem dependências: requer apenas Node >= 18.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'dist');
const CHECK_ONLY = process.argv.includes('--check');

const REQUIRED = ['index.html', '404.html', '.htaccess', '_headers', '_redirects', 'robots.txt', 'sitemap.xml'];
const SCANNED_EXT = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.xml']);
const SITE_DIRS = 'assets|imagens|fonts|videos|data|artigos';

// ---------- utilidades ----------

function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function readText(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

// ---------- coleta ----------

if (!fs.existsSync(SRC)) {
  console.error('✖ Pasta public/ não encontrada.');
  process.exit(1);
}

const files = listFiles(SRC);
const fileSet = new Set(files);
const dirSet = new Set();
for (const f of files) {
  const parts = f.split('/');
  for (let i = 1; i < parts.length; i++) dirSet.add(parts.slice(0, i).join('/'));
}

// Regras "origem destino 200" do _redirects (reescritas internas).
const rewrites = new Map();
if (fileSet.has('_redirects')) {
  for (const line of readText('_redirects').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to] = t.split(/\s+/);
    if (from && to) rewrites.set(from, to);
  }
}

/** Resolve um caminho absoluto do site ("/x/y") para um arquivo de public/, ou null. */
function resolveUrl(url) {
  let u = url.split('#')[0].split('?')[0];
  try { u = decodeURIComponent(u); } catch { /* mantém como está */ }
  if (rewrites.has(u)) u = rewrites.get(u);
  if (!u.startsWith('/')) return u; // reescrita para URL externa
  const p = u.replace(/^\/+/, '').replace(/\/+$/, '');
  if (p === '') return 'index.html';
  if (fileSet.has(p)) return p;
  if (fileSet.has(p + '.html')) return p + '.html';
  if (fileSet.has(p + '/index.html')) return p + '/index.html';
  if (dirSet.has(p)) return p + '/'; // prefixo de caminho montado em JS
  return null;
}

// ---------- validação ----------

const errors = [];
let refsChecked = 0;

for (const req of REQUIRED) {
  if (!fileSet.has(req)) errors.push(`Arquivo obrigatório ausente: ${req}`);
}

const refPattern = new RegExp(
  String.raw`(?:href|src|srcset|poster|content)\s*=\s*["']([^"']+)["']` +
  String.raw`|url\(\s*["']?(\/[^"')\s]+)` +
  String.raw`|["'](\/(?:${SITE_DIRS})(?:\/[^"'\s]*)?)["']`,
  'g'
);

const missing = new Map(); // url -> Set(arquivos que referenciam)
for (const f of files) {
  if (!SCANNED_EXT.has(path.extname(f))) continue;
  const text = readText(f);
  for (const m of text.matchAll(refPattern)) {
    for (const group of m.slice(1)) {
      if (!group) continue;
      for (const part of group.split(',')) {
        const url = part.trim().split(/\s+/)[0];
        if (!url.startsWith('/') || url.startsWith('//')) continue;
        refsChecked++;
        if (resolveUrl(url) === null) {
          if (!missing.has(url)) missing.set(url, new Set());
          missing.get(url).add(f);
        }
      }
    }
  }
}
for (const [url, from] of missing) {
  errors.push(`Referência quebrada: ${url}  (em ${[...from].slice(0, 3).join(', ')})`);
}

if (fileSet.has('site-routes.json')) {
  const routes = JSON.parse(readText('site-routes.json')).routes || [];
  for (const r of routes) {
    if (r.file && !fileSet.has(r.file)) errors.push(`site-routes.json: arquivo ausente ${r.file} (rota ${r.path})`);
  }
}

if (fileSet.has('sitemap.xml')) {
  for (const m of readText('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let pathname;
    try { pathname = new URL(m[1]).pathname; } catch { errors.push(`sitemap.xml: URL inválida ${m[1]}`); continue; }
    const hit = resolveUrl(pathname);
    if (!hit || !hit.endsWith('.html')) errors.push(`sitemap.xml: página não encontrada para ${m[1]}`);
  }
}

if (errors.length) {
  console.error(`✖ Validação falhou (${errors.length} problema(s)):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`✔ Validação OK: ${files.length} arquivos, ${refsChecked} referências locais checadas.`);
if (CHECK_ONLY) process.exit(0);

// ---------- geração de dist/ ----------

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });

let commit = 'unknown';
try {
  commit = execSync('git rev-parse HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch { /* fora de um repositório git */ }

fs.writeFileSync(
  path.join(OUT, 'version.json'),
  JSON.stringify({ commit, builtAt: new Date().toISOString(), builder: 'tools/build.cjs' }, null, 2) + '\n'
);

const totalBytes = listFiles(OUT).reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`✔ dist/ gerado: ${files.length + 1} arquivos, ${(totalBytes / 1048576).toFixed(1)} MB.`);
console.log('  Publique o CONTEÚDO de dist/ (inclui .htaccess, _headers e _redirects).');
