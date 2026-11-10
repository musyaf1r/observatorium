import type { ElementType, ReactNode } from "react";

interface Props {
  active: boolean;
  i: number; // urutan baris: jeda 70 ms per baris
  base?: number; // jeda dasar (ms) supaya teks muncul setelah media
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export default function Line({ active, i, base = 320, as: Tag = "div", className = "", children }: Props) {
  return (
    <Tag
      className={`${active ? "rise" : "pre"} ${className}`}
      style={active ? { animationDelay: `${base + i * 70}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
