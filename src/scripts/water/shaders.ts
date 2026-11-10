// Shaders do motor de água. Simulação de altura (ping-pong) no estilo de
// Evan Wallace + render procedural de piscina vista de cima.

export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Até 16 gotas por passada: xy = centro (uv), z = raio (em alturas de tela), w = força.
export const DROP = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec4 uDrops[16];
uniform int uCount;
uniform float uAspect;
in vec2 vUv;
out vec4 o;
const float PI = 3.141592653589793;
void main() {
  vec4 info = texture(uTex, vUv);
  for (int i = 0; i < 16; i++) {
    if (i >= uCount) break;
    vec4 d = uDrops[i];
    vec2 diff = (d.xy - vUv) * vec2(uAspect, 1.0);
    float drop = max(0.0, 1.0 - length(diff) / d.z);
    drop = 0.5 - cos(drop * PI) * 0.5;
    info.r += drop * d.w;
  }
  o = info;
}`;

export const UPDATE = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uDelta;
uniform float uDamp;
in vec2 vUv;
out vec4 o;
void main() {
  vec4 info = texture(uTex, vUv);
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  float avg = (
    texture(uTex, vUv - dx).r + texture(uTex, vUv + dx).r +
    texture(uTex, vUv - dy).r + texture(uTex, vUv + dy).r
  ) * 0.25;
  info.g += (avg - info.r) * 2.0;
  info.g *= uDamp;
  info.r += info.g;
  info.r *= 0.9995;
  o = info;
}`;

export const NORMAL = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uDelta;
in vec2 vUv;
out vec4 o;
void main() {
  vec4 info = texture(uTex, vUv);
  vec3 dx = vec3(uDelta.x, texture(uTex, vec2(vUv.x + uDelta.x, vUv.y)).r - info.r, 0.0);
  vec3 dy = vec3(0.0, texture(uTex, vec2(vUv.x, vUv.y + uDelta.y)).r - info.r, uDelta.y);
  info.ba = normalize(cross(dy, dx)).xz;
  o = info;
}`;

export const COPY = /* glsl */ `#version 300 es
precision mediump float;
uniform sampler2D uTex;
in vec2 vUv;
out vec4 o;
void main() { o = texture(uTex, vUv); }`;

export const RENDER = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uSim;
uniform sampler2D uImg;
uniform vec2 uRes;
uniform float uTime;
uniform float uDive;
uniform float uMode;      // 0 = piscina procedural, 1 = foto
uniform vec4 uImgFit;     // xy = escala, zw = offset (cover)
uniform float uImgReady;
in vec2 vUv;
out vec4 o;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// Cáustica clássica tileável (joltz0r / Dave Hoskins).
float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

vec3 poolFloor(vec2 w) {
  float tiles = 22.0;
  vec2 tp = w * tiles;
  vec2 f = fract(tp);
  vec2 id = floor(tp);
  float g = 0.07;
  float grout = smoothstep(0.0, g, f.x) * smoothstep(1.0, 1.0 - g, f.x) * smoothstep(0.0, g, f.y) * smoothstep(1.0, 1.0 - g, f.y);
  float tv = hash(id);
  vec3 tile = mix(vec3(0.16, 0.66, 0.80), vec3(0.22, 0.74, 0.86), tv);
  // Raias: faixas de duas fileiras de pastilhas escuras.
  float lanes = step(abs(mod(id.y, 11.0) - 3.5), 0.6);
  tile = mix(tile, mix(vec3(0.03, 0.22, 0.42), vec3(0.05, 0.27, 0.48), tv), lanes);
  return mix(vec3(0.66, 0.92, 0.96), tile, grout);
}

vec3 underwater(vec2 uv, float aspect, float t) {
  vec2 w = vec2(uv.x * aspect, uv.y);
  vec3 top = vec3(0.40, 0.86, 0.95);
  vec3 bot = vec3(0.02, 0.27, 0.48);
  vec3 c = mix(bot, top, pow(uv.y, 1.4));
  // Raios de luz descendo da superfície.
  float sl = (w.x + (1.0 - uv.y) * 0.45);
  float rays = noise(vec2(sl * 7.0, t * 0.22)) * noise(vec2(sl * 13.0 + 4.0, t * 0.31 + 2.0));
  c += vec3(0.65, 0.95, 1.0) * pow(rays, 1.6) * 0.55 * smoothstep(0.05, 1.0, uv.y);
  // Brilho da superfície vista de baixo.
  float cs = caustic(vec2(w.x * 0.5, uv.y * 0.2 - t * 0.01), t * 0.5);
  c += vec3(0.8, 1.0, 1.0) * cs * smoothstep(0.78, 1.0, uv.y) * 0.8;
  // Bolhas subindo.
  for (int k = 0; k < 2; k++) {
    float sc = 7.0 + float(k) * 6.0;
    vec2 p = w * sc;
    p.y -= t * (0.9 + float(k) * 0.5);
    vec2 id = floor(p);
    vec2 f = fract(p) - 0.5;
    float h = hash(id + float(k) * 7.1);
    if (h > 0.86) {
      vec2 off = vec2(hash(id + 1.3) - 0.5, hash(id + 2.7) - 0.5) * 0.5;
      off.x += sin(t * 2.0 + h * 40.0) * 0.07;
      float r = 0.06 + 0.1 * hash(id + 5.1);
      float d = length(f - off);
      float ring = smoothstep(r, r - 0.025, d) * (0.25 + 0.75 * smoothstep(r - 0.05, r, d));
      float spec = smoothstep(r * 0.35, 0.0, length(f - off - vec2(-r * 0.35, r * 0.35)));
      c += vec3(0.85, 1.0, 1.0) * (ring * 0.45 + spec * 0.6);
    }
  }
  // Partículas em suspensão.
  vec2 mp = w * 60.0 + vec2(t * 0.6, -t * 0.4);
  float m = step(0.985, hash(floor(mp))) * smoothstep(0.45, 0.0, length(fract(mp) - 0.5));
  c += m * 0.25;
  return c;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  vec4 info = texture(uSim, uv);
  vec3 n = vec3(info.b, sqrt(max(0.0, 1.0 - dot(info.ba, info.ba))), info.a);

  // Ondulação ambiente para a água nunca ficar parada.
  vec2 q = uv * vec2(aspect, 1.0) * 2.6;
  float e = 0.03;
  float t1 = uTime * 0.16, t2 = uTime * 0.23;
  float a0 = noise(q + t1) + 0.5 * noise(q * 2.3 - t2);
  float ax = noise(q + vec2(e, 0.0) + t1) + 0.5 * noise((q + vec2(e, 0.0)) * 2.3 - t2);
  float ay = noise(q + vec2(0.0, e) + t1) + 0.5 * noise((q + vec2(0.0, e)) * 2.3 - t2);
  vec2 amb = vec2(ax - a0, ay - a0) / e * 0.022;
  n = normalize(n + vec3(amb.x, 0.0, amb.y));

  vec2 refr = n.xz;
  vec3 col;
  if (uMode < 0.5) {
    vec2 w = (uv + refr * 0.11) * vec2(aspect, 1.0);
    col = poolFloor(w);
    float cs = caustic(w * 0.55 + refr * 0.6, uTime * 0.45);
    col += vec3(0.75, 1.0, 1.0) * cs * 0.42;
    col = mix(col, vec3(0.0, 0.42, 0.62), 0.18);
    col *= 1.0 + info.r * 3.0;
  } else {
    vec2 iuv = (uv + refr * 0.05) * uImgFit.xy + uImgFit.zw;
    col = mix(vec3(0.05, 0.35, 0.55), texture(uImg, vec2(iuv.x, 1.0 - iuv.y)).rgb, uImgReady);
    float cs = caustic(uv * vec2(aspect, 1.0) * 0.7 + refr * 0.5, uTime * 0.4);
    col += vec3(0.7, 0.95, 1.0) * cs * 0.07;
    col *= 1.0 + info.r * 1.5;
  }

  // Reflexo do céu e brilhos especulares.
  float tilt = 1.0 - n.y;
  col = mix(col, vec3(0.88, 0.97, 1.0), clamp(tilt * 2.2, 0.0, 0.35));
  vec3 L = normalize(vec3(-0.25, 1.0, 0.35));
  vec3 H = normalize(L + vec3(0.0, 1.0, 0.0));
  float spec = pow(max(dot(n, H), 0.0), 900.0);
  col += vec3(1.0) * spec * (uMode < 0.5 ? 1.1 : 0.6);

  // Vinheta suave.
  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc, vc) * 0.45;

  // Mergulho: a linha d'água sobe e a câmera entra na piscina.
  if (uDive > 0.0) {
    float line = mix(-0.12, 1.12, uDive);
    float x = uv.x * aspect;
    float wv = sin(x * 7.0 + uTime * 2.1) * 0.014 + sin(x * 15.0 - uTime * 3.3) * 0.006 +
               (noise(vec2(x * 3.5, uTime * 0.7)) - 0.5) * 0.035;
    float edge = line + wv;
    float below = smoothstep(edge + 0.004, edge - 0.004, uv.y);
    vec3 uw = underwater(uv, aspect, uTime);
    col = mix(col, uw, below);
    float foam = exp(-abs(uv.y - edge) * 220.0);
    col += vec3(0.9, 1.0, 1.0) * foam * 0.55;
  }

  o = vec4(col, 1.0);
}`;

