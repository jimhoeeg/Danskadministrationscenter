import { hentEjerEllerIkkeFundet } from "@/lib/hent";
import { Bankoverblik, Portefoeljestribe } from "@/components/sektioner/Bankoverblik";
import { Sektionsoverskrift } from "@/components/ui/Sektion";

export default async function BankoverblikSide({
  params,
}: {
  params: Promise<{ ejer: string }>;
}) {
  const { ejer } = await params;
  const data = await hentEjerEllerIkkeFundet(ejer);
  return (
    <>
      <Sektionsoverskrift
        titel="Velkommen tilbage,"
        fremhaevet={data.ejer.navn}
        beskrivelse={`Overblik over porteføljen pr. ${data.ejer.rapportperiode.maanedLabel.toLowerCase()}`}
        ekstra={<Portefoeljestribe data={data} />}
      />
      <Bankoverblik data={data} ejerId={ejer} />
    </>
  );
}
