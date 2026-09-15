# Ejendomsdashboard

Datadrevet ejendomsdashboard for Dansk Administrationscenter (DAC). Bygget som
et standardprodukt: én ejer = én JSON-fil. Første ejer er Nygårdsholm Ejendomme.

**Status: fase 1 og 2 færdige (dataudtræk og datamodel). Fase 3 – selve
dashboardet – er ikke bygget endnu.**

## Sådan er projektet skruet sammen

```
kilde/      Kilderapporten som .docx
tools/      Udtræk og validering (Python) + kontrolscript til nøgletal
data/       Én JSON-fil pr. ejer + ejere.json som register + VALIDERING.md
lib/        Typer, datalag og beregning af nøgletal
config/     Tærskelværdier til nøgletalskortene
```

Datalaget i `lib/data.ts` er det eneste sted, der kender datakilden. UI'et
importerer kun derfra, så kilden senere kan skiftes fra JSON til Supabase uden
at røre en eneste komponent.

## Kom i gang

```bash
npm install
npm run data       # bygger data/nygaardsholm.json + data/VALIDERING.md
npm run typecheck
npm run tjek       # udskriver de beregnede nøgletal, så de kan efterprøves
```

`npm run data` kræver Python 3. Scriptet afstemmer alle tabeller mod hinanden og
fejler, hvis en kontrol ikke stemmer og ikke er dokumenteret i VALIDERING.md.

## Tilføj en ny ejer

1. Læg `data/<ejer-id>.json` ind. Formatet er beskrevet af `EjerData` i
   `lib/types.ts`.
2. Tilføj `{ "id": "<ejer-id>", "fil": "<ejer-id>.json" }` til `data/ejere.json`.

Der skal ikke ændres kode. Modellen indeholder ingen faste ejendomme, faste
regnskabslinjer eller faste årstal.

## Tærskelværdier

Grænserne for grøn/gul/rød ligger udelukkende i `config/taerskler.ts`. Alle
værdier er markeret `erForslag: true`, indtil de er aftalt med banken.

## Datagrundlag

`data/VALIDERING.md` dokumenterer, hvor hvert tal kommer fra, hvilke
afstemninger der er lavet, og hvilke uoverensstemmelser kilden indeholder.
