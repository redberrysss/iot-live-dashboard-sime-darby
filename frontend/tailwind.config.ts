import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { ink: "#07111f", panel: "#0c1b2d", cyan: "#21d4e8", teal: "#12bca8" }, boxShadow: { glow: "0 0 32px rgba(33,212,232,.13)" } } }, plugins: [] } satisfies Config;
