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
        // Payno / Orbix Studio Color System (Slide 01)
        navy: {
          50: "#F3F6FB",
          100: "#EDF1F4", // Gray 50 from Slide 01
          700: "#4F6A99",
          800: "#405881", // Navy 800 from Slide 01 (#405881)
          900: "#273869", // Navy 900 from Slide 01 (#273869 - Primary Navy)
          950: "#182542", // Navy 950 deep ink
        },
        payno: {
          ink: "#182542",
          navy: "#273869",
          slate: "#405881",
          muted: "#6E81A0",
          canvas: "#F3F6FB",
          surface: "#EDF1F4",
          hairline: "#E2E8F0",
          mint: "#12B76A", // Trend Up only
          coral: "#F04438", // Trend Down only
        },
        canvas: {
          DEFAULT: "#F3F6FB",
          subtle: "#EDF1F4",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          elevated: "#FFFFFF",
          muted: "#F8FAFC",
        },
        hairline: "#E2E8F0",
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
      borderRadius: {
        // Slide 05: xs 8px, md 16px, lg 24px, full pill
        xs: "8px",
        md: "16px",
        lg: "24px",
        xl: "28px",
        pill: "9999px",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          "system-ui",
          "sans-serif",
        ],
        serif: [
          '"Newsreader"',
          '"Playfair Display"',
          '"Instrument Serif"',
          "Georgia",
          "serif",
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
        // Slide 05: Soft corners, soft shadows
        "orbix-sm": "0 2px 8px -2px rgba(39, 56, 105, 0.06), 0 1px 3px rgba(39, 56, 105, 0.03)",
        "orbix-md": "0 12px 28px -6px rgba(39, 56, 105, 0.08), 0 2px 6px rgba(39, 56, 105, 0.03)",
        "orbix-lg": "0 24px 48px -12px rgba(39, 56, 105, 0.12), 0 4px 12px rgba(39, 56, 105, 0.04)",
        "orbix-fab": "0 12px 28px -4px rgba(39, 56, 105, 0.38), 0 4px 10px rgba(39, 56, 105, 0.2)",
        "orbix-dock": "0 16px 40px -10px rgba(39, 56, 105, 0.18), 0 2px 8px rgba(39, 56, 105, 0.04)",
      },
      animation: {
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer-fast": "shimmer 1.5s infinite",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
