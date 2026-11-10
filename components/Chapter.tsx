import { pad } from "@/lib/motion";

interface Props {
  id: string;
  index: number; // 0-based
  total: number;
  active: boolean;
  dark?: boolean;
  tag?: [string, string]; // [kicker, judul]
  children: React.ReactNode;
}

export default function Chapter({ id, index, total, active, dark = false, tag, children }: Props) {
  return (
    <section
      id={id}
      data-chapter
      className={`relative w-full snap-start overflow-hidden md:h-screen ${dark ? "theme-dark" : "theme-light bg-white"}`}
      aria-label={id}
    >
      <div className="relative md:ml-[84px] md:h-full">
        <div
          className={`rule absolute left-6 right-6 top-[60px] z-10 md:left-14 md:right-14 md:top-7 ${active ? "on" : ""}`}
          aria-hidden
        />
        <div className={`chapter-content ${active ? "on" : ""}`}>{children}</div>

        {tag && (
          <div className="pointer-events-none absolute left-6 top-20 z-10 md:left-14 md:top-14" aria-hidden>
            <div className="text-[8px] uppercase tracking-[0.22em] opacity-60">▼// Observatorium</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="flex h-5 w-14 items-center justify-end bg-[color:var(--chip)] pr-1.5 text-[11px]">↘</span>
              <span className="text-xl font-light uppercase leading-none md:text-2xl">{tag[0]}</span>
            </div>
            <div className="mt-1 text-2xl font-extrabold uppercase leading-none md:text-3xl">{tag[1]}</div>
            <div className="mt-4 flex gap-[3px]">
              <i className="block h-5 w-[3px] bg-[#e5199a]" />
              <i className="block h-5 w-[3px] bg-[#17d49b]" />
              <i className="block h-5 w-[3px] bg-accent" />
            </div>
          </div>
        )}

        <div
          className="pointer-events-none absolute bottom-5 left-6 z-10 text-[11px] uppercase tracking-[0.32em] tabular-nums text-[color:var(--fg-mute)] md:left-14"
          aria-hidden
        >
          {pad(index + 1)} / {pad(total)}
        </div>
        <div
          className="pointer-events-none absolute bottom-5 right-6 z-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] md:right-14"
          aria-hidden
        >
          <span className="rec-dot" />[ OBS ]
        </div>
      </div>
    </section>
  );
}
