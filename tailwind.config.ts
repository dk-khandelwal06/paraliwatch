import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Agricultural & Environmental Palette
        earth: {
          50: "#faf8f5",
          100: "#f3ede3",
          200: "#e5d8c3",
          300: "#d3bd9d",
          400: "#be9e76",
          500: "#a98256",
          600: "#916a45",
          700: "#755239",
          800: "#5e4231",
          900: "#4d362a",
        },
        sage: {
          50: "#f4f6f4",
          100: "#e5eae5",
          200: "#ccd6cc",
          300: "#a6bba6",
          400: "#7f9c80",
          500: "#5f7e61",
          600: "#49634b",
          700: "#3b4f3d",
          800: "#314032",
          900: "#2a362b",
          950: "#151e16",
        },
        forest: {
          800: "#132318",
          900: "#0c1811",
          950: "#070f0a",
        },
        dusk: {
          bg: "#1e2221",
          surface: "#252b29",
          border: "#363e3b",
          text: "#dcd8cf",
          muted: "#969c97",
        },
        fire: {
          yellow: "#eab308",
          orange: "#f97316",
          red: "#ef4444",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

