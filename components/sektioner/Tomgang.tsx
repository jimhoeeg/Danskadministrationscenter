import type { EjerData } from "@/lib/types";
import { Kort } from "@/components/ui/Kort";
import { Pladsholder } from "@/components/ui/Sektion";
import { Tabel } from "@/components/ui/Tabel";
import { formatTal } from "@/lib/format";

/**
 * Lejerotation og tomgang.
 *
 * Sektionen er tom i kilderapporten. Den vises alligevel som en synlig
 * pladsholder, så både ejer og DAC kan se, at data mangler – frem for at
 * manglen forsvinder ved at udelade fanen.
 */
export function Tomgang({ data }: { data: EjerData }) {
  const { tomgang } = data;

  if (tomgang.status === "mangler" || tomgang.perioder.length === 0) {
    return (
      <div className="space-y-6">
        <Pladsholder
          overskrift="Lejerotation og tomgang"
          besked={tomgang.besked}
          beskrivelse={tomgang.beskrivelse}
        />
        <Kort overskrift="Hvad mangler der?">
          <p className="text-sm leading-relaxed text-blaek-sekundaer">
            For at tomgang kan indgå i nøgletallene, skal DAC levere følgende pr. ejendom og
            periode:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-blaek-sekundaer">
            <li>Antal tomme lejemål ved periodens udgang</li>
            <li>Antal fraflytninger i perioden</li>
            <li>Tabt leje som følge af tomgang, så den kan holdes op mod lejetabslinjen</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-blaek-sekundaer">
            Datamodellen er allerede klar til det: feltet{" "}
            <code className="font-mono text-xs">tomgang.perioder</code> i ejerens JSON-fil tager
            imod tallene, og denne side skifter selv fra pladsholder til indhold, når listen ikke
            længere er tom.
          </p>
          <p className="mt-4 rounded-lg border border-linje bg-flade-daempet p-3 text-xs leading-relaxed text-blaek-daempet">
            Indtil videre er lejetab den eneste indikator i rapporten: budget 26/27 lyder på 333
            t.kr., og år til dato er der bogført 124 t.kr. mod et budget på 114 t.kr.
          </p>
        </Kort>
      </div>
    );
  }

  return (
    <Kort overskrift="Lejerotation og tomgang">
      <Tabel
        kolonner={[
          {
            id: "ejendom",
            navn: "Ejendom",
            celle: (p) => data.ejendomme.find((e) => e.id === p.ejendomId)?.navn ?? p.ejendomId,
          },
          { id: "periode", navn: "Periode", celle: (p) => p.periode },
          {
            id: "tomme",
            navn: "Tomme lejemål",
            taljustering: true,
            celle: (p) => formatTal(p.tommeLejemaal),
          },
          {
            id: "fraflytninger",
            navn: "Fraflytninger",
            taljustering: true,
            celle: (p) => formatTal(p.fraflytninger),
          },
        ]}
        raekker={tomgang.perioder}
        noegle={(p, i) => `${p.ejendomId}-${p.periode}-${i}`}
      />
    </Kort>
  );
}
