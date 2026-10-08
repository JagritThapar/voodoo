import type { Config } from "tailwindcss";

export default {
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 50: "#eef3fa", 100: "#d6e2f2", 600: "#1d4f8f", 700: "#163d70", 800: "#0f2d55", 900: "#0b2240", 950: "#071629" },
        sun: { 50: "#fff8e6", 100: "#ffedbf", 300: "#ffd166", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
        leaf: { 50: "#ecfdf3", 100: "#d1fadf", 500: "#16a34a", 600: "#15803d", 700: "#166534" },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,34,64,.06), 0 1px 3px rgba(11,34,64,.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
