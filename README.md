# Aquacenter Casa Verde · site novo

Site estático em [Astro](https://astro.build), com o mesmo visual do site da Aquacenter Vila Guilherme:
- hero com água interativa em WebGL;
- rolagem suave com Lenis;
- animações com GSAP.

- **Domínio:** https://aquacentercasaverde.com/, hospedado na Hostinger.
- **Projeto irmão:** `~/projetos/aquacenter-vila-guilherme`. Este projeto partiu dele em 10/11/2026.

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321/
npm run build    # build de teste (com noindex)
npm run pacote   # build de produção + aquacenter-casaverde-site.zip para subir na Hostinger
```

## Publicar

Não há deploy automático.
1. Rode `npm run pacote`.
2. Abra o hPanel do aquacentercasaverde.com, vá em Gerenciador de Arquivos e entre em `public_html`.
3. Suba `aquacenter-casaverde-site.zip`.
4. Extraia numa pasta chamada `site`.
5. Mova tudo de dentro de `site` para `public_html`, inclusive o `.htaccess`.
6. Apague a pasta `site` e o zip.

O build de produção gera:
- o `.htaccess`, com HTTPS, sem www, 301 das URLs antigas e PHP bloqueado;
- o sitemap;
- o `robots.txt`.

## Onde editar o conteúdo

| O quê | Arquivo |
|---|---|
| Telefones, WhatsApp, endereço, funcionamento, sobre, planos, convênios | `src/data/site.ts` |
| Grade de horários (vazia por enquanto) | `src/data/horarios.ts` |
| Modalidades (nome, resumo, foto, diferenciais) | `src/data/modalidades.ts` |
| Textos das modalidades (descrição e benefícios) | `src/data/modalidades-conteudo.json` |
| Metodologia e níveis (mascotes) | `src/data/metodo.ts` |
| Fotos | `src/assets/img/` |

## Água interativa

O código fica em `src/scripts/water/`:
- simulação de ondas na GPU (WebGL2);
- piscina procedural com cáusticas;
- respingo 3D;
- gotas na "lente";
- transição de mergulho.

Em aparelhos sem WebGL2, ou com "reduzir movimento" ativado, aparece uma versão estática.
