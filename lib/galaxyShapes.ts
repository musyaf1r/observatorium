import type { ShapeId } from "@/data/galaxies";
import { gauss, makeRng } from "./rand";

export interface Shape {
  pos: Float32Array;
  col: Float32Array;
}

type P = [number, number, number, number]; // x, y, z, t (0 inti ... 1 tepi)
type Rng = () => number;

interface SpiralOpts {
  arms: number;
  radius: number;
  twist: number;
  spread: number;
  thick: number;
  bulge: number;
  bulgeR: number;
  bar?: number;
  barW?: number;
  barFrac?: number;
}

// Cakram berada di bidang xz, sumbu normal = y.
function spiral(o: SpiralOpts, r: Rng): P {
  const u = r();
  if (u < o.bulge) {
    const x = gauss(r) * o.bulgeR;
    const z = gauss(r) * o.bulgeR;
    const y = gauss(r) * o.bulgeR * 0.7;
    return [x, y, z, Math.min(1, Math.hypot(x, z) / o.radius) * 0.4];
  }
  if (o.bar && u < o.bulge + (o.barFrac ?? 0.1)) {
    return [gauss(r) * o.bar * 0.5, gauss(r) * o.thick, gauss(r) * (o.barW ?? 0.16), 0.15];
  }
  const startR = o.bar ? o.bar * 0.5 : 0.2;
  let rad = startR - Math.log(1 - r() * 0.97) * o.radius * 0.3;
  if (rad > o.radius) rad = startR + r() * (o.radius - startR);
  const arm = Math.floor(r() * o.arms);
  let ang = (arm * 2 * Math.PI) / o.arms + (o.twist * (rad - startR)) / o.radius;
  ang += (gauss(r) * o.spread) / (1 + rad * 0.8);
  rad += gauss(r) * o.spread * 0.2;
  const y = gauss(r) * o.thick * (1 - 0.5 * (rad / o.radius));
  return [rad * Math.cos(ang), y, rad * Math.sin(ang), Math.min(1, rad / o.radius)];
}

function rotate(p: P, rx: number, rz: number, ox: number, oy: number, oz: number): P {
  let [x, y, z] = p;
  // putar sumbu x
  let c = Math.cos(rx);
  let s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];
  // putar sumbu z
  c = Math.cos(rz);
  s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x + ox, y + oy, z + oz, p[3]];
}

const GENERATORS: Record<ShapeId, (r: Rng) => P> = {
  milkyway: (r) =>
    spiral({ arms: 2, radius: 3.4, twist: 5.2, spread: 0.35, thick: 0.07, bulge: 0.14, bulgeR: 0.5, bar: 1.5, barW: 0.16, barFrac: 0.12 }, r),

  andromeda: (r) =>
    spiral({ arms: 2, radius: 3.7, twist: 4.6, spread: 0.28, thick: 0.06, bulge: 0.16, bulgeR: 0.55 }, r),

  lmc: (r) => {
    if (r() < 0.45) {
      const x = gauss(r) * 1.1;
      const z = gauss(r) * 0.32;
      const c = Math.cos(0.4);
      const s = Math.sin(0.4);
      return [x * c - z * s, gauss(r) * 0.1, x * s + z * c, Math.min(1, Math.hypot(x, z) / 2.4)];
    }
    const x = gauss(r) * 1.5;
    const z = gauss(r) * 1.0;
    return [x, gauss(r) * 0.18, z, Math.min(1, Math.hypot(x, z) / 3)];
  },

  smc: (r) => {
    if (r() < 0.65) {
      const x = gauss(r) * 0.9 - 0.4;
      const z = gauss(r) * 0.55;
      return [x, gauss(r) * 0.15, z, Math.min(1, Math.hypot(x, z) / 2.2)];
    }
    const x = 1.0 + gauss(r) * 0.55;
    const z = 0.2 + gauss(r) * 0.3;
    return [x, gauss(r) * 0.12, z, 0.7];
  },

  sombrero: (r) => {
    if (r() < 0.55) {
      const x = gauss(r) * 0.95;
      const z = gauss(r) * 0.95;
      return [x, gauss(r) * 0.72, z, Math.min(1, Math.hypot(x, z) / 3.2) * 0.4];
    }
    const rad = 1.0 + r() * 2.3;
    const a = r() * Math.PI * 2;
    // celah di bidang tengah = pita debu
    const y = (r() < 0.5 ? -1 : 1) * (0.025 + Math.abs(gauss(r)) * 0.035);
    return [rad * Math.cos(a), y, rad * Math.sin(a), rad / 3.3];
  },

  arp273: (r) => {
    const u = r();
    if (u < 0.58) {
      return rotate(
        spiral({ arms: 2, radius: 2.3, twist: 4, spread: 0.3, thick: 0.05, bulge: 0.14, bulgeR: 0.35 }, r),
        0.15, 0.1, -1.2, 0, 0,
      );
    }
    if (u < 0.9) {
      return rotate(
        spiral({ arms: 2, radius: 1.0, twist: 3.2, spread: 0.2, thick: 0.04, bulge: 0.2, bulgeR: 0.22 }, r),
        1.0, 0.4, 2.0, 0.25, 0.3,
      );
    }
    const s = r();
    return [2.0 + 1.5 * s + gauss(r) * 0.08, 0.3 * s + gauss(r) * 0.06, 1.2 * Math.sin(s * Math.PI) + gauss(r) * 0.08, 0.85];
  },

  ngc253: (r) =>
    spiral({ arms: 2, radius: 3.8, twist: 4, spread: 0.35, thick: 0.05, bulge: 0.2, bulgeR: 0.45, bar: 1.1, barW: 0.14, barFrac: 0.1 }, r),

  m64: (r) =>
    spiral({ arms: 2, radius: 3.0, twist: 8.5, spread: 0.22, thick: 0.05, bulge: 0.3, bulgeR: 0.7 }, r),

  m101: (r) =>
    spiral({ arms: 2, radius: 3.6, twist: 5.5, spread: 0.4, thick: 0.05, bulge: 0.08, bulgeR: 0.35 }, r),
};

const cache = new Map<string, Shape>();

export function getShape(id: ShapeId, n: number): Shape {
  const key = `${id}:${n}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const r = makeRng(id.length * 7919 + id.charCodeAt(0) * 104729);
  const gen = GENERATORS[id];
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const [x, y, z, t] = gen(r);
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    // inti putih-hangat, tepi biru dingin (galaksi tampil di latar gelap)
    const k = Math.min(1, t * 1.1);
    const j = 0.55 + 0.45 * r();
    col[i * 3] = (1.0 + (0.55 - 1.0) * k) * j;
    col[i * 3 + 1] = (0.9 + (0.68 - 0.9) * k) * j;
    col[i * 3 + 2] = (0.65 + (1.0 - 0.65) * k) * j;
  }
  const shape = { pos, col };
  cache.set(key, shape);
  return shape;
}
