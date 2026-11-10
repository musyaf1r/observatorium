"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { planets, type Planet } from "@/data/planets";
import { galaxies, type Galaxy } from "@/data/galaxies";
import Chapter from "./Chapter";
import Loader from "./Loader";
import Line from "./Line";
import Pager from "./Pager";
import Sidebar from "./Sidebar";
import Swap from "./Swap";
import VideoOverlay, { type VideoReq } from "./VideoOverlay";
import { useIsMobile, useLinger, usePageVisible, useReducedMotion, useSwipe } from "@/lib/hooks";
import { pad } from "@/lib/motion";

const StarScene = dynamic(() => import("./scenes/StarScene"), { ssr: false });
const PlanetScene = dynamic(() => import("./scenes/PlanetScene"), { ssr: false });
const GalaxyScene = dynamic(() => import("./scenes/GalaxyScene"), { ssr: false });

type Kind = "planet" | "galaxy";
type Item = Planet | Galaxy;
const wrap = (i: number, n: number) => (i + n) % n;

const planetThumb = (p: Planet) =>
  `radial-gradient(circle at 35% 30%, ${p.surface.palette[1] ?? p.surface.palette[0]}, ${p.surface.palette[0]} 72%)`;
const galaxyThumb = "radial-gradient(circle, #ffe3a0 0%, #4a5d95 42%, #060912 78%)";
const thumbOf = (it: Item) => ("surface" in it ? planetThumb(it) : galaxyThumb);
const mediaBg = (it: Item) => {
  const c = "surface" in it ? [it.surface.palette[1] ?? it.surface.palette[0], it.surface.palette[0]] : ["#ffd98a", "#3a4a7a"];
  return `radial-gradient(ellipse at 68% 40%, ${c[0]}55, transparent 52%), radial-gradient(ellipse at 15% 85%, ${c[1]}77, transparent 60%), #05070d`;
};

const Chev = ({ flip, up }: { flip?: boolean; up?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ transform: up ? "rotate(-90deg)" : flip ? "scaleX(-1)" : undefined }} aria-hidden>
    <path d="M5 2l5 5-5 5" />
  </svg>
);