// Gotas (respingo 3D e gotas na lente) como point sprites que refratam a cena.
export const DROPLET_VERT = /* glsl */ `#version 300 es
in vec4 aP;   // xy = posição (uv), z = diâmetro (px), w = alpha
in float aLens;
out float vA;
out vec2 vCenter;
out float vSize;
out float vLens;
void main() {
  gl_Position = vec4(aP.xy * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = aP.z;
  vA = aP.w;
  vCenter = aP.xy;
  vSize = aP.z;
  vLens = aLens;
}`;

export const DROPLET_FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uRes;
in float vA;
in vec2 vCenter;
in float vSize;
in float vLens;
out vec4 o;
void main() {
  vec2 pc = gl_PointCoord * 2.0 - 1.0;
  pc.y = -pc.y;
  float r2 = dot(pc, pc);
  if (r2 > 1.0) discard;
  float r = sqrt(r2);
  float z = sqrt(1.0 - r2);
  vec2 px = vSize / uRes;
  // Gota na lente: imagem invertida e ampliada, como gota real no vidro.
  vec2 suv = vLens > 0.5 ? vCenter - pc * px * 1.4 : vCenter + pc * px * 0.6 * (1.0 - z);
  vec3 c = texture(uScene, clamp(suv, 0.001, 0.999)).rgb;
  c *= mix(0.7, 1.12, z);
  c = mix(c, vec3(0.02, 0.18, 0.32), smoothstep(0.7, 1.0, r) * 0.55);
  float hl = smoothstep(0.32, 0.0, length(pc - vec2(-0.33, 0.38)));
  c += hl * 0.85;
  c += smoothstep(0.85, 1.0, r) * smoothstep(-0.2, -0.9, pc.y) * 0.35;
  float aa = smoothstep(1.0, 0.86, r);
  o = vec4(c, aa * vA);
}`;
