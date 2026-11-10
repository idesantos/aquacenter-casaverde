import { VERT, DROP, UPDATE, NORMAL, COPY, RENDER, DROPLET_VERT, DROPLET_FRAG } from './shaders';

export type WaterOptions = {
  mode: 'pool' | 'image';
  image?: string;
  intro?: boolean;
  idleDrops?: boolean;
  onSplash?: () => void;
  onReady?: () => void;
};

export type Water = {
  splash: (x: number, y: number, power?: number) => void;
  setDive: (v: number) => void;
  destroy: () => void;
};

type Particle = { x: number; y: number; z: number; vx: number; vy: number; vz: number; r: number; lead?: boolean };
type LensDrop = { x: number; y: number; r: number; life: number; max: number; vy: number };

const CAM_H = 1.6; // altura da "câmera" sobre a água, em alturas de tela
const GRAVITY = 3.6;
const MAX_PARTICLES = 420;
const MAX_LENS = 36;

function compile(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    gl.attachShader(p, s);
  }
  gl.bindAttribLocation(p, 0, 'aPos');
  gl.bindAttribLocation(p, 0, 'aP');
  gl.bindAttribLocation(p, 1, 'aLens');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  const u: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i)!.name.replace(/\[0\]$/, '');
    u[name] = gl.getUniformLocation(p, name);
  }
  return { p, u };
}

type Target = { tex: WebGLTexture; fb: WebGLFramebuffer; w: number; h: number };

function target(gl: WebGL2RenderingContext, w: number, h: number, float: boolean): Target {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (float) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { tex, fb, w, h };
}