export default function Observatorium() {
  const scroller = useRef<HTMLDivElement>(null);
  const planetThumbScroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pi, setPi] = useState(0);
  const [gi, setGi] = useState(0);
  const [pdir, setPdir] = useState(1);
  const [gdir, setGdir] = useState(1);
  const [mdir, setMdir] = useState(1);
  const [flat, setFlat] = useState(false);
  const [kind, setKind] = useState<Kind>("planet");
  const [video, setVideo] = useState<VideoReq | null>(null);
  const [ready, setReady] = useState(false);

  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const visible = usePageVisible();

  // Bab aktif = bab yang paling terlihat di scroller.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const secs = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive(secs.indexOf(e.target as HTMLElement));
      },
      { root, threshold: 0.55 },
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const goTo = useCallback(
    (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }),
    [reduced],
  );

  const stepPlanet = useCallback((d: number) => {
    setPdir(d);
    setPi((i) => wrap(i + d, planets.length));
    setKind("planet");
  }, []);
  const stepGalaxy = useCallback((d: number) => {
    setGdir(d);
    setGi((i) => wrap(i + d, galaxies.length));
    setKind("galaxy");
  }, []);
  const pickPlanet = (i: number) => {
    if (i === pi) return;
    setPdir(i > pi ? 1 : -1);
    setPi(i);
    setKind("planet");
  };

  useEffect(() => {
    const viewport = planetThumbScroller.current;
    const selected = viewport?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!viewport || !selected) return;

    const viewportRect = viewport.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    const horizontal = mobile;
    const target = horizontal
      ? viewport.scrollLeft +
        selectedRect.left -
        viewportRect.left -
        (viewport.clientWidth - selectedRect.width) / 2
      : viewport.scrollTop +
        selectedRect.top -
        viewportRect.top -
        (viewport.clientHeight - selectedRect.height) / 2;
    const max = horizontal ? viewport.scrollWidth - viewport.clientWidth : viewport.scrollHeight - viewport.clientHeight;
    const clampedTarget = Math.max(0, Math.min(target, max));
    const start = horizontal ? viewport.scrollLeft : viewport.scrollTop;
    const setScroll = (value: number) => {
      if (horizontal) viewport.scrollLeft = value;
      else viewport.scrollTop = value;
    };

    if (reduced) {
      setScroll(clampedTarget);
      return;
    }

    const startTime = performance.now();
    const duration = 480;
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setScroll(start + (clampedTarget - start) * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pi, reduced, mobile]);
  const stepMedia = useCallback(
    (d: number) => {
      setMdir(d);
      if (kind === "planet") setPi((i) => wrap(i + d, planets.length));
      else setGi((i) => wrap(i + d, galaxies.length));
    },
    [kind],
  );

  // Papan ketik: panah kiri/kanan menggeser pager pada bab yang aktif.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (video || (e.target as HTMLElement).closest("button")) return;
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      if (active === 1) stepPlanet(d);
      else if (active === 2) stepGalaxy(d);
      else if (active === 3) stepMedia(d);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, video, stepPlanet, stepGalaxy, stepMedia]);

  const planetSwipe = useSwipe(() => stepPlanet(-1), () => stepPlanet(1));
  const galaxySwipe = useSwipe(() => stepGalaxy(-1), () => stepGalaxy(1));
  const mediaSwipe = useSwipe(() => stepMedia(-1), () => stepMedia(1));

  const heroOn = ready && active === 0;
  const planet = planets[pi];
  const galaxy = galaxies[gi];
  const list: Item[] = kind === "planet" ? planets : galaxies;
  const mIdx = kind === "planet" ? pi : gi;
  const mItem = list[mIdx];
  const mPrev = list[wrap(mIdx - 1, list.length)];
  const mNext = list[wrap(mIdx + 1, list.length)];
  const mSub = "surface" in mItem ? mItem.type : mItem.morphology;

  // Kanvas hanya berjalan saat babnya terlihat (dan tab tidak tersembunyi).
  const lingerStars = useLinger(active === 0, 1200);
  const lingerPlanet = useLinger(active === 1, 1200);
  const lingerGalaxy = useLinger(active === 2, 1200);
  const runStars = visible && lingerStars;
  const runPlanet = visible && lingerPlanet;
  const runGalaxy = visible && lingerGalaxy;

  const points = mobile ? 7000 : 12000;
  const play = (v: Item["video"], title: string) => v && setVideo({ url: v.url, title });

  const VideoBtn = ({ v, title }: { v: Item["video"]; title: string }) =>
    v ? (
      <button className="btn" onClick={() => play(v, title)}>
        Tonton video
      </button>
    ) : (
      <span className="eyebrow inline-block border border-[color:var(--line)] px-5 py-[14px]">Video segera hadir</span>
    );

  return (
    <main>
      <Sidebar active={active} onGo={goTo} />

      <div ref={scroller} className="scroller">
        {/* ================= 01 HERO (terang) ================= */}
        <Chapter id="home" index={0} total={4} active={heroOn}>
          <div className="absolute inset-0 overflow-hidden" aria-hidden>
            <div className="dots absolute right-0 top-0 h-[55%] w-[60%]" />
            <div className="absolute -right-[10vmin] top-[38%] h-[74vmin] w-[74vmin] -translate-y-1/2">
              <div className="disc float inset-0" />
            </div>
          </div>
          <div className="absolute inset-0">
            <StarScene running={runStars} reduced={reduced} />
          </div>

          <div className="relative flex min-h-[100svh] flex-col justify-end gap-6 px-6 pb-20 pt-24 md:h-full md:min-h-0 md:flex-row md:items-end md:justify-between md:px-14 md:pb-16">
            <div>
              <Line active={heroOn} i={0} base={500} className="eyebrow mb-5">
                Observatorium · Pendidikan Antariksa
              </Line>
              <Line active={heroOn} i={1} base={500} as="h1" className="text-5xl font-black leading-[0.98] tracking-tight md:text-8xl">
                Melintasi
              </Line>
              <Line active={heroOn} i={2} base={500} as="h1" className="text-5xl font-black leading-[0.98] tracking-tight md:text-8xl">
                <span className={`mark ${heroOn ? "on" : ""}`}>Galaksi</span>
              </Line>
              <Line active={heroOn} i={3} base={500} as="p" className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--fg-dim)]">
                Pelajari planet di Tata Surya dan galaksi di sekitar kita lewat model tiga dimensi yang bisa diputar.
              </Line>
            </div>

            <Line active={heroOn} i={4} base={500} className="w-full bg-black/60 p-3 text-white md:w-[28rem]">
              <div className="mb-3 flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center bg-accent text-ink">↓</span>
                Jelajahi
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-dark !py-4" onClick={() => goTo("planet")}>
                  Lihat Planet
                </button>
                <button className="btn btn-dark !py-4" onClick={() => goTo("galaxy")}>
                  Jelajahi Galaksi
                </button>
              </div>
            </Line>
          </div>
        </Chapter>

        {/* ================= 02 PLANET (terang) ================= */}
        <Chapter id="planet" index={1} total={4} active={active === 1}>
          <div className="relative flex min-h-[100svh] flex-col pt-16 md:block md:h-full md:pt-0" {...planetSwipe}>
            {/* latar: blok kuning, titik, garis bawah */}
            <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
              <div className="absolute right-[26%] top-0 h-[56%] w-[24%] bg-accent" />
              <div className="dots absolute right-0 top-0 h-56 w-80" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[6px] bg-accent" aria-hidden />

            {/* kanvas */}
            <div className="relative h-[44svh] shrink-0 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[66%]">
              <PlanetScene planet={planet} dir={pdir} flat={flat} running={runPlanet} reduced={reduced} />
              <div className="vpill absolute right-4 top-1/2 z-10 -translate-y-1/2 md:right-12" role="group" aria-label="Mode tampilan">
                {(["3D", "2D"] as const).map((m) => (
                  <button key={m} aria-pressed={(m === "2D") === flat} onClick={() => setFlat(m === "2D")}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* nama raksasa berarsir */}
            <div className="pointer-events-none absolute left-[190px] top-[22%] hidden md:block" aria-hidden>
              <Swap id={`h-${planet.id}`} dir={pdir}>
                <div className="hatch text-[min(20vw,36vh)]">{planet.name}</div>
              </Swap>
            </div>

            {/* daftar thumbnail */}
            <div className="relative z-10 flex min-w-0 items-center gap-4 px-6 py-4 md:absolute md:bottom-auto md:left-14 md:top-1/2 md:flex-col md:-translate-y-1/2 md:p-0">
              <button className="arrow !hidden md:!inline-flex" onClick={() => stepPlanet(-1)} aria-label="Sebelumnya">
                <Chev up />
              </button>
              <div ref={planetThumbScroller} className="planet-thumb-list flex min-w-0 max-w-[calc(100vw-3rem)] items-center gap-4 overflow-x-auto md:max-h-80 md:max-w-20 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:p-2" role="tablist" aria-label="Pilih planet">
                {planets.map((p, i) => (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={i === pi}
                    aria-label={p.name}
                    className={`thumb ${i === pi ? "on" : ""}`}
                    onClick={() => pickPlanet(i)}
                  >
                    <img className="thumb-image" src={p.image2d} alt="" draggable={false} />
                  </button>
                ))}
              </div>
              <button className="arrow !hidden rotate-90 md:!inline-flex" onClick={() => stepPlanet(1)} aria-label="Berikutnya">
                <Chev />
              </button>
            </div>

            {/* REC + info */}
            <div className="relative z-10 flex flex-col gap-4 px-6 pb-16 md:absolute md:left-[190px] md:top-[12%] md:w-[min(30rem,38vw)] md:p-0">
              <Line active={active === 1} i={0} className="flex items-center gap-3 text-[13px]">
                <span className="text-[color:var(--fg-mute)]">[</span>
                <span className="font-semibold tracking-wider">REC</span>
                <span className="text-[color:var(--fg-mute)]">]</span>
                <div className="recbar flex-1">
                  <i style={{ transform: `scaleX(${(pi + 1) / planets.length})` }} />
                  <span>
                    <b className="font-medium">{planet.name}</b>
                    <b className="font-medium tabular-nums">
                      {pi + 1} / {planets.length}
                    </b>
                  </span>
                </div>
              </Line>
            </div>

            <div className="relative z-10 flex flex-col gap-4 px-6 pb-16 md:absolute md:bottom-14 md:left-[190px] md:w-[min(30rem,38vw)] md:p-0">
              <Swap id={planet.id} dir={pdir}>
                <Info
                  active={active === 1}
                  title={planet.name}
                  sub={planet.type}
                  rows={[
                    ["Jarak", planet.distance],
                    ["Diameter", planet.diameter],
                  ]}
                  text={planet.description}
                  action={<VideoBtn v={planet.video} title={planet.name} />}
                />
              </Swap>
              <Line active={active === 1} i={7}>
                <Pager index={pi} count={planets.length} onPrev={() => stepPlanet(-1)} onNext={() => stepPlanet(1)} />
              </Line>
            </div>
          </div>
        </Chapter>

        {/* ================= 03 GALAKSI (gelap) ================= */}
        <Chapter id="galaxy" index={2} total={4} active={active === 2} dark tag={["Deep Space", "Galaksi"]}>
          <div className="relative flex min-h-[100svh] flex-col pt-16 md:block md:h-full md:pt-0" {...galaxySwipe}>
            {/* garis bantu tipis */}
            <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
              <div className="absolute inset-y-0 left-[22%] w-px bg-white/10" />
              <div className="absolute inset-x-0 top-[44%] h-px bg-white/10" />
            </div>

            <div className="relative mt-24 h-[52svh] shrink-0 md:absolute md:left-0 md:top-0 md:mt-0 md:h-full md:w-[64%]">
              <div className="absolute inset-0">
                <GalaxyScene galaxy={galaxy} dir={gdir} running={runGalaxy} reduced={reduced} count={points} />
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                <svg viewBox="0 0 400 400" className="h-[92%] max-h-full">
                  <circle cx="200" cy="200" r="138" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                  <g className="ticks">
                    <circle cx="200" cy="200" r="186" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="9" strokeDasharray="1 10.7" />
                    <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5" strokeDasharray="96 440" strokeDashoffset="-20" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-4 px-6 pb-16 md:absolute md:right-14 md:top-[16%] md:w-[min(28rem,32vw)] md:p-0">
              <Swap id={galaxy.id} dir={gdir}>
                <div className="flex flex-col gap-4">
                  <Line active={active === 2} i={1} as="h2" className="break-words text-right text-4xl font-light uppercase leading-[0.95] tracking-tight md:text-[clamp(2.2rem,4.4vw,4.4rem)]">
                    {galaxy.name}
                  </Line>
                  <Line active={active === 2} i={2} className="text-right text-sm font-semibold uppercase tracking-wide">
                    {galaxy.catalog}
                  </Line>
                </div>
              </Swap>

              <Line active={active === 2} i={3} className="pill mt-2">
                <button className="round" onClick={() => stepGalaxy(-1)} aria-label="Sebelumnya">
                  <Chev flip />
                </button>
                <span className="truncate text-sm" aria-live="polite">
                  <span className="mr-2 text-[10px] tabular-nums text-accent">
                    {gi + 1}/{galaxies.length}
                  </span>
                  {galaxy.name}
                </span>
                <button className="round" onClick={() => stepGalaxy(1)} aria-label="Berikutnya">
                  <Chev />
                </button>
              </Line>

              <Line active={active === 2} i={4} className="flex justify-center gap-2">
                {galaxies.map((g, i) => (
                  <span key={g.id} className={`seg ${i === gi ? "on" : ""}`} style={{ width: 28 }} />
                ))}
              </Line>

              <Swap id={`t-${galaxy.id}`} dir={gdir}>
                <div className="flex flex-col gap-4">
                  <Line active={active === 2} i={5} className="tag">
                    <b>Jarak</b>
                    <span>{galaxy.distance}</span>
                  </Line>
                  <Line active={active === 2} i={6} className="tag">
                    <b>Morfologi</b>
                    <span>{galaxy.morphology}</span>
                  </Line>
                  <Line active={active === 2} i={7} as="p" className="text-sm leading-relaxed text-[color:var(--fg-dim)]">
                    {galaxy.description}
                  </Line>
                  <Line active={active === 2} i={8}>
                    <VideoBtn v={galaxy.video} title={galaxy.name} />
                  </Line>
                </div>
              </Swap>
            </div>
          </div>
        </Chapter>

        {/* ================= 04 MEDIA (gelap) ================= */}
        <Chapter id="media" index={3} total={4} active={active === 3} dark tag={["Information", "Media"]}>
          <div className="relative flex min-h-[100svh] flex-col justify-end gap-6 px-6 pb-16 pt-44 md:block md:h-full md:p-0" {...mediaSwipe}>
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <Swap id={`bg-${kind}-${mItem.id}`} dir={mdir} className="h-full">
                <div className="h-full w-full" style={{ background: mediaBg(mItem) }} />
              </Swap>
            </div>
            <div className="pointer-events-none absolute bottom-24 right-10 hidden overflow-hidden md:block" aria-hidden>
              <div className="outline-text text-[min(16vw,26vh)]">{mItem.name.split(" ")[0]}</div>
            </div>

            {/* garis warna kanan atas + pilihan jenis */}
            <div className="absolute right-6 top-5 z-10 flex flex-col items-end gap-3 md:right-[5%] md:top-[3%]">
              <div className="hidden h-[3px] w-56 md:block" style={{ background: "linear-gradient(to right,#e5199a 0 30%,#17d49b 30% 60%,#ffd000 60% 100%)" }} aria-hidden />
              <div className="flex gap-6 pt-2 md:pt-6" role="group" aria-label="Jenis objek">
                {(["planet", "galaxy"] as const).map((k) => (
                  <button key={k} className={`tab ${kind === k ? "is-active" : ""}`} aria-pressed={kind === k} onClick={() => setKind(k)}>
                    {k === "planet" ? "Planet" : "Galaksi"}
                  </button>
                ))}
              </div>
            </div>

            {/* judul kiri bawah */}
            <div className="relative z-10 md:absolute md:bottom-16 md:left-14 md:w-[min(44%,40rem)]">
              <Swap id={`m-${kind}-${mItem.id}`} dir={mdir}>
                <div className="flex flex-col gap-4">
                  <Line active={active === 3} i={0} className="flex items-center gap-4 text-sm">
                    <span className="bg-white/15 px-3 py-1">{kind === "planet" ? "Planet" : "Galaksi"}</span>
                    <span className="tabular-nums text-accent">
                      {pad(mIdx + 1)} / {pad(list.length)}
                    </span>
                  </Line>
                  <Line active={active === 3} i={1} as="h2" className="text-3xl font-semibold leading-tight md:text-5xl">
                    {mItem.name}
                  </Line>
                  <Line active={active === 3} i={2} as="p" className="text-sm text-[color:var(--fg-dim)]">
                    {mSub}
                  </Line>
                </div>
              </Swap>
              <div className="mt-6 h-px w-full bg-accent/70 md:mt-8" aria-hidden />
              <div className="mt-5 flex items-center gap-3">
                <button
                  className="flex h-[50px] w-[50px] items-center justify-center bg-accent text-ink transition-opacity duration-300 disabled:opacity-40"
                  disabled={!mItem.video}
                  onClick={() => play(mItem.video, mItem.name)}
                  aria-label={mItem.video ? `Putar video ${mItem.name}` : "Video segera hadir"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M7 4l13 8-13 8z" />
                  </svg>
                </button>
                <span className="eyebrow flex h-[50px] items-center bg-white/10 px-5">{mItem.video ? "Putar video" : "Video segera hadir"}</span>
              </div>
            </div>

            {/* strip thumbnail kanan bawah */}
            <div className="relative z-10 flex items-end gap-4 md:absolute md:bottom-16 md:right-10">
              <Swap id={`s-${kind}-${mItem.id}`} dir={mdir}>
                <div className="flex items-end gap-4">
                  <ThumbCard it={mPrev} label={`${pad(wrap(mIdx - 1, list.length) + 1)} / ${pad(list.length)}`} onClick={() => stepMedia(-1)} />
                  <ThumbCard it={mItem} big label={`${pad(mIdx + 1)} / ${pad(list.length)}`} onClick={() => play(mItem.video, mItem.name)} />
                  <ThumbCard it={mNext} label={`NEXT ${pad(wrap(mIdx + 1, list.length) + 1)} / ${pad(list.length)}`} onClick={() => stepMedia(1)} />
                </div>
              </Swap>
            </div>
            <div className="relative z-10 flex gap-3 md:absolute md:bottom-3 md:right-10">
              <button className="round" onClick={() => stepMedia(-1)} aria-label="Sebelumnya">
                <Chev flip />
              </button>
              <button className="round" onClick={() => stepMedia(1)} aria-label="Berikutnya">
                <Chev />
              </button>
            </div>
          </div>
        </Chapter>
      </div>

      <VideoOverlay video={video} onClose={() => setVideo(null)} />
      <Loader onReveal={() => setReady(true)} />
    </main>
  );
}

function ThumbCard({ it, big, label, onClick }: { it: Item; big?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={it.name}
      className={`relative hidden shrink-0 overflow-hidden border border-white/20 text-left transition-opacity duration-300 hover:opacity-100 md:block ${
        big ? "h-[200px] w-[300px] opacity-100 !block" : "h-[160px] w-[220px] opacity-55"
      }`}
      style={{ background: thumbOf(it) }}
    >
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-xs">
        <span className="mb-1 block text-[10px] tabular-nums text-accent">{label}</span>
        {it.name}
      </span>
    </button>
  );
}

function Info({
  active,
  title,
  sub,
  rows,
  text,
  action,
}: {
  active: boolean;
  title: string;
  sub: string;
  rows: [string, string][];
  text: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Line active={active} i={1} as="h2" className="text-5xl font-extrabold tracking-tight md:text-6xl">
        <span className="mr-3 font-light text-[color:var(--fg-mute)]">[</span>
        {title}
        <span className="ml-3 font-light text-[color:var(--fg-mute)]">]</span>
      </Line>
      <Line active={active} i={2} className="spectrum" />
      <Line active={active} i={3} className="eyebrow">
        {sub}
      </Line>
      {rows.map(([k, v], n) => (
        <Line key={k} active={active} i={4 + n} className="tag">
          <b>{k}</b>
          <span>{v}</span>
        </Line>
      ))}
      <Line active={active} i={6} as="p" className="text-sm leading-relaxed text-[color:var(--fg-dim)]">
        {text}
      </Line>
      <Line active={active} i={7}>
        {action}
      </Line>
    </div>
  );
}
