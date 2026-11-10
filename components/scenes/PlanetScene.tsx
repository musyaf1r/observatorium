"use client";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent as RPointerEvent } from "react";
import type { Planet } from "@/data/planets";
import { PAGER_MS, clamp, ease } from "@/lib/motion";

type Rot = { x: number; y: number; vy: number; dragging: boolean };
type Flat = { value: number; target: number };
type Zoom = { cur: number; target: number };
type Body = { key: string; planet: Planet; t0: number; dir: number; leaving: boolean };

// Kamera + gerak. 2D = dolly-zoom: FOV menyempit sambil kamera mundur, sehingga
// bola dan kamera perspektif berubah menjadi proyeksi datar dari planet yang sama.
function Rig({ flat, zoom, rot, reduced }: { flat: MutableRefObject<Flat>; zoom: MutableRefObject<Zoom>; rot: MutableRefObject<Rot>; reduced: boolean }) {
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const f = flat.current;
    f.value += (f.target - f.value) * (reduced ? 1 : 1 - Math.exp(-dt / 0.14)); // selesai ~600 ms
    if (Math.abs(f.target - f.value) < 0.002) f.value = f.target;

    const z = zoom.current;
    z.cur += (z.target - z.cur) * (1 - Math.exp(-dt / 0.12));

    const cam = state.camera as THREE.PerspectiveCamera;
    const half = (4.6 / z.cur) * Math.tan(THREE.MathUtils.degToRad(20));
    cam.fov = THREE.MathUtils.lerp(40, 5, f.value);
    cam.position.z = half / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    cam.updateProjectionMatrix();

    const r = rot.current;
    if (!r.dragging) {
      const idle = reduced ? 0 : 0.04; // putaran idle sangat lambat
      r.vy += (idle - r.vy) * Math.min(1, dt * 1.5);
      r.y += r.vy * dt;
      r.x += (0 - r.x) * Math.min(1, dt * 0.8);
    }
  });
  return null;
}

