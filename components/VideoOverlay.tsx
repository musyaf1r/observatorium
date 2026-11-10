"use client";
import { useEffect, useState } from "react";

export interface VideoReq {
  url: string;
  title: string;
}

// Overlay gelap, membuka dan menutup dengan fade 300 ms.
export default function VideoOverlay({ video, onClose }: { video: VideoReq | null; onClose: () => void }) {
  const [shown, setShown] = useState<VideoReq | null>(video);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (video) {
      setShown(video);
      const r = requestAnimationFrame(() => setVis(true));
      return () => cancelAnimationFrame(r);
    }
    setVis(false);
    const t = setTimeout(() => setShown(null), 300);
    return () => clearTimeout(t);
  }, [video]);

  useEffect(() => {
    if (!video) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [video, onClose]);

  if (!shown) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shown.title}
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 text-white transition-opacity duration-300 md:p-14 ${vis ? "opacity-100" : "opacity-0"}`}
    >
      <button className="btn absolute right-6 top-5" onClick={onClose} autoFocus>
        Tutup
      </button>
      <div className="aspect-video w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={shown.url}
          title={shown.title}
          className="h-full w-full border-0"
          allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
