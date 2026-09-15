/**
 * Dansk tal- og beløbsformatering.
 *
 * Regel fra designoplægget: beløb vises i t.kr. eller mio. kr. afhængigt af
 * størrelse – aldrig rå kroner i et nøgletal.
 */

const DA = "da-DK";

/**
 * Dansk tal med typografisk minus (−, U+2212) i stedet for bindestreg.
 * Intl bruger bindestreg, som er for kort og forsvinder i store taltyper.
 */
function tal(v: number, decimaler = 0): string {
  return v
    .toLocaleString(DA, {
      minimumFractionDigits: decimaler,
      maximumFractionDigits: decimaler,
    })
    .replace("-", "\u2212");
}

/** Forkorter en lang etiket, så den ikke klippes på en skrå akse. */
export function forkort(tekst: string, maks = 26): string {
  if (tekst.length <= maks) return tekst;
  return `${tekst.slice(0, maks - 1).replace(/[\s.,/-]+$/, "")}…`;
}

/**
 * Samler en sætning, der indeholder beløb.
 *
 * Beløbsformaterne slutter selv på "kr.", så en sætning, der slutter med et
 * beløb, ville ellers få to punktummer i træk.
 */
export function saetning(...dele: string[]): string {
  return dele
    .join(" ")
    .replace(/\.\.(?=\s|$)/g, ".")
    .replace(/\.\s*,/g, ".,")
    .trim();
}

/** 1.234,5 – rent tal uden enhed. */
export function formatTal(v: number | null, decimaler = 0): string {
  return v === null || !Number.isFinite(v) ? "–" : tal(v, decimaler);
}

/** Beløb i tusinde kroner: 16.522 t.kr. */
export function tkr(kroner: number | null, medEnhed = true): string {
  if (kroner === null || !Number.isFinite(kroner)) return "–";
  return tal(kroner / 1000, 0) + (medEnhed ? " t.kr." : "");
}

/** Beløb i millioner kroner: 253,5 mio. kr. */
export function mio(kroner: number | null, decimaler = 1, medEnhed = true): string {
  if (kroner === null || !Number.isFinite(kroner)) return "–";
  return tal(kroner / 1_000_000, decimaler) + (medEnhed ? " mio. kr." : "");
}

/**
 * Vælger selv mellem t.kr. og mio. kr.
 * Grænsen er 1 mio. kr., så nøgletal aldrig vises i rå kroner.
 */
export function beloeb(kroner: number | null, decimaler = 1): string {
  if (kroner === null || !Number.isFinite(kroner)) return "–";
  return Math.abs(kroner) >= 1_000_000 ? mio(kroner, decimaler) : tkr(kroner);
}

/** Procent med dansk decimalkomma: 61,2 %. */
export function pct(v: number | null, decimaler = 1): string {
  return v === null || !Number.isFinite(v) ? "–" : `${tal(v, decimaler)} %`;
}

/** Faktor: 1,73x. */
export function gange(v: number | null, decimaler = 2): string {
  return v === null || !Number.isFinite(v) ? "–" : `${tal(v, decimaler)}x`;
}

/** Kroner pr. kvadratmeter: 933 kr./m². */
export function krPrM2(v: number | null): string {
  return v === null || !Number.isFinite(v) ? "–" : `${tal(v, 0)} kr./m²`;
}

/** Areal: 17.624 m². */
export function m2(v: number | null): string {
  return v === null || !Number.isFinite(v) ? "–" : `${tal(v, 0)} m²`;
}

/** Sætter altid fortegn på – bruges til afvigelser. */
export function medFortegn(tekst: string, v: number | null): string {
  if (v === null || !Number.isFinite(v) || v === 0) return tekst;
  return v > 0 ? `+${tekst}` : tekst;
}

/** Afvigelse i t.kr. med fortegn: +322 t.kr. / −322 t.kr. */
export function afvigelseTkr(kroner: number | null): string {
  if (kroner === null || !Number.isFinite(kroner)) return "–";
  const t = tkr(Math.abs(kroner));
  return kroner < 0 ? `−${t}` : kroner > 0 ? `+${t}` : t;
}

/** Afvigelse i procent med fortegn: −16,9 %. */
export function afvigelsePct(v: number | null, decimaler = 1): string {
  if (v === null || !Number.isFinite(v)) return "–";
  const s = `${tal(Math.abs(v), decimaler)} %`;
  return v < 0 ? `−${s}` : v > 0 ? `+${s}` : s;
}

/**
 * Formaterer en værdi fra resultatopgørelsen, der står i t.kr.
 * Minustegn vises som typografisk minus (−), ikke bindestreg.
 */
export function fraTkr(v: number | null, decimaler = 0): string {
  if (v === null || !Number.isFinite(v)) return "–";
  const s = tal(Math.abs(v), decimaler);
  return v < 0 ? `−${s}` : s;
}

/** Omregner en t.kr.-værdi til hele kroner. */
export function tkrTilKroner(v: number | null): number | null {
  return v === null ? null : v * 1000;
}

/** Dansk dato: 30. april 2026. */
export function dato(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(DA, { day: "numeric", month: "long", year: "numeric" });
}

/** Formaterer et nøgletal ud fra dets enhed. */
export function noegletalsvaerdi(
  v: number | null,
  enhed: "procent" | "gange" | "kroner",
): string {
  switch (enhed) {
    case "procent":
      return pct(v);
    case "gange":
      return gange(v);
    case "kroner":
      return beloeb(v);
  }
}
