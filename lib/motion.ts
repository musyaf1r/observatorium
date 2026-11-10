export const CHAPTER_MS = 1000; // pergeseran antar bab
export const PAGER_MS = 650; // pager horizontal (500-800 ms)

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ease in-out tanpa pantulan
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const pad = (n: number) => String(n).padStart(2, "0");
