import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        paper: "#FAFAF7",
        line: "#E7E1D7",
        mint: "#5BA97D",
        berry: "#9A365F",
        saffron: "#E7A83E",
        sea: "#277C8E"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 20, 20, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
