import Image from "next/image";

import maerke from "@/public/dac-maerke.png";
import lockup from "@/public/dac-logo.png";

/**
 * Dansk Administrationscenters logo.
 *
 * `next/image` bruges frem for en almindelig <img>, fordi sitet også udgives
 * under en basispath på GitHub Pages – komponenten sætter præfikset selv.
 * Billederne importeres, så bredde og højde følger med fra filen og layoutet
 * ikke hopper, mens de hentes.
 */
export function Logo({
  variant = "lockup",
  bredde = 176,
  className = "",
}: {
  /** "lockup" er det fulde logo, "maerke" kun bygningerne. */
  variant?: "lockup" | "maerke";
  bredde?: number;
  className?: string;
}) {
  const kilde = variant === "maerke" ? maerke : lockup;
  const hoejde = Math.round((bredde * kilde.height) / kilde.width);

  return (
    <Image
      src={kilde}
      alt="Dansk Administrationscenter"
      width={bredde}
      height={hoejde}
      priority
      className={className}
    />
  );
}
