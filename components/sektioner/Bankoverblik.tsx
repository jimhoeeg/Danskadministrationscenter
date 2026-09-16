import type { EjerData } from "@/lib/types";
import { beregnNoegletal, portefoeljesum } from "@/lib/noegletal";
import { formatTal, m2, mio } from "@/lib/format";
import { Noegletalskort, Noegletalsforklaringer } from "@/components/ui/Noegletalskort";
import { Kort } from "@/components/ui/Kort";
import { Foldud } from "@/components/ui/Foldud";
import { Ikon } from "@/components/ui/Ikon";
import { Beslutningsresume } from "./Beslutninger";

const ALVORSSTIL: Record<string, { flade: string; prik: string; maerkat: string }> = {
  hoej: { flade: "border-status-roed/25 bg-status-roed-bund", prik: "bg-status-roed", maerkat: "Høj" },
  mellem: { flade: "border-status-gul/30 bg-status-gul-bund", prik: "bg-status-gul", maerkat: "Mellem" },
  lav: { flade: "border-linje bg-flade-kort", prik: "bg-linje-kraftig", maerkat: "Lav" },
  info: { flade: "border-linje bg-flade-daempet", prik: "bg-blaek-daempet", maerkat: "Info" },
};

/**
 * Forsiden: seks nøgletal, periodens konklusion og opmærksomhedspunkterne.
 * Alt andet ligger i menuen, så siden kan læses på under et minut.
 */
export function Bankoverblik({
  data,
  ejerId,
  startAaben = false,
}: {
  data: EjerData;
  ejerId: string;
  startAaben?: boolean;
}) {
  const noegletal = beregnNoegletal(data);
  const { periodensOverblik } = data.kommentar;

  return (
    <div className="space-y-6">
      <section aria-labelledby="noegletal-overskrift">
        <h2 id="noegletal-overskrift" className="sr-only">
          Nøgletal
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {noegletal.map((n) => (
            <Noegletalskort key={n.definition.id} n={n} />
          ))}
        </div>

        <Kort className="mt-3" polstring="px-4 py-3">
          <Foldud titel="Sådan er nøgletallene beregnet" startAaben={startAaben} bar>
            <Noegletalsforklaringer noegletal={noegletal} />
            <p className="mt-4 border-t border-linje pt-3 text-xs text-blaek-daempet">
              Grænseværdierne for grøn, gul og rød er forslag og skal aftales med banken.
              De ligger samlet i <code className="font-mono">config/taerskler.ts</code>.
            </p>
          </Foldud>
        </Kort>
      </section>

      <div className="print-2kol grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        <Kort
          overskrift="Periodens overblik"
          underoverskrift={periodensOverblik.periode}
          className="lg:col-span-3"
        >
          <div className="space-y-3">
            {periodensOverblik.afsnit.map((afsnit) => (
              <p key={afsnit} className="text-[13px] leading-relaxed text-blaek-sekundaer">
                {afsnit}
              </p>
            ))}
          </div>
          <p className="mt-4 border-t border-linje pt-3 text-[11px] text-blaek-daempet">
            {periodensOverblik.kilde === "manuel"
              ? `Skrevet af administrator. Kilde: ${periodensOverblik.kildebeskrivelse}.`
              : `Genereret automatisk${periodensOverblik.genereretAf ? ` af ${periodensOverblik.genereretAf}` : ""}.`}
          </p>
        </Kort>

        <div className="lg:col-span-2">
          <Beslutningsresume data={data} ejerId={ejerId} />
        </div>
      </div>
    </div>
  );
}

/** Kompakt portefølje-resumé til sidehovedet. */
export function Portefoeljestribe({ data }: { data: EjerData }) {
  const sum = portefoeljesum(data);
  const poster = [
    { ikon: "bygning" as const, tekst: `${data.ejendomme.length} ejendomme` },
    { ikon: "hjem" as const, tekst: `${formatTal(sum.antalLejemaal)} lejemål` },
    { ikon: "portefoelje" as const, tekst: m2(sum.arealIalt) },
    { ikon: "kurve" as const, tekst: `${mio(sum.vaerdi)} i værdi` },
  ];
  return (
    <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {poster.map((p) => (
        <li key={p.tekst} className="flex items-center gap-1.5 text-[13px] text-blaek-sekundaer">
          <Ikon navn={p.ikon} størrelse={15} className="text-blaek-daempet" />
          <span className="tal">{p.tekst}</span>
        </li>
      ))}
    </ul>
  );
}
