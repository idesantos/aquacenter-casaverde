import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

// ---------- Rolagem suave ----------
let velocity = 0;
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  lenis.on('scroll', (l: Lenis) => {
    velocity = l.velocity;
    ScrollTrigger.update();
  });
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // Âncoras internas também deslizam.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!;
    const el = id === '#top' ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis!.scrollTo(el as HTMLElement, { offset: id === '#top' ? 0 : -90, duration: 1.4 });
  });
} else {
  addEventListener('scroll', () => ScrollTrigger.update(), { passive: true });
}
(window as any).__lenis = lenis;

// ---------- Títulos palavra a palavra ----------
document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent!.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = part;
          w.append(inner);
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && !(child as HTMLElement).matches('br')) {
        walk(child);
      }
    });
  };
  el.setAttribute('aria-label', el.textContent!.replace(/\s+/g, ' ').trim());
  walk(el);
  el.querySelectorAll('.w').forEach((w) => w.setAttribute('aria-hidden', 'true'));
  if (reduced || el.hasAttribute('data-split-manual')) return;
  gsap.fromTo(el.querySelectorAll('.w > span'), { yPercent: 105, y: 0 }, {
    yPercent: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.06,
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    onStart: () => el.querySelectorAll<HTMLElement>('.w > span').forEach((s) => (s.style.willChange = 'transform')),
  });
});

// ---------- Revelações ----------
if (!reduced) {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.09,
        delay: Number((els[0] as HTMLElement).dataset.revealDelay || 0),
      }),
  });
}

// ---------- Contadores ----------
document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
  const to = Number(el.dataset.count);
  const from = Number(el.dataset.countFrom ?? 0);
  if (reduced) return void (el.textContent = String(to));
  const obj = { v: from };
  el.textContent = String(from);
  gsap.to(obj, {
    v: to,
    duration: 2.2,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    onUpdate: () => (el.textContent = String(Math.round(obj.v))),
  });
});

// ---------- Ondas vivas entre seções ----------
const waves = [...document.querySelectorAll<SVGSVGElement>('[data-wave]')];
const visibleWaves = new Set<SVGSVGElement>();
const waveIO = new IntersectionObserver((entries) =>
  entries.forEach((en) => (en.isIntersecting ? visibleWaves.add(en.target as SVGSVGElement) : visibleWaves.delete(en.target as SVGSVGElement))),
);
waves.forEach((w) => waveIO.observe(w));
let phase = 0;
let amp = 12;
function drawWave(svg: SVGSVGElement, i: number) {
  const path = svg.querySelector('path')!;
  const pts: string[] = [];
  const seg = 24;
  for (let s = 0; s <= seg; s++) {
    const x = (s / seg) * 1440;
    const k = (s / seg) * Math.PI * 2;
    const y = 50 + Math.sin(k * 1.5 + phase + i) * amp + Math.sin(k * 3.2 - phase * 1.4 + i * 2) * amp * 0.35;
    pts.push(`${s ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  path.setAttribute('d', `${pts.join(' ')} L1440 90 L0 90 Z`);
}
if (!reduced && waves.length) {
  gsap.ticker.add((_, dt) => {
    phase += dt * 0.0012;
    const target = 10 + Math.min(26, Math.abs(velocity) * 0.9);
    amp += (target - amp) * 0.06;
    visibleWaves.forEach((w) => drawWave(w, waves.indexOf(w)));
  });
}
waves.forEach((w, i) => drawWave(w, i));

// ---------- Profundímetro ----------
const depth = document.querySelector<HTMLElement>('[data-depth]');
const depthVal = document.querySelector<HTMLElement>('[data-depth-val]');
const depthFill = document.querySelector<HTMLElement>('[data-depth-fill]');
const depthLabel = document.querySelector<HTMLElement>('[data-depth-label-out]');
const labeled = [...document.querySelectorAll<HTMLElement>('[data-depth-label]')];
const mbar = document.querySelector<HTMLElement>('[data-mbar]');
const MAX_DEPTH = 3.2;
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, scrollY / max) : 0;
  if (depth) {
    const mid0 = innerHeight * 0.5;
    const atual = labeled.findLast((el) => el.getBoundingClientRect().top < mid0);
    depth.classList.toggle('is-on', scrollY > innerHeight * 0.4 && !atual?.hasAttribute('data-depth-hide'));
    depthVal!.textContent = `${(p * MAX_DEPTH).toFixed(1).replace('.', ',')} m`;
    depthFill!.style.transform = `scaleY(${p})`;
    depthLabel!.textContent = atual?.dataset.depthLabel ?? '';
  }
  mbar?.classList.toggle('is-on', scrollY > innerHeight * 0.7);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Botões: onda no clique ----------
document.addEventListener('pointerdown', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn');
  if (!btn || reduced) return;
  const r = btn.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'ripple-dot';
  dot.style.left = `${e.clientX - r.left}px`;
  dot.style.top = `${e.clientY - r.top}px`;
  btn.append(dot);
  setTimeout(() => dot.remove(), 800);
});

// ---------- Cards com inclinação 3D ----------
if (finePointer && !reduced) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

// ---------- Medição de conversões (GA4 / Meta Pixel quando instalados) ----------
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
  if (!el) return;
  const evento = el.dataset.track!;
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: `clique_${evento}`, pagina: location.pathname });
  w.gtag?.('event', `clique_${evento}`, { pagina: location.pathname });
  if (evento === 'whatsapp') w.fbq?.('track', 'Contact');
});

// Recalcula posições quando fontes e imagens terminam de carregar.
addEventListener('load', () => ScrollTrigger.refresh());

export { gsap, ScrollTrigger, lenis, reduced };
