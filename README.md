# Site Dra. Julia Amaral Brazil

Site estático (HTML, CSS e JS) de **https://drajuliabrazil.com.br**.
Sem frameworks e sem dependências: só precisa do **Node ≥ 18** para rodar o build, que valida o site e gera a pasta de publicação.

## Início rápido

```bash
git clone https://github.com/VictorTadashi/site_DrJulia.git
cd site_DrJulia
npm run build      # valida public/ e gera dist/
npm run preview    # testa dist/ em http://localhost:8080
```

Não é preciso rodar `npm install`, porque não há pacotes.

## Estrutura

```
public/            ← O SITE (fonte da verdade). Edite aqui.
tools/build.cjs    ← valida public/ e gera dist/
tools/serve.cjs    ← servidor local para testar dist/
dist/              ← saída do build (não versionada). É ISTO que vai para a hospedagem.
netlify.toml       ← configuração automática para Netlify
package.json       ← scripts: check, build, preview
```

Dentro de `public/`:

| Caminho | Conteúdo |
|---|---|
| `index.html`, `clinica.html`, `sobre.html`, `artigos.html`, `privacidade.html`, `404.html` | Páginas |
| `artigos/` | Uma página por artigo |
| `assets/css/`, `assets/js/` | Estilos e scripts (minificados, com hash no nome) |
| `fonts/`, `imagens/`, `videos/`, `data/` | Mídia e dados das animações 3D |
| `.htaccess` | Config Apache: HTTPS, URLs limpas, cache, headers de segurança e 404 |
| `_headers`, `_redirects` | Mesma config, no formato Netlify / Cloudflare Pages |
| `sitemap.xml`, `robots.txt`, `site.webmanifest` | SEO e PWA |
| `site-routes.json`, `asset-manifest.json`, `media-manifest.json` | Metadados. O build usa o `site-routes.json` para validar as rotas; as páginas não leem esses arquivos. |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run check` | Só valida: arquivos obrigatórios, todas as referências locais (HTML/CSS/JS), rotas do `site-routes.json` e URLs do `sitemap.xml`. Falha com a lista de problemas. |
| `npm run build` | Valida e gera `dist/` (cópia de `public/` + `version.json` com o commit e a data do build). |
| `npm run preview` | Serve `dist/` localmente com URLs limpas e 404 (porta 8080, ou `PORT=xxxx`). |

## Como publicar

Em todos os casos, o que vai ao ar é o **conteúdo de `dist/`**.

### Apache (cPanel, Hostinger, KingHost, Locaweb etc.)
1. `npm run build`
2. Envie o **conteúdo** de `dist/` (não a pasta em si) para `public_html/` ou para a raiz do domínio.
3. Inclua o `.htaccess`. Ele é um arquivo oculto, então ative "mostrar arquivos ocultos" no gerenciador/FTP.
4. O servidor precisa de `mod_rewrite` e `mod_headers`. É o padrão na maioria das hospedagens.

### Netlify
Conecte o repositório. O `netlify.toml` já define `npm run build` e a pasta publicada `dist`. Não há mais nada a configurar.

### Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `dist`
- Os arquivos `_headers` e `_redirects` são aplicados automaticamente.

### Outros (Nginx, Vercel, S3/CloudFront)
Sirva `dist/` como estático. Para as URLs limpas funcionarem, mapeie `/clinica` → `clinica.html` e `/artigos/slug` → `artigos/slug.html`, e use o `404.html` como página de erro. As regras completas estão em `public/.htaccess` e `public/_redirects`.

## Domínio

O domínio configurado é `https://drajuliabrazil.com.br`, em `public/sitemap.xml` e `public/robots.txt`. Se mudar, atualize esses dois arquivos.

## Como editar o site

1. Altere os arquivos em `public/`.
2. Rode `npm run check`.
3. Faça commit e push. No Netlify/Cloudflare o deploy é automático; no Apache, rode `npm run build` e reenvie `dist/`.

> Os arquivos em `assets/css` e `assets/js` são minificados e têm hash no nome. Se renomear algum, atualize as referências nos HTML. O `npm run check` aponta qualquer referência quebrada.

## Histórico

A primeira versão do site foi gerada por um build externo (`tools/build.cjs` original, commit `2ec50cb`), que **não acompanha este repositório** e não está disponível. Depois dele o site foi ajustado manualmente: CSS e JS foram organizados em `assets/`, e a rolagem e o desempenho no celular foram corrigidos.
O `tools/build.cjs` atual foi **escrito do zero** para este repositório. Ele não regenera o site a partir de fontes: valida `public/` e gera `dist/`.
