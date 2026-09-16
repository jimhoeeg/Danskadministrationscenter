import type { Noegletal } from "@/lib/noegletal";
import { afvigelsePct, gange, noegletalsvaerdi, pct } from "@/lib/format";
import { Statuslinje, statusfarve, statustekst } from "./Statusmaerke";
import { Ikon } from "./Ikon";

/**
 * Ét nøgletal: etiket, ikon, stort tal og én linje status.
 *
 * Kortet holdes let med vilje. Forklaringen og grænseværdierne ligger samlet
 * under kortrækken, så forsiden kan læses på få sekunder.
 */
export function Noegletalskort({ n }: { n: Noegletal }) {
  const { definition: d } = n;
  return (
    <article className="print-hel rounded-kort border border-linje bg-flade-kort p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-medium text-blaek-sekundaer">{d.navn}</h3>
        <span style={{ color: statusfarve(n.status) }} className="shrink-0">
          <Ikon navn={d.ikon} størrelse={17} />
        </span>
      </div>

      <p className="tal mt-2.5 text-[28px] font-bold leading-none tracking-tight text-blaek">
        {noegletalsvaerdi(n.vaerdi, d.enhed)}
      </p>

      <div className="mt-2.5 space-y-1">
        <Statuslinje status={n.status}>
          {n.sammenligning
            ? `${n.sammenligning.navn} ${noegletalsvaerdi(n.sammenligning.vaerdi, d.enhed)}${
                d.id === "drift_mod_budget" && n.vaerdi !== null
                  ? ` · ${afvigelsePct(n.vaerdi)}`
                  : ""
              }`
            : statustekst(n.status)}
        </Statuslinje>
        <p className="tal text-[11px] leading-relaxed text-blaek-daempet">{n.grundlag}</p>
      </div>
    </article>
  );
}

/** Farven bruges også af ikonet på kortet. */
export function noegletalsfarve(n: Noegletal): string {
  return statusfarve(n.status);
}

/**
 * Forklaringerne til alle nøgletal, samlet ét sted under kortrækken.
 * Sådan kan kortene være lette, uden at grundlaget forsvinder for banken.
 */
export function Noegletalsforklaringer({ noegletal }: { noegletal: Noegletal[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {noegletal.map((n) => {
        const d = n.definition;
        const graense =
          d.taerskel === null
            ? null
            : d.taerskel.retning === "lavere_er_bedre"
              ? `Grøn under ${formatGraense(d.taerskel.groen, d.enhed)}, rød over ${formatGraense(d.taerskel.gul, d.enhed)}`
              : `Grøn over ${formatGraense(d.taerskel.groen, d.enhed)}, rød under ${formatGraense(d.taerskel.gul, d.enhed)}`;
        return (
          <div key={d.id}>
            <dt className="text-[13px] font-semibold text-blaek">{d.navn}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-blaek-sekundaer">{d.forklaring}</dd>
            <dd className="mt-1.5 text-[11px] leading-relaxed text-blaek-daempet">
              {d.beregning}.
              {graense && (
                <>
                  {" "}
                  {graense}
                  {d.erForslag && <span className="italic"> (forslag)</span>}.
                </>
              )}
            </dd>
            {n.noter?.map((note) => (
              <dd key={note} className="tal mt-1 text-[11px] text-blaek-daempet">
                {note}
              </dd>
            ))}
          </div>
        );
      })}
    </dl>
  );
}

/** 4,5 % må ikke rundes til 5 %, når det er selve grænsen. */
function formatGraense(v: number, enhed: "procent" | "gange" | "kroner"): string {
  const decimaler = Number.isInteger(v) ? 0 : 1;
  if (enhed === "procent") return pct(v, decimaler);
  if (enhed === "gange") return gange(v, decimaler);
  return noegletalsvaerdi(v, enhed);
}
