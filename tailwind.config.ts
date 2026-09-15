import type { Config } from "tailwindcss";

/**
 * Designlinje: hvid baggrund, én accentfarve (blå) og status i grøn/gul/rød.
 * Statusfarverne bruges udelukkende til status – aldrig som dataserie.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2a78d6",
          moerk: "#1c5cab",
          lys: "#cde2fb",
          bund: "#f2f7fd",
        },
        blaek: {
          DEFAULT: "#0b0b0b",
          sekundaer: "#52514e",
          daempet: "#898781",
        },
        linje: {
          DEFAULT: "#e1e0d9",
          kraftig: "#c3c2b7",
        },
        status: {
          groen: "#0ca30c",
          gul: "#fab219",
          roed: "#d03b3b",
          "groen-bund": "#e9f7e9",
          "gul-bund": "#fdf4e0",
          "roed-bund": "#faeaea",
        },
        serie: {
          1: "#2a78d6",
          2: "#eb6834",
          3: "#1baf7a",
          4: "#eda100",
          5: "#e87ba4",
          6: "#008300",
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      maxWidth: { indhold: "1200px" },
    },
  },
  plugins: [],
};
export default config;
