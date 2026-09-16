import type { Config } from "tailwindcss";

/**
 * Designlinje: Jyske Banks palette lagt ind i et lyst, roligt app-layout.
 *
 * Den dybe Jyske-grøn (#00422E) fungerer som blæk og primærfarve – ikke som
 * "grøn betyder godt". Statusfarverne er et selvstændigt sæt, og de optræder
 * aldrig uden symbol og tekst.
 *
 * Diagramfarverne er valideret mod hvid kortbaggrund med dataviz-validatoren:
 * kategorisk (6 slots) og den ordinale grønne rampe består alle checks.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Jyske Banks faste palette */
        jyske: {
          groen: "#00422E",
          moerk: "#002F20",
          lime: "#A0D169",
          mint: "#ECFBDB",
          creme: "#FAF6F0",
        },
        /* Flader */
        flade: {
          side: "#FAFAF8",
          kort: "#FFFFFF",
          daempet: "#F5F4F0",
        },
        linje: {
          DEFAULT: "#EAE8E3",
          kraftig: "#D6D3CC",
        },
        blaek: {
          DEFAULT: "#11150F",
          sekundaer: "#5A6059",
          daempet: "#8B918A",
        },
        /* Status – altid sammen med symbol og tekst */
        status: {
          groen: "#1E7F52",
          "groen-tekst": "#15603C",
          "groen-bund": "#EAF5EF",
          gul: "#E0A020",
          "gul-tekst": "#8A5D00",
          "gul-bund": "#FDF6E7",
          roed: "#C2504A",
          "roed-tekst": "#9E3B36",
          "roed-bund": "#FBEEED",
        },
        /* Kategoriske diagramfarver, tildeles i fast rækkefølge */
        serie: {
          1: "#2A8F6A",
          2: "#7A5BA6",
          3: "#E0722F",
          4: "#3C7FB0",
          5: "#C99A1E",
          6: "#C2504A",
        },
        /* Ordinal grøn rampe – til data med naturlig rangorden */
        rampe: {
          lys: "#7FBBA1",
          mellem: "#2A8F6A",
          moerk: "#0B5B41",
        },
      },
      fontFamily: {
        sans: ["var(--skrift)", "system-ui", "sans-serif"],
      },
      borderRadius: { kort: "12px" },
      maxWidth: { indhold: "1320px" },
      fontSize: {
        etiket: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.06em" }],
      },
    },
  },
  plugins: [],
};
export default config;
