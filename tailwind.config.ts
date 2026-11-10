import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { accent: "#ffd000", ink: "#0b0b0b", cream: "#fff3b0" },
    },
  },
  plugins: [],
};
export default config;
