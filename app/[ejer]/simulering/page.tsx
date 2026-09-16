import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Simulering } from "@/components/sektioner/Simulering";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function SimuleringSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Hvad hvis?"
        beskrivelse="Træk i skyderne og se, hvad der sker med pengene. Alt regnes ud fra budgettet, fremskrevet fem år længere."
      />
      <Simulering data={data} />
    </>
  );
}
