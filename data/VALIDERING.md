# Validering af dataudtræk

Nygårdsholm Ejendomme · genereret automatisk af `tools/byg_data.py`

Dato: 2026-09-15

## Sådan er tallene udtrukket

**Kildefil:** `kilde/Nygårdsholm_Ejendomme_Ejendomsrapport.docx` (Nygårdsholm Ejendomme – overblik, forfatter Peter N. Andersen)

docx udpakket som zip. Brødtekst læst fra word/document.xml. Diagram 'Lejemål pr. by' læst direkte fra word/charts/chart1.xml. Øvrige tabeller er indklippede Excel-billeder (EMF/PNG) i word/media/, konverteret med LibreOffice til PDF og rasteriseret med pdftoppm ved 600 dpi.

Rådata står i `tools/kildedata.py`, én konstant pr. tabel. Alle aflæste tal er gengivet uændret; intet er beregnet under aflæsningen. `tools/byg_data.py` bygger `data/nygaardsholm.json` og afstemmer hver tabel mod sine egne totaler og mod de øvrige tabeller.

| Sektion | Kilde i .docx | Status |
|---|---|---|
| Profit &amp; Loss 26/27 | `word/media/image1.emf (rId8) – side 1` | Aflæst – alle subtotaler afstemt |
| Lejemål pr. by (m²) | `word/charts/chart1.xml (rId9) – side 1` | Læst direkte fra XML – eksakte tal |
| Lejemål pr. ejendom og lejetype | `word/media/image2.emf (rId10) – side 2` | Aflæst – alle række- og kolonnetotaler afstemt |
| Planlagt vedligehold 2026/27–2033/34 | `word/media/image3.emf (rId11) – side 3` | Aflæst – alle kolonnetotaler afstemt (se Å1 om årstal) |
| Grundejernes Investeringsfond | `word/media/image4.emf (rId12) – side 3` | Aflæst – 11 af 12 saldi genberegnet (se Å8) |
| Ejendommenes værdiansættelse | `word/media/image5.emf (rId13) – side 4` | Aflæst – alle totaler afstemt (se Å5, Å6, Å7) |
| Finansiering pr. ejendom | `word/media/image6.emf (rId14) – side 4` | Aflæst – alle totaler afstemt (se Å3, Å4, Å12) |
| Renteprofil pr. 30.04.2026 | `word/media/image7.png (rId15) – side 4` | Aflæst – summerer til 100 % og matcher brødteksten |
| Afdragsprofil pr. 30.04.2026 | `word/media/image8.png (rId16) – side 5` | Aflæst – summerer til 100 % og matcher brødteksten |
| Likviditetsbudget 2026/27–2035/36 | `word/media/image9.emf (rId17) – side 5` | Aflæst – alle 10 år gennemregnet (se Å2) |
| Lejerotation og tomgang | Sektionen er tom i kilden | **Ingen data** (se Å10) |

## Kontrolværdier fra opgavebeskrivelsen

| Kontrolværdi | Forventet | Fundet | Status |
|---|---|---|---|
| samlet ejendomsværdi ca. 253 mio. kr. | 253 | 253 | ✅ |
| lejeindtægter budget 26/27 ≈ 16.522 t.kr. | 16.522 | 16.522 | ✅ |
| EBITDA budget 26/27 ≈ 8.181 t.kr. | 8.181 | 8.181 | ✅ |
| EBITDA estimat 26/27 ≈ 7.457 t.kr. | 7.457 | 7.457 | ✅ |
| prioritetsrenter budget 26/27 ≈ 4.392 t.kr. | −4.392 | −4.392 | ✅ |
| resultat før skat budget 26/27 ≈ 3.771 t.kr. | 3.771 | 3.771 | ✅ |
| resultat før skat estimat 26/27 ≈ 3.375 t.kr. | 3.375 | 3.375 | ✅ |
| vedligehold år til dato 322 t.kr. over budget | −322 | −322 | ✅ |
| realkreditgæld ca. 155 mio. kr. | 155 | 155 | ✅ |
| belåning ca. 61 % | 61 | 61 | ✅ |

## Åbne spørgsmål og kendte uoverensstemmelser

| Nr. | Område | Type | Beskrivelse |
|---|---|---|---|
| Å1 | Vedligeholdelsesplan | ❓ Spørgsmål til DAC | Kildens kolonneoverskrifter er 2026/27, 2027/28, 2028/29, 2028/29, 2030/31, 2031/32, 2032/33, 2033/34. 2028/29 optræder to gange og 2029/30 mangler. Den fjerde kolonne (2,0 mio. kr., Dannebrogsgade skifertag) er normaliseret til 2029/30. Skal bekræftes. |
| Å2 | Ejendomsforsikringer | ❓ Spørgsmål til DAC | Resultatopgørelsen har −263 t.kr. i budget 26/27, mens likviditetsbudgettet har −63 t.kr. for 2026/27. Begge tal er gengivet som i kilden. Forskellen på 200 t.kr. forklarer hele forskellen mellem P&L-EBIT (8.181 t.kr.) og likviditetsbudgettets EBIT (8.383 t.kr.). |
| Å3 | Finansiering | 🚫 Data mangler | Lånetype og rentetype (fast / Cibor 3 / Cibor 6 / F5) findes kun som samlet fordeling i cirkeldiagrammet, ikke pr. ejendom. Felterne laanetype, rentetype, afdragsfri og refinansieringsdato står derfor som null pr. lån. |
| Å4 | Finansiering | 🚫 Data mangler | Asylgade 21-23 har ingen rentesats i kildetabellen (tom celle), selv om der er 13,0 mio. kr. i realkreditgæld. Rentesatsen mangler. |
| Å5 | Antal lejemål | ⚠️ Uoverensstemmelse i kilden | Lejemålstabellen har 255 lejemål i alt (og 12 på Blegdammen 9 / Møllestien 59), mens værdiansættelsestabellen har 256 i alt (og 13 på samme ejendom). Begge tal er gemt, hver med sin kilde. |
| Å6 | Lejeindtægter | ⚠️ Uoverensstemmelse i kilden | Lejemålstabellens samlede leje er 16.442.690 kr., mens værdiansættelsens 'Indtægter' er 16.305.790 kr. De to opgørelser er ikke identiske pr. ejendom. Dashboardet bruger lejemålstabellen til lejeanalyse og værdiansættelsen til afkast. |
| Å7 | Værdiansættelse | ⚠️ Uoverensstemmelse i kilden | Kildens afkastkolonne kan ikke genskabes som nettoleje / værdi; den ligger systematisk 0,1–0,4 procentpoint højere (i alt 4,3 % mod beregnet 4,2 %). Kildens tal er gemt som afkastPctKilde, og dashboardet beregner selv nettoafkast = nettoleje / værdi. |
| Å8 | Grundejernes Investeringsfond | ⚠️ Uoverensstemmelse i kilden | 11 af 12 §119/§120-saldi kan genberegnes som primo + hensættelse pr. m² × areal − afholdt vedligehold. Asylgade 21-23 §120 giver −320.743 kr. mod kildens −328.951 kr.; det svarer til et GI-pligtigt areal på 1.016 m² i stedet for 1.092 m². |
| Å9 | Modernisering | 🚫 Data mangler | Kilden oplyser, at Skanderborg-lejlighederne først kan §19.2-moderniseres efter 5 års ejerskab, men angiver hverken anskaffelsesdato eller frigivelsesdato. Feltet moderniseringSpaerretTil står som null. |
| Å10 | Lejerotation og tomgang | 🚫 Data mangler | Sektionen er helt tom i kildefilen. Ingen data om tomme lejemål eller fraflytninger. |
| Å11 | Resultatopgørelse | ℹ️ Afrunding | P&L er i hele t.kr. Enkelte subtotaler og afvigelseskolonner afviger 1–2 t.kr. fra den genberegnede værdi, fordi kilden runder hver linje for sig. Summen af de 12 ejendommes bogførte værdi afviger tilsvarende 1 kr. fra kildens total. Ingen af disse forskelle er større end afrundingen tillader. |
| Å12 | Finansiering | ❓ Spørgsmål til DAC | Långiverkoderne JR og RD er ikke forklaret i kilden. Forslag: JR = Jyske Realkredit, RD = Realkredit Danmark. Ikke bekræftet — vises som kode indtil videre. |

## Afstemninger

**531 kontroller i alt: 527 stemmer (inden for afrunding), 4 er kendte uoverensstemmelser i kilden, 0 er uforklarede.**

Summer af t.kr.-afrundede linjer accepteres med en tolerance på halvdelen af antallet af led, fordi hvert led i kilden kan være rundet op til 0,5 t.kr. i hver retning. Alle andre kontroller kræver eksakt overensstemmelse.

### Kendte uoverensstemmelser i kilden

