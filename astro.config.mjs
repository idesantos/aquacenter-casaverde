import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFile } from 'node:fs/promises';

// Produção (Hostinger) sai com `npm run pacote`, que liga STAGING=false.
// Sem isso o build é tratado como teste e leva noindex.
const site = process.env.SITE_URL ?? 'https://aquacentercasaverde.com';
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');
const staging = process.env.STAGING !== 'false';

// URLs antigas do WordPress que mudaram de lugar.
const antigas = {
  '/horairos/': '/horarios/',
  '/estrela/': '/metodo/#estrela',
  '/tartaruguinha/': '/metodo/#tartaruguinha',
  '/polvo/': '/metodo/#polvo',
  '/peixe/': '/metodo/#peixe',
  '/leaomarinho/': '/metodo/#leaomarinho',
  '/tubarao/': '/metodo/#tubarao',
  '/golfinho/': '/metodo/#golfinho',
  '/freepass/': '/contato/',
  '/convenios/': '/contato/',
  '/condicionamento/': '/musculacao/',
  '/local/': '/ginastica-2/#localizada',
  '/dancas/': '/ginastica-2/#dancas',
  '/jump/': '/ginastica-2/#jump',
  '/pilates/': '/#modalidades',
  '/bike-indoor/': '/#modalidades',
  '/black-friday/': '/planos/',
  // Bebê e Infantil viraram duas páginas em 13/11/2026.
  '/natacao-bebe-infantil/': '/natacao-infantil/',
};

// Sobras do WordPress que só existem no servidor antigo: viram 301 no .htaccess.
const sobrasWordpress = {
  '/project/': '/',
  '/category/uncategorized/': '/',
  '/author/admin/': '/',
  '/2020/11/24/hello-world/': '/',
};

const escapa = (p) => p.replace(/^\//, '').replace(/\/$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// .htaccess da Hostinger (LiteSpeed): HTTPS, sem www, 301 das URLs antigas e WordPress desativado.
function htaccess() {
  const regras = Object.entries({ ...antigas, ...sobrasWordpress })
    .map(([de, para]) => `RewriteRule ^${escapa(de)}/?$ ${para} [R=301,L,NE]`)
    .join('\n');
  return `DirectoryIndex index.html
ErrorDocument 404 /404.html
Options -Indexes

RewriteEngine On

RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^ https://aquacentercasaverde.com%{REQUEST_URI} [R=301,L,NE]

# O WordPress antigo pode continuar na pasta: nenhum PHP roda e as áreas dele ficam fechadas.
RewriteRule (^|/)(wp-admin|wp-includes)(/|$) - [F,L]
RewriteRule \\.php$ - [F,L]

${regras}

<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|webp|avif|jpg|jpeg|png|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
`;
}

export default defineConfig({
  site,
  base: base || '/',
  trailingSlash: 'always',
  redirects: Object.fromEntries(Object.entries(antigas).map(([de, para]) => [de, `${base}${para}`])),
  devToolbar: { enabled: false },
  integrations: [
    sitemap({ filter: (page) => !Object.keys(antigas).some((de) => page.endsWith(de)) }),
    {
      name: 'htaccess-producao',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          if (!staging) await writeFile(new URL('.htaccess', dir), htaccess());
        },
      },
    },
  ],
});
