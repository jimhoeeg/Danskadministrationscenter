"use client";

import type { EjerData } from "@/lib/types";
import {
  dominerendeLejetype,
  moderniseringspotentiale,
  prBy,
  prLejetype,
} from "@/lib/beregninger";
import { portefoeljesum } from "@/lib/noegletal";
import { beloeb, forkort, formatTal, krPrM2, m2, mio, pct, saetning } from "@/lib/format";
import { Kort } from "@/components/ui/Kort";
import { Foldud } from "@/components/ui/Foldud";
import { Tabel } from "@/components/ui/Tabel";
import { Soejler } from "@/components/diagrammer/Soejler";
import { seriefarve } from "@/components/diagrammer/tema";

/**
 * Porteføljefanen: hvor lejemålene ligger, hvad de koster pr. m², hvor der er
 * moderniseringspotentiale, og hvad ejendommene er værdiansat til.
 */
/** Korte akseetiketter – de fulde navne står i legende, værktøjstip og tabel. */
const KORT_LEJETYPE: Record<string, string> = {
  omkostningsbestemt: "§19.1",
  aftalt: "§19.2",
  smaa_huse: "Små huse",
  erhverv: "Erhverv",
};

export function Portefoelje({ data, startAaben = false }: { data: EjerData; startAaben?: boolean }) {
  const byer = prBy(data);
  const lejetyper = prLejetype(data);
  const sum = portefoeljesum(data);
  const modernisering = moderniseringspotentiale(data);

  /* Farverne følger lejetypen, ikke ejendommens plads i listen. */
  const lejetypefarve = new Map(lejetyper.map((t, i) => [t.lejetype, seriefarve(i)]));
  const lejetypenavn = new Map(lejetyper.map((t) => [t.lejetype, t.navn]));

  const ejendommeEfterLeje = [...data.ejendomme]
    .map((e) => ({
      ejendom: e,
      lejePrM2: e.lejemaal.ialt.m2 ? e.lejemaal.ialt.leje / e.lejemaal.ialt.m2 : 0,
      type: dominerendeLejetype(e),
    }))
    .sort((a, b) => b.lejePrM2 - a.lejePrM2);

  const samletPotentiale = modernisering.reduce((s, m) => s + (m.potentiale ?? 0), 0);
  const spaerrede = modernisering.filter((m) => m.spaerret);

  return (
    <div className="space-y-6">
      <div className="print-2kol grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Kort
          overskrift={`${formatTal(sum.antalLejemaal)} lejemål fordelt på ${byer.length} byer`}
          underoverskrift={saetning(
            "Areal i m² pr. by.",
            `${byer[0]?.by} er størst med ${m2(byer[0]?.m2 ?? 0)}.`,
          )}
        >
          <Soejler
            punkter={byer.map((b) => ({
              navn: b.by,
              vaerdi: b.m2,
              detaljer: [
                { navn: "Lejemål", vaerdi: formatTal(b.antal) },
                { navn: "Leje pr. m²", vaerdi: krPrM2(b.lejePrM2) },
                { navn: "Årlig leje", vaerdi: mio(b.leje, 1) },
              ],
            }))}
            formater={(v) => formatTal(v)}
            hoejde={240}
          />
          <Foldud titel="Vis tal pr. by" startAaben={startAaben}>
            <Tabel
              kolonner={[
                { id: "by", navn: "By", celle: (b) => b.by },
                { id: "antal", navn: "Lejemål", taljustering: true, celle: (b) => formatTal(b.antal) },
                { id: "m2", navn: "Areal", taljustering: true, celle: (b) => m2(b.m2) },
                { id: "leje", navn: "Årlig leje", taljustering: true, celle: (b) => beloeb(b.leje) },
                {
                  id: "prm2",
                  navn: "Leje pr. m²",
                  taljustering: true,
                  celle: (b) => krPrM2(b.lejePrM2),
                },
              ]}
              raekker={byer}
              noegle={(b) => b.by}
              sumraekke={[
                "I alt",
                formatTal(sum.antalLejemaal),
                m2(sum.arealIalt),
                beloeb(byer.reduce((s, b) => s + b.leje, 0)),
                krPrM2(byer.reduce((s, b) => s + b.leje, 0) / sum.arealIalt),
              ]}
            />
          </Foldud>
        </Kort>

        <Kort
          overskrift={`${pct((100 * (lejetyper.find((t) => t.lejetype === "aftalt")?.antal ?? 0)) / sum.antalLejemaal, 0)} af lejemålene er på aftalt leje`}
          underoverskrift="Fordeling på lejetype – antallet af lejemål"
        >
          <Soejler
            punkter={lejetyper.map((t) => ({
              navn: KORT_LEJETYPE[t.lejetype] ?? forkort(t.navn, 14),
              vaerdi: t.antal,
              farve: lejetypefarve.get(t.lejetype),
              detaljer: [
                { navn: "Areal", vaerdi: m2(t.m2) },
                { navn: "Leje pr. m²", vaerdi: krPrM2(t.lejePrM2) },
              ],
            }))}
            formater={(v) => formatTal(v)}
            hoejde={240}
            legende={lejetyper.map((t) => ({
              navn: t.navn,
              farve: lejetypefarve.get(t.lejetype) ?? seriefarve(0),
            }))}
          />
          <Foldud titel="Vis tal pr. lejetype" startAaben={startAaben}>
            <Tabel
              kolonner={[
                { id: "navn", navn: "Lejetype", celle: (t) => t.navn },
                { id: "antal", navn: "Lejemål", taljustering: true, celle: (t) => formatTal(t.antal) },
                { id: "m2", navn: "Areal", taljustering: true, celle: (t) => m2(t.m2) },
                { id: "leje", navn: "Årlig leje", taljustering: true, celle: (t) => beloeb(t.leje) },
                {
                  id: "prm2",
                  navn: "Leje pr. m²",
                  taljustering: true,
                  celle: (t) => krPrM2(t.lejePrM2),
                },
              ]}
              raekker={lejetyper}
              noegle={(t) => t.lejetype}
            />
          </Foldud>
        </Kort>
      </div>

      <Kort
        overskrift={`Lejen svinger fra ${krPrM2(ejendommeEfterLeje.at(-1)?.lejePrM2 ?? 0)} til ${krPrM2(ejendommeEfterLeje[0]?.lejePrM2 ?? 0)}`}
        underoverskrift="Leje pr. m² pr. ejendom i kroner, farvet efter den lejetype der fylder mest"
      >
        <Soejler
          punkter={ejendommeEfterLeje.map((e) => ({
            navn: forkort(e.ejendom.navn, 22),
            vaerdi: Math.round(e.lejePrM2),
            farve: e.type ? lejetypefarve.get(e.type) : undefined,
            detaljer: [
              { navn: "Ejendom", vaerdi: e.ejendom.navn },
              { navn: "By", vaerdi: e.ejendom.by },
              { navn: "Lejemål", vaerdi: formatTal(e.ejendom.lejemaal.ialt.antal) },
              { navn: "Areal", vaerdi: m2(e.ejendom.lejemaal.ialt.m2) },
              {
                navn: "Fylder mest",
                vaerdi: e.type ? (lejetypenavn.get(e.type) ?? e.type) : "–",
              },
            ],
          }))}
          formater={(v) => formatTal(v)}
          hoejde={380}
          vinkletAkse
          legende={lejetyper
            .filter((t) => ejendommeEfterLeje.some((e) => e.type === t.lejetype))
            .map((t) => ({
              navn: `Overvejende ${t.navn.toLowerCase()}`,
              farve: lejetypefarve.get(t.lejetype) ?? seriefarve(0),
            }))}
        />
      </Kort>

      <Kort
        overskrift={
          samletPotentiale > 0
            ? `Indikativt moderniseringspotentiale ${beloeb(samletPotentiale)} om året`
            : "Ingen §19.1-lejemål med målbart potentiale"
        }
        underoverskrift="§19.1-lejemål målt mod det §19.2-niveau der faktisk opnås i samme by"
      >
        <Tabel
          kolonner={[
            {
              id: "navn",
              navn: "Ejendom",
              celle: (m) => (
                <span>
                  {m.navn}
                  {m.spaerret && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-status-gul-bund px-2 py-0.5 text-[11px] font-medium text-status-gul-tekst ring-1 ring-status-gul/30">
                      <span aria-hidden="true">▲</span> Spærret
                    </span>
                  )}
                </span>
              ),
            },
            { id: "by", navn: "By", celle: (m) => m.by },
            { id: "antal", navn: "§19.1-lejemål", taljustering: true, celle: (m) => formatTal(m.antal) },
            { id: "m2", navn: "Areal", taljustering: true, celle: (m) => m2(m.m2) },
            { id: "nu", navn: "Leje nu", taljustering: true, celle: (m) => krPrM2(m.nuPrM2) },
            {
              id: "ref",
              navn: "§19.2 i byen",
              taljustering: true,
              celle: (m) => krPrM2(m.referencePrM2),
            },
            {
              id: "potentiale",
              navn: "Potentiale pr. år",
              taljustering: true,
              celle: (m) => (m.potentiale === null ? "–" : beloeb(m.potentiale)),
            },
          ]}
          raekker={modernisering}
          noegle={(m) => m.ejendomId}
          sumraekke={[
            "I alt",
            "",
            formatTal(modernisering.reduce((s, m) => s + m.antal, 0)),
            m2(modernisering.reduce((s, m) => s + m.m2, 0)),
            "",
            "",
            beloeb(samletPotentiale),
          ]}
        />

        {spaerrede.length > 0 && (
          <div className="mt-4 rounded-lg border border-status-gul/30 bg-status-gul-bund p-3">
            <p className="text-sm font-medium text-status-gul-tekst">
              <span aria-hidden="true">▲ </span>
              {spaerrede.length === 1
                ? "Én ejendom kan endnu ikke moderniseres"
                : `${spaerrede.length} ejendomme kan endnu ikke moderniseres`}
            </p>
            <ul className="mt-2 space-y-1.5">
              {spaerrede.map((m) => (
                <li key={m.ejendomId} className="text-xs leading-relaxed text-blaek-sekundaer">
                  <strong className="font-medium text-blaek">
                    {m.navn} ({m.by}):
                  </strong>{" "}
                  {m.begrundelse}{" "}
                  {m.spaerretTil ? (
                    <>
                      Kan moderniseres fra{" "}
                      {new Date(m.spaerretTil).toLocaleDateString("da-DK", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      .
                    </>
                  ) : (
                    <em>Dato mangler i datagrundlaget – skal oplyses af DAC.</em>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-3 text-xs leading-relaxed text-blaek-daempet">
          Potentialet er et regneeksempel: §19.1-arealet ganget med forskellen op til den
          gennemsnitlige §19.2-leje i samme by. Kildematerialet indeholder hverken
          moderniseringsomkostninger eller forventede lejeforhøjelser, så tallet er ikke et budget.
        </p>
      </Kort>

      <Kort
        overskrift={`Porteføljen er værdiansat til ${mio(sum.vaerdi)} – ${krPrM2(sum.vaerdi / sum.arealIalt)}`}
        underoverskrift="Værdiansættelse pr. ejendom"
      >
        <Tabel
          kolonner={[
            { id: "navn", navn: "Ejendom", celle: (e) => e.navn },
            { id: "by", navn: "By", celle: (e) => e.by },
            {
              id: "energi",
              navn: "Energimærke",
              celle: (e) => e.energimaerke ?? "–",
            },
            {
              id: "antal",
              navn: "Lejemål",
              taljustering: true,
              celle: (e) => formatTal(e.lejemaal.ialt.antal),
            },
            { id: "areal", navn: "Areal", taljustering: true, celle: (e) => m2(e.areal.ialt) },
            {
              id: "nettoleje",
              navn: "Nettoleje",
              taljustering: true,
              celle: (e) => beloeb(e.vaerdiansaettelse.nettoleje),
            },
            {
              id: "vaerdi",
              navn: "Værdi",
              taljustering: true,
              celle: (e) => mio(e.vaerdiansaettelse.vaerdi),
            },
            {
              id: "prm2",
              navn: "Værdi pr. m²",
              taljustering: true,
              celle: (e) =>
                e.areal.ialt ? krPrM2(e.vaerdiansaettelse.vaerdi / e.areal.ialt) : "–",
            },
            {
              id: "afkast",
              navn: "Nettoafkast",
              taljustering: true,
              celle: (e) =>
                e.vaerdiansaettelse.vaerdi
                  ? pct((100 * e.vaerdiansaettelse.nettoleje) / e.vaerdiansaettelse.vaerdi)
                  : "–",
            },
          ]}
          raekker={data.ejendomme}
          noegle={(e) => e.id}
          sumraekke={[
            "I alt",
            "",
            "",
            formatTal(sum.antalLejemaal),
            m2(sum.arealIalt),
            beloeb(sum.nettoleje),
            mio(sum.vaerdi),
            krPrM2(sum.vaerdi / sum.arealIalt),
            pct((100 * sum.nettoleje) / sum.vaerdi),
          ]}
        />
        <p className="mt-3 text-xs leading-relaxed text-blaek-daempet">
          Nettoafkastet er beregnet som nettoleje divideret med værdi. Kilderapportens egen
          afkastkolonne ligger 0,1–0,4 procentpoint højere og kan ikke genskabes af de oplyste
          tal – se punkt Å7 i valideringsrapporten.
        </p>
      </Kort>
    </div>
  );
}
