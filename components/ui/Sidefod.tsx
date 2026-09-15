import type { EjerData } from "@/lib/types";

/**
 * Sidefod med datagrundlag og periode. Skal stå på hver side – både på
 * skærmen og i PDF'en, så modtageren altid kan se, hvornår tallene er fra.
 */
export function Sidefod({ data }: { data: EjerData }) {
  const { rapportperiode } = data.ejer;
  return (
    <footer className="mt-10 border-t border-linje pt-4 text-xs text-blaek-daempet">
      <p>
        {rapportperiode.datagrundlag} · Kilde: {rapportperiode.kilde} · {data.ejer.navn}
      </p>
      <p className="mt-1">
        Regnskabsår {data.ejer.regnskabsaar.aktueltLabel} ({data.ejer.regnskabsaar.beskrivelse}).
        Værdiansættelse, gæld og GI-saldi er opgjort pr.{" "}
        {new Date(rapportperiode.balancedato).toLocaleDateString("da-DK", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        .
      </p>
    </footer>
  );
}
