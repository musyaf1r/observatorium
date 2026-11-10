"use client";
import { useRef, useState, type ReactNode } from "react";
import { PAGER_MS } from "@/lib/motion";
import { useIsoLayoutEffect } from "@/lib/hooks";

type Layer = { id: string; node: ReactNode; dir: number };

// Saat `id` berubah: konten lama memudar keluar, konten baru masuk dari arah geser.
export default function Swap({
  id,
  dir,
  className = "",
  children,
}: {
  id: string;
  dir: number;
  className?: string;
  children: ReactNode;
}) {
  const prev = useRef<{ id: string; node: ReactNode }>({ id, node: children });
  const [leaving, setLeaving] = useState<Layer[]>([]);

  useIsoLayoutEffect(() => {
    const old = prev.current;
    if (old.id !== id) {
      setLeaving((l) => [...l, { ...old, dir }]);
      setTimeout(() => setLeaving((l) => l.filter((x) => x.id !== old.id)), PAGER_MS + 60);
    }
    prev.current = { id, node: children };
  });

  return (
    <div className={`relative ${className}`}>
      {leaving.map((l) => (
        <div
          key={`out-${l.id}`}
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${l.dir > 0 ? "leave-l" : "leave-r"}`}
        >
          {l.node}
        </div>
      ))}
      <div key={id} className={`h-full ${dir > 0 ? "enter-r" : "enter-l"}`}>
        {children}
      </div>
    </div>
  );
}
