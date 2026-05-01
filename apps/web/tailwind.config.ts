import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101217",
        paper: "#F6F8FB",
        line: "#E2E6EC",
        mint: "#5BA97D",
        berry: "#9A365F",
        saffron: "#E7A83E",
        sea: "#277C8E",
        night: "#070A0F",
        cloud: "#FFFFFF",
        muted: "#67707F"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(16, 18, 23, 0.10)",
        premium: "0 24px 80px rgba(16, 18, 23, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
