import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { beregnNoegletal } from "@/lib/noegletal";
import { noegletalsvaerdi } from "@/lib/format";
import { Bankoverblik } from "@/components/sektioner/Bankoverblik";
import { Drift } from "@/components/sektioner/Drift";
import { Portefoelje } from "@/components/sektioner/Portefoelje";
import { Vedligehold } from "@/components/sektioner/Vedligehold";
import { Finansiering } from "@/components/sektioner/Finansiering";
import { Tomgang } from "@/components/sektioner/Tomgang";
import { Printknap } from "@/components/ui/Printknap";
import { Statusmaerke } from "@/components/ui/Statusmaerke";
import { Tabel } from "@/components/ui/Tabel";

/**
 * Samlet rapport: alle faner i ét dokument med alt foldet ud.
 *
 * Det er denne side, der udskrives til PDF og sendes til banken. Hver sektion
 * starter på en ny side, og kort brækkes ikke midt over (se @media print
 * i app/globals.css).
 */
export default async function PrintSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  const noegletal = beregnNoegletal(data);

  const sektioner = [
    { id: "overblik", titel: "Bankoverblik", indhold: <Bankoverblik data={data} /> },
    { id: "drift", titel: "Drift", indhold: <Drift data={data} startAaben /> },
    { id: "portefoelje", titel: "Portefølje", indhold: <Portefoelje data={data} startAaben /> },
    {
      id: "vedligehold",
      titel: "Vedligehold og GI",
      indhold: <Vedligehold data={data} startAaben />,
    },
    {
      id: "finansiering",
      titel: "Finansiering og likviditet",
      indhold: <Finansiering data={data} startAaben />,
    },
    { id: "tomgang", titel: "Lejerotation og tomgang", indhold: <Tomgang data={data} /> },
  ];

  return (
    <>
      <div className="ingen-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent-bund p-4">
        <p className="text-sm text-blaek-sekundaer">
          Hele rapporten i ét dokument med alle tabeller foldet ud. Udskriv til PDF, og send den
          direkte videre.
        </p>
        <Printknap tekst="Gem hele rapporten som PDF" />
      </div>

      {/*
        Forsiden. Ejernavn og periode står allerede i sidehovedet, som også
        kommer med i PDF'en, så de gentages ikke her.
      */}
      <section className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-blaek">Ejendomsrapport</h1>
        <p className="mt-1 text-sm text-blaek-sekundaer">
          Samlet rapport for {data.ejer.rapportperiode.maanedLabel}, regnskabsår{" "}
          {data.ejer.regnskabsaar.aktueltLabel}.
        </p>

        <div className="print-hel mt-6 rounded-lg border border-linje p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blaek-daempet">
            Nøgletal i sammendrag
          </h2>
          <Tabel
            kolonner={[
              { id: "navn", navn: "Nøgletal", celle: (n) => n.definition.navn },
              {
                id: "vaerdi",
                navn: "Værdi",
                taljustering: true,
                celle: (n) => (
                  <span className="font-semibold">
                    {noegletalsvaerdi(n.vaerdi, n.definition.enhed)}
                  </span>
                ),
              },
              { id: "status", navn: "Status", celle: (n) => <Statusmaerke status={n.status} /> },
              {
                id: "grundlag",
                navn: "Beregnet af",
                celle: (n) => (
                  <span className="text-xs text-blaek-sekundaer">{n.grundlag}</span>
                ),
              },
            ]}
            raekker={noegletal}
            noegle={(n) => n.definition.id}
            kompakt
          />
          <p className="mt-3 text-xs text-blaek-daempet">
            Grænseværdierne for grøn, gul og rød er forslag og skal aftales med banken.
          </p>
        </div>

        <div className="print-hel mt-6 rounded-lg border border-linje p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blaek-daempet">
            Datagrundlag
          </h2>
          <p className="text-sm leading-relaxed text-blaek-sekundaer">
            Alle tal stammer fra {data.skema.kilde.fil} og er afstemt mod kilden. Rapporten er
            genereret {new Date(data.skema.genereret).toLocaleDateString("da-DK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </p>
          {data.datakvalitet.filter((d) => d.alvor === "mangler").length > 0 && (
            <>
              <p className="mt-3 text-sm font-medium text-blaek">Data der mangler i kilden</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-blaek-sekundaer">
                {data.datakvalitet
                  .filter((d) => d.alvor === "mangler")
                  .map((d) => (
                    <li key={d.id}>
                      <strong className="font-medium">{d.omraade}:</strong> {d.tekst}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {sektioner.map((s, i) => (
        <section
          key={s.id}
          className={i === 0 ? "print-ingen-nyside" : "print-nyside pt-10"}
          aria-labelledby={`sektion-${s.id}`}
        >
          <h2
            id={`sektion-${s.id}`}
            className="mb-5 border-b border-linje-kraftig pb-2 text-xl font-semibold tracking-tight text-blaek"
          >
            {s.titel}
          </h2>
          {s.indhold}
        </section>
      ))}
    </>
  );
}
