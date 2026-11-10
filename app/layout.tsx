import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Observatorium",
  description: "Observatorium: jelajahi planet Tata Surya dan galaksi lewat model interaktif.",
};

export const viewport: Viewport = { themeColor: "#ffd000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
