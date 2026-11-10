import * as THREE from "three";
import type { Planet } from "@/data/planets";

type RGB = [number, number, number];

function hash(x: number, y: number, z: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const sm = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function vnoise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
}

function fbm(x: number, y: number, z: number, oct = 4) {
  let a = 0.5, f = 1, s = 0;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(x * f, y * f, z * f);
    f *= 2;
    a *= 0.5;
  }
  return s / 0.94;
}

const hex = (h: string): RGB => {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB => {
  const k = Math.min(1, Math.max(0, t));
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
};
const WHITE: RGB = [255, 255, 255];

function pickBand(pal: RGB[], v: number): RGB {
  const f = Math.min(0.9999, Math.max(0, v)) * (pal.length - 1);
  const i = Math.floor(f);
  return mix(pal[i], pal[i + 1], sm(f - i));
}

export function makePlanetTexture(p: Planet): THREE.CanvasTexture {
  const W = 512, H = 256;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const pal = p.surface.palette.map(hex);
  const kind = p.surface.kind;

  for (let y = 0; y < H; y++) {
    const lat = (0.5 - (y + 0.5) / H) * Math.PI;
    const py = Math.sin(lat);
    const cl = Math.cos(lat);
    for (let x = 0; x < W; x++) {
      const lon = ((x + 0.5) / W) * Math.PI * 2;
      const px = cl * Math.cos(lon);
      const pz = cl * Math.sin(lon);
      let c: RGB;

      if (kind === "earth") {
        const n = fbm(px * 2.2 + 1.3, py * 2.2, pz * 2.2);
        const sea = 0.5;
        if (n < sea) c = mix(pal[0], pal[1], sm((n - (sea - 0.2)) / 0.2));
        else {
          const h = (n - sea) / 0.2 + (fbm(px * 6, py * 6, pz * 6, 3) - 0.5);
          c = mix(pal[2], pal[3], h);
        }
        c = mix(c, pal[4], sm((Math.abs(py) - 0.86) / 0.08));
        const cloud = fbm(px * 3.4 + 9, py * 5.4, pz * 3.4 + 4);
        c = mix(c, WHITE, sm((cloud - 0.5) / 0.12) * 0.8);
      } else if (kind === "mars") {
        const n = fbm(px * 2.6, py * 2.6, pz * 2.6);
        c = mix(pal[0], pal[1], sm((n - 0.35) / 0.3));
        c = mix(c, pal[2], sm((fbm(px * 1.6 + 5, py * 1.6, pz * 1.6) - 0.52) / 0.12) * 0.7);
        c = mix(c, WHITE, sm((Math.abs(py) - 0.93) / 0.04) * 0.9);
      } else if (kind === "bands") {
        const warp = fbm(px * 2, py * 6, pz * 2) - 0.5;
        const v = Math.sin((py + warp * 0.18) * (p.surface.freq ?? 16)) * 0.5 + 0.5;
        c = pickBand(pal, v * 0.8 + (fbm(px * 8, py * 30, pz * 8, 3) - 0.5) * 0.25 + 0.1);
        if (p.surface.spot) {
          const dl = Math.atan2(Math.sin(lon - 4.2), Math.cos(lon - 4.2));
          const d = (dl / 0.22) ** 2 + ((lat + 0.36) / 0.1) ** 2;
          if (d < 1) c = mix(c, [176, 86, 58], (1 - d) * 0.9);
        }
      } else {
        const band = Math.sin(py * 9 + (fbm(px * 2, py * 4, pz * 2) - 0.5) * 2) * 0.5 + 0.5;
        c = pickBand(pal, 0.15 + band * 0.55 + (fbm(px * 3, py * 5, pz * 3) - 0.5) * 0.3);
        c = mix(c, WHITE, sm((fbm(px * 4 + 3, py * 16, pz * 4) - 0.66) / 0.08) * 0.35);
      }

      const o = (y * W + x) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const RING_IN = 1.3;
const RING_OUT = 2.3;

export function makeRingGeometry(): THREE.RingGeometry {
  const geo = new THREE.RingGeometry(RING_IN, RING_OUT, 128, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    uv.setXY(i, (v.length() - RING_IN) / (RING_OUT - RING_IN), 0.5);
  }
  return geo;
}

export function makeRingTexture(): THREE.CanvasTexture {
  const W = 512;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = 4;
  const ctx = cv.getContext("2d")!;
  for (let x = 0; x < W; x++) {
    const u = x / W;
    let a = 0;
    if (u < 0.2) a = 0.18; // cincin C, samar
    else if (u < 0.52) a = 0.85; // cincin B, terang
    else if (u < 0.56) a = 0.05; // celah Cassini
    else if (u < 0.92) a = 0.55; // cincin A
    a *= 0.8 + 0.2 * vnoise(u * 60, 0, 0);
    const g = 200 + Math.round(30 * vnoise(u * 40, 3, 0));
    ctx.fillStyle = `rgba(${g},${g - 14},${g - 50},${a})`;
    ctx.fillRect(x, 0, 1, 4);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
