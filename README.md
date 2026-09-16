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

## Likviditetssimulator

`/<ejer>/simulering` svarer på ét spørgsmål: holder pengene? Tre håndtag —
rentestigning, fald i udlejningsprocent og udbytte — plus et valg om, hvorvidt
afdragsprofilen skal regnes med. Seks færdige scenarier fra "Som budgetteret"
til "Alt på én gang".

Motoren i `lib/simulering.ts` adskiller sig fra det leverede budget på to punkter:

1. **Afdragene.** Budgettet holder afdrag fast på 914 t.kr. i alle ti år, men
   afdragsprofilen siger, at andelen af gælden der afdrages stiger fra 15 % til
   100 % hen over perioden. Regnes profilen med, går bankbeholdningen fra
   +28,5 mio. kr. til omkring nul.
2. **Horisonten.** Budgettet stopper efter ti år. Simulatoren fremskriver fem
   år mere.

Renterne beregnes af den faktiske restgæld, så afdrag også sænker renten, og
rentestresset lægges kun på den rentefølsomme del af gælden.

**Alle antagelser er afledt, ikke oplyst.** De står som redigerbare felter i
brugerfladen og kan rettes, når de faktiske lånevilkår foreligger:

| Antagelse | Afledt som | Værdi |
|---|---|---|
| Afdragstakt | budgettets afdrag / den gæld der afdrages i dag | 3,93 % p.a. |
| Effektiv rente | budgettets prioritetsrenter / realkreditgælden | 2,83 % |
| Fremskrivning | budgettets egen sats | 2,0 % p.a. |
| Vedligehold efter 2033/34 | gennemsnittet af vedligeholdelsesplanens år | 1.069 t.kr./år |

Kortet "Hvornår sker der noget med gælden" udleder gældskalenderen af
afdragsprofilen. Kun 2026-trinnet er dateret i kildeteksten — resten kommer fra
cirkeldiagrammets årstal.

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
navigation og knapper udelades. App-skallen scroller indeni på skærmen, så dens
højde- og overflow-grænser slås fra i print – ellers ville kun den synlige del
komme med. Ejernavn og periode indsættes som et sidehoved, der kun vises på
papir, og hver side har datagrundlag i sidefoden.

De enkelte faner kan også printes hver for sig.

## Udgiv sitet

Projektet kan udgives to steder. Begge bygges fra den samme kode.

### GitHub Pages (statisk)

`.github/workflows/pages.yml` bygger sitet som statiske filer og udgiver dem ved
hvert push. Sitet lander på `https://<bruger>.github.io/<repo>/`.

**Engangsopsætning:** gå til repoets **Settings → Pages** og sæt **Source** til
**GitHub Actions**.

Det er vigtigt. Står kilden på "Deploy from a branch", bygger GitHub med Jekyll i
stedet. Jekyll kan ikke køre Next.js, finder ingen `index.html` i roden og viser
derfor kun README-filen – selv om alt andet er sat rigtigt op.

Bygningen sker med `npm run build:pages`, som sætter `STATISK_EKSPORT=1`. Det
tænder `output: "export"` og `trailingSlash`, så hver rute får sin egen
`index.html`. Workflowet sætter selv `NEXT_PUBLIC_BASE_PATH` til repo-navnet,
fordi et projektsite ligger på et underpath.

Alle sider forhåndsgenereres, så en ny ejer kræver et nyt build. Det sker
automatisk, når JSON-filen pushes.

### Vercel (server)

Ingen kodeændringer nødvendige – `npm run build` bygger som normalt.

1. Opret projektet på Vercel og peg det på dette repo.
2. Framework detekteres som Next.js.
3. Valgfrit: sæt `NEXT_PUBLIC_STANDARD_EJER`.

Lad `NEXT_PUBLIC_BASE_PATH` og `STATISK_EKSPORT` være usatte på Vercel; de er
kun til GitHub Pages.

Python bruges alene til dataudtrækket lokalt og kører ingen af stederne.

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

Layoutet er et roligt app-layout: fast venstremenu, topbjælke og indhold i
midten. Paletten er Jyske Banks.

| Rolle | Farve | Brug |
|---|---|---|
| Primær | `#00422E` | Aktivt menupunkt, primærknap, fremhævet tekst |
| Lime | `#A0D169` | Sparsom accent |
| Mint | `#ECFBDB` | Lyse flader, sekundær markering |
| Creme | `#FAF6F0` | Varm papirtone |

Skrifttypen er **Hanken Grotesk** – den frie erstatning for Jyske Banks egen
skrift. Store tal i vægt 700, overskrifter 600, brødtekst 400.

Den dybe Jyske-grøn bruges som blæk og primærfarve, ikke som "grøn betyder
godt". Den er både for mørk og for lav i kulørstyrke til at bære identitet i et
diagram, og den ville kollidere med statusfarverne. Status har derfor sit eget
sæt, og en statusfarve optræder aldrig uden symbol og tekst – gul har kun 1,8:1
kontrast mod hvid og kan ikke bære betydning alene.

Diagramfarverne er valideret mod hvid kortbaggrund med dataviz-validatoren:

- **Kategorisk** (identitet – lejetyper, vedligeholdskategorier):
  `#2A8F6A · #7A5BA6 · #E0722F · #3C7FB0 · #C99A1E · #C2504A`.
  Alle checks består, værste nabopar ΔE 13,2 ved deuteranopi.
- **Ordinal grøn rampe** (rangordnet data, fx renterisiko):
  `#7FBBA1 · #2A8F6A · #0B5B41`. Alle checks består.
- **Divergerende** (budgetafvigelser): grøn for bedre end budget, orange for
  dårligere.

Guld ligger under 3:1 kontrast mod hvid, så hvert diagram har både synlig
legende og en tabel med de præcise tal.

Hver graf har en overskrift, der er en konklusion – "Vedligehold 322 t.kr. over
budget år til dato", ikke "Vedligehold". Beløb vises i t.kr. eller mio. kr.,
aldrig som rå kroner i et nøgletal.

Der er ingen dark mode. Det er et bankdokument.

## Senere faser

Modellen er bygget med disse for øje, men de er ikke implementeret:

- **Supabase i stedet for JSON** – ny `Datakilde`-implementering, intet andet.
- **Automatisk dataindlæsning via n8n** – skriver til samme skema.
- **AI-genereret periodekommentar** – `kommentar.periodensOverblik` har allerede
  felterne `kilde` og `genereretAf`, og komponenten skelner mellem manuel og
  automatisk tekst.
- **Login pr. ejer og delbar bank-visning** – ruterne er allerede opdelt pr. ejer.
