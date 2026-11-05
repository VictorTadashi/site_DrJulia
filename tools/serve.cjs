#!/usr/bin/env node
/*
 * tools/serve.cjs — servidor local para testar dist/ antes de publicar.
 * Reproduz o essencial da hospedagem: reescritas 200 do _redirects,
 * URLs limpas (/clinica -> clinica.html) e 404.html com status 404.
 *
 * Uso: npm run preview   (porta 8080, ou defina PORT)
 * Só para testes locais, não use em produção.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 8080;

if (!fs.existsSync(DIR)) {
  console.error('✖ dist/ não existe. Rode "npm run build" antes.');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.avif': 'image/avif', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.bin': 'application/octet-stream',
};

const rewrites = new Map();
const redirectsFile = path.join(DIR, '_redirects');
if (fs.existsSync(redirectsFile)) {
  for (const line of fs.readFileSync(redirectsFile, 'utf8').split(/\r?\n/)) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (from && to && !from.startsWith('#') && (!status || status === '200')) rewrites.set(from, to);
  }
}

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function resolve(urlPath) {
  let u = urlPath;
  if (rewrites.has(u)) u = rewrites.get(u);
  const rel = path.normalize(decodeURIComponent(u)).replace(/^([/\\])+/, '');
  const base = path.join(DIR, rel);
  if (!base.startsWith(DIR)) return null;
  for (const c of [base, base.replace(/[/\\]+$/, '') + '.html', path.join(base, 'index.html')]) {
    if (isFile(c)) return c;
  }
  return null;
}

http.createServer((req, res) => {
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  let file = resolve(urlPath);
  let status = 200;
  if (!file) { file = path.join(DIR, '404.html'); status = 404; }
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Servindo dist/ em http://localhost:${PORT}  (Ctrl+C para parar)`);
});
