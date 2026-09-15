/**
 * Udskriver de beregnede nøgletal, så de kan holdes op mod kildefilen.
 * Kør: npx tsx tools/tjek_noegletal.ts
 */
import { hentEjerData } from "@/lib/data";
import {
  beregnNoegletal,
  belaaningPrEjendom,
  likviditetsbillede,
  portefoeljesum,
  stresstest,
} from "@/lib/noegletal";

async function main() {
const data = await hentEjerData();
const s = portefoeljesum(data);

console.log(`${data.ejer.navn} · ${data.ejer.rapportperiode.maanedLabel}\n`);
console.log("Porteføljesummer (beregnet ud fra ejendomslisten):");
console.log(`  Ejendomsværdi     ${(s.vaerdi / 1e6).toFixed(1)} mio. kr.`);
console.log(`  Realkreditgæld    ${(s.realkreditgaeld / 1e6).toFixed(1)} mio. kr.`);
console.log(`  Kursværdi         ${(s.kursvaerdi / 1e6).toFixed(1)} mio. kr.`);
console.log(`  Nettoleje         ${(s.nettoleje / 1e6).toFixed(2)} mio. kr.`);
console.log(`  Areal             ${s.arealIalt.toLocaleString("da-DK")} m²`);
console.log(`  Lejemål           ${s.antalLejemaal}\n`);

console.log("Nøgletal:");
for (const n of beregnNoegletal(data)) {
  const v =
    n.vaerdi === null
      ? "–"
      : n.definition.enhed === "procent"
        ? `${n.vaerdi.toFixed(1)} %`
        : n.definition.enhed === "gange"
          ? `${n.vaerdi.toFixed(2)}x`
          : `${n.vaerdi.toFixed(0)} kr.`;
  console.log(`  ${n.definition.navn.padEnd(24)} ${v.padStart(9)}  [${n.status}]  ${n.grundlag}`);
  for (const note of n.noter ?? []) console.log(`${" ".repeat(38)}${note}`);
}

const l = likviditetsbillede(data);
console.log(
  `\nLikviditet: nu ${(l.bankNu! / 1000).toFixed(0)} t.kr., laveste ${(l.laveste!.beloeb / 1000).toFixed(0)} t.kr. i ${l.laveste!.aar}, ` +
    `1 md. drift ${(l.maanedligeUdgifter! / 1000).toFixed(0)} t.kr.`,
);

console.log("\nStresstest på prioritetsrenter (estimat 26/27):");
for (const pp of [0, 1, 2, 3, 4]) {
  const r = stresstest(data, pp);
  console.log(
    `  +${pp} pp:  ramt gæld ${(r.ramtGaeld / 1e6).toFixed(1)} mio.  merrente ${(r.merrente / 1000).toFixed(0)} t.kr.  ` +
      `ICR ${r.icrEfter!.toFixed(2)}x  resultat før skat ${(r.resultatEfter! / 1000).toFixed(0)} t.kr.`,
  );
}

console.log("\nBelåningsgrad pr. ejendom (beregnet):");
for (const b of belaaningPrEjendom(data)) {
  console.log(
    `  ${b.navn.padEnd(40)} ${b.ltvPct === null ? "  ingen gæld" : `${b.ltvPct.toFixed(1)} %`.padStart(9)}` +
      `   (kilde: ${b.laan.gaeldPctKilde ?? "–"} %)`,
  );
}
}

main();
