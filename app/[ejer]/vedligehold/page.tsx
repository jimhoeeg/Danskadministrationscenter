import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Vedligehold } from "@/components/sektioner/Vedligehold";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function VedligeholdSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Vedligehold og GI"
        beskrivelse="Planlagte projekter frem til 2033/34 og indeståenderne i Grundejernes Investeringsfond."
      />
      <Vedligehold data={data} />
    </>
  );
}
