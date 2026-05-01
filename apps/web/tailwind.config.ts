import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D1117",
        paper: "#F5F7FB",
        line: "#E4E8F0",
        mint: "#4F9F73",
        berry: "#92385F",
        saffron: "#D99A2B",
        sea: "#247C8D",
        night: "#05080D",
        cloud: "#FFFFFF",
        muted: "#667085"
      },
      boxShadow: {
        soft: "0 18px 46px rgba(13, 17, 23, 0.10)",
        premium: "0 24px 80px rgba(13, 17, 23, 0.13)"
      }
    }
  },
  plugins: []
};

export default config;
