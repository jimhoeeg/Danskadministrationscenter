import { notFound } from "next/navigation";
import { hentEjerData, UkendtEjerFejl } from "./data";
import type { EjerData } from "./types";

/**
 * Henter en ejer og viser 404 i stedet for at kaste, hvis id'et ikke findes.
 *
 * Next renderer layout og side parallelt, så hver side skal selv håndtere det.
 * Ellers fejler fx /favicon.ico, der matcher den dynamiske [ejer]-rute.
 */
export async function hentEjerEllerIkkeFundet(ejerId: string): Promise<EjerData> {
  try {
    return await hentEjerData(ejerId);
  } catch (fejl) {
    if (fejl instanceof UkendtEjerFejl) notFound();
    throw fejl;
  }
}
