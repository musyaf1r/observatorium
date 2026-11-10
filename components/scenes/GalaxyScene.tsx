"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import type { Galaxy } from "@/data/galaxies";
import { getShape } from "@/lib/galaxyShapes";
import { makeRng } from "@/lib/rand";
import { PAGER_MS, clamp, ease } from "@/lib/motion";

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPx;
  uniform float uOpacity;
  varying vec3 vC;
  varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.78 + 0.22 * sin(uTime * 1.5 + aSeed * 40.0);
    gl_PointSize = aSize * uPx * tw * (22.0 / -mv.z);
    vC = aColor;
    vA = uOpacity * tw;
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  varying vec3 vC;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vC, smoothstep(0.5, 0.0, d) * vA);
  }
`;

interface Trans {
  from: Float32Array;
  to: Float32Array;
  fromC: Float32Array;
  toC: Float32Array;
  t0: number;
  on: boolean;
  dir: number;
}

function Cloud({ galaxy, dir, count, reduced }: { galaxy: Galaxy; dir: number; count: number; reduced: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { size, seed, scatter, p0, c0 } = useMemo(() => {
    const r = makeRng(4242);
    const sh = getShape(galaxy.shape, count);
    return {
      size: Float32Array.from({ length: count }, () => 0.8 + r() * 1.8),
      seed: Float32Array.from({ length: count }, () => r()),
      scatter: Float32Array.from({ length: count * 3 }, () => (r() - 0.5) * 1.6),
      p0: new Float32Array(sh.pos),
      c0: new Float32Array(sh.col),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPx: { value: 1 }, uOpacity: { value: 1 } }), []);
  const tr = useRef<Trans>({ from: p0, to: p0, fromC: c0, toC: c0, t0: -1e9, on: false, dir });
  const lastId = useRef(galaxy.id);
  const tilt = useRef({ x: 0, z: 0 });
  const dirRef = useRef(dir);
  dirRef.current = dir;

  useEffect(() => {
    if (lastId.current === galaxy.id) return;
    lastId.current = galaxy.id;
    const g = geoRef.current;
    if (!g) return;
    const sh = getShape(galaxy.shape, count);
    const t = tr.current;
    t.from = new Float32Array(g.getAttribute("position").array as Float32Array);
    t.fromC = new Float32Array(g.getAttribute("aColor").array as Float32Array);
    t.to = sh.pos;
    t.toC = sh.col;
    t.t0 = performance.now();
    t.on = true;
    t.dir = dirRef.current;
  }, [galaxy, count]);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPx.value = state.gl.getPixelRatio();

    const g = geoRef.current;
    const t = tr.current;
    let e = 1;
    if (g && t.on) {
      const k = clamp((performance.now() - t.t0) / (reduced ? 1 : PAGER_MS + 150), 0, 1);
      e = reduced ? 1 : ease(k);
      const pa = g.getAttribute("position") as THREE.BufferAttribute;
      const ca = g.getAttribute("aColor") as THREE.BufferAttribute;
      const sc = reduced ? 0 : Math.sin(Math.PI * e);
      for (let i = 0; i < count * 3; i++) {
        pa.array[i] = t.from[i] + (t.to[i] - t.from[i]) * e + scatter[i] * sc;
        ca.array[i] = t.fromC[i] + (t.toC[i] - t.fromC[i]) * e;
      }
      pa.needsUpdate = true;
      ca.needsUpdate = true;
      uniforms.uOpacity.value = reduced ? 1 : 0.35 + 0.65 * Math.abs(1 - 2 * e);
      if (k >= 1) {
        t.on = false;
        uniforms.uOpacity.value = 1;
      }
    }

    // rotasi lambat + bergeser sedikit mengikuti penunjuk
    const o = outer.current;
    if (o) {
      const s = spin.current;
      if (s && !reduced) s.rotation.y += dt * galaxy.spin;
      const tx = (Math.PI / 2 - THREE.MathUtils.degToRad(galaxy.inclination)) + state.pointer.y * -0.12;
      const tz = THREE.MathUtils.degToRad(galaxy.roll);
      const kk = 1 - Math.exp(-dt / 0.35);
      tilt.current.x += (tx - tilt.current.x) * kk;
      tilt.current.z += (tz - tilt.current.z) * kk;
      o.rotation.x = tilt.current.x;
      o.rotation.z = tilt.current.z;
      o.rotation.y += (state.pointer.x * 0.18 - o.rotation.y) * kk;
      o.position.x = t.on && !reduced ? t.dir * 1.2 * (1 - e) : 0;
    }
  });

  return (
    <group ref={outer}>
      <group ref={spin}>
        <points frustumCulled={false}>
          <bufferGeometry ref={geoRef}>
            <bufferAttribute attach="attributes-position" args={[p0.slice(), 3]} usage={THREE.DynamicDrawUsage} />
            <bufferAttribute attach="attributes-aColor" args={[c0.slice(), 3]} usage={THREE.DynamicDrawUsage} />
            <bufferAttribute attach="attributes-aSize" args={[size, 1]} />
            <bufferAttribute attach="attributes-aSeed" args={[seed, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={matRef}
            uniforms={uniforms}
            vertexShader={VERT}
            fragmentShader={FRAG}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}

interface Props {
  galaxy: Galaxy;
  dir: number;
  running: boolean;
  reduced: boolean;
  count: number;
}

export default function GalaxyScene({ galaxy, dir, running, reduced, count }: Props) {
  return (
    <div className="absolute inset-0" role="img" aria-label={`Awan titik galaksi ${galaxy.name}`}>
      <Canvas
        dpr={[1, 1.75]}
        frameloop={running ? "always" : "never"}
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: false, alpha: true }}
      >
        <Cloud key={count} galaxy={galaxy} dir={dir} count={count} reduced={reduced} />
      </Canvas>
    </div>
  );
}
