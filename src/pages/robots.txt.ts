import type { APIRoute } from 'astro';
import { STAGING } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const corpo = STAGING
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', new URL(import.meta.env.BASE_URL, site)).href}\n`;
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
