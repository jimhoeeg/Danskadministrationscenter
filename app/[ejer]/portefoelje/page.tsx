import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Portefoelje } from "@/components/sektioner/Portefoelje";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function PortefoeljeSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Portefølje"
        beskrivelse="Lejemål, lejeniveauer, moderniseringspotentiale og værdiansættelse."
      />
      <Portefoelje data={data} />
    </>
  );
}
