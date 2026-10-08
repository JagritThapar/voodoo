import type { Config } from "tailwindcss";

// Aussie Energy Savers brand: Ink base, Yellow for action and highlights, Lime as accent.
export default {
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#0F0F0F", 900: "#181818", 800: "#222222", 700: "#2D2D2D", 600: "#3A3A3A", 500: "#5C5C5C", 400: "#8A8A8A", 300: "#B8B8B8", 200: "#CFCFCF" },
        cream: { 50: "#FBFAF6", 100: "#F5F2EA", 200: "#EAE5D8", 300: "#D6D0C2" },
        volt: { 50: "#FFF8D6", 100: "#FFEFA3", 300: "#FFDB3D", 400: "#FCCD01", 500: "#E5B900", 700: "#7A6200" },
        lime: { 50: "#EFFEE3", 100: "#DAFCC2", 300: "#B4FB80", 400: "#8EF840", 500: "#74E01F" },
        leaf: { 50: "#E8F5E9", 100: "#C9E8CB", 600: "#238A2B", 700: "#1C6E23" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: { brand: "18px" },
      boxShadow: { card: "0 1px 2px rgba(24,24,24,.05), 0 2px 8px rgba(24,24,24,.04)" },
    },
  },
  plugins: [],
} satisfies Config;
