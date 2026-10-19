import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: {
          DEFAULT: "#030712",
          deep: "#02040a",
          subtle: "#0b0f19",
        },
        surface: {
          DEFAULT: "rgba(13, 19, 34, 0.72)",
          elevated: "rgba(22, 30, 50, 0.8)",
          glass: "rgba(255, 255, 255, 0.03)",
        },
        hairline: "rgba(255, 255, 255, 0.08)",
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Geist"',
          '"Inter"',
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          '"JetBrains Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "apple-glass": "0 8px 32px 0 rgba(0, 0, 0, 0.42), inset 0 1px 0 0 rgba(255, 255, 255, 0.09)",
        "apple-card": "0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.07)",
        "apple-elevated": "0 20px 48px -8px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
        "emerald-glow": "0 0 28px -4px rgba(16, 185, 129, 0.35)",
        "amber-glow": "0 0 28px -4px rgba(245, 158, 11, 0.3)",
        "rose-glow": "0 0 28px -4px rgba(244, 63, 94, 0.3)",
      },
      animation: {
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer-fast": "shimmer 1.5s infinite",
        "tick-up": "tickUp 0.8s ease-out forwards",
        "tick-down": "tickDown 0.8s ease-out forwards",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        tickUp: {
          "0%": { backgroundColor: "rgba(16, 185, 129, 0.32)" },
          "100%": { backgroundColor: "transparent" },
        },
        tickDown: {
          "0%": { backgroundColor: "rgba(244, 63, 94, 0.32)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
