"use client";
import { useEffect, useRef, useState } from "react";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks";

const WORD = "OBSERVATORIUM".split("");

// Layar muat: penghitung 0-100%, bar tipis, lalu memudar (900 ms) sambil membuka beranda.
export default function Loader({ onReveal }: { onReveal: () => void }) {
  const reduced = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const loaded = useRef(false);
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;

  useEffect(() => {
    const done = () => (loaded.current = true);
    if (document.readyState === "complete") done();
    else window.addEventListener("load", done, { once: true });

    const DUR = reduced ? 250 : 2400;
    const t0 = performance.now();
    let raf = 0;
    let finished = false;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      // tahan di 92% sampai halaman benar-benar selesai dimuat
      const v = Math.min(loaded.current ? 100 : 92, ease(k) * 100);
      setPct(Math.floor(v));
      if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
      if (v >= 100 && !finished) {
        finished = true;
        setTimeout(() => {
          setOut(true);
          revealRef.current();
          setTimeout(() => setGone(true), reduced ? 20 : 950);
        }, reduced ? 0 : 350);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", done);
    };
  }, [reduced]);

  if (gone) return null;
  return (
    <div className={`loader ${out ? "out" : ""}`} role="status" aria-live="polite" aria-label="Memuat Observatorium">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em]">
        <span className="flex items-center gap-2">
          <span className="rec-dot !bg-ink" />[ OBS ]
        </span>
        <span>Pendidikan Antariksa</span>
      </div>

      <div className="loader-word text-[clamp(2.2rem,9vw,7.5rem)] font-light leading-none tracking-[0.08em]" aria-hidden>
        {WORD.map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 45}ms` }}>
            {c}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <span className="text-[11px] uppercase tracking-[0.32em]">{pct < 100 ? "Menyelaraskan teleskop" : "Siap"}</span>
          <span className="text-5xl font-light tabular-nums leading-none md:text-7xl">
            {String(pct).padStart(3, "0")}
            <span className="text-xl md:text-3xl">%</span>
          </span>
        </div>
        <div className="loader-bar">
          <i ref={bar as React.RefObject<HTMLElement>} />
        </div>
      </div>
    </div>
  );
}