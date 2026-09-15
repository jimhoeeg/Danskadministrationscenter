# Ejendomsdashboard

Datadrevet ejendomsdashboard for Dansk Administrationscenter (DAC). Bygget som et
standardprodukt: **én ejer = én JSON-fil**. Første ejer er Nygårdsholm Ejendomme.

Dashboardet skal kunne tre ting:

1. Ejeren forstår sin forretning på under et minut.
2. Rapporten kan sendes direkte videre til banken som PDF.
3. Den kan genbruges til DAC's øvrige ejere uden kodeændringer.

## Kom i gang

```bash
npm install
npm run dev        # http://localhost:3000
```

Andre kommandoer:

| Kommando | Hvad den gør |
|---|---|
| `npm run data` | Bygger `data/nygaardsholm.json` og `data/VALIDERING.md` fra kildedataene. Kræver Python 3. |
| `npm run tjek` | Udskriver de beregnede nøgletal, så de kan efterprøves mod kilden. |
| `npm run typecheck` | TypeScript uden emit. |
| `npm run build` | Produktionsbuild. |

`npm run data` afstemmer alle tabeller mod hinanden og **fejler**, hvis en kontrol
ikke stemmer og ikke er dokumenteret som en kendt uoverensstemmelse.

## Sådan hænger projektet sammen

```
kilde/      Kilderapporten som .docx
tools/      Dataudtræk og validering (Python) + kontrolscript til nøgletal
data/       Én JSON-fil pr. ejer + VALIDERING.md
lib/        Typer, datalag, opslag, beregninger og nøgletal
config/     Tærskelværdier til nøgletalskortene
components/ UI-komponenter, diagrammer og de seks sektioner
app/        Next.js App Router – én rute pr. fane plus en samlet printside
```

Datastrømmen er ensrettet:

```
kilde/*.docx  →  tools/kildedata.py  →  tools/byg_data.py  →  data/<ejer>.json
                                                                    ↓
                                            lib/data.ts (Datakilde-interface)
                                                                    ↓
                                    lib/noegletal.ts + lib/beregninger.ts
                                                                    ↓
                                                  components/ → app/
```

**UI'et kender ikke datakilden.** Alt går gennem `Datakilde`-interfacet i
`lib/data.ts`. I dag findes én implementering, `JsonDatakilde`, der læser fra
`data/`. Når kilden senere skiftes til Supabase, skrives en ny implementering og
`vaelgKilde()` peges derhen – ingen komponent skal ændres.

## Tilføj en ny ejer

Læg ejerens JSON-fil i `data/`. Det er hele opskriften.

Mappen skannes ved opslag, og filens eget `ejer.id` bestemmer URL'en, så
`data/bagergaarden.json` med `"id": "bagergaarden"` bliver til
`/bagergaarden`. Der er hverken registerfil eller kode at rette.

Formatet er beskrevet af typen `EjerData` i `lib/types.ts`. Modellen er generisk:
ingen faste ejendomme, ingen faste regnskabslinjer og ingen faste årstal.
Resultatopgørelsens perioder og kolonner, lejetyperne, vedligeholdskategorierne og
likviditetsbudgettets år kommer alle fra dataene.

Vil man skifte hvilken ejer forsiden viser, sættes `NEXT_PUBLIC_STANDARD_EJER`.

### Hvis en sektion mangler data

Sæt `tomgang.status` til `"mangler"`. Så viser fanen en synlig pladsholder frem
for at forsvinde – manglen skal være tydelig for både ejer og DAC. Samme princip
gælder felter, der er `null`: de vises som "–" eller "mangler", aldrig som nul.

## Tærskelværdier

Grænserne for grøn, gul og rød ligger **udelukkende** i `config/taerskler.ts`.
Hverken beregninger eller komponenter indeholder hårdkodede grænser.

Alle værdier er markeret `erForslag: true` og vises med "(forslag)" i
brugerfladen, indtil de er aftalt med banken. Samme fil rummer
beregningsforudsætningerne, blandt andet om F-lån med rentetilpasning tæller med i
"andel variabel rente" (med F5: 73 %, uden: 48 %).

## Nøgletal

De seks nøgletal beregnes af rådata i `lib/noegletal.ts` – ingen af dem er
indtastet som et færdigt tal:

| Nøgletal | Beregning |
|---|---|
| Belåningsgrad (LTV) | Realkreditgæld i alt / ejendomsværdi i alt |
| Rentedækning (ICR) | EBITDA / prioritetsrenter for regnskabsåret |
| Nettoafkast | Nettoleje i alt / ejendomsværdi i alt |
| Andel variabel rente | (Cibor + lån med kort rentetilpasning) / samlet gæld |
| Drift mod budget | (Resultat før skat år til dato − budget) / budget |
| Likviditet | Laveste bankbeholdning i prognosen / én måneds driftsudgifter |

