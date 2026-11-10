interface Props {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  labels?: string[];
  onPick?: (i: number) => void;
}

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
    <path d="M5 2l5 5-5 5" />
  </svg>
);

export default function Pager({ index, count, onPrev, onNext, labels, onPick }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="min-w-[4.5rem] text-xs uppercase tabular-nums tracking-[0.3em]" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button className="arrow" onClick={onPrev} aria-label="Sebelumnya">
          <Chevron flip />
        </button>
        <button className="arrow" onClick={onNext} aria-label="Berikutnya">
          <Chevron />
        </button>
      </div>
      {labels && (
        <div className="flex flex-wrap gap-x-5 gap-y-1" role="tablist">
          {labels.map((l, i) => (
            <button
              key={l}
              role="tab"
              aria-selected={i === index}
              className={`tab ${i === index ? "is-active" : ""}`}
              onClick={() => onPick?.(i)}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