| Tabel | Kontrol | Kilde | Beregnet | Difference | Ref. |
|---|---|---|---|---|---|
| GI | Asylgade 21-23: saldo 30.04.2027 §120 = primo + 108 kr/m² × 1092 m² | −328.951 | −320.743 | 8.208 | Å8 |
| Krydstjek | Antal lejemål: værdiansættelse = lejemålstabel | 256 | 255 | −1 | Å5 |
| Krydstjek | Blegdammen 9 / Møllestien 59: antal lejemål i værdiansættelse = lejemålstabel | 13 | 12 | −1 | Å5 |
| Krydstjek | Budget 26/27 'Ejendomsforsikringer': P&L (t.kr.) = likviditetsbudget | −263 | −63 | 200 | Å2 |

### Alle kontroller pr. tabel

<details><summary><strong>Lejemål</strong> – 52 kontroller (52 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Hostrupvænget 41-63: antal pr. lejetype = i alt | 57 | 57 | ✅ |
| Hostrupvænget 41-63: m² pr. lejetype = i alt | 4.395 | 4.395 | ✅ |
| Hostrupvænget 41-63: leje pr. lejetype (+kælder) = i alt | 3.125.515 | 3.125.515 | ✅ |
| Horsøvej 13: antal pr. lejetype = i alt | 5 | 5 | ✅ |
| Horsøvej 13: m² pr. lejetype = i alt | 240 | 240 | ✅ |
| Horsøvej 13: leje pr. lejetype (+kælder) = i alt | 237.105 | 237.105 | ✅ |
| Adelgade 4: antal pr. lejetype = i alt | 12 | 12 | ✅ |
| Adelgade 4: m² pr. lejetype = i alt | 1.068 | 1.068 | ✅ |
| Adelgade 4: leje pr. lejetype (+kælder) = i alt | 841.250 | 841.250 | ✅ |
| Nørre Boulevard 74 m.fl.: antal pr. lejetype = i alt | 91 | 91 | ✅ |
| Nørre Boulevard 74 m.fl.: m² pr. lejetype = i alt | 5.836 | 5.836 | ✅ |
| Nørre Boulevard 74 m.fl.: leje pr. lejetype (+kælder) = i alt | 4.394.491 | 4.394.491 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: antal pr. lejetype = i alt | 24 | 24 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: m² pr. lejetype = i alt | 1.509 | 1.509 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: leje pr. lejetype (+kælder) = i alt | 1.972.076 | 1.972.076 | ✅ |
| Teglværksgade 6: antal pr. lejetype = i alt | 12 | 12 | ✅ |
| Teglværksgade 6: m² pr. lejetype = i alt | 726 | 726 | ✅ |
| Teglværksgade 6: leje pr. lejetype (+kælder) = i alt | 1.059.883 | 1.059.883 | ✅ |
| Adelgade 64: antal pr. lejetype = i alt | 1 | 1 | ✅ |
| Adelgade 64: m² pr. lejetype = i alt | 216 | 216 | ✅ |
| Adelgade 64: leje pr. lejetype (+kælder) = i alt | 87.492 | 87.492 | ✅ |
| Vestergade 25 B-D: antal pr. lejetype = i alt | 3 | 3 | ✅ |
| Vestergade 25 B-D: m² pr. lejetype = i alt | 293 | 293 | ✅ |
| Vestergade 25 B-D: leje pr. lejetype (+kælder) = i alt | 322.001 | 322.001 | ✅ |
| Vestre Ringgade 45: antal pr. lejetype = i alt | 9 | 9 | ✅ |
| Vestre Ringgade 45: m² pr. lejetype = i alt | 557 | 557 | ✅ |
| Vestre Ringgade 45: leje pr. lejetype (+kælder) = i alt | 785.099 | 785.099 | ✅ |
| Tietgens Plads 9: antal pr. lejetype = i alt | 11 | 11 | ✅ |
| Tietgens Plads 9: m² pr. lejetype = i alt | 871 | 871 | ✅ |
| Tietgens Plads 9: leje pr. lejetype (+kælder) = i alt | 1.276.803 | 1.276.803 | ✅ |
| Blegdammen 9 / Møllestien 59: antal pr. lejetype = i alt | 12 | 12 | ✅ |
| Blegdammen 9 / Møllestien 59: m² pr. lejetype = i alt | 821 | 821 | ✅ |
| Blegdammen 9 / Møllestien 59: leje pr. lejetype (+kælder) = i alt | 1.162.136 | 1.162.136 | ✅ |
| Asylgade 21-23: antal pr. lejetype = i alt | 18 | 18 | ✅ |
| Asylgade 21-23: m² pr. lejetype = i alt | 1.092 | 1.092 | ✅ |
| Asylgade 21-23: leje pr. lejetype (+kælder) = i alt | 1.178.839 | 1.178.839 | ✅ |
| I alt-række: Omkostningsbestemt §19.1 – antal | 92 | 92 | ✅ |
| I alt-række: Omkostningsbestemt §19.1 – m2 | 5.988 | 5.988 | ✅ |
| I alt-række: Omkostningsbestemt §19.1 – leje | 4.483.373 | 4.483.373 | ✅ |
| I alt-række: Aftalt leje / fri leje §19.2 – antal | 154 | 154 | ✅ |
| I alt-række: Aftalt leje / fri leje §19.2 – m2 | 10.947 | 10.947 | ✅ |
| I alt-række: Aftalt leje / fri leje §19.2 – leje | 11.443.808 | 11.443.808 | ✅ |
| I alt-række: Små huse – antal | 4 | 4 | ✅ |
| I alt-række: Små huse – m2 | 240 | 240 | ✅ |
| I alt-række: Små huse – leje | 231.705 | 231.705 | ✅ |
| I alt-række: Erhverv – antal | 5 | 5 | ✅ |
| I alt-række: Erhverv – m2 | 449 | 449 | ✅ |
| I alt-række: Erhverv – leje | 278.317 | 278.317 | ✅ |
| I alt-række: Lejemål i alt – antal | 255 | 255 | ✅ |
| I alt-række: Lejemål i alt – m2 | 17.624 | 17.624 | ✅ |
| I alt-række: Lejemål i alt – leje | 16.442.690 | 16.442.690 | ✅ |
| Brødtekst: 255 lejemål i alt | 255 | 255 | ✅ |

</details>

<details><summary><strong>Resultatopgørelse</strong> – 132 kontroller (132 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| August/realiseretForrige: Lejeindtægter brutto = sum af underliggende | 1.293 | 1.294 | ✅ |
| August/budget: Lejeindtægter brutto = sum af underliggende | 1.390 | 1.390 | ✅ |
| August/realiseret: Lejeindtægter brutto = sum af underliggende | 1.398 | 1.397 | ✅ |
| August/realiseretForrige: Lejeindtægter = sum af underliggende | 1.263 | 1.262 | ✅ |
| August/budget: Lejeindtægter = sum af underliggende | 1.365 | 1.365 | ✅ |
| August/realiseret: Lejeindtægter = sum af underliggende | 1.359 | 1.359 | ✅ |
| August/realiseretForrige: Driftsudgifter i alt = sum af underliggende | −175 | −174 | ✅ |
| August/budget: Driftsudgifter i alt = sum af underliggende | −307 | −307 | ✅ |
| August/realiseret: Driftsudgifter i alt = sum af underliggende | −346 | −347 | ✅ |
| August/realiseretForrige: Netto leje før vedligehold = sum af underliggende | 1.088 | 1.088 | ✅ |
| August/budget: Netto leje før vedligehold = sum af underliggende | 1.058 | 1.058 | ✅ |
| August/realiseret: Netto leje før vedligehold = sum af underliggende | 1.012 | 1.013 | ✅ |
| August/realiseretForrige: Netto leje = sum af underliggende | 785 | 785 | ✅ |
| August/budget: Netto leje = sum af underliggende | 937 | 937 | ✅ |
| August/realiseret: Netto leje = sum af underliggende | 850 | 849 | ✅ |
| August/realiseretForrige: EBITDA-resultat før renter og afskr. = sum af underliggende | 775 | 775 | ✅ |
| August/budget: EBITDA-resultat før renter og afskr. = sum af underliggende | 855 | 855 | ✅ |
| August/realiseret: EBITDA-resultat før renter og afskr. = sum af underliggende | 753 | 753 | ✅ |
| August/realiseretForrige: EBIT-resultat før renter = sum af underliggende | 775 | 775 | ✅ |
| August/budget: EBIT-resultat før renter = sum af underliggende | 855 | 855 | ✅ |
| August/realiseret: EBIT-resultat før renter = sum af underliggende | 753 | 753 | ✅ |
| August/realiseretForrige: Resultat før skat = sum af underliggende | 631 | 630 | ✅ |
| August/budget: Resultat før skat = sum af underliggende | 733 | 734 | ✅ |
| August/realiseret: Resultat før skat = sum af underliggende | 637 | 637 | ✅ |
| År til dato/realiseretForrige: Lejeindtægter brutto = sum af underliggende | 5.206 | 5.204 | ✅ |
| År til dato/budget: Lejeindtægter brutto = sum af underliggende | 5.592 | 5.591 | ✅ |
| År til dato/realiseret: Lejeindtægter brutto = sum af underliggende | 5.604 | 5.603 | ✅ |
| År til dato/realiseretForrige: Lejeindtægter = sum af underliggende | 5.083 | 5.083 | ✅ |
| År til dato/budget: Lejeindtægter = sum af underliggende | 5.478 | 5.478 | ✅ |
| År til dato/realiseret: Lejeindtægter = sum af underliggende | 5.480 | 5.480 | ✅ |
| År til dato/realiseretForrige: Driftsudgifter i alt = sum af underliggende | −435 | −434 | ✅ |
| År til dato/budget: Driftsudgifter i alt = sum af underliggende | −1.025 | −1.025 | ✅ |
| År til dato/realiseret: Driftsudgifter i alt = sum af underliggende | −993 | −994 | ✅ |
| År til dato/realiseretForrige: Netto leje før vedligehold = sum af underliggende | 4.648 | 4.648 | ✅ |
| År til dato/budget: Netto leje før vedligehold = sum af underliggende | 4.453 | 4.453 | ✅ |
| År til dato/realiseret: Netto leje før vedligehold = sum af underliggende | 4.486 | 4.487 | ✅ |
| År til dato/realiseretForrige: Netto leje = sum af underliggende | 3.787 | 3.787 | ✅ |
| År til dato/budget: Netto leje = sum af underliggende | 3.915 | 3.914 | ✅ |
| År til dato/realiseret: Netto leje = sum af underliggende | 3.626 | 3.626 | ✅ |
| År til dato/realiseretForrige: EBITDA-resultat før renter og afskr. = sum af underliggende | 3.737 | 3.736 | ✅ |
| År til dato/budget: EBITDA-resultat før renter og afskr. = sum af underliggende | 3.582 | 3.582 | ✅ |
| År til dato/realiseret: EBITDA-resultat før renter og afskr. = sum af underliggende | 2.856 | 2.856 | ✅ |
| År til dato/realiseretForrige: EBIT-resultat før renter = sum af underliggende | 3.737 | 3.737 | ✅ |
| År til dato/budget: EBIT-resultat før renter = sum af underliggende | 3.582 | 3.582 | ✅ |
| År til dato/realiseret: EBIT-resultat før renter = sum af underliggende | 2.856 | 2.856 | ✅ |
| År til dato/realiseretForrige: Resultat før skat = sum af underliggende | 2.652 | 2.653 | ✅ |
| År til dato/budget: Resultat før skat = sum af underliggende | 2.359 | 2.359 | ✅ |
| År til dato/realiseret: Resultat før skat = sum af underliggende | 1.961 | 1.961 | ✅ |
| Regnskabsår/realiseretForrige: Lejeindtægter brutto = sum af underliggende | 15.803 | 15.804 | ✅ |
| Regnskabsår/budget: Lejeindtægter brutto = sum af underliggende | 16.855 | 16.856 | ✅ |
| Regnskabsår/estimat: Lejeindtægter brutto = sum af underliggende | 16.866 | 16.867 | ✅ |
| Regnskabsår/realiseretForrige: Lejeindtægter = sum af underliggende | 15.447 | 15.446 | ✅ |
| Regnskabsår/budget: Lejeindtægter = sum af underliggende | 16.522 | 16.522 | ✅ |
| Regnskabsår/estimat: Lejeindtægter = sum af underliggende | 16.524 | 16.523 | ✅ |
| Regnskabsår/realiseretForrige: Driftsudgifter i alt = sum af underliggende | −3.143 | −3.142 | ✅ |
| Regnskabsår/budget: Driftsudgifter i alt = sum af underliggende | −3.821 | −3.820 | ✅ |
| Regnskabsår/estimat: Driftsudgifter i alt = sum af underliggende | −3.789 | −3.790 | ✅ |
| Regnskabsår/realiseretForrige: Netto leje før vedligehold = sum af underliggende | 12.304 | 12.304 | ✅ |
| Regnskabsår/budget: Netto leje før vedligehold = sum af underliggende | 12.702 | 12.701 | ✅ |
| Regnskabsår/estimat: Netto leje før vedligehold = sum af underliggende | 12.735 | 12.735 | ✅ |
| Regnskabsår/realiseretForrige: Netto leje = sum af underliggende | 9.830 | 9.831 | ✅ |
| Regnskabsår/budget: Netto leje = sum af underliggende | 9.443 | 9.443 | ✅ |
| Regnskabsår/estimat: Netto leje = sum af underliggende | 9.154 | 9.154 | ✅ |
| Regnskabsår/realiseretForrige: EBITDA-resultat før renter og afskr. = sum af underliggende | 8.591 | 8.591 | ✅ |
| Regnskabsår/budget: EBITDA-resultat før renter og afskr. = sum af underliggende | 8.181 | 8.182 | ✅ |
| Regnskabsår/estimat: EBITDA-resultat før renter og afskr. = sum af underliggende | 7.457 | 7.456 | ✅ |
| Regnskabsår/realiseretForrige: EBIT-resultat før renter = sum af underliggende | 8.581 | 8.581 | ✅ |
| Regnskabsår/budget: EBIT-resultat før renter = sum af underliggende | 8.181 | 8.181 | ✅ |
| Regnskabsår/estimat: EBIT-resultat før renter = sum af underliggende | 7.457 | 7.457 | ✅ |
| Regnskabsår/realiseretForrige: Resultat før skat = sum af underliggende | 4.483 | 4.483 | ✅ |
| Regnskabsår/budget: Resultat før skat = sum af underliggende | 3.771 | 3.771 | ✅ |
| Regnskabsår/estimat: Resultat før skat = sum af underliggende | 3.375 | 3.375 | ✅ |
| August: afvigelse på 'Beboelse omkostningsbestemt' = realiseret − budget | −2 | −1 | ✅ |
| August: afvigelse på 'Beboelse aftalt leje' = realiseret − budget | 8 | 8 | ✅ |
| August: afvigelse på 'Erhverv' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Øvrige' = realiseret − budget | 1 | 0 | ✅ |
| August: afvigelse på 'Lejeindtægter brutto' = realiseret − budget | 8 | 8 | ✅ |
| August: afvigelse på 'Lejetab' = realiseret − budget | −14 | −14 | ✅ |
| August: afvigelse på 'Lejeindtægter' = realiseret − budget | −7 | −6 | ✅ |
| August: afvigelse på 'Ejendomsskatter' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Vand, vandafgift' = realiseret − budget | 1 | 1 | ✅ |
| August: afvigelse på 'Renovation' = realiseret − budget | 19 | 18 | ✅ |
| August: afvigelse på 'Ejendomsforsikringer' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Vicevært, trappevask' = realiseret − budget | −47 | −48 | ✅ |
| August: afvigelse på 'Ejendomsadministration' = realiseret − budget | −3 | −3 | ✅ |
| August: afvigelse på 'Varmeregnskab' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Øvrige driftsudgifter' = realiseret − budget | −8 | −8 | ✅ |
| August: afvigelse på 'Driftsudgifter i alt' = realiseret − budget | −39 | −39 | ✅ |
| August: afvigelse på 'Netto leje før vedligehold' = realiseret − budget | −46 | −46 | ✅ |
| August: afvigelse på 'Vedligehold' = realiseret − budget | −42 | −42 | ✅ |
| August: afvigelse på 'Planlagt vedligehold' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Netto leje' = realiseret − budget | −87 | −87 | ✅ |
| August: afvigelse på 'Reklame m.m.' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Øvrige adm omk' = realiseret − budget | −15 | −15 | ✅ |
| August: afvigelse på 'EBITDA-resultat før renter og afskr.' = realiseret − budget | −102 | −102 | ✅ |
| August: afvigelse på 'Afskrivninger' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'EBIT-resultat før renter' = realiseret − budget | −102 | −102 | ✅ |
| August: afvigelse på 'Prioritetsrenter' = realiseret − budget | 6 | 5 | ✅ |
| August: afvigelse på 'Øvrige renter m.m.' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Værdiregulering ejendom' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Tab/Gevinst ved salg af ejendom' = realiseret − budget | 0 | 0 | ✅ |
| August: afvigelse på 'Resultat før skat' = realiseret − budget | −96 | −96 | ✅ |
| År til dato: afvigelse på 'Beboelse omkostningsbestemt' = realiseret − budget | −6 | −6 | ✅ |
| År til dato: afvigelse på 'Beboelse aftalt leje' = realiseret − budget | 21 | 21 | ✅ |
| År til dato: afvigelse på 'Erhverv' = realiseret − budget | 17 | 17 | ✅ |
| År til dato: afvigelse på 'Øvrige' = realiseret − budget | −21 | −20 | ✅ |
| År til dato: afvigelse på 'Lejeindtægter brutto' = realiseret − budget | 11 | 12 | ✅ |
| År til dato: afvigelse på 'Lejetab' = realiseret − budget | −10 | −10 | ✅ |
| År til dato: afvigelse på 'Lejeindtægter' = realiseret − budget | 1 | 2 | ✅ |
| År til dato: afvigelse på 'Ejendomsskatter' = realiseret − budget | −1 | −1 | ✅ |
| År til dato: afvigelse på 'Vand, vandafgift' = realiseret − budget | 2 | 2 | ✅ |
| År til dato: afvigelse på 'Renovation' = realiseret − budget | 31 | 30 | ✅ |
| År til dato: afvigelse på 'Ejendomsforsikringer' = realiseret − budget | 0 | 0 | ✅ |
| År til dato: afvigelse på 'Vicevært, trappevask' = realiseret − budget | −6 | −6 | ✅ |
| År til dato: afvigelse på 'Ejendomsadministration' = realiseret − budget | −12 | −12 | ✅ |
| År til dato: afvigelse på 'Varmeregnskab' = realiseret − budget | 0 | 0 | ✅ |
| År til dato: afvigelse på 'Øvrige driftsudgifter' = realiseret − budget | 18 | 18 | ✅ |
| År til dato: afvigelse på 'Driftsudgifter i alt' = realiseret − budget | 32 | 32 | ✅ |
| År til dato: afvigelse på 'Netto leje før vedligehold' = realiseret − budget | 33 | 33 | ✅ |
| År til dato: afvigelse på 'Vedligehold' = realiseret − budget | −322 | −321 | ✅ |
| År til dato: afvigelse på 'Planlagt vedligehold' = realiseret − budget | 0 | 0 | ✅ |
| År til dato: afvigelse på 'Netto leje' = realiseret − budget | −289 | −289 | ✅ |
| År til dato: afvigelse på 'Reklame m.m.' = realiseret − budget | −2 | −2 | ✅ |
| År til dato: afvigelse på 'Øvrige adm omk' = realiseret − budget | −435 | −435 | ✅ |
| År til dato: afvigelse på 'EBITDA-resultat før renter og afskr.' = realiseret − budget | −725 | −726 | ✅ |
| År til dato: afvigelse på 'Afskrivninger' = realiseret − budget | 0 | 0 | ✅ |
| År til dato: afvigelse på 'EBIT-resultat før renter' = realiseret − budget | −725 | −726 | ✅ |
| År til dato: afvigelse på 'Prioritetsrenter' = realiseret − budget | 70 | 70 | ✅ |
| År til dato: afvigelse på 'Øvrige renter m.m.' = realiseret − budget | −28 | −28 | ✅ |
| År til dato: afvigelse på 'Værdiregulering ejendom' = realiseret − budget | 0 | 0 | ✅ |
| År til dato: afvigelse på 'Tab/Gevinst ved salg af ejendom' = realiseret − budget | 286 | 286 | ✅ |
| År til dato: afvigelse på 'Resultat før skat' = realiseret − budget | −398 | −398 | ✅ |

</details>

<details><summary><strong>Finansiering</strong> – 16 kontroller (16 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Hostrupvænget 41-63: gælds% = realkreditgæld / bogført værdi | 51 | 51 | ✅ |
| Horsøvej 13: gælds% = realkreditgæld / bogført værdi | 59 | 59 | ✅ |
| Adelgade 4: gælds% = realkreditgæld / bogført værdi | 54 | 54 | ✅ |
| Nørre Boulevard 74 m.fl.: gælds% = realkreditgæld / bogført værdi | 62 | 62 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: gælds% = realkreditgæld / bogført værdi | 70 | 70 | ✅ |
| Teglværksgade 6: gælds% = realkreditgæld / bogført værdi | 50 | 50 | ✅ |
| Vestergade 25 B-D: gælds% = realkreditgæld / bogført værdi | 62 | 62 | ✅ |
| Vestre Ringgade 45: gælds% = realkreditgæld / bogført værdi | 62 | 62 | ✅ |
| Tietgens Plads 9: gælds% = realkreditgæld / bogført værdi | 64 | 64 | ✅ |
| Blegdammen 9 / Møllestien 59: gælds% = realkreditgæld / bogført værdi | 64 | 64 | ✅ |
| Asylgade 21-23: gælds% = realkreditgæld / bogført værdi | 71 | 71 | ✅ |
| I alt: bogført værdi | 253.473.288 | 253.473.289 | ✅ |
| I alt: realkreditgæld | 155.013.861 | 155.013.861 | ✅ |
| I alt: kursværdi | 143.583.950 | 143.583.950 | ✅ |
| I alt: gælds% (afrundet) | 61 | 61 | ✅ |
| I alt: kursværdi% (afrundet) | 57 | 57 | ✅ |

</details>

<details><summary><strong>Renteprofil</strong> – 4 kontroller (4 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Cirkeldiagram summerer til 100 % | 100 | 100 | ✅ |
| Brødtekst: 27 % fast rente 30 år = Obl. 0,5 % + Obl. 1,0 % | 27 | 27 | ✅ |
| Brødtekst: 48 % Cibor 3/6 | 48 | 48 | ✅ |
| Brødtekst: 25 % F5 | 25 | 25 | ✅ |

</details>

<details><summary><strong>Afdragsprofil</strong> – 3 kontroller (3 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Cirkeldiagram summerer til 100 % | 100 | 100 | ✅ |
| Brødtekst: der afdrages på 15 % af realkreditten | 15 | 15 | ✅ |
| Brødtekst: ultimo 2026 øges afdragsprocenten med 17 | 17 | 17 | ✅ |

</details>

<details><summary><strong>Vedligeholdelsesplan</strong> – 8 kontroller (8 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Kolonnetotal 2026/27 (kildens '2026/27') | 1.800.000 | 1.800.000 | ✅ |
| Kolonnetotal 2027/28 (kildens '2027/28') | 1.700.000 | 1.700.000 | ✅ |
| Kolonnetotal 2028/29 (kildens '2028/29') | 1.400.000 | 1.400.000 | ✅ |
| Kolonnetotal 2029/30 (kildens '2028/29') | 2.000.000 | 2.000.000 | ✅ |
| Kolonnetotal 2030/31 (kildens '2030/31') | 800.000 | 800.000 | ✅ |
| Kolonnetotal 2031/32 (kildens '2031/32') | 500.000 | 500.000 | ✅ |
| Kolonnetotal 2032/33 (kildens '2032/33') | 200.000 | 200.000 | ✅ |
| Kolonnetotal 2033/34 (kildens '2033/34') | 150.000 | 150.000 | ✅ |

</details>

<details><summary><strong>GI</strong> – 17 kontroller (16 stemmer, 1 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Nørre Boulevard 74 m.fl.: saldo 30.04.2027 §119 = primo + 96 kr/m² × 5836 m² − vedligehold | 93.376 | 93.376 | ✅ |
| Nørre Boulevard 74 m.fl.: saldo 30.04.2027 §120 = primo + 88 kr/m² × 5836 m² | −4.464.851 | −4.464.851 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: saldo 30.04.2027 §119 = primo + 101 kr/m² × 1509 m² − vedligehold | 31.689 | 31.689 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: saldo 30.04.2027 §120 = primo + 92 kr/m² × 1509 m² | −1.900.539 | −1.900.539 | ✅ |
| Teglværksgade 6: saldo 30.04.2027 §119 = primo + 105 kr/m² × 726 m² − vedligehold | 18.150 | 18.150 | ✅ |
| Teglværksgade 6: saldo 30.04.2027 §120 = primo + 96 kr/m² × 726 m² | −1.065.355 | −1.065.355 | ✅ |
| Vestre Ringgade 45: saldo 30.04.2027 §119 = primo + 107 kr/m² × 557 m² − vedligehold | −2.112 | −2.112 | ✅ |
| Vestre Ringgade 45: saldo 30.04.2027 §120 = primo + 99 kr/m² × 557 m² | 281.009 | 281.009 | ✅ |
| Tietgens Plads 9: saldo 30.04.2027 §119 = primo + 109 kr/m² × 871 m² − vedligehold | 25.259 | 25.259 | ✅ |
| Tietgens Plads 9: saldo 30.04.2027 §120 = primo + 100 kr/m² × 871 m² | −405.071 | −405.071 | ✅ |
| Blegdammen 9 / Møllestien 59: saldo 30.04.2027 §119 = primo + 106 kr/m² × 821 m² − vedligehold | 21.346 | 21.346 | ✅ |
| Blegdammen 9 / Møllestien 59: saldo 30.04.2027 §120 = primo + 98 kr/m² × 821 m² | −2.594.392 | −2.594.392 | ✅ |
| Asylgade 21-23: saldo 30.04.2027 §119 = primo + 92 kr/m² × 1092 m² − vedligehold | 13.104 | 13.104 | ✅ |
| Asylgade 21-23: saldo 30.04.2027 §120 = primo + 108 kr/m² × 1092 m² | −328.951 | −320.743 | ⚠️ Å8 |
| I alt: årets uplanlagte vedligehold | 1.416.780 | 1.416.780 | ✅ |
| I alt: planlagt vedligehold | 1.800.000 | 1.800.000 | ✅ |
| GI planlagt vedligehold = vedligeholdelsesplanens 2026/27-total | 1.800.000 | 1.800.000 | ✅ |

</details>

<details><summary><strong>Likviditetsbudget</strong> – 225 kontroller (225 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| 2026/27: Indtægter i alt = sum af underliggende | 16.523.000 | 16.523.000 | ✅ |
| 2026/27: Driftsudgifter i alt = sum af underliggende | −6.879.000 | −6.879.000 | ✅ |
| 2026/27: Nettoleje = sum af underliggende | 9.644.000 | 9.644.000 | ✅ |
| 2026/27: EBIT = sum af underliggende | 8.383.000 | 8.383.000 | ✅ |
| 2026/27: Resultat før skat = sum af underliggende | 4.151.000 | 4.151.000 | ✅ |
| 2026/27: Skat = 22 % af resultat før skat | 913.220 | 913.220 | ✅ |
| 2026/27: Resultat efter skat = før skat − skat | 3.237.780 | 3.237.780 | ✅ |
| 2026/27: Likviditet = resultat efter skat + afdrag | 2.323.780 | 2.323.780 | ✅ |
| 2026/27: Bank ultimo = primo + årets bevægelser | 2.924.000 | 2.924.000 | ✅ |
| 2027/28: Indtægter i alt = sum af underliggende | 16.853.460 | 16.853.460 | ✅ |
| 2027/28: Driftsudgifter i alt = sum af underliggende | −6.880.580 | −6.880.580 | ✅ |
| 2027/28: Nettoleje = sum af underliggende | 9.972.880 | 9.972.880 | ✅ |
| 2027/28: EBIT = sum af underliggende | 8.686.660 | 8.686.660 | ✅ |
| 2027/28: Resultat før skat = sum af underliggende | 4.454.660 | 4.454.660 | ✅ |
| 2027/28: Skat = 22 % af resultat før skat | 980.025 | 980.025 | ✅ |
| 2027/28: Resultat efter skat = før skat − skat | 3.474.635 | 3.474.635 | ✅ |
| 2027/28: Likviditet = resultat efter skat + afdrag | 2.560.635 | 2.560.635 | ✅ |
| 2027/28: Bank ultimo = primo + årets bevægelser | 4.511.440 | 4.511.440 | ✅ |
| 2028/29: Indtægter i alt = sum af underliggende | 17.190.529 | 17.190.530 | ✅ |
| 2028/29: Driftsudgifter i alt = sum af underliggende | −6.684.192 | −6.684.191 | ✅ |
| 2028/29: Nettoleje = sum af underliggende | 10.506.338 | 10.506.337 | ✅ |
| 2028/29: EBIT = sum af underliggende | 9.194.393 | 9.194.394 | ✅ |
| 2028/29: Resultat før skat = sum af underliggende | 4.962.393 | 4.962.393 | ✅ |
| 2028/29: Skat = 22 % af resultat før skat | 1.091.727 | 1.091.726 | ✅ |
| 2028/29: Resultat efter skat = før skat − skat | 3.870.667 | 3.870.666 | ✅ |
| 2028/29: Likviditet = resultat efter skat + afdrag | 2.956.667 | 2.956.667 | ✅ |
| 2028/29: Bank ultimo = primo + årets bevægelser | 6.539.808 | 6.539.808 | ✅ |
| 2029/30: Indtægter i alt = sum af underliggende | 17.534.340 | 17.534.339 | ✅ |
| 2029/30: Driftsudgifter i alt = sum af underliggende | −7.389.875 | −7.389.875 | ✅ |
| 2029/30: Nettoleje = sum af underliggende | 10.144.464 | 10.144.465 | ✅ |
| 2029/30: EBIT = sum af underliggende | 8.806.281 | 8.806.281 | ✅ |
| 2029/30: Resultat før skat = sum af underliggende | 4.574.281 | 4.574.281 | ✅ |
| 2029/30: Skat = 22 % af resultat før skat | 1.006.342 | 1.006.342 | ✅ |
| 2029/30: Resultat efter skat = før skat − skat | 3.567.939 | 3.567.939 | ✅ |
| 2029/30: Likviditet = resultat efter skat + afdrag | 2.653.939 | 2.653.939 | ✅ |
| 2029/30: Bank ultimo = primo + årets bevægelser | 8.068.363 | 8.068.362 | ✅ |
| 2030/31: Indtægter i alt = sum af underliggende | 17.885.027 | 17.885.027 | ✅ |
| 2030/31: Driftsudgifter i alt = sum af underliggende | −6.297.673 | −6.297.673 | ✅ |
| 2030/31: Nettoleje = sum af underliggende | 11.587.354 | 11.587.354 | ✅ |
| 2030/31: EBIT = sum af underliggende | 10.222.407 | 10.222.407 | ✅ |
| 2030/31: Resultat før skat = sum af underliggende | 5.990.407 | 5.990.407 | ✅ |
| 2030/31: Skat = 22 % af resultat før skat | 1.317.889 | 1.317.890 | ✅ |
| 2030/31: Resultat efter skat = før skat − skat | 4.672.517 | 4.672.518 | ✅ |
| 2030/31: Likviditet = resultat efter skat + afdrag | 3.758.517 | 3.758.517 | ✅ |
| 2030/31: Bank ultimo = primo + årets bevægelser | 11.098.427 | 11.098.428 | ✅ |
| 2031/32: Indtægter i alt = sum af underliggende | 18.242.727 | 18.242.727 | ✅ |
| 2031/32: Driftsudgifter i alt = sum af underliggende | −6.107.626 | −6.107.626 | ✅ |
| 2031/32: Nettoleje = sum af underliggende | 12.135.101 | 12.135.101 | ✅ |
| 2031/32: EBIT = sum af underliggende | 10.742.855 | 10.742.855 | ✅ |
| 2031/32: Resultat før skat = sum af underliggende | 6.510.855 | 6.510.855 | ✅ |
| 2031/32: Skat = 22 % af resultat før skat | 1.432.388 | 1.432.388 | ✅ |
| 2031/32: Resultat efter skat = før skat − skat | 5.078.467 | 5.078.467 | ✅ |
| 2031/32: Likviditet = resultat efter skat + afdrag | 4.164.467 | 4.164.467 | ✅ |
| 2031/32: Bank ultimo = primo + årets bevægelser | 14.337.393 | 14.337.393 | ✅ |
| 2032/33: Indtægter i alt = sum af underliggende | 18.607.582 | 18.607.582 | ✅ |
| 2032/33: Driftsudgifter i alt = sum af underliggende | −5.919.779 | −5.919.778 | ✅ |
| 2032/33: Nettoleje = sum af underliggende | 12.687.803 | 12.687.803 | ✅ |
| 2032/33: EBIT = sum af underliggende | 11.267.712 | 11.267.712 | ✅ |
| 2032/33: Resultat før skat = sum af underliggende | 7.035.712 | 7.035.712 | ✅ |
| 2032/33: Skat = 22 % af resultat før skat | 1.547.857 | 1.547.857 | ✅ |
| 2032/33: Resultat efter skat = før skat − skat | 5.487.855 | 5.487.855 | ✅ |
| 2032/33: Likviditet = resultat efter skat + afdrag | 4.573.855 | 4.573.855 | ✅ |
| 2032/33: Bank ultimo = primo + årets bevægelser | 17.986.717 | 17.986.717 | ✅ |
| 2033/34: Indtægter i alt = sum af underliggende | 18.979.733 | 18.979.734 | ✅ |
| 2033/34: Driftsudgifter i alt = sum af underliggende | −5.984.175 | −5.984.174 | ✅ |
| 2033/34: Nettoleje = sum af underliggende | 12.995.559 | 12.995.558 | ✅ |
| 2033/34: EBIT = sum af underliggende | 11.547.066 | 11.547.066 | ✅ |
| 2033/34: Resultat før skat = sum af underliggende | 7.315.066 | 7.315.066 | ✅ |
| 2033/34: Skat = 22 % af resultat før skat | 1.609.315 | 1.609.315 | ✅ |
| 2033/34: Resultat efter skat = før skat − skat | 5.705.752 | 5.705.751 | ✅ |
| 2033/34: Likviditet = resultat efter skat + afdrag | 4.791.752 | 4.791.752 | ✅ |
| 2033/34: Bank ultimo = primo + årets bevægelser | 21.799.926 | 21.799.927 | ✅ |
| 2034/35: Indtægter i alt = sum af underliggende | 19.359.328 | 19.359.327 | ✅ |
| 2034/35: Driftsudgifter i alt = sum af underliggende | −5.950.858 | −5.950.860 | ✅ |
| 2034/35: Nettoleje = sum af underliggende | 13.408.470 | 13.408.470 | ✅ |
| 2034/35: EBIT = sum af underliggende | 11.931.007 | 11.931.008 | ✅ |
| 2034/35: Resultat før skat = sum af underliggende | 7.699.007 | 7.699.007 | ✅ |
| 2034/35: Skat = 22 % af resultat før skat | 1.693.782 | 1.693.782 | ✅ |
| 2034/35: Resultat efter skat = før skat − skat | 6.005.226 | 6.005.225 | ✅ |
| 2034/35: Likviditet = resultat efter skat + afdrag | 5.091.226 | 5.091.226 | ✅ |
| 2034/35: Bank ultimo = primo + årets bevægelser | 25.935.619 | 25.935.619 | ✅ |
| 2035/36: Indtægter i alt = sum af underliggende | 19.746.515 | 19.746.515 | ✅ |
| 2035/36: Driftsudgifter i alt = sum af underliggende | −6.069.875 | −6.069.876 | ✅ |
| 2035/36: Nettoleje = sum af underliggende | 13.676.639 | 13.676.640 | ✅ |
| 2035/36: EBIT = sum af underliggende | 12.169.628 | 12.169.627 | ✅ |
| 2035/36: Resultat før skat = sum af underliggende | 7.937.628 | 7.937.628 | ✅ |
| 2035/36: Skat = 22 % af resultat før skat | 1.746.278 | 1.746.278 | ✅ |
| 2035/36: Resultat efter skat = før skat − skat | 6.191.350 | 6.191.350 | ✅ |
| 2035/36: Likviditet = resultat efter skat + afdrag | 5.277.350 | 5.277.350 | ✅ |
| 2035/36: Bank ultimo = primo + årets bevægelser | 30.225.465 | 30.225.465 | ✅ |
| Bank primo 2027/28 = bank ultimo 2026/27 | 2.924.000 | 2.924.000 | ✅ |
| Bank primo 2028/29 = bank ultimo 2027/28 | 4.511.440 | 4.511.440 | ✅ |
| Bank primo 2029/30 = bank ultimo 2028/29 | 6.539.808 | 6.539.808 | ✅ |
| Bank primo 2030/31 = bank ultimo 2029/30 | 8.068.363 | 8.068.363 | ✅ |
| Bank primo 2031/32 = bank ultimo 2030/31 | 11.098.427 | 11.098.427 | ✅ |
| Bank primo 2032/33 = bank ultimo 2031/32 | 14.337.393 | 14.337.393 | ✅ |
| Bank primo 2033/34 = bank ultimo 2032/33 | 17.986.717 | 17.986.717 | ✅ |
| Bank primo 2034/35 = bank ultimo 2033/34 | 21.799.926 | 21.799.926 | ✅ |
| Bank primo 2035/36 = bank ultimo 2034/35 | 25.935.619 | 25.935.619 | ✅ |
| Beboelse omkostningsbestemt 2027/28 = 2026/27 × 1,02 | 4.670.580 | 4.670.580 | ✅ |
| Beboelse omkostningsbestemt 2028/29 = 2027/28 × 1,02 | 4.763.992 | 4.763.992 | ✅ |
| Beboelse omkostningsbestemt 2029/30 = 2028/29 × 1,02 | 4.859.271 | 4.859.272 | ✅ |
| Beboelse omkostningsbestemt 2030/31 = 2029/30 × 1,02 | 4.956.457 | 4.956.456 | ✅ |
| Beboelse omkostningsbestemt 2031/32 = 2030/31 × 1,02 | 5.055.586 | 5.055.586 | ✅ |
| Beboelse omkostningsbestemt 2032/33 = 2031/32 × 1,02 | 5.156.698 | 5.156.698 | ✅ |
| Beboelse omkostningsbestemt 2033/34 = 2032/33 × 1,02 | 5.259.832 | 5.259.832 | ✅ |
| Beboelse omkostningsbestemt 2034/35 = 2033/34 × 1,02 | 5.365.028 | 5.365.029 | ✅ |
| Beboelse omkostningsbestemt 2035/36 = 2034/35 × 1,02 | 5.472.329 | 5.472.329 | ✅ |
| Beboelse aftalt leje 2027/28 = 2026/27 × 1,02 | 12.050.280 | 12.050.280 | ✅ |
| Beboelse aftalt leje 2028/29 = 2027/28 × 1,02 | 12.291.286 | 12.291.286 | ✅ |
| Beboelse aftalt leje 2029/30 = 2028/29 × 1,02 | 12.537.111 | 12.537.112 | ✅ |
| Beboelse aftalt leje 2030/31 = 2029/30 × 1,02 | 12.787.854 | 12.787.853 | ✅ |
| Beboelse aftalt leje 2031/32 = 2030/31 × 1,02 | 13.043.611 | 13.043.611 | ✅ |
| Beboelse aftalt leje 2032/33 = 2031/32 × 1,02 | 13.304.483 | 13.304.483 | ✅ |
| Beboelse aftalt leje 2033/34 = 2032/33 × 1,02 | 13.570.572 | 13.570.573 | ✅ |
| Beboelse aftalt leje 2034/35 = 2033/34 × 1,02 | 13.841.984 | 13.841.983 | ✅ |
| Beboelse aftalt leje 2035/36 = 2034/35 × 1,02 | 14.118.824 | 14.118.824 | ✅ |
| Erhverv 2027/28 = 2026/27 × 1,02 | 230.520 | 230.520 | ✅ |
| Erhverv 2028/29 = 2027/28 × 1,02 | 235.130 | 235.130 | ✅ |
| Erhverv 2029/30 = 2028/29 × 1,02 | 239.833 | 239.833 | ✅ |
| Erhverv 2030/31 = 2029/30 × 1,02 | 244.630 | 244.630 | ✅ |
| Erhverv 2031/32 = 2030/31 × 1,02 | 249.522 | 249.523 | ✅ |
| Erhverv 2032/33 = 2031/32 × 1,02 | 254.513 | 254.512 | ✅ |
| Erhverv 2033/34 = 2032/33 × 1,02 | 259.603 | 259.603 | ✅ |
| Erhverv 2034/35 = 2033/34 × 1,02 | 264.795 | 264.795 | ✅ |
| Erhverv 2035/36 = 2034/35 × 1,02 | 270.091 | 270.091 | ✅ |
| Øvrige 2027/28 = 2026/27 × 1,02 | 241.740 | 241.740 | ✅ |
| Øvrige 2028/29 = 2027/28 × 1,02 | 246.575 | 246.575 | ✅ |
| Øvrige 2029/30 = 2028/29 × 1,02 | 251.506 | 251.506 | ✅ |
| Øvrige 2030/31 = 2029/30 × 1,02 | 256.536 | 256.536 | ✅ |
| Øvrige 2031/32 = 2030/31 × 1,02 | 261.667 | 261.667 | ✅ |
| Øvrige 2032/33 = 2031/32 × 1,02 | 266.900 | 266.900 | ✅ |
| Øvrige 2033/34 = 2032/33 × 1,02 | 272.239 | 272.238 | ✅ |
| Øvrige 2034/35 = 2033/34 × 1,02 | 277.683 | 277.684 | ✅ |
| Øvrige 2035/36 = 2034/35 × 1,02 | 283.237 | 283.237 | ✅ |
| Lejetab 2027/28 = 2026/27 × 1,02 | −339.660 | −339.660 | ✅ |
| Lejetab 2028/29 = 2027/28 × 1,02 | −346.453 | −346.453 | ✅ |
| Lejetab 2029/30 = 2028/29 × 1,02 | −353.382 | −353.382 | ✅ |
| Lejetab 2030/31 = 2029/30 × 1,02 | −360.450 | −360.450 | ✅ |
| Lejetab 2031/32 = 2030/31 × 1,02 | −367.659 | −367.659 | ✅ |
| Lejetab 2032/33 = 2031/32 × 1,02 | −375.012 | −375.012 | ✅ |
| Lejetab 2033/34 = 2032/33 × 1,02 | −382.512 | −382.512 | ✅ |
| Lejetab 2034/35 = 2033/34 × 1,02 | −390.163 | −390.162 | ✅ |
| Lejetab 2035/36 = 2034/35 × 1,02 | −397.966 | −397.966 | ✅ |
| Ejendomsskatter 2027/28 = 2026/27 × 1,02 | −384.540 | −384.540 | ✅ |
| Ejendomsskatter 2028/29 = 2027/28 × 1,02 | −392.231 | −392.231 | ✅ |
| Ejendomsskatter 2029/30 = 2028/29 × 1,02 | −400.075 | −400.076 | ✅ |
| Ejendomsskatter 2030/31 = 2029/30 × 1,02 | −408.077 | −408.076 | ✅ |
| Ejendomsskatter 2031/32 = 2030/31 × 1,02 | −416.238 | −416.239 | ✅ |
| Ejendomsskatter 2032/33 = 2031/32 × 1,02 | −424.563 | −424.563 | ✅ |
| Ejendomsskatter 2033/34 = 2032/33 × 1,02 | −433.054 | −433.054 | ✅ |
| Ejendomsskatter 2034/35 = 2033/34 × 1,02 | −441.716 | −441.715 | ✅ |
| Ejendomsskatter 2035/36 = 2034/35 × 1,02 | −450.550 | −450.550 | ✅ |
| Vand, vandafgift 2027/28 = 2026/27 × 1,02 | −6.120 | −6.120 | ✅ |
| Vand, vandafgift 2028/29 = 2027/28 × 1,02 | −6.242 | −6.242 | ✅ |
| Vand, vandafgift 2029/30 = 2028/29 × 1,02 | −6.367 | −6.367 | ✅ |
| Vand, vandafgift 2030/31 = 2029/30 × 1,02 | −6.495 | −6.494 | ✅ |
| Vand, vandafgift 2031/32 = 2030/31 × 1,02 | −6.624 | −6.625 | ✅ |
| Vand, vandafgift 2032/33 = 2031/32 × 1,02 | −6.757 | −6.756 | ✅ |
| Vand, vandafgift 2033/34 = 2032/33 × 1,02 | −6.892 | −6.892 | ✅ |
| Vand, vandafgift 2034/35 = 2033/34 × 1,02 | −7.030 | −7.030 | ✅ |
| Vand, vandafgift 2035/36 = 2034/35 × 1,02 | −7.171 | −7.171 | ✅ |
| Renovation 2027/28 = 2026/27 × 1,02 | −689.520 | −689.520 | ✅ |
| Renovation 2028/29 = 2027/28 × 1,02 | −703.310 | −703.310 | ✅ |
| Renovation 2029/30 = 2028/29 × 1,02 | −717.377 | −717.376 | ✅ |
| Renovation 2030/31 = 2029/30 × 1,02 | −731.724 | −731.725 | ✅ |
| Renovation 2031/32 = 2030/31 × 1,02 | −746.359 | −746.358 | ✅ |
| Renovation 2032/33 = 2031/32 × 1,02 | −761.286 | −761.286 | ✅ |
| Renovation 2033/34 = 2032/33 × 1,02 | −776.512 | −776.512 | ✅ |
| Renovation 2034/35 = 2033/34 × 1,02 | −792.042 | −792.042 | ✅ |
| Renovation 2035/36 = 2034/35 × 1,02 | −807.883 | −807.883 | ✅ |
| Ejendomsforsikringer 2027/28 = 2026/27 × 1,02 | −64.260 | −64.260 | ✅ |
| Ejendomsforsikringer 2028/29 = 2027/28 × 1,02 | −65.545 | −65.545 | ✅ |
| Ejendomsforsikringer 2029/30 = 2028/29 × 1,02 | −66.856 | −66.856 | ✅ |
| Ejendomsforsikringer 2030/31 = 2029/30 × 1,02 | −68.193 | −68.193 | ✅ |
| Ejendomsforsikringer 2031/32 = 2030/31 × 1,02 | −69.557 | −69.557 | ✅ |
| Ejendomsforsikringer 2032/33 = 2031/32 × 1,02 | −70.948 | −70.948 | ✅ |
| Ejendomsforsikringer 2033/34 = 2032/33 × 1,02 | −72.367 | −72.367 | ✅ |
| Ejendomsforsikringer 2034/35 = 2033/34 × 1,02 | −73.815 | −73.814 | ✅ |
| Ejendomsforsikringer 2035/36 = 2034/35 × 1,02 | −75.291 | −75.291 | ✅ |
| Vicevært, trappevask 2027/28 = 2026/27 × 1,02 | −1.645.260 | −1.645.260 | ✅ |
| Vicevært, trappevask 2028/29 = 2027/28 × 1,02 | −1.678.165 | −1.678.165 | ✅ |
| Vicevært, trappevask 2029/30 = 2028/29 × 1,02 | −1.711.729 | −1.711.728 | ✅ |
| Vicevært, trappevask 2030/31 = 2029/30 × 1,02 | −1.745.963 | −1.745.964 | ✅ |
| Vicevært, trappevask 2031/32 = 2030/31 × 1,02 | −1.780.882 | −1.780.882 | ✅ |
| Vicevært, trappevask 2032/33 = 2031/32 × 1,02 | −1.816.500 | −1.816.500 | ✅ |
| Vicevært, trappevask 2033/34 = 2032/33 × 1,02 | −1.852.830 | −1.852.830 | ✅ |
| Vicevært, trappevask 2034/35 = 2033/34 × 1,02 | −1.889.887 | −1.889.887 | ✅ |
| Vicevært, trappevask 2035/36 = 2034/35 × 1,02 | −1.927.684 | −1.927.685 | ✅ |
| Ejendomsadministration 2027/28 = 2026/27 × 1,02 | −146.880 | −146.880 | ✅ |
| Ejendomsadministration 2028/29 = 2027/28 × 1,02 | −149.818 | −149.818 | ✅ |
| Ejendomsadministration 2029/30 = 2028/29 × 1,02 | −152.814 | −152.814 | ✅ |
| Ejendomsadministration 2030/31 = 2029/30 × 1,02 | −155.870 | −155.870 | ✅ |
| Ejendomsadministration 2031/32 = 2030/31 × 1,02 | −158.988 | −158.987 | ✅ |
| Ejendomsadministration 2032/33 = 2031/32 × 1,02 | −162.167 | −162.168 | ✅ |
| Ejendomsadministration 2033/34 = 2032/33 × 1,02 | −165.411 | −165.410 | ✅ |
| Ejendomsadministration 2034/35 = 2033/34 × 1,02 | −168.719 | −168.719 | ✅ |
| Ejendomsadministration 2035/36 = 2034/35 × 1,02 | −172.093 | −172.093 | ✅ |
| Øvrige driftsudgifter 2027/28 = 2026/27 × 1,02 | −755.820 | −755.820 | ✅ |
| Øvrige driftsudgifter 2028/29 = 2027/28 × 1,02 | −770.936 | −770.936 | ✅ |
| Øvrige driftsudgifter 2029/30 = 2028/29 × 1,02 | −786.355 | −786.355 | ✅ |
| Øvrige driftsudgifter 2030/31 = 2029/30 × 1,02 | −802.082 | −802.082 | ✅ |
| Øvrige driftsudgifter 2031/32 = 2030/31 × 1,02 | −818.124 | −818.124 | ✅ |
| Øvrige driftsudgifter 2032/33 = 2031/32 × 1,02 | −834.486 | −834.486 | ✅ |
| Øvrige driftsudgifter 2033/34 = 2032/33 × 1,02 | −851.176 | −851.176 | ✅ |
| Øvrige driftsudgifter 2034/35 = 2033/34 × 1,02 | −868.200 | −868.200 | ✅ |
| Øvrige driftsudgifter 2035/36 = 2034/35 × 1,02 | −885.564 | −885.564 | ✅ |
| Uplanlagt vedligehold 2027/28 = 2026/27 × 1,02 | −1.488.180 | −1.488.180 | ✅ |
| Uplanlagt vedligehold 2028/29 = 2027/28 × 1,02 | −1.517.944 | −1.517.944 | ✅ |
| Uplanlagt vedligehold 2029/30 = 2028/29 × 1,02 | −1.548.302 | −1.548.303 | ✅ |
| Uplanlagt vedligehold 2030/31 = 2029/30 × 1,02 | −1.579.269 | −1.579.268 | ✅ |
| Uplanlagt vedligehold 2031/32 = 2030/31 × 1,02 | −1.610.854 | −1.610.854 | ✅ |
| Uplanlagt vedligehold 2032/33 = 2031/32 × 1,02 | −1.643.071 | −1.643.071 | ✅ |
| Uplanlagt vedligehold 2033/34 = 2032/33 × 1,02 | −1.675.932 | −1.675.932 | ✅ |
| Uplanlagt vedligehold 2034/35 = 2033/34 × 1,02 | −1.709.451 | −1.709.451 | ✅ |
| Uplanlagt vedligehold 2035/36 = 2034/35 × 1,02 | −1.743.640 | −1.743.640 | ✅ |
| Øvrige adm. omkostninger 2027/28 = 2026/27 × 1,02 | −1.286.220 | −1.286.220 | ✅ |
| Øvrige adm. omkostninger 2028/29 = 2027/28 × 1,02 | −1.311.944 | −1.311.944 | ✅ |
| Øvrige adm. omkostninger 2029/30 = 2028/29 × 1,02 | −1.338.183 | −1.338.183 | ✅ |
| Øvrige adm. omkostninger 2030/31 = 2029/30 × 1,02 | −1.364.947 | −1.364.947 | ✅ |
| Øvrige adm. omkostninger 2031/32 = 2030/31 × 1,02 | −1.392.246 | −1.392.246 | ✅ |
| Øvrige adm. omkostninger 2032/33 = 2031/32 × 1,02 | −1.420.091 | −1.420.091 | ✅ |
| Øvrige adm. omkostninger 2033/34 = 2032/33 × 1,02 | −1.448.493 | −1.448.493 | ✅ |
| Øvrige adm. omkostninger 2034/35 = 2033/34 × 1,02 | −1.477.462 | −1.477.463 | ✅ |
| Øvrige adm. omkostninger 2035/36 = 2034/35 × 1,02 | −1.507.012 | −1.507.011 | ✅ |

</details>

<details><summary><strong>Lejemål pr. by</strong> – 5 kontroller (5 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Diagram m² for Hobro = sum af ejendomme i lejemålstabellen | 4.635 | 4.635 | ✅ |
| Diagram m² for Randers = sum af ejendomme i lejemålstabellen | 6.904 | 6.904 | ✅ |
| Diagram m² for Århus = sum af ejendomme i lejemålstabellen | 4.484 | 4.484 | ✅ |
| Diagram m² for Skanderborg = sum af ejendomme i lejemålstabellen | 1.601 | 1.601 | ✅ |
| Diagram m² i alt = lejemålstabellens i alt | 17.624 | 17.624 | ✅ |

</details>

<details><summary><strong>Værdiansættelse</strong> – 21 kontroller (21 stemmer, 0 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| I alt-række: antalLejemaal | 256 | 256 | ✅ |
| I alt-række: indtaegter | 16.305.790 | 16.305.790 | ✅ |
| I alt-række: nettoleje | 10.717.319 | 10.717.319 | ✅ |
| I alt-række: vaerdi | 253.473.288 | 253.473.289 | ✅ |
| I alt-række: areal bolig | 17.175 | 17.175 | ✅ |
| I alt-række: areal erhverv | 449 | 449 | ✅ |
| I alt-række: areal ialt | 17.624 | 17.624 | ✅ |
| Hostrupvænget 41-63: værdi pr. m² = værdi / areal | 7.109 | 7.109 | ✅ |
| Horsøvej 13: værdi pr. m² = værdi / areal | 9.172 | 9.172 | ✅ |
| Adelgade 4: værdi pr. m² = værdi / areal | 10.770 | 10.770 | ✅ |
| Nørre Boulevard 74 m.fl.: værdi pr. m² = værdi / areal | 9.764 | 9.764 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: værdi pr. m² = værdi / areal | 24.904 | 24.904 | ✅ |
| Teglværksgade 6: værdi pr. m² = værdi / areal | 31.544 | 31.544 | ✅ |
| Adelgade 64: værdi pr. m² = værdi / areal | 3.310 | 3.310 | ✅ |
| Vestergade 25 B-D: værdi pr. m² = værdi / areal | 17.033 | 17.033 | ✅ |
| Vestre Ringgade 45: værdi pr. m² = værdi / areal | 26.460 | 26.460 | ✅ |
| Tietgens Plads 9: værdi pr. m² = værdi / areal | 32.971 | 32.971 | ✅ |
| Blegdammen 9 / Møllestien 59: værdi pr. m² = værdi / areal | 28.805 | 28.805 | ✅ |
| Asylgade 21-23: værdi pr. m² = værdi / areal | 16.712 | 16.712 | ✅ |
| I alt: værdi pr. m² = samlet værdi / samlet areal | 14.382 | 14.382 | ✅ |
| Kontrolværdi fra opgaven: samlet ejendomsværdi ca. 253 mio. kr. | 253 | 253 | ✅ |

</details>

<details><summary><strong>Krydstjek</strong> – 48 kontroller (45 stemmer, 3 kendt afvigelse, 0 uforklaret)</summary>

| Kontrol | Kilde | Beregnet | Status |
|---|---|---|---|
| Areal i alt: værdiansættelse = lejemålstabel | 17.624 | 17.624 | ✅ |
| Antal lejemål: værdiansættelse = lejemålstabel | 256 | 255 | ⚠️ Å5 |
| Hostrupvænget 41-63: antal lejemål i værdiansættelse = lejemålstabel | 57 | 57 | ✅ |
| Horsøvej 13: antal lejemål i værdiansættelse = lejemålstabel | 5 | 5 | ✅ |
| Adelgade 4: antal lejemål i værdiansættelse = lejemålstabel | 12 | 12 | ✅ |
| Nørre Boulevard 74 m.fl.: antal lejemål i værdiansættelse = lejemålstabel | 91 | 91 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: antal lejemål i værdiansættelse = lejemålstabel | 24 | 24 | ✅ |
| Teglværksgade 6: antal lejemål i værdiansættelse = lejemålstabel | 12 | 12 | ✅ |
| Adelgade 64: antal lejemål i værdiansættelse = lejemålstabel | 1 | 1 | ✅ |
| Vestergade 25 B-D: antal lejemål i værdiansættelse = lejemålstabel | 3 | 3 | ✅ |
| Vestre Ringgade 45: antal lejemål i værdiansættelse = lejemålstabel | 9 | 9 | ✅ |
| Tietgens Plads 9: antal lejemål i værdiansættelse = lejemålstabel | 11 | 11 | ✅ |
| Blegdammen 9 / Møllestien 59: antal lejemål i værdiansættelse = lejemålstabel | 13 | 12 | ⚠️ Å5 |
| Asylgade 21-23: antal lejemål i værdiansættelse = lejemålstabel | 18 | 18 | ✅ |
| Hostrupvænget 41-63: bogført værdi (finansiering) = værdi (værdiansættelse) | 31.246.146 | 31.246.146 | ✅ |
| Horsøvej 13: bogført værdi (finansiering) = værdi (værdiansættelse) | 2.201.176 | 2.201.176 | ✅ |
| Adelgade 4: bogført værdi (finansiering) = værdi (værdiansættelse) | 11.501.978 | 11.501.978 | ✅ |
| Nørre Boulevard 74 m.fl.: bogført værdi (finansiering) = værdi (værdiansættelse) | 56.982.619 | 56.982.619 | ✅ |
| Dannebrogsgade 12 A-B / Lundingsgade 20: bogført værdi (finansiering) = værdi (værdiansættelse) | 37.579.518 | 37.579.518 | ✅ |
| Teglværksgade 6: bogført værdi (finansiering) = værdi (værdiansættelse) | 22.901.246 | 22.901.246 | ✅ |
| Adelgade 64: bogført værdi (finansiering) = værdi (værdiansættelse) | 714.906 | 714.906 | ✅ |
| Vestergade 25 B-D: bogført værdi (finansiering) = værdi (værdiansættelse) | 4.990.791 | 4.990.791 | ✅ |
| Vestre Ringgade 45: bogført værdi (finansiering) = værdi (værdiansættelse) | 14.738.049 | 14.738.049 | ✅ |
| Tietgens Plads 9: bogført værdi (finansiering) = værdi (værdiansættelse) | 28.718.018 | 28.718.018 | ✅ |
| Blegdammen 9 / Møllestien 59: bogført værdi (finansiering) = værdi (værdiansættelse) | 23.648.842 | 23.648.842 | ✅ |
| Asylgade 21-23: bogført værdi (finansiering) = værdi (værdiansættelse) | 18.250.000 | 18.250.000 | ✅ |
| Budget 26/27 'Beboelse omkostningsbestemt': P&L (t.kr.) = likviditetsbudget | 4.579 | 4.579 | ✅ |
| Budget 26/27 'Beboelse aftalt leje': P&L (t.kr.) = likviditetsbudget | 11.814 | 11.814 | ✅ |
| Budget 26/27 'Erhverv': P&L (t.kr.) = likviditetsbudget | 226 | 226 | ✅ |
| Budget 26/27 'Øvrige': P&L (t.kr.) = likviditetsbudget | 237 | 237 | ✅ |
| Budget 26/27 'Lejetab': P&L (t.kr.) = likviditetsbudget | −333 | −333 | ✅ |
| Budget 26/27 'Ejendomsskatter': P&L (t.kr.) = likviditetsbudget | −377 | −377 | ✅ |
| Budget 26/27 'Vand, vandafgift': P&L (t.kr.) = likviditetsbudget | −6 | −6 | ✅ |
| Budget 26/27 'Renovation': P&L (t.kr.) = likviditetsbudget | −676 | −676 | ✅ |
| Budget 26/27 'Ejendomsforsikringer': P&L (t.kr.) = likviditetsbudget | −263 | −63 | ⚠️ Å2 |
| Budget 26/27 'Vicevært, trappevask': P&L (t.kr.) = likviditetsbudget | −1.613 | −1.613 | ✅ |
| Budget 26/27 'Ejendomsadministration': P&L (t.kr.) = likviditetsbudget | −144 | −144 | ✅ |
| Budget 26/27 'Øvrige driftsudgifter': P&L (t.kr.) = likviditetsbudget | −741 | −741 | ✅ |
| Budget 26/27 'Prioritetsrenter': P&L (t.kr.) = likviditetsbudget | −4.392 | −4.392 | ✅ |
| Kontrolværdi fra opgaven: lejeindtægter budget 26/27 ≈ 16.522 t.kr. | 16.522 | 16.522 | ✅ |
| Kontrolværdi fra opgaven: EBITDA budget 26/27 ≈ 8.181 t.kr. | 8.181 | 8.181 | ✅ |
| Kontrolværdi fra opgaven: EBITDA estimat 26/27 ≈ 7.457 t.kr. | 7.457 | 7.457 | ✅ |
| Kontrolværdi fra opgaven: prioritetsrenter budget 26/27 ≈ 4.392 t.kr. | −4.392 | −4.392 | ✅ |
| Kontrolværdi fra opgaven: resultat før skat budget 26/27 ≈ 3.771 t.kr. | 3.771 | 3.771 | ✅ |
| Kontrolværdi fra opgaven: resultat før skat estimat 26/27 ≈ 3.375 t.kr. | 3.375 | 3.375 | ✅ |
| Kontrolværdi fra opgaven: vedligehold år til dato 322 t.kr. over budget | −322 | −322 | ✅ |
| Kontrolværdi fra opgaven: realkreditgæld ca. 155 mio. kr. | 155 | 155 | ✅ |
| Kontrolværdi fra opgaven: belåning ca. 61 % | 61 | 61 | ✅ |

</details>