function freeTarget(gl: WebGL2RenderingContext, t?: Target) {
  if (!t) return;
  gl.deleteTexture(t.tex);
  gl.deleteFramebuffer(t.fb);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function createWater(canvas: HTMLCanvasElement, opts: WaterOptions): Water | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;
  if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return null;

  let prog: Record<string, ReturnType<typeof compile>>;
  try {
    prog = {
      drop: compile(gl, VERT, DROP),
      update: compile(gl, VERT, UPDATE),
      normal: compile(gl, VERT, NORMAL),
      copy: compile(gl, VERT, COPY),
      render: compile(gl, VERT, RENDER),
      droplet: compile(gl, DROPLET_VERT, DROPLET_FRAG),
    };
  } catch (err) {
    console.warn('[water] shader', err);
    return null;
  }

  // Triângulo de tela cheia.
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const quadVao = gl.createVertexArray();
  gl.bindVertexArray(quadVao);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Buffer das gotas: 4 floats (pos, tamanho, alpha) + 1 (lente).
  const dropData = new Float32Array((MAX_PARTICLES + MAX_LENS) * 5);
  const dropBuf = gl.createBuffer();
  const dropVao = gl.createVertexArray();
  gl.bindVertexArray(dropVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, dropBuf);
  gl.bufferData(gl.ARRAY_BUFFER, dropData.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 20, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 20, 16);
  gl.bindVertexArray(null);

  // Foto (modo imagem).
  let imgTex: WebGLTexture | null = null;
  let imgReady = 0;
  let imgW = 1;
  let imgH = 1;
  if (opts.mode === 'image' && opts.image) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      imgTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, imgTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      imgReady = 1;
    };
    img.src = opts.image;
  }

  const coarse = matchMedia('(pointer: coarse)').matches;
  let quality = coarse ? 1.25 : 1.5;
  let width = 0;
  let height = 0;
  let aspect = 1;
  let simA: Target | undefined;
  let simB: Target | undefined;
  let scene: Target | undefined;
  let simW = 0;
  let simH = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, quality);
    const w = Math.max(2, Math.round(rect.width * dpr));
    const h = Math.max(2, Math.round(rect.height * dpr));
    if (w === width && h === height) return;
    width = canvas.width = w;
    height = canvas.height = h;
    const newAspect = rect.width / Math.max(1, rect.height);
    // Recria a simulação só quando a proporção muda bastante.
    if (!simA || Math.abs(newAspect - aspect) / aspect > 0.12) {
      aspect = newAspect;
      const cells = coarse ? 150 * 150 : 230 * 230;
      simW = Math.round(Math.sqrt(cells * aspect));
      simH = Math.round(cells / simW);
      freeTarget(gl!, simA);
      freeTarget(gl!, simB);
      simA = target(gl!, simW, simH, true);
      simB = target(gl!, simW, simH, true);
      for (const t of [simA, simB]) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, t.fb);
        gl!.clearColor(0, 0, 0, 0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
      }
    }
    freeTarget(gl!, scene);
    scene = target(gl!, width, height, false);
  }

  function pass(p: ReturnType<typeof compile>, out: Target | null, bind: (u: Record<string, WebGLUniformLocation | null>) => void) {
    gl!.useProgram(p.p);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, out ? out.fb : null);
    gl!.viewport(0, 0, out ? out.w : width, out ? out.h : height);
    bind(p.u);
    gl!.bindVertexArray(quadVao);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function swap() {
    const t = simA;
    simA = simB;
    simB = t;
  }

  // ---- Estado ----
  const drops: number[][] = [];
  const particles: Particle[] = [];
  const lens: LensDrop[] = [];
  let dive = 0;
  let time = 0;
  let last = performance.now();
  let raf = 0;
  let running = false;
  let visible = true;
  let destroyed = false;
  let nextIdle = 1.5;
  let introAt = opts.intro ? 0.45 : -1;
  let readyFired = false;
  let frameAvg = 16;
  let frames = 0;

  const addDrop = (x: number, y: number, radius: number, strength: number) => {
    if (drops.length < 16) drops.push([x, y, radius, strength]);
  };

  function burst(x: number, y: number, power: number) {
    const wx = x * aspect;
    const count = Math.round(70 * power);
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
      const a = (i / count) * Math.PI * 2 + rand(-0.15, 0.15);
      const sp = rand(0.25, 0.75) * power;
      particles.push({ x: wx, y, z: 0.01, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rand(0.9, 1.9) * power, r: rand(0.003, 0.009) });
    }
    // Jato central — algumas gotas chegam até a "lente".
    const jet = Math.round(22 * power);
    for (let i = 0; i < jet && particles.length < MAX_PARTICLES; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(0.02, 0.22);
      particles.push({ x: wx, y, z: 0.02, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rand(2.4, 3.6) * Math.min(1, power + 0.15), r: rand(0.006, 0.014) });
    }
  }

  function splash(x: number, y: number, power = 1) {
    addDrop(x, y, 0.05 * power + 0.02, 0.05 * power);
    addDrop(x, y, 0.12 * power, -0.012 * power);
    burst(x, y, power);
  }

  function project(p: Particle) {
    const s = CAM_H / Math.max(0.05, CAM_H - p.z);
    const cx = aspect * 0.5;
    return { x: (cx + (p.x - cx) * s) / aspect, y: 0.5 + (p.y - 0.5) * s, s };
  }

  function step(dt: number) {
    time += dt;

    // Abertura: uma gota cai da "câmera" até a água e explode.
    if (introAt >= 0 && time >= introAt) {
      introAt = -1;
      const ix = aspect > 1 ? 0.68 : 0.5;
      const iy = aspect > 1 ? 0.55 : 0.62;
      particles.push({ x: ix * aspect, y: iy, z: CAM_H * 0.86, vx: 0, vy: 0, vz: -2.6, r: 0.016, lead: true });
    }

    if (opts.idleDrops && (time > nextIdle)) {
      nextIdle = time + rand(1.1, 2.4);
      addDrop(rand(0.05, 0.95), rand(0.05, 0.95), rand(0.012, 0.02), rand(0.008, 0.016));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vz -= GRAVITY * dt;
      p.vx *= 0.995;
      p.vy *= 0.995;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      if (p.vz > 0 && p.z > CAM_H * 0.84) {
        // Bateu na lente.
        const pr = project(p);
        if (Math.random() < 0.7 && lens.length < MAX_LENS && pr.x > 0 && pr.x < 1 && pr.y > 0 && pr.y < 1) {
          const life = rand(3.5, 8);
          lens.push({ x: pr.x, y: pr.y, r: rand(0.01, 0.032), life, max: life, vy: 0 });
        }
        particles.splice(i, 1);
        continue;
      }
      if (p.z <= 0 && p.vz < 0) {
        const ux = p.x / aspect;
        if (p.lead) {
          splash(ux, p.y, 1);
          opts.onSplash?.();
        } else if (ux > 0 && ux < 1 && p.y > 0 && p.y < 1 && Math.random() < 0.3) {
          addDrop(ux, p.y, 0.022, 0.002 + p.r * 0.25);
        }
        particles.splice(i, 1);
      }
    }

    for (let i = lens.length - 1; i >= 0; i--) {
      const d = lens[i];
      d.life -= dt;
      if (d.r > 0.022) {
        d.vy = Math.min(d.vy + dt * 0.02, 0.06);
        d.y -= d.vy * dt;
      }
      if (d.life <= 0 || d.y < -0.05) lens.splice(i, 1);
    }
  }

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Qualidade adaptativa: se o aparelho sofrer, reduz a resolução.
    frameAvg = frameAvg * 0.95 + (dt * 1000) * 0.05;
    if (++frames % 90 === 0 && frameAvg > 24 && quality > 0.75) {
      quality = Math.max(0.75, quality - 0.25);
      width = 0;
    }

    resize();
    step(dt);
    if (!simA || !simB || !scene) return;

    if (drops.length) {
      const flat = new Float32Array(64);
      drops.forEach((d, i) => flat.set(d, i * 4));
      const count = drops.length;
      pass(prog.drop, simB, (u) => {
        gl!.activeTexture(gl!.TEXTURE0);
        gl!.bindTexture(gl!.TEXTURE_2D, simA!.tex);
        gl!.uniform1i(u.uTex, 0);
        gl!.uniform4fv(u.uDrops, flat);
        gl!.uniform1i(u.uCount, count);
        gl!.uniform1f(u.uAspect, aspect);
      });
      swap();
      drops.length = 0;
    }

    for (let i = 0; i < 2; i++) {
      pass(prog.update, simB, (u) => {
        gl!.bindTexture(gl!.TEXTURE_2D, simA!.tex);
        gl!.uniform1i(u.uTex, 0);
        gl!.uniform2f(u.uDelta, 1 / simW, 1 / simH);
        gl!.uniform1f(u.uDamp, 0.99);
      });
      swap();
    }
    pass(prog.normal, simB, (u) => {
      gl!.bindTexture(gl!.TEXTURE_2D, simA!.tex);
      gl!.uniform1i(u.uTex, 0);
      gl!.uniform2f(u.uDelta, 1 / simW, 1 / simH);
    });
    swap();

    const hasDrops = particles.length > 0 || lens.length > 0;
    pass(prog.render, hasDrops ? scene : null, (u) => {
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, simA!.tex);
      gl!.uniform1i(u.uSim, 0);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, imgTex);
      gl!.uniform1i(u.uImg, 1);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.uniform2f(u.uRes, width, height);
      gl!.uniform1f(u.uTime, time);
      gl!.uniform1f(u.uDive, dive);
      gl!.uniform1f(u.uMode, opts.mode === 'image' ? 1 : 0);
      gl!.uniform1f(u.uImgReady, imgReady);
      // "cover": escala o uv para a foto preencher a tela sem distorcer.
      const ca = width / height;
      const ia = imgW / imgH;
      const sx = ca > ia ? 1 : ca / ia;
      const sy = ca > ia ? ia / ca : 1;
      gl!.uniform4f(u.uImgFit, sx, sy, (1 - sx) / 2, (1 - sy) / 2);
    });

    if (!readyFired && (opts.mode === 'pool' || imgReady)) {
      readyFired = true;
      opts.onReady?.();
    }

    if (hasDrops) {
      pass(prog.copy, null, (u) => {
        gl!.bindTexture(gl!.TEXTURE_2D, scene!.tex);
        gl!.uniform1i(u.uTex, 0);
      });
      let n = 0;
      const unit = height;
      for (const p of particles) {
        const pr = project(p);
        dropData.set([pr.x, pr.y, Math.min(220, p.r * 2 * unit * pr.s), 1, 0], n * 5);
        n++;
      }
      for (const d of lens) {
        const a = Math.min(1, d.life / 1.2) * Math.min(1, (d.max - d.life) / 0.12);
        dropData.set([d.x, d.y, d.r * 2 * unit * (0.8 + 0.2 * Math.min(1, d.life / d.max + 0.3)), a, 1], n * 5);
        n++;
      }
      gl!.useProgram(prog.droplet.p);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, width, height);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.bindTexture(gl!.TEXTURE_2D, scene!.tex);
      gl!.uniform1i(prog.droplet.u.uScene, 0);
      gl!.uniform2f(prog.droplet.u.uRes, width, height);
      gl!.bindVertexArray(dropVao);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, dropBuf);
      gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, dropData, 0, n * 5);
      gl!.drawArrays(gl!.POINTS, 0, n);
      gl!.disable(gl!.BLEND);
    }
  }

  function start() {
    if (running || destroyed || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // ---- Interação: rastro de ondas no mouse/dedo e respingo no clique/toque ----
  let lastPt: { x: number; y: number; t: number } | null = null;
  const toUv = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height, inside: e.clientY >= r.top && e.clientY <= r.bottom };
  };
  const host = canvas.parentElement!;
  const onMove = (e: PointerEvent) => {
    const p = toUv(e);
    if (!p.inside) return;
    const now = performance.now();
    if (lastPt) {
      const dx = (p.x - lastPt.x) * aspect;
      const dy = p.y - lastPt.y;
      const dist = Math.hypot(dx, dy);
      const speed = dist / Math.max(1, now - lastPt.t);
      const steps = Math.min(4, Math.ceil(dist / 0.025));
      for (let i = 1; i <= steps; i++) {
        const k = i / steps;
        addDrop(lastPt.x + (p.x - lastPt.x) * k, lastPt.y + (p.y - lastPt.y) * k, 0.022, Math.min(0.022, 0.004 + speed * 0.5));
      }
    }
    lastPt = { x: p.x, y: p.y, t: now };
  };
  const onLeave = () => (lastPt = null);
  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button,input,select,textarea,label')) return;
    const p = toUv(e);
    if (p.inside) splash(p.x, p.y, 0.55);
  };
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerleave', onLeave);
  host.addEventListener('pointerdown', onDown);

  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    destroyed = true;
    canvas.dispatchEvent(new CustomEvent('water:lost', { bubbles: true }));
  });

  resize();
  start();

  return {
    splash,
    setDive: (v) => (dive = Math.max(0, Math.min(1, v))),
    destroy() {
      destroyed = true;
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown);
    },
  };
}
