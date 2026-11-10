"use client";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const f = () => setMatch(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

export function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const f = () => setVisible(!document.hidden);
    f();
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);
  return visible;
}

// true selama `on`, dan tetap true `ms` milidetik setelahnya (agar kanvas tidak membeku saat memudar)
export function useLinger(on: boolean, ms: number) {
  const [v, setV] = useState(on);
  useEffect(() => {
    if (on) {
      setV(true);
      return;
    }
    const t = setTimeout(() => setV(false), ms);
    return () => clearTimeout(t);
  }, [on, ms]);
  return on || v;
}

// Geser horizontal untuk layar sentuh. Mengabaikan area [data-zoom] (kanvas planet: seret = putar).
export function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: RPointerEvent) => {
      if (e.pointerType === "mouse") return;
      if ((e.target as HTMLElement).closest("[data-zoom]")) return;
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: RPointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? onNext : onPrev)();
    },
  };
}