function BodyView({ b, flat, rot, reduced }: { b: Body; flat: MutableRefObject<Flat>; rot: MutableRefObject<Rot>; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const threeD = useRef<THREE.Group>(null);
  const image = useRef<THREE.Group>(null);
  const squash = useRef<THREE.Group>(null);
  const pitch = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  const gltf = useLoader(GLTFLoader, b.planet.model3d);
  const imageTex = useLoader(THREE.TextureLoader, b.planet.image2d);
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const cloneMaterial = (material: THREE.Material) => {
        const clone = material.clone();
        clone.userData.baseOpacity = clone.opacity;
        clone.transparent = true;
        return clone;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(cloneMaterial)
        : cloneMaterial(object.material);
    });

    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const diameter = b.planet.ring ? size.y : Math.max(size.x, size.y, size.z);
    const scale = 2 / diameter;
    const normalized = new THREE.Group();
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    normalized.scale.setScalar(scale);
    normalized.add(scene);
    return normalized;
  }, [b.planet.ring, gltf.scene]);

  imageTex.colorSpace = THREE.SRGBColorSpace;
  imageTex.anisotropy = 4;
  useEffect(
    () => () => {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
    },
    [model],
  );

  useFrame(() => {
    const g = root.current;
    if (!g) return;
    const k = clamp((performance.now() - b.t0) / PAGER_MS, 0, 1);
    const e = reduced ? 1 : ease(k);
    const opacity = b.leaving ? 1 - e : e;
    const flatAmount = flat.current.value;
    const x = reduced ? 0 : b.leaving ? -b.dir * 2.4 * e : b.dir * 2.4 * (1 - e);
    g.position.x = x;
    threeD.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (material) material.opacity = (material.userData.baseOpacity ?? 1) * opacity * (1 - flatAmount);
      }
    });
    image.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m) m.opacity = opacity * flatAmount;
    });
    if (image.current) {
      const progress = reduced ? 1 : e;
      const scale = b.leaving ? 1 - progress * 0.18 : 0.82 + progress * 0.18;
      image.current.scale.setScalar(scale);
      image.current.rotation.z = reduced ? 0 : (b.leaving ? -b.dir * progress : b.dir * (1 - progress)) * 0.3;
    }
    if (squash.current) squash.current.scale.z = 1 - 0.985 * flat.current.value;
    if (pitch.current) pitch.current.rotation.x = rot.current.x;
    if (spin.current) spin.current.rotation.y = rot.current.y;
  });

  return (
    <group ref={root} scale={b.planet.scale}>
      <group ref={threeD}>
        <group ref={squash}>
          <group ref={pitch}>
            <group rotation={[0, 0, THREE.MathUtils.degToRad(b.planet.tilt)]}>
              <group ref={spin}>
                <primitive object={model} />
              </group>
            </group>
          </group>
        </group>
      </group>
      <group ref={image}>
        <mesh position={[0, 0, 0.1]} renderOrder={2}>
          <planeGeometry args={[b.planet.ring ? 4.6 : 2.3, b.planet.ring ? 4.6 : 2.3]} />
          <meshBasicMaterial map={imageTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// Tampilan 3D tidak pernah di-unmount: planet lama memudar sambil bergeser,
// planet baru masuk dari arah geser, di kanvas yang sama.
function Bodies({ planet, dir, flat, rot, reduced }: { planet: Planet; dir: number; flat: MutableRefObject<Flat>; rot: MutableRefObject<Rot>; reduced: boolean }) {
  const [bodies, setBodies] = useState<Body[]>(() => [{ key: planet.id, planet, t0: -1e9, dir, leaving: false }]);
  const lastId = useRef(planet.id);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  useEffect(() => {
    if (lastId.current === planet.id) return;
    lastId.current = planet.id;
    const now = performance.now();
    const d = dirRef.current;
    setBodies((bs) => [
      ...bs.map((x) => (x.leaving ? x : { ...x, leaving: true, t0: now, dir: d })),
      { key: planet.id, planet, t0: now, dir: d, leaving: false },
    ]);
    const t = setTimeout(() => setBodies((bs) => bs.filter((x) => !x.leaving)), PAGER_MS + 80);
    return () => clearTimeout(t);
  }, [planet]);

  return (
    <>
      {bodies.map((b) => (
        <BodyView key={`${b.key}-${b.leaving ? "out" : "in"}-${b.t0}`} b={b} flat={flat} rot={rot} reduced={reduced} />
      ))}
    </>
  );
}

interface Props {
  planet: Planet;
  dir: number;
  flat: boolean;
  running: boolean;
  reduced: boolean;
}

export default function PlanetScene({ planet, dir, flat, running, reduced }: Props) {
  const rot = useRef<Rot>({ x: 0, y: 0.6, vy: 0, dragging: false });
  const flatRef = useRef<Flat>({ value: 0, target: 0 });
  const zoom = useRef<Zoom>({ cur: 1, target: 1 });
  const wrap = useRef<HTMLDivElement>(null);
  const last = useRef({ x: 0, y: 0, t: 0 });
  flatRef.current.target = flat ? 1 : 0;

  // Roda mouse hanya memperbesar saat penunjuk berada di kanvas.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const h = (e: WheelEvent) => {
      e.preventDefault();
      zoom.current.target = clamp(zoom.current.target * Math.exp(-e.deltaY * 0.0012), 0.6, 2.4);
    };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    rot.current.dragging = true;
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const r = rot.current;
    if (!r.dragging) return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - last.current.t) / 1000);
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    r.y += dx * 0.006;
    r.x = clamp(r.x + dy * 0.006, -0.9, 0.9);
    r.vy = clamp((dx * 0.006) / dt, -3, 3);
    last.current = { x: e.clientX, y: e.clientY, t: now };
  };
  const up = () => {
    rot.current.dragging = false;
  };

  return (
    <div
      ref={wrap}
      data-zoom
      className="absolute inset-0 touch-pan-y select-none"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="img"
      aria-label={`Model planet ${planet.name}. Seret untuk memutar, gulir untuk memperbesar.`}
    >
      <Canvas
        dpr={[1, 1.75]}
        frameloop={running ? "always" : "never"}
        camera={{ position: [0, 0, 4.6], fov: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 2, 5]} intensity={2.0} />
        <Rig flat={flatRef} zoom={zoom} rot={rot} reduced={reduced} />
        <Bodies planet={planet} dir={dir} flat={flatRef} rot={rot} reduced={reduced} />
      </Canvas>
    </div>
  );
}
