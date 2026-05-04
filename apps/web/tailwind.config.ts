import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      transitionTimingFunction: {
        premium: "cubic-bezier(0.33, 1, 0.68, 1)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0A0D12",
        paper: "#EEF2F9",
        line: "#DFE5EF",
        mint: "#3D8F62",
        berry: "#8B3258",
        saffron: "#C9891F",
        sea: "#1D6F82",
        night: "#05080D",
        cloud: "#FFFFFF",
        muted: "#5C6578"
      },
      boxShadow: {
        soft: "0 18px 46px rgba(13, 17, 23, 0.10)",
        premium: "0 24px 80px rgba(13, 17, 23, 0.13)",
        ultra:
          "0 1px 0 rgba(255,255,255,0.9) inset, 0 36px 100px rgba(10, 13, 18, 0.09), 0 8px 24px rgba(10, 13, 18, 0.04)",
        glowSea: "0 0 80px -20px rgba(29, 111, 130, 0.45), 0 0 40px -24px rgba(139, 50, 88, 0.2)",
        glowSoft: "0 32px 90px rgba(29, 111, 130, 0.12), 0 12px 36px rgba(139, 50, 88, 0.06)"
      },
      keyframes: {
        "aurora-shift": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1) translate(0, 0)" },
          "33%": { opacity: "0.75", transform: "scale(1.05) translate(2%, -1%)" },
          "66%": { opacity: "0.65", transform: "scale(1.02) translate(-1%, 2%)" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "aurora-shift": "aurora-shift 14s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.33, 1, 0.68, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
