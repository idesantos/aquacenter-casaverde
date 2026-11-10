const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefixa o caminho com o base do site (GitHub Pages usa /aquacenter). */
export const url = (path = '/') => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;

export const STAGING = import.meta.env.STAGING !== 'false' && process.env.STAGING !== 'false';
