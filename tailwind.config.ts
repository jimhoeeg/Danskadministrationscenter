import type { Config } from "tailwindcss";

/**
 * Designlinje: Dansk Administrationscenters egen palette i et lyst app-layout.
 *
 * Farverne er trukket direkte ud af logofilen: petrol (#005A5B) er den mørke
 * bygning, turkis (#009DA7) er wordmarket. Petrol er blæk og primærfarve –
 * ikke "grøn betyder godt".
 *
 * Det er netop pointen i skiftet fra den tidligere Jyske-grøn: da primærfarven
 * var grøn, kunne en grøn flade både betyde "her er du" og "det går godt".
 * Med petrol som brand er grøn frigjort til kun at være status.
 *
 * Statusfarverne er et selvstændigt sæt og optræder aldrig uden symbol og
 * tekst. Diagramfarverne ligger i components/diagrammer/tema.ts og er
 * valideret med dataviz-validatoren.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* DAC's egen palette, aflæst i logofilen */
        dac: {
          petrol: "#005A5B",
          moerk: "#00423F",
          turkis: "#009DA7",
          /* Turkis er 3,3:1 mod hvid – for lav til tekst. Denne er 5,4:1. */
          "turkis-tekst": "#00767D",
          lys: "#E4F4F4",
          antracit: "#393937",
        },
        /* Flader */
        flade: {
          side: "#F7F9F9",
          kort: "#FFFFFF",
          daempet: "#EFF4F4",
        },
        linje: {
          DEFAULT: "#E2E9E9",
          kraftig: "#CBD6D6",
        },
        blaek: {
          DEFAULT: "#1B2322",
          sekundaer: "#556160",
          daempet: "#87918F",
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
