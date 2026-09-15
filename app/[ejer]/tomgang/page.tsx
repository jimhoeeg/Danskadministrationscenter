import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Tomgang } from "@/components/sektioner/Tomgang";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function TomgangSide({ params }: { params: Promise<{ ejer: string }> }) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Lejerotation og tomgang"
        beskrivelse="Sektionen mangler data i kilderapporten."
      />
      <Tomgang data={data} />
    </>
  );
}
