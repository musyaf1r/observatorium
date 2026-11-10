"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { makeRng } from "@/lib/rand";

function Layer({ count, size, color, seed, speed }: { count: number; size: number; color: string; seed: number; speed: number }) {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const r = makeRng(seed);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const rad = 6 + r() * 16;
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      a[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = rad * Math.cos(ph);
      a[i * 3 + 2] = rad * Math.sin(ph) * Math.sin(th);
    }
    return a;
  }, [count, seed]);

  useFrame((_, dt) => {
    if (ref.current && speed > 0) {
      ref.current.rotation.y += Math.min(dt, 0.05) * speed;
      ref.current.rotation.x += Math.min(dt, 0.05) * speed * 0.3;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

export default function StarScene({ running, reduced }: { running: boolean; reduced: boolean }) {
  const k = reduced ? 0 : 1;
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={running ? "always" : "never"}
      camera={{ position: [0, 0, 0.01], fov: 60 }}
      gl={{ antialias: false, alpha: true }}
    >
      <Layer count={2600} size={0.045} color="#0b0b0b" seed={11} speed={0.006 * k} />
      <Layer count={260} size={0.07} color="#e0a800" seed={29} speed={0.009 * k} />
    </Canvas>
  );
}
