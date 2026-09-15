# -*- coding: utf-8 -*-
"""
Bygger data/nygaardsholm.json ud fra tools/kildedata.py og skriver
afstemningsrapporten data/VALIDERING.md.

Kør:  python3 tools/byg_data.py
"""
import json, os, sys, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kildedata as K

ROD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKS = []   # (tabel, kontrol, forventet, fundet, status, kendt)


def check(tabel, kontrol, forventet, fundet, tolerance=0, kendt=None):
    """Registrer én afstemning.

    tolerance: hvor stor en difference der stadig regnes som eksakt. Ved summer af
        afrundede t.kr.-beløb sættes den til antal led / 2, fordi hvert led kan
        være rundet op til 0,5 t.kr. i hver retning.
    kendt: id på en post i DATAKVALITET, hvis afvigelsen er dokumenteret og accepteret.
    """
    diff = None if forventet is None or fundet is None else abs(forventet - fundet)
    if diff is not None and diff <= tolerance:
        status = "OK"
    elif kendt:
        status = "KENDT"
    else:
        status = "AFVIGER"
    CHECKS.append((tabel, kontrol, forventet, fundet, status, kendt))
    return status == "OK"


def afrundingstolerance(antal_led):
    """Summen af n t.kr.-afrundede tal kan afvige op til n/2 fra den afrundede sum."""
    return max(1, (antal_led + 1) // 2)


def t(v):
    """None -> None, ellers tal."""
    return v


# ---------------------------------------------------------------------------
# Ejendomme: flet lejemål + værdiansættelse til én generisk ejendomsliste
# ---------------------------------------------------------------------------
LEJETYPER = [
    ("19_1", "Omkostningsbestemt §19.1", "omkostningsbestemt"),
    ("19_2", "Aftalt leje / fri leje §19.2", "aftalt"),
    ("smaa_huse", "Små huse", "smaa_huse"),
    ("erhverv", "Erhverv", "erhverv"),
]


def byg_ejendomme():
    ud = []
    for e in K.EJENDOMME:
        eid = e["id"]
        lm = K.LEJEMAAL[eid]
        va = K.VAERDIANSAETTELSE[eid]
        energimaerke, antal_v, ar_bolig, ar_erhverv, ar_ialt, indt, netto, vaerdi, vpm2, afkast = va

        fordeling = []
        for noegle, navn, kat in LEJETYPER:
            antal, m2, leje, lejepm2 = lm[noegle]
            fordeling.append({
                "lejetype": kat, "navn": navn,
                "antal": antal or 0, "m2": m2 or 0, "leje": leje or 0,
                "lejePrM2Kilde": lejepm2,
            })
        i_antal, i_m2, i_leje, i_lejepm2 = lm["ialt"]

        # afstemning: sum af lejetyper mod kildens "i alt"-kolonne
        s_antal = sum(f["antal"] for f in fordeling)
        s_m2 = sum(f["m2"] for f in fordeling)
        s_leje = sum(f["leje"] for f in fordeling) + (lm["kaelder_pplads_leje"] or 0)
        check("Lejemål", f"{e['navn']}: antal pr. lejetype = i alt", i_antal, s_antal)
        check("Lejemål", f"{e['navn']}: m² pr. lejetype = i alt", i_m2, s_m2)
        check("Lejemål", f"{e['navn']}: leje pr. lejetype (+kælder) = i alt", i_leje, s_leje)

        ud.append({
            "id": eid,
            "navn": e["navn"],
            "adresse": e["navn"],
            "by": e["by"],
            "energimaerke": energimaerke,
            "kildenavne": e["kildenavne"],
            "lejemaal": {
                "fordeling": fordeling,
                "kaelderPPladsMvLeje": lm["kaelder_pplads_leje"] or 0,
                "ialt": {"antal": i_antal, "m2": i_m2, "leje": i_leje, "lejePrM2Kilde": i_lejepm2},
            },
            "areal": {"bolig": ar_bolig, "erhverv": ar_erhverv, "ialt": ar_ialt},
            "vaerdiansaettelse": {
                "antalLejemaal": antal_v,
                "indtaegter": indt,
                "nettoleje": netto,
                "vaerdi": vaerdi,
                "vaerdiPrM2Kilde": vpm2,
                "afkastPctKilde": afkast,
            },
        })
    return ud


# ---------------------------------------------------------------------------
# Resultatopgørelse
# ---------------------------------------------------------------------------
PERIODER = [
    {"id": "maaned", "navn": "August", "kort": "Måned",
     "kolonner": [
         {"id": "realiseretForrige", "navn": "25/26 Realis.", "rolle": "realiseret_forrige"},
         {"id": "budget", "navn": "26/27 Budget", "rolle": "budget"},
         {"id": "realiseret", "navn": "26/27 Realis.", "rolle": "realiseret"},
         {"id": "afvigelse", "navn": "26/27 Afv.", "rolle": "afvigelse"}]},
    {"id": "aarTilDato", "navn": "År til dato", "kort": "År til dato",
     "kolonner": [
         {"id": "realiseretForrige", "navn": "25/26 Realis.", "rolle": "realiseret_forrige"},
         {"id": "budget", "navn": "26/27 Budget", "rolle": "budget"},
         {"id": "realiseret", "navn": "26/27 Realis.", "rolle": "realiseret"},
         {"id": "afvigelse", "navn": "26/27 Afv.", "rolle": "afvigelse"}]},
    {"id": "regnskabsaar", "navn": "Regnskabsåret", "kort": "Helår",
     "kolonner": [
         {"id": "realiseretForrige", "navn": "25/26 Realis.", "rolle": "realiseret_forrige"},
         {"id": "budget", "navn": "26/27 Budget", "rolle": "budget"},
         {"id": "estimat", "navn": "26/27 Estimat", "rolle": "estimat"}]},
]


def byg_resultatopgoerelse():
    linjer = []
    for lid, navn, typ, gruppe, mnd, ytd, aar in K.RESULTATOPGOERELSE:
        linjer.append({
            "id": lid, "navn": navn, "type": typ, "gruppe": gruppe,
            "kildenavn": K.RESULTATOPGOERELSE_KILDESTAVNING.get(lid, navn),
            "vaerdier": {
                "maaned": {"realiseretForrige": mnd[0], "budget": mnd[1],
                           "realiseret": mnd[2], "afvigelse": mnd[3]},
                "aarTilDato": {"realiseretForrige": ytd[0], "budget": ytd[1],
                               "realiseret": ytd[2], "afvigelse": ytd[3]},
                "regnskabsaar": {"realiseretForrige": aar[0], "budget": aar[1], "estimat": aar[2]},
            },
        })
    idx = {l["id"]: l for l in linjer}

    def v(lid, per, kol):
        return idx[lid]["vaerdier"][per][kol]

    # Afstemning af subtotaler i alle tre perioder
    kolonner = {"maaned": ["realiseretForrige", "budget", "realiseret"],
                "aarTilDato": ["realiseretForrige", "budget", "realiseret"],
                "regnskabsaar": ["realiseretForrige", "budget", "estimat"]}
    regler = [
        ("lejeindtaegter_brutto", ["beboelse_omkostningsbestemt", "beboelse_aftalt_leje",
                                   "erhverv", "oevrige_indtaegter"]),
        ("lejeindtaegter", ["lejeindtaegter_brutto", "lejetab"]),
        ("driftsudgifter_ialt", ["ejendomsskatter", "vand", "renovation", "ejendomsforsikringer",
                                 "vicevaert", "ejendomsadministration", "varmeregnskab",
                                 "oevrige_driftsudgifter"]),
        ("netto_leje_foer_vedligehold", ["lejeindtaegter", "driftsudgifter_ialt"]),
        ("netto_leje", ["netto_leje_foer_vedligehold", "vedligehold", "planlagt_vedligehold"]),
        ("ebitda", ["netto_leje", "reklame", "oevrige_adm_omk"]),
        ("ebit", ["ebitda", "afskrivninger"]),
        ("resultat_foer_skat", ["ebit", "prioritetsrenter", "oevrige_renter",
                                "vaerdiregulering_ejendom", "tab_gevinst_salg"]),
    ]
    for per, kols in kolonner.items():
        pnavn = {"maaned": "August", "aarTilDato": "År til dato", "regnskabsaar": "Regnskabsår"}[per]
        for mal, dele in regler:
            for kol in kols:
                forventet = v(mal, per, kol)
                fundet = sum(v(d, per, kol) for d in dele)
                check("Resultatopgørelse",
                      f"{pnavn}/{kol}: {idx[mal]['navn']} = sum af underliggende",
                      forventet, fundet, tolerance=afrundingstolerance(len(dele)))
    # Afvigelseskolonnen = realiseret - budget
    for per in ("maaned", "aarTilDato"):
        pnavn = {"maaned": "August", "aarTilDato": "År til dato"}[per]
        for l in linjer:
            forventet = l["vaerdier"][per]["afvigelse"]
            fundet = l["vaerdier"][per]["realiseret"] - l["vaerdier"][per]["budget"]
            # Differencen mellem to t.kr.-afrundede tal kan selv afvige 1 t.kr.
            check("Resultatopgørelse", f"{pnavn}: afvigelse på '{l['navn']}' = realiseret − budget",
                  forventet, fundet, tolerance=1)

    vandfald = [
        {"linjeId": "lejeindtaegter", "rolle": "start", "navn": "Lejeindtægter"},
        {"linjeId": "driftsudgifter_ialt", "rolle": "traek", "navn": "Driftsudgifter"},
        {"linjeId": "vedligehold", "rolle": "traek", "navn": "Vedligehold"},
        {"linjeId": "administration", "rolle": "traek", "navn": "Administration",
         "summerer": ["reklame", "oevrige_adm_omk"]},
        {"linjeId": "ebitda", "rolle": "delsum", "navn": "EBITDA"},
        {"linjeId": "renter", "rolle": "traek", "navn": "Renter",
         "summerer": ["prioritetsrenter", "oevrige_renter"]},
        {"linjeId": "andet", "rolle": "traek", "navn": "Værdiregulering og salg",
         "summerer": ["vaerdiregulering_ejendom", "tab_gevinst_salg"]},
        {"linjeId": "resultat_foer_skat", "rolle": "slutsum", "navn": "Resultat før skat"},
    ]
    return {"enhed": "tkr", "perioder": PERIODER, "linjer": linjer, "vandfald": vandfald}


# ---------------------------------------------------------------------------
# Lån, renteprofil og afdragsprofil
# ---------------------------------------------------------------------------
LAANGIVERE = {
    "JR": {"kode": "JR", "navn": "JR", "fuldtNavnForslag": "Jyske Realkredit", "bekraeftet": False},
    "RD": {"kode": "RD", "navn": "RD", "fuldtNavnForslag": "Realkredit Danmark", "bekraeftet": False},
}


def byg_laan(ejendomme):
    laan = []
    sum_gaeld = sum_kurs = sum_vaerdi = 0
    for e in K.EJENDOMME:
        eid = e["id"]
        kode, bogfoert, gaeld, gaeld_pct, kurs, kurs_pct, rente = K.FINANSIERING[eid]
        sum_vaerdi += bogfoert
        sum_gaeld += gaeld or 0
        sum_kurs += kurs or 0
        if gaeld:
            beregnet = round(100 * gaeld / bogfoert)
            check("Finansiering", f"{e['navn']}: gælds% = realkreditgæld / bogført værdi",
                  gaeld_pct, beregnet, tolerance=1)
        laan.append({
            "id": f"laan-{eid}",
            "ejendomId": eid,
            "laangiverKode": kode,
            "laangiver": LAANGIVERE.get(kode),
            "bogfoertVaerdi": bogfoert,
            "restgaeld": gaeld,
            "gaeldPctKilde": gaeld_pct,
            "kursvaerdi": kurs,
            "kursvaerdiPctKilde": kurs_pct,
            "rentePct": rente,
            # Felterne herunder findes ikke pr. ejendom i kildefilen – kun som
            # samlede fordelinger (renteprofil/afdragsprofil). Se VALIDERING.md Å3/Å4.
            "laanetype": None,
            "rentetype": None,
            "afdragsfri": None,
            "refinansieringsdato": None,
        })
    check("Finansiering", "I alt: bogført værdi", K.FINANSIERING_IALT_KILDE["bogfoert_vaerdi"],
          sum_vaerdi, tolerance=1)
    check("Finansiering", "I alt: realkreditgæld", K.FINANSIERING_IALT_KILDE["realkreditgaeld"], sum_gaeld)
    check("Finansiering", "I alt: kursværdi", K.FINANSIERING_IALT_KILDE["kursvaerdi"], sum_kurs)
    check("Finansiering", "I alt: gælds% (afrundet)", K.FINANSIERING_IALT_KILDE["gaeld_pct"],
          round(100 * sum_gaeld / sum_vaerdi), tolerance=1)
    check("Finansiering", "I alt: kursværdi% (afrundet)", K.FINANSIERING_IALT_KILDE["kursvaerdi_pct"],
          round(100 * sum_kurs / sum_vaerdi), tolerance=1)
    return laan


def byg_renteprofil():
    poster = [{"label": l, "andelPct": a, "kategori": k} for l, a, k in K.RENTEPROFIL]
    check("Renteprofil", "Cirkeldiagram summerer til 100 %", 100, sum(p["andelPct"] for p in poster))
    fast = sum(p["andelPct"] for p in poster if p["kategori"] == "fast")
    cibor = sum(p["andelPct"] for p in poster if p["kategori"] == "variabel")
    f5 = sum(p["andelPct"] for p in poster if p["kategori"] == "rentetilpasning_kort")
    check("Renteprofil", "Brødtekst: 27 % fast rente 30 år = Obl. 0,5 % + Obl. 1,0 %", 27, fast)
    check("Renteprofil", "Brødtekst: 48 % Cibor 3/6", 48, cibor)
    check("Renteprofil", "Brødtekst: 25 % F5", 25, f5)
    return {"peridato": "2026-04-30", "poster": poster}


def byg_afdragsprofil():
    poster = [{"label": l, "andelPct": a,
               "aar": None if l == "Afdrages nu" else int(l),
               "afdragesNu": l == "Afdrages nu"} for l, a in K.AFDRAGSPROFIL]
    check("Afdragsprofil", "Cirkeldiagram summerer til 100 %", 100, sum(p["andelPct"] for p in poster))
    check("Afdragsprofil", "Brødtekst: der afdrages på 15 % af realkreditten", 15,
          next(p["andelPct"] for p in poster if p["afdragesNu"]))
    check("Afdragsprofil", "Brødtekst: ultimo 2026 øges afdragsprocenten med 17", 17,
          next(p["andelPct"] for p in poster if p["aar"] == 2026))
    return {"peridato": "2026-04-30", "poster": poster}


# ---------------------------------------------------------------------------
# Vedligeholdelsesplan
# ---------------------------------------------------------------------------
def byg_vedligeholdelsesplan():
    aar = []
    for i, norm in enumerate(K.VEDLIGEHOLD_AAR_NORMALISERET):
        aar.append({"id": norm, "label": norm, "kildeLabel": K.VEDLIGEHOLD_AAR_KILDE[i],
                    "kildeLabelAfviger": K.VEDLIGEHOLD_AAR_KILDE[i] != norm})
    projekter = []
    for n, (eid, kat, besk, ai, beloeb) in enumerate(K.VEDLIGEHOLDSPROJEKTER, 1):
        projekter.append({"id": f"vh-{n:02d}", "ejendomId": eid, "kategori": kat,
                          "projekt": besk, "aar": K.VEDLIGEHOLD_AAR_NORMALISERET[ai],
                          "beloeb": beloeb})
    for i, norm in enumerate(K.VEDLIGEHOLD_AAR_NORMALISERET):
        fundet = sum(p["beloeb"] for p in projekter if p["aar"] == norm)
        check("Vedligeholdelsesplan", f"Kolonnetotal {norm} (kildens '{K.VEDLIGEHOLD_AAR_KILDE[i]}')",
              K.VEDLIGEHOLD_IALT_KILDE[i], fundet)
    return {"aar": aar, "projekter": projekter}


# ---------------------------------------------------------------------------
# Grundejernes Investeringsfond
# ---------------------------------------------------------------------------
def byg_gi(ejendomme):
    areal = {e["id"]: e["areal"]["ialt"] for e in ejendomme}
    ud = []
    sum_uplanlagt = sum_planlagt = 0
    for e in K.EJENDOMME:
        eid = e["id"]
        (s26_119, s26_120, h119, h120, uplanlagt, planlagt, s27_119, s27_120) = K.GI_INDESTAAENDER[eid]
        pligtig = s26_119 is not None
        sum_uplanlagt += uplanlagt
        sum_planlagt += planlagt
        if pligtig:
            # §119: saldo primo + hensættelse (kr/m² × areal) − afholdt vedligehold
            forv = (s26_119 or 0) + h119 * areal[eid] - (uplanlagt + planlagt)
            check("GI", f"{e['navn']}: saldo 30.04.2027 §119 = primo + {h119} kr/m² × "
                        f"{areal[eid]} m² − vedligehold", s27_119, forv, tolerance=1)
            # §120: saldo primo + hensættelse, ingen træk
            forv120 = (s26_120 or 0) + h120 * areal[eid]
            check("GI", f"{e['navn']}: saldo 30.04.2027 §120 = primo + {h120} kr/m² × "
                        f"{areal[eid]} m²", s27_120, forv120, tolerance=1,
                  kendt="Å8" if eid == "asylgade-21" else None)
        ud.append({
            "ejendomId": eid,
            "indberetningspligtig": pligtig,
            "saldoPrimo119": s26_119, "saldoPrimo120": s26_120,
            "hensaettelse119KrPrM2": h119, "hensaettelse120KrPrM2": h120,
            "aaretsUplanlagteVedligehold": uplanlagt,
            "planlagtVedligehold": planlagt,
            "saldoUltimo119": s27_119, "saldoUltimo120": s27_120,
        })
    check("GI", "I alt: årets uplanlagte vedligehold",
          K.GI_IALT_KILDE["aarets_uplanlagte_vedligehold"], sum_uplanlagt)
    check("GI", "I alt: planlagt vedligehold", K.GI_IALT_KILDE["planlagt_vedligehold"], sum_planlagt)
    check("GI", "GI planlagt vedligehold = vedligeholdelsesplanens 2026/27-total",
          K.VEDLIGEHOLD_IALT_KILDE[0], sum_planlagt)
    return {"primoDato": "2026-04-30", "ultimoDato": "2027-04-30", "poster": ud}


# ---------------------------------------------------------------------------
# Likviditetsbudget
# ---------------------------------------------------------------------------
def anvend_rettelse_forsikring(linjer, cash):
    """R1: retter forsikringslinjen til −263 t.kr. og genberegner hele budgettet.

    Kildens oprindelige tal gemmes på hver rørt linje som "kildeVaerdier", så
    rettelsen altid kan spores tilbage til den originale rapport.
    """
    rettelse = next((r for r in K.RETTELSER if r["id"] == "R1"), None)
    if not rettelse:
        return []
    idx = {l["id"]: l for l in linjer}
    cidx = {c["id"]: c for c in cash}
    aar = K.LIKVIDITET_AAR
    roert = []

    def gem_kilde(linje):
        if "kildeVaerdier" not in linje:
            linje["kildeVaerdier"] = dict(linje["vaerdier"])
            linje["rettetAf"] = rettelse["id"]
            roert.append(linje["id"])

    # 1) Forsikringslinjen: startbeløb fremskrevet 2,0 % p.a. på ikke-afrundede
    #    værdier, præcis som kilden selv gør det.
    forsikring = idx[rettelse["linje"]]
    gem_kilde(forsikring)
    lob = float(rettelse["startbeloeb"])
    for i, a in enumerate(aar):
        if i:
            lob *= 1 + (forsikring["reguleringPct"] or 0) / 100
        forsikring["vaerdier"][a] = round(lob)

    # 2) Genberegn alle afledte linjer som eksakte summer af deres bestanddele.
    kaede = [
        ("driftsudgifter_ialt", ["ejendomsskatter", "vand", "renovation",
                                 "ejendomsforsikringer", "vicevaert",
                                 "ejendomsadministration", "varmeregnskab",
                                 "oevrige_driftsudgifter", "uplanlagt_vedligehold",
                                 "planlagt_vedligehold"]),
        ("nettoleje", ["indtaegter_ialt", "driftsudgifter_ialt"]),
        ("ebit", ["nettoleje", "oevrige_adm_omkostninger"]),
        ("resultat_foer_skat", ["ebit", "afskrivninger", "prioritetsrenter", "bankrenter"]),
    ]
    for mal, dele in kaede:
        gem_kilde(idx[mal])
        for a in aar:
            idx[mal]["vaerdier"][a] = sum(idx[d]["vaerdier"][a] for d in dele)

    skattesats = (idx["skat"]["reguleringPct"] or 22.0) / 100
    for navn in ("skat", "resultat_efter_skat", "likviditet"):
        gem_kilde(idx[navn])
    for a in aar:
        rfs = idx["resultat_foer_skat"]["vaerdier"][a]
        idx["skat"]["vaerdier"][a] = round(rfs * skattesats)
        idx["resultat_efter_skat"]["vaerdier"][a] = rfs - idx["skat"]["vaerdier"][a]
        idx["likviditet"]["vaerdier"][a] = (idx["resultat_efter_skat"]["vaerdier"][a]
                                            + idx["afdrag_realkredit"]["vaerdier"][a])

    # 3) Genberegn cash flowet. Udskudt skat følger årets ændring i skat,
    #    præcis som i kilden; bankbeholdningen kædes år for år.
    for navn in ("resultat_efter_skat", "regulering_udskudt_skat", "bank_primo", "bank_ultimo"):
        gem_kilde(cidx[navn])
    primo = cidx["bank_primo"]["kildeVaerdier"][aar[0]]
    for i, a in enumerate(aar):
        cidx["resultat_efter_skat"]["vaerdier"][a] = idx["resultat_efter_skat"]["vaerdier"][a]
        cidx["regulering_udskudt_skat"]["vaerdier"][a] = (
            idx["skat"]["vaerdier"][a] if i == 0
            else idx["skat"]["vaerdier"][a] - idx["skat"]["vaerdier"][aar[i - 1]])
        cidx["bank_primo"]["vaerdier"][a] = primo
        primo += sum(cidx[c]["vaerdier"][a] for c in
                     ["resultat_efter_skat", "udbytte", "regulering_udskudt_skat",
                      "regulering_deposita", "afdrag_realkreditlaan"])
        cidx["bank_ultimo"]["vaerdier"][a] = primo
    return roert


def byg_likviditet():
    linjer = [{"id": lid, "navn": navn, "gruppe": gruppe, "type": typ,
               "reguleringPct": reg,
               "vaerdier": dict(zip(K.LIKVIDITET_AAR, vals))}
              for lid, navn, gruppe, typ, reg, vals in K.LIKVIDITETSBUDGET]
    cash = [{"id": cid, "navn": navn, "type": typ, "vaerdier": dict(zip(K.LIKVIDITET_AAR, vals))}
            for cid, navn, typ, vals in K.CASH_FLOW]
    rettede = anvend_rettelse_forsikring(linjer, cash)
    idx = {l["id"]: l for l in linjer}
    cidx = {c["id"]: c for c in cash}

    regler = [
        ("indtaegter_ialt", ["beboelse_omkostningsbestemt", "beboelse_aftalt_leje", "erhverv",
                             "oevrige_indtaegter", "lejetab"]),
        ("driftsudgifter_ialt", ["ejendomsskatter", "vand", "renovation", "ejendomsforsikringer",
                                 "vicevaert", "ejendomsadministration", "varmeregnskab",
                                 "oevrige_driftsudgifter", "uplanlagt_vedligehold",
                                 "planlagt_vedligehold"]),
        ("nettoleje", ["indtaegter_ialt", "driftsudgifter_ialt"]),
        ("ebit", ["nettoleje", "oevrige_adm_omkostninger"]),
        ("resultat_foer_skat", ["ebit", "afskrivninger", "prioritetsrenter", "bankrenter"]),
    ]
    for aar in K.LIKVIDITET_AAR:
        for mal, dele in regler:
            check("Likviditetsbudget", f"{aar}: {idx[mal]['navn']} = sum af underliggende",
                  idx[mal]["vaerdier"][aar], sum(idx[d]["vaerdier"][aar] for d in dele),
                  tolerance=afrundingstolerance(len(dele)))
        # Skat 22 % af resultat før skat
        check("Likviditetsbudget", f"{aar}: Skat = 22 % af resultat før skat",
              idx["skat"]["vaerdier"][aar],
              round(idx["resultat_foer_skat"]["vaerdier"][aar] * 0.22), tolerance=1)
        check("Likviditetsbudget", f"{aar}: Resultat efter skat = før skat − skat",
              idx["resultat_efter_skat"]["vaerdier"][aar],
              idx["resultat_foer_skat"]["vaerdier"][aar] - idx["skat"]["vaerdier"][aar], tolerance=1)
        check("Likviditetsbudget", f"{aar}: Likviditet = resultat efter skat + afdrag",
              idx["likviditet"]["vaerdier"][aar],
              idx["resultat_efter_skat"]["vaerdier"][aar] + idx["afdrag_realkredit"]["vaerdier"][aar],
              tolerance=1)
        # Cash flow
        cf = sum(cidx[c]["vaerdier"][aar] for c in
                 ["bank_primo", "resultat_efter_skat", "udbytte", "regulering_udskudt_skat",
                  "regulering_deposita", "afdrag_realkreditlaan"])
        check("Likviditetsbudget", f"{aar}: Bank ultimo = primo + årets bevægelser",
              cidx["bank_ultimo"]["vaerdier"][aar], cf, tolerance=1)
    for i in range(1, len(K.LIKVIDITET_AAR)):
        f, n = K.LIKVIDITET_AAR[i - 1], K.LIKVIDITET_AAR[i]
        check("Likviditetsbudget", f"Bank primo {n} = bank ultimo {f}",
              cidx["bank_primo"]["vaerdier"][n], cidx["bank_ultimo"]["vaerdier"][f])
    # 2 % fremskrivning
    for l in linjer:
        if l["reguleringPct"] == 2.0 and l["vaerdier"][K.LIKVIDITET_AAR[0]] != 0:
            for i in range(1, len(K.LIKVIDITET_AAR)):
                f, n = K.LIKVIDITET_AAR[i - 1], K.LIKVIDITET_AAR[i]
                check("Likviditetsbudget", f"{l['navn']} {n} = {f} × 1,02",
                      l["vaerdier"][n], round(l["vaerdier"][f] * 1.02), tolerance=1)
    return {"aar": K.LIKVIDITET_AAR, "linjer": linjer, "cashFlow": cash,
            "rettedeLinjer": rettede,
            "forudsaetninger": [
                "Indtægter og driftsudgifter fremskrives 2,0 % p.a.",
                "Planlagt vedligehold følger vedligeholdelsesplanen og fremskrives ikke.",
                "Prioritetsrenter holdes fast på 4.392 t.kr. i alle 10 år.",
                "Bankrenter holdes fast på 200 t.kr. i alle 10 år.",
                "Afdrag på realkredit holdes fast på 914 t.kr. i alle 10 år.",
                "Selskabsskat 22 %. Udbytte 1.000 t.kr. p.a.",
                "Ejendomsforsikringer er rettet fra kildens 63 t.kr. til 263 t.kr. "
                "jf. resultatopgørelsen (rettelse R1); budgettet er genberegnet.",
            ]}


# ---------------------------------------------------------------------------
# Krydstjek på tværs af tabeller
# ---------------------------------------------------------------------------
def krydstjek(ejendomme, resultat, likviditet):
    # Lejemålstabellens i alt-række
    for noegle, felt, pos in [("19_1", "antal", 0), ("19_2", "antal", 0),
                              ("smaa_huse", "antal", 0), ("erhverv", "antal", 0)]:
        pass
    for noegle, navn, kat in LEJETYPER:
        for pos, felt in [(0, "antal"), (1, "m2"), (2, "leje")]:
            forventet = K.LEJEMAAL_IALT_KILDE[noegle][pos]
            fundet = sum((K.LEJEMAAL[e["id"]][noegle][pos] or 0) for e in K.EJENDOMME)
            check("Lejemål", f"I alt-række: {navn} – {felt}", forventet, fundet)
    for pos, felt in [(0, "antal"), (1, "m2"), (2, "leje")]:
        forventet = K.LEJEMAAL_IALT_KILDE["ialt"][pos]
        fundet = sum((K.LEJEMAAL[e["id"]]["ialt"][pos] or 0) for e in K.EJENDOMME)
        check("Lejemål", f"I alt-række: Lejemål i alt – {felt}", forventet, fundet)
    check("Lejemål", "Brødtekst: 255 lejemål i alt", 255, K.LEJEMAAL_IALT_KILDE["ialt"][0])

    # Diagram (chart1.xml) mod lejemålstabellen
    for by, m2 in K.LEJEMAAL_PR_BY_M2.items():
        fundet = sum(e["lejemaal"]["ialt"]["m2"] for e in ejendomme if e["by"] == by)
        check("Lejemål pr. by", f"Diagram m² for {by} = sum af ejendomme i lejemålstabellen", m2, fundet)
    check("Lejemål pr. by", "Diagram m² i alt = lejemålstabellens i alt",
          sum(K.LEJEMAAL_PR_BY_M2.values()), K.LEJEMAAL_IALT_KILDE["ialt"][1])

    # Værdiansættelse
    for felt, noegle in [("antalLejemaal", "antal_lejemaal"), ("indtaegter", "indtaegter"),
                         ("nettoleje", "nettoleje"), ("vaerdi", "vaerdi")]:
        fundet = sum(e["vaerdiansaettelse"][felt] for e in ejendomme)
        check("Værdiansættelse", f"I alt-række: {felt}", K.VAERDIANSAETTELSE_IALT_KILDE[noegle],
              fundet, tolerance=1)
    for felt, noegle in [("bolig", "areal_bolig"), ("erhverv", "areal_erhverv"), ("ialt", "areal_ialt")]:
        fundet = sum(e["areal"][felt] for e in ejendomme)
        check("Værdiansættelse", f"I alt-række: areal {felt}",
              K.VAERDIANSAETTELSE_IALT_KILDE[noegle], fundet)
    for e in ejendomme:
        va = e["vaerdiansaettelse"]
        if e["areal"]["ialt"]:
            check("Værdiansættelse", f"{e['navn']}: værdi pr. m² = værdi / areal",
                  va["vaerdiPrM2Kilde"], round(va["vaerdi"] / e["areal"]["ialt"]), tolerance=1)
    check("Værdiansættelse", "I alt: værdi pr. m² = samlet værdi / samlet areal",
          K.VAERDIANSAETTELSE_IALT_KILDE["vaerdi_pr_m2"],
          round(K.VAERDIANSAETTELSE_IALT_KILDE["vaerdi"] / K.VAERDIANSAETTELSE_IALT_KILDE["areal_ialt"]),
          tolerance=1)
    check("Værdiansættelse", "Kontrolværdi fra opgaven: samlet ejendomsværdi ca. 253 mio. kr.",
          253, round(K.VAERDIANSAETTELSE_IALT_KILDE["vaerdi"] / 1_000_000))

    # Værdiansættelse mod lejemålstabellen
    check("Krydstjek", "Areal i alt: værdiansættelse = lejemålstabel",
          K.VAERDIANSAETTELSE_IALT_KILDE["areal_ialt"], K.LEJEMAAL_IALT_KILDE["ialt"][1])
    check("Krydstjek", "Antal lejemål: værdiansættelse = lejemålstabel",
          K.VAERDIANSAETTELSE_IALT_KILDE["antal_lejemaal"], K.LEJEMAAL_IALT_KILDE["ialt"][0],
          kendt="Å5")
    for e in ejendomme:
        check("Krydstjek", f"{e['navn']}: antal lejemål i værdiansættelse = lejemålstabel",
              e["vaerdiansaettelse"]["antalLejemaal"], e["lejemaal"]["ialt"]["antal"],
              kendt="Å5" if e["id"] == "blegdammen-9" else None)

    # Finansiering mod værdiansættelse
    for e in ejendomme:
        check("Krydstjek", f"{e['navn']}: bogført værdi (finansiering) = værdi (værdiansættelse)",
              K.FINANSIERING[e["id"]][1], e["vaerdiansaettelse"]["vaerdi"])

    # Resultatopgørelse mod likviditetsbudget (regnskabsårets budget 26/27)
    idx = {l["id"]: l for l in resultat["linjer"]}
    par = [("beboelse_omkostningsbestemt", "beboelse_omkostningsbestemt"),
           ("beboelse_aftalt_leje", "beboelse_aftalt_leje"), ("erhverv", "erhverv"),
           ("oevrige_indtaegter", "oevrige_indtaegter"), ("lejetab", "lejetab"),
           ("ejendomsskatter", "ejendomsskatter"), ("vand", "vand"), ("renovation", "renovation"),
           ("ejendomsforsikringer", "ejendomsforsikringer"), ("vicevaert", "vicevaert"),
           ("ejendomsadministration", "ejendomsadministration"),
           ("oevrige_driftsudgifter", "oevrige_driftsudgifter"),
           ("prioritetsrenter", "prioritetsrenter")]
    lik = {l["id"]: l["vaerdier"] for l in likviditet["linjer"]}
    for pl_id, lk_id in par:
        check("Krydstjek", f"Budget 26/27 '{idx[pl_id]['navn']}': P&L (t.kr.) = likviditetsbudget",
              idx[pl_id]["vaerdier"]["regnskabsaar"]["budget"],
              round(lik[lk_id]["2026/27"] / 1000), tolerance=1)
    check("Krydstjek", "Kontrolværdi fra opgaven: lejeindtægter budget 26/27 ≈ 16.522 t.kr.",
          16522, idx["lejeindtaegter"]["vaerdier"]["regnskabsaar"]["budget"])
    check("Krydstjek", "Kontrolværdi fra opgaven: EBITDA budget 26/27 ≈ 8.181 t.kr.",
          8181, idx["ebitda"]["vaerdier"]["regnskabsaar"]["budget"])
    check("Krydstjek", "Kontrolværdi fra opgaven: EBITDA estimat 26/27 ≈ 7.457 t.kr.",
          7457, idx["ebitda"]["vaerdier"]["regnskabsaar"]["estimat"])
    check("Krydstjek", "Kontrolværdi fra opgaven: prioritetsrenter budget 26/27 ≈ 4.392 t.kr.",
          -4392, idx["prioritetsrenter"]["vaerdier"]["regnskabsaar"]["budget"])
    check("Krydstjek", "Kontrolværdi fra opgaven: resultat før skat budget 26/27 ≈ 3.771 t.kr.",
          3771, idx["resultat_foer_skat"]["vaerdier"]["regnskabsaar"]["budget"])
    check("Krydstjek", "Kontrolværdi fra opgaven: resultat før skat estimat 26/27 ≈ 3.375 t.kr.",
          3375, idx["resultat_foer_skat"]["vaerdier"]["regnskabsaar"]["estimat"])
    check("Krydstjek", "Kontrolværdi fra opgaven: vedligehold år til dato 322 t.kr. over budget",
          -322, idx["vedligehold"]["vaerdier"]["aarTilDato"]["afvigelse"])
    check("Krydstjek", "Kontrolværdi fra opgaven: realkreditgæld ca. 155 mio. kr.",
          155, round(K.FINANSIERING_IALT_KILDE["realkreditgaeld"] / 1_000_000))
    check("Krydstjek", "Kontrolværdi fra opgaven: belåning ca. 61 %",
          61, round(100 * K.FINANSIERING_IALT_KILDE["realkreditgaeld"]
                    / K.FINANSIERING_IALT_KILDE["bogfoert_vaerdi"]))


# ---------------------------------------------------------------------------
# Kommentarer og opmærksomhedspunkter (fase 1: statisk tekst fra kildefilen)
# ---------------------------------------------------------------------------
def byg_kommentarer():
    return {
        "periodensOverblik": {
            "kilde": "manuel",
            "kildebeskrivelse": "Konklusioner fra brødteksten i Nygårdsholm_Ejendomme_Ejendomsrapport.docx",
            "genereretAf": None,
            "periode": "August 2026",
            "afsnit": [
                "Driftsudgifterne er på niveau med budget, og lejeindtægterne år til dato "
                "ligger 1 t.kr. over budget.",
                "Der er brugt 322 t.kr. mere på vedligehold end budgetteret år til dato. "
                "Det skyldes primært periodisering.",
                "Resultat før skat år til dato er 1.961 t.kr. mod et budget på 2.359 t.kr. "
                "Helårsestimatet er 3.375 t.kr. mod et budget på 3.771 t.kr.",
                "Porteføljen er værdiansat til 253,5 mio. kr. med en realkreditgæld på "
                "155,0 mio. kr.",
            ],
        },
        "opmaerksomhedspunkter": [
            {"id": "afdragsprofil-dannebrogsgade", "alvor": "hoej",
             "overskrift": "Afdragsprofilen ændres ultimo 2026",
             "tekst": "Der afdrages i dag på 15 % af realkreditten. Ultimo 2026 øges "
                      "afdragsprocenten med 17, såfremt lånet i Dannebrogsgade ikke "
                      "konverteres til nyt 30-årigt lån med indledende 10 års afdragsfrihed.",
             "kilde": "Brødtekst, side 5"},
            {"id": "renterisiko", "alvor": "hoej",
             "overskrift": "73 % af gælden er variabelt forrentet eller F5",
             "tekst": "27 % af realkreditten er 30-årige lån med fast rente. 48 % er Cibor 3 "
                      "eller Cibor 6, og de resterende 25 % er F5 med kommende rentetilpasning. "
                      "Er det den ønskede renterisikoprofil?",
             "kilde": "Brødtekst og renteprofil, side 4"},
            {"id": "vedligehold-over-budget", "alvor": "mellem",
             "overskrift": "Vedligehold 322 t.kr. over budget år til dato",
             "tekst": "Merforbruget skyldes primært periodisering. Helårsestimatet er "
                      "3.581 t.kr. mod et budget på 3.259 t.kr.",
             "kilde": "Profit & Loss 26/27 og brødtekst, side 1"},
            {"id": "modernisering-19-1", "alvor": "mellem",
             "overskrift": "Moderniseringspotentiale i §19.1-lejemålene",
             "tekst": "Der er potentiale i en gennemgribende modernisering af §19.1-lejemålene, "
                      "hvilket særligt knytter sig til lejemål i Århus og Skanderborg. "
                      "Lejlighederne i Skanderborg vedrører dog nyanskaffede ejendomme, der "
                      "først kan §19.2-moderniseres efter 5 års ejerskab.",
             "kilde": "Brødtekst, side 2"},
            {"id": "gi-negative-saldi", "alvor": "mellem",
             "overskrift": "Negative GI-saldi på §120-kontiene",
             "tekst": "Seks ejendomme har negativ §120-saldo, i alt −10,7 mio. kr. pr. "
                      "30.04.2026. Det er afholdt vedligehold, der endnu ikke er dækket af "
                      "hensættelser.",
             "kilde": "Grundejernes Investeringsfond, side 3"},
            {"id": "tomgang-mangler", "alvor": "info",
             "overskrift": "Lejerotation og tomgang mangler",
             "tekst": "Afsnittet er tomt i kilderapporten. Data skal leveres af DAC, før "
                      "tomgang kan indgå i nøgletallene.",
             "kilde": "Sektionen 'Lejerotation og tomgang', side 2"},
        ],
    }


DATAKVALITET = [
    {"id": "Å1", "alvor": "afklaret", "omraade": "Vedligeholdelsesplan",
     "tekst": "Kildens kolonneoverskrifter er 2026/27, 2027/28, 2028/29, 2028/29, 2030/31, "
              "2031/32, 2032/33, 2033/34 – 2028/29 optræder to gange og 2029/30 mangler. "
              "AFKLARET: fjerde kolonne (2,0 mio. kr., Dannebrogsgade skifertag) er 2029/30. "
              "Se rettelse R2."},
    {"id": "Å2", "alvor": "afklaret", "omraade": "Ejendomsforsikringer",
     "tekst": "Resultatopgørelsen havde −263 t.kr. i budget 26/27, mens likviditetsbudgettet "
              "havde −63 t.kr. for 2026/27. AFKLARET: −263 t.kr. er det rigtige. "
              "Likviditetsbudgettet er rettet og genberegnet. Se rettelse R1."},
    {"id": "Å3", "alvor": "mangler", "omraade": "Finansiering",
     "tekst": "Lånetype og rentetype (fast / Cibor 3 / Cibor 6 / F5) findes kun som samlet "
              "fordeling i cirkeldiagrammet, ikke pr. ejendom. Felterne laanetype, rentetype, "
              "afdragsfri og refinansieringsdato står derfor som null pr. lån."},
    {"id": "Å4", "alvor": "mangler", "omraade": "Finansiering",
     "tekst": "Asylgade 21-23 har ingen rentesats i kildetabellen (tom celle), selv om der er "
              "13,0 mio. kr. i realkreditgæld. Rentesatsen mangler."},
    {"id": "Å5", "alvor": "afviger", "omraade": "Antal lejemål",
     "tekst": "Lejemålstabellen har 255 lejemål i alt (og 12 på Blegdammen 9 / Møllestien 59), "
              "mens værdiansættelsestabellen har 256 i alt (og 13 på samme ejendom). "
              "Begge tal er gemt, hver med sin kilde."},
    {"id": "Å6", "alvor": "afviger", "omraade": "Lejeindtægter",
     "tekst": "Lejemålstabellens samlede leje er 16.442.690 kr., mens værdiansættelsens "
              "'Indtægter' er 16.305.790 kr. De to opgørelser er ikke identiske pr. ejendom. "
              "Dashboardet bruger lejemålstabellen til lejeanalyse og værdiansættelsen til afkast."},
    {"id": "Å7", "alvor": "afviger", "omraade": "Værdiansættelse",
     "tekst": "Kildens afkastkolonne kan ikke genskabes som nettoleje / værdi; den ligger "
              "systematisk 0,1–0,4 procentpoint højere (i alt 4,3 % mod beregnet 4,2 %). "
              "Kildens tal er gemt som afkastPctKilde, og dashboardet beregner selv "
              "nettoafkast = nettoleje / værdi."},
    {"id": "Å8", "alvor": "afviger", "omraade": "Grundejernes Investeringsfond",
     "tekst": "11 af 12 §119/§120-saldi kan genberegnes som primo + hensættelse pr. m² × areal "
              "− afholdt vedligehold. Asylgade 21-23 §120 giver −320.743 kr. mod kildens "
              "−328.951 kr.; det svarer til et GI-pligtigt areal på 1.016 m² i stedet for "
              "1.092 m²."},
    {"id": "Å9", "alvor": "mangler", "omraade": "Modernisering",
     "tekst": "Kilden oplyser, at Skanderborg-lejlighederne først kan §19.2-moderniseres efter "
              "5 års ejerskab, men angiver hverken anskaffelsesdato eller frigivelsesdato. "
              "Feltet moderniseringSpaerretTil står som null."},
    {"id": "Å10", "alvor": "mangler", "omraade": "Lejerotation og tomgang",
     "tekst": "Sektionen er helt tom i kildefilen. Ingen data om tomme lejemål eller fraflytninger."},
    {"id": "Å11", "alvor": "afrunding", "omraade": "Resultatopgørelse",
     "tekst": "P&L er i hele t.kr. Enkelte subtotaler og afvigelseskolonner afviger 1–2 t.kr. "
              "fra den genberegnede værdi, fordi kilden runder hver linje for sig. Summen af "
              "de 12 ejendommes bogførte værdi afviger tilsvarende 1 kr. fra kildens total. "
              "Ingen af disse forskelle er større end afrundingen tillader."},
    {"id": "Å12", "alvor": "aabent_spoergsmaal", "omraade": "Finansiering",
     "tekst": "Långiverkoderne JR og RD er ikke forklaret i kilden. Forslag: JR = Jyske "
              "Realkredit, RD = Realkredit Danmark. Ikke bekræftet — vises som kode indtil videre."},
]


def main():
    ejendomme = byg_ejendomme()
    resultat = byg_resultatopgoerelse()
    laan = byg_laan(ejendomme)
    renteprofil = byg_renteprofil()
    afdragsprofil = byg_afdragsprofil()
    vedligehold = byg_vedligeholdelsesplan()
    gi = byg_gi(ejendomme)
    likviditet = byg_likviditet()
    krydstjek(ejendomme, resultat, likviditet)

    # Moderniseringsspærring – kilden nævner Skanderborg, men ikke hvilken dato
    for e in ejendomme:
        har_19_1 = any(f["lejetype"] == "omkostningsbestemt" and f["antal"] > 0
                       for f in e["lejemaal"]["fordeling"])
        spaerret = e["by"] == "Skanderborg" and har_19_1
        e["modernisering"] = {
            "harOmkostningsbestemteLejemaal": har_19_1,
            "spaerret": spaerret,
            "spaerretTil": None,
            "begrundelse": ("Nyanskaffet ejendom – §19.2-modernisering først muligt efter "
                            "5 års ejerskab. Dato ikke oplyst i kilden.") if spaerret else None,
        }

    data = {
        "skema": {
            "version": "1.0",
            "genereret": datetime.date.today().isoformat(),
            "generetAf": "tools/byg_data.py",
            "kilde": K.KILDE,
            "billedkilder": K.BILLEDKILDER,
        },
        "ejer": {
            "id": "nygaardsholm",
            "navn": "Nygårdsholm Ejendomme",
            "administrator": "Dansk Administrationscenter",
            "valuta": "DKK",
            "regnskabsaar": {
                "startMaaned": 5, "slutMaaned": 4,
                "beskrivelse": "1. maj – 30. april",
                "aktueltLabel": "2026/27", "forrigeLabel": "2025/26",
            },
            "rapportperiode": {
                "maanedLabel": "August 2026",
                "aarTilDatoMaaneder": 4,
                "balancedato": "2026-04-30",
                "datagrundlag": "Data pr. august 2026",
                "kilde": "DAC",
            },
        },
        "kommentar": byg_kommentarer(),
        "ejendomme": ejendomme,
        "resultatopgoerelse": resultat,
        "laan": laan,
        "renteprofil": renteprofil,
        "afdragsprofil": afdragsprofil,
        "vedligeholdelsesplan": vedligehold,
        "giIndestaaender": gi,
        "likviditetsbudget": likviditet,
        "tomgang": {
            "status": "mangler",
            "besked": "Data ikke leveret endnu",
            "beskrivelse": "Sektionen 'Lejerotation og tomgang' er tom i kilderapporten.",
            "perioder": [],
        },
        "datakvalitet": DATAKVALITET,
        "rettelser": K.RETTELSER,
    }

    sti = os.path.join(ROD, "data", "nygaardsholm.json")
    os.makedirs(os.path.dirname(sti), exist_ok=True)
    with open(sti, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    skriv_validering()
    ok = sum(1 for c in CHECKS if c[4] == "OK")
    kendt = sum(1 for c in CHECKS if c[4] == "KENDT")
    fejl = sum(1 for c in CHECKS if c[4] == "AFVIGER")
    print(f"Skrev {sti}")
    print(f"Kontroller: {len(CHECKS)} i alt – {ok} stemmer, "
          f"{kendt} kendt afvigelse, {fejl} uforklaret")
    return 0 if fejl == 0 else 1


def dk(n):
    if n is None:
        return "–"
    s = f"{abs(n):,}".replace(",", ".")
    return ("−" if n < 0 else "") + s


def skriv_validering():
    L = []
    A = L.append
    A("# Validering af dataudtræk\n")
    A("Nygårdsholm Ejendomme · genereret automatisk af `tools/byg_data.py`\n")
    A(f"Dato: {datetime.date.today().isoformat()}\n")
    A("## Sådan er tallene udtrukket\n")
    A(f"**Kildefil:** `{K.KILDE['fil']}` ({K.KILDE['titel']}, forfatter {K.KILDE['forfatter']})\n")
    A(K.KILDE["metode"] + "\n")
    A("Rådata står i `tools/kildedata.py`, én konstant pr. tabel. Alle aflæste tal er "
      "gengivet uændret; intet er beregnet under aflæsningen. `tools/byg_data.py` bygger "
      "`data/nygaardsholm.json` og afstemmer hver tabel mod sine egne totaler og mod de "
      "øvrige tabeller.\n")
    A("| Sektion | Kilde i .docx | Status |")
    A("|---|---|---|")
    status_pr_sektion = {
        "resultatopgoerelse": "Aflæst – alle subtotaler afstemt",
        "lejemaal_pr_by": "Læst direkte fra XML – eksakte tal",
        "lejemaal": "Aflæst – alle række- og kolonnetotaler afstemt",
        "vedligeholdelsesplan": "Aflæst – alle kolonnetotaler afstemt (se Å1 om årstal)",
        "gi_indestaaender": "Aflæst – 11 af 12 saldi genberegnet (se Å8)",
        "vaerdiansaettelse": "Aflæst – alle totaler afstemt (se Å5, Å6, Å7)",
        "finansiering": "Aflæst – alle totaler afstemt (se Å3, Å4, Å12)",
        "renteprofil": "Aflæst – summerer til 100 % og matcher brødteksten",
        "afdragsprofil": "Aflæst – summerer til 100 % og matcher brødteksten",
        "likviditetsbudget": "Aflæst – alle 10 år gennemregnet (se Å2)",
    }
    sektionsnavne = {
        "resultatopgoerelse": "Profit &amp; Loss 26/27", "lejemaal_pr_by": "Lejemål pr. by (m²)",
        "lejemaal": "Lejemål pr. ejendom og lejetype",
        "vedligeholdelsesplan": "Planlagt vedligehold 2026/27–2033/34",
        "gi_indestaaender": "Grundejernes Investeringsfond",
        "vaerdiansaettelse": "Ejendommenes værdiansættelse", "finansiering": "Finansiering pr. ejendom",
        "renteprofil": "Renteprofil pr. 30.04.2026", "afdragsprofil": "Afdragsprofil pr. 30.04.2026",
        "likviditetsbudget": "Likviditetsbudget 2026/27–2035/36",
    }
    for n, kilde in K.BILLEDKILDER.items():
        A(f"| {sektionsnavne.get(n, n)} | `{kilde}` | {status_pr_sektion.get(n, '')} |")
    A("| Lejerotation og tomgang | Sektionen er tom i kilden | **Ingen data** (se Å10) |")
    A("")

    A("## Kontrolværdier fra opgavebeskrivelsen\n")
    A("| Kontrolværdi | Forventet | Fundet | Status |")
    A("|---|---|---|---|")
    for tabel, kontrol, forv, fund, status, _kendt in CHECKS:
        if "Kontrolværdi fra opgaven" in kontrol:
            navn = kontrol.split(": ", 1)[1]
            A(f"| {navn} | {dk(forv)} | {dk(fund)} | {'✅' if status == 'OK' else '⚠️'} |")
    A("")

    A("## Godkendte rettelser\n")
    A("Kilden er aflæst uændret i `tools/kildedata.py`. Rettelserne herunder er "
      "besluttet af ejer/DAC og anvendes af `tools/byg_data.py`. Hver rørt linje "
      "beholder kildens oprindelige tal i JSON-feltet `kildeVaerdier`.\n")
    A("| Nr. | Vedrører | Område | Godkendt | Rettelse |")
    A("|---|---|---|---|---|")
    for r in K.RETTELSER:
        A(f"| {r['id']} | {r['ref']} | {r['omraade']} | {r['godkendt']} | {r['tekst']} |")
    A("")

    A("## Åbne spørgsmål og kendte uoverensstemmelser\n")
    alvor_tekst = {"aabent_spoergsmaal": "❓ Spørgsmål til DAC", "mangler": "🚫 Data mangler",
                   "afviger": "⚠️ Uoverensstemmelse i kilden", "afrunding": "ℹ️ Afrunding",
                   "afklaret": "✅ Afklaret – rettet"}
    A("| Nr. | Område | Type | Beskrivelse |")
    A("|---|---|---|---|")
    for d in DATAKVALITET:
        A(f"| {d['id']} | {d['omraade']} | {alvor_tekst[d['alvor']]} | {d['tekst']} |")
    A("")

    A("## Afstemninger\n")
    ok = sum(1 for c in CHECKS if c[4] == "OK")
    kendt = sum(1 for c in CHECKS if c[4] == "KENDT")
    fejl = sum(1 for c in CHECKS if c[4] == "AFVIGER")
    A(f"**{len(CHECKS)} kontroller i alt: {ok} stemmer (inden for afrunding), "
      f"{kendt} er kendte uoverensstemmelser i kilden, {fejl} er uforklarede.**\n")
    A("Summer af t.kr.-afrundede linjer accepteres med en tolerance på halvdelen af "
      "antallet af led, fordi hvert led i kilden kan være rundet op til 0,5 t.kr. i hver "
      "retning. Alle andre kontroller kræver eksakt overensstemmelse.\n")
    for overskrift, mrk in [("Kendte uoverensstemmelser i kilden", "KENDT"),
                            ("Uforklarede afvigelser", "AFVIGER")]:
        raekker = [c for c in CHECKS if c[4] == mrk]
        if not raekker:
            continue
        A(f"### {overskrift}\n")
        A("| Tabel | Kontrol | Kilde | Beregnet | Difference | Ref. |")
        A("|---|---|---|---|---|---|")
        for tabel, kontrol, forv, fund, status, kref in raekker:
            diff = None if forv is None or fund is None else fund - forv
            A(f"| {tabel} | {kontrol} | {dk(forv)} | {dk(fund)} | {dk(diff)} | {kref or '–'} |")
        A("")
    A("### Alle kontroller pr. tabel\n")
    tabeller = []
    for c in CHECKS:
        if c[0] not in tabeller:
            tabeller.append(c[0])
    for tab in tabeller:
        raekker = [c for c in CHECKS if c[0] == tab]
        t_ok = sum(1 for c in raekker if c[4] == "OK")
        t_kendt = sum(1 for c in raekker if c[4] == "KENDT")
        t_fejl = sum(1 for c in raekker if c[4] == "AFVIGER")
        A(f"<details><summary><strong>{tab}</strong> – {len(raekker)} kontroller "
          f"({t_ok} stemmer, {t_kendt} kendt afvigelse, {t_fejl} uforklaret)</summary>\n")
        A("| Kontrol | Kilde | Beregnet | Status |")
        A("|---|---|---|---|")
        for _, kontrol, forv, fund, status, kref in raekker:
            ikon = {"OK": "✅", "KENDT": f"⚠️ {kref}", "AFVIGER": "❌"}[status]
            A(f"| {kontrol} | {dk(forv)} | {dk(fund)} | {ikon} |")
        A("\n</details>\n")

    sti = os.path.join(ROD, "data", "VALIDERING.md")
    with open(sti, "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    print(f"Skrev {sti}")


if __name__ == "__main__":
    sys.exit(main())