Stresstesten lægger en rentestigning oven i **kun** den variable del af gælden og
viser de antagelser, beregningen hviler på, direkte ved siden af resultatet.

## PDF til banken

`/<ejer>/print` samler alle faner i ét dokument med tabellerne foldet ud.
Browserens "Gem som PDF" giver den fil, der kan sendes videre – omkring 12 A4-sider.

Printreglerne står i `app/globals.css`: hver sektion starter på ny side, diagrammer
og tabelrækker brækkes aldrig midt over, tabelhoveder gentages på hver side, og
navigation og knapper udelades. Hver side har datagrundlag og periode i sidefoden.

De enkelte faner kan også printes hver for sig.

## Deploy til Vercel

Projektet er et almindeligt Next.js App Router-projekt uden runtime-afhængigheder
ud over `data/`-mappen, der bundles med builden.

1. Opret projektet på Vercel og peg det på dette repo.
2. Framework detekteres som Next.js. Build-kommando `npm run build`, output
   håndteres af Vercel.
3. Valgfrit: sæt `NEXT_PUBLIC_STANDARD_EJER`, hvis forsiden skal vise en anden
   ejer end `nygaardsholm`.

Siderne renderes på serveren ved forespørgsel, fordi ejeren kommer fra URL'en.
Python bruges kun til dataudtrækket lokalt – det kører ikke på Vercel.

## Datagrundlag og validering

Kilderapporten indeholder næsten ingen rigtige tabeller: indholdet er syv
EMF-billeder, to PNG-billeder og ét indlejret diagram.

- Diagrammet "lejemål pr. by" er læst direkte fra `word/charts/chart1.xml`.
- De ni billedtabeller er konverteret med LibreOffice til PDF, rasteriseret ved
  600 dpi og aflæst ind i `tools/kildedata.py`, én konstant pr. tabel.
- `tools/byg_data.py` bygger JSON-filen og kører 531 afstemninger: rækkesummer,
  kolonnetotaler, subtotaler i alle tre perioder af resultatopgørelsen, alle ti år
  i likviditetsbudgettet, GI-saldi genberegnet ud fra hensættelse pr. m², samt
  krydstjek mellem tabellerne.

`data/VALIDERING.md` er den fulde rapport: kilde pr. tabel, hver enkelt kontrol,
de godkendte rettelser og de punkter, hvor kilden modsiger sig selv eller mangler
data. Rådataene i `tools/kildedata.py` er aflæst uændret; rettelser anvendes
separat i `byg_data.py`, og hver rettet linje beholder kildens oprindelige tal i
feltet `kildeVaerdier`.

### Kendte huller i datagrundlaget

| Område | Mangler |
|---|---|
| Finansiering | Rentetype og afdrag pr. ejendom findes kun som samlede fordelinger |
| Finansiering | Asylgade 21-23 har ingen rentesats, trods 13,0 mio. kr. i gæld |
| Modernisering | Ingen dato for hvornår Skanderborg-lejemålene må §19.2-moderniseres |
| Lejerotation og tomgang | Sektionen er helt tom i kilderapporten |

## Designlinje

Hvid baggrund, én accentfarve (blå) og grøn/gul/rød udelukkende til status.
Statusfarven står aldrig alene – den følges altid af symbol og tekst, fordi gul kun
har 1,8:1 kontrast mod hvid.

Diagramfarverne er valideret mod hvid baggrund: den kategoriske palette (seks
slots) og den ordinale blå rampe består alle checks, herunder farveblindhedstest.
Tre kategoriske farver ligger under 3:1 kontrast, og derfor har hvert diagram både
synlig legende og en tabel med de præcise tal.

Hver graf har en overskrift, der er en konklusion – "Vedligehold 322 t.kr. over
budget år til dato", ikke "Vedligehold". Beløb vises i t.kr. eller mio. kr., aldrig
som rå kroner i et nøgletal.

## Senere faser

Modellen er bygget med disse for øje, men de er ikke implementeret:

- **Supabase i stedet for JSON** – ny `Datakilde`-implementering, intet andet.
- **Automatisk dataindlæsning via n8n** – skriver til samme skema.
- **AI-genereret periodekommentar** – `kommentar.periodensOverblik` har allerede
  felterne `kilde` og `genereretAf`, og komponenten skelner mellem manuel og
  automatisk tekst.
- **Login pr. ejer og delbar bank-visning** – ruterne er allerede opdelt pr. ejer.
