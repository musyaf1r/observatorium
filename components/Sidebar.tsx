"use client";
import type { ReactNode } from "react";

const I = ({ children }: { children: ReactNode }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

const ITEMS = [
  { id: "home", label: "Beranda", icon: <I><path d="M5 5l14 14M19 5L5 19" /><circle cx="12" cy="12" r="2.2" /></I> },
  { id: "planet", label: "Planet", icon: <I><circle cx="12" cy="12" r="5.5" /><ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-20 12 12)" /></I> },
  { id: "galaxy", label: "Galaksi", icon: <I><circle cx="12" cy="12" r="1.6" /><path d="M12 12c0-4 4-6 8-4M12 12c0 4-4 6-8 4" /><circle cx="12" cy="12" r="9.5" strokeDasharray="1 3.2" /></I> },
  { id: "media", label: "Media", icon: <I><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M10 9.5l5 2.5-5 2.5z" /></I> },
] as const;

export default function Sidebar({ active, onGo }: { active: number; onGo: (id: string) => void }) {
  return (
    <aside className="sidebar" aria-label="Navigasi bab">
      <button className="sb-logo text-left" onClick={() => onGo("home")} aria-label="Observatorium, ke awal" style={{ background: "none", border: 0, cursor: "pointer", color: "inherit" }}>
        OBSER<br />VATORIUM<i />
      </button>

      <nav className="sb-nav">
        {ITEMS.map((it, i) => (
          <button
            key={it.id}
            className={`sb-item ${active === i ? "is-active" : ""}`}
            aria-current={active === i ? "true" : undefined}
            aria-label={it.label}
            onClick={() => onGo(it.id)}
          >
            {it.icon}
            <span className="sb-label">{it.label}</span>
          </button>
        ))}
      </nav>

      <button className="sb-cta" onClick={() => onGo("planet")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 4h18l-9 9zM6 15h12l-6 6z" />
        </svg>
        <span className="sb-label">Mulai Jelajah</span>
      </button>
    </aside>
  );
}