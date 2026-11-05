# Site Dra. Julia Amaral Brazil

Site estático **pronto para publicar** (HTML, CSS e JS).
**Não tem etapa de build nem dependências**: nada de npm e nada para compilar. Publique os arquivos como estão.

## Origem

O site foi gerado originalmente por um build externo (`tools/build.cjs`, commit `2ec50cb`). Esse projeto-fonte **não acompanha este repositório** e não está disponível.
Depois do build, o site foi ajustado manualmente: CSS e JS foram organizados em `assets/`, e houve correções de rolagem e desempenho no celular.
**Este repositório é a fonte da verdade.** Edite os arquivos diretamente aqui.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `index.html`, `clinica.html`, `sobre.html`, `artigos.html`, `privacidade.html`, `404.html` | Páginas |
| `artigos/` | Páginas de cada artigo |
| `assets/css/`, `assets/js/` | Estilos e scripts (já minificados, com hash no nome) |
| `fonts/`, `imagens/`, `videos/`, `data/` | Mídia e dados usados pelas animações |
| `.htaccess` | Configuração para Apache: HTTPS, URLs limpas, cache e headers de segurança |
| `_headers`, `_redirects` | A mesma configuração, para Netlify e Cloudflare Pages |
| `sitemap.xml`, `robots.txt`, `site.webmanifest` | SEO e PWA |
| `asset-manifest.json`, `media-manifest.json`, `site-routes.json`, `version.json` | Metadados do build original. Nenhuma página lê esses arquivos. |

## Como publicar

### Apache (cPanel, Hostinger, KingHost etc.)
1. Envie **todo** o conteúdo da raiz do repositório para `public_html/` (ou para a raiz do domínio).
2. Inclua o `.htaccess`. Ele é um arquivo oculto, então ative "mostrar arquivos ocultos" no gerenciador.
3. O servidor precisa ter `mod_rewrite` e `mod_headers` ativos. É o padrão na maioria das hospedagens.

### Netlify / Cloudflare Pages
- Conecte este repositório.
- Build command: **(vazio)**
- Publish/output directory: **`/`** (a raiz)
- Os arquivos `_headers` e `_redirects` são aplicados automaticamente.

### Outros (Nginx, S3, Vercel)
Sirva a pasta como estática. Para as URLs limpas funcionarem, o servidor precisa mapear `/clinica` para `clinica.html` e `/artigos/slug` para `artigos/slug.html`. Use o `.htaccess` como referência das regras.

## Domínio

O domínio configurado é `https://drajuliabrazil.com.br`, em `sitemap.xml` e `robots.txt`. Se o domínio mudar, atualize esses dois arquivos.

## Testar localmente

```bash
npx serve .
# ou
python -m http.server 8000
```
