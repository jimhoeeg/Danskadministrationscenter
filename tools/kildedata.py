# -*- coding: utf-8 -*-
"""
Rådata aflæst fra Nygårdsholm_Ejendomme_Ejendomsrapport.docx.

Hver konstant herunder svarer 1:1 til én tabel/graf i kildefilen.
Tallene er aflæst fra de indklippede Excel-tabeller (EMF/PNG), som er
rasteriseret via LibreOffice -> PDF -> pdftoppm. Kilde-reference står i
kommentaren over hver tabel og gentages i data/VALIDERING.md.

Ingen tal er beregnet i denne fil - alt er aflæst. Beregninger og
afstemninger sker i byg_data.py.
"""

KILDE = {
    "fil": "kilde/Nygårdsholm_Ejendomme_Ejendomsrapport.docx",
    "titel": "Nygårdsholm Ejendomme – overblik",
    "forfatter": "Peter N. Andersen",
    "metode": (
        "docx udpakket som zip. Brødtekst læst fra word/document.xml. "
        "Diagram 'Lejemål pr. by' læst direkte fra word/charts/chart1.xml. "
        "Øvrige tabeller er indklippede Excel-billeder (EMF/PNG) i word/media/, "
        "konverteret med LibreOffice til PDF og rasteriseret med pdftoppm ved 600 dpi."
    ),
}

# Hvilket billede hører til hvilken sektion (fra word/_rels/document.xml.rels)
BILLEDKILDER = {
    "resultatopgoerelse": "word/media/image1.emf (rId8) – side 1",
    "lejemaal_pr_by": "word/charts/chart1.xml (rId9) – side 1",
    "lejemaal": "word/media/image2.emf (rId10) – side 2",
    "vedligeholdelsesplan": "word/media/image3.emf (rId11) – side 3",
    "gi_indestaaender": "word/media/image4.emf (rId12) – side 3",
    "vaerdiansaettelse": "word/media/image5.emf (rId13) – side 4",
    "finansiering": "word/media/image6.emf (rId14) – side 4",
    "renteprofil": "word/media/image7.png (rId15) – side 4",
    "afdragsprofil": "word/media/image8.png (rId16) – side 5",
    "likviditetsbudget": "word/media/image9.emf (rId17) – side 5",
}

# Brødtekst, ordret fra word/document.xml
BROEDTEKST = {
    "drift": (
        "Driftsudgifter er på niveau med budget. Der er brugt 322 t.kr. mere på "
        "vedligehold end budgettet. Det skyldes primært periodisering."
    ),
    "lejemaal": (
        "Nygårdsholm Ejendomme har i alt 255 lejemål beliggende i Hobro, Randers, "
        "Århus og Skanderborg."
    ),
    "modernisering": (
        "Der er potentiale i en gennemgribende modernisering af §19.1 lejemålene, "
        "hvilket særlig knytter sig til lejemål i Århus og Skanderborg. Lejligheder i "
        "Skanderborg vedr. dog ny anskaffede ejendomme, der først kan §19.2 moderniseres "
        "efter 5 års ejerskab"
    ),
    "renteprofil": (
        "27% den samlede realkredit udgøres af 30 årige lån med fast rente. 48% er "
        "cibor 3 eller cibor 6 lån, og de resterende 25% er F5."
    ),
    "renterisiko_spoergsmaal": "Er det den ønskede renterisikoprofil?",
    "afdragsprofil": (
        "Der afdrages på 15% af realkreditten. Ultimo 2026 øges afdrags procent med 17, "
        "såfremt lånet i Dannebrogsgade ikke konverteres til nyt 30 årigt lån med "
        "indledende 10 års afdragsfrihed"
    ),
}

# ---------------------------------------------------------------------------
# Kanoniske ejendomme. Kildefilen staver ejendomsnavnene forskelligt i hver
# tabel; "kildenavne" viser præcis hvad der står hvor, så mapningen kan revideres.
# ---------------------------------------------------------------------------
EJENDOMME = [
    {"id": "hostrupvaenget-41", "navn": "Hostrupvænget 41-63", "by": "Hobro",
     "kildenavne": {"lejemaal": "Hostrupvænget 41-63", "vedligehold": "Hostrupvænget 41 m.fl.",
                    "gi": "Hostrupvænget 41 m.fl.", "vaerdi": "Hostrupvænget 41 m.fl.",
                    "finansiering": "Hostrupvænget 41 m.fl."}},
    {"id": "horsoevej-13", "navn": "Horsøvej 13", "by": "Hobro",
     "kildenavne": {"lejemaal": "Horsøvej 13", "vedligehold": "Horsøvej 13",
                    "gi": "Horsøvej 13", "vaerdi": "Horsøvej 13", "finansiering": "Horsøvej 13"}},
    {"id": "adelgade-4", "navn": "Adelgade 4", "by": "Randers",
     "kildenavne": {"lejemaal": "Adelgade 4", "vedligehold": "Adelgade 4", "gi": "Adelgade 4",
                    "vaerdi": "Adelgade 4", "finansiering": "Adelgade 4"}},
    {"id": "noerre-boulevard-74", "navn": "Nørre Boulevard 74 m.fl.", "by": "Randers",
     "kildenavne": {"lejemaal": "Nørre Boulevard 74 m.fl.", "vedligehold": "Nørre Blvd. 74 m.fl.",
                    "gi": "Nørre Blvd. 74 m.fl.", "vaerdi": "Nørre Blvd. 74 m.fl.",
                    "finansiering": "Nørre Blvd. 74 m.fl."}},
    {"id": "dannebrogsgade-12", "navn": "Dannebrogsgade 12 A-B / Lundingsgade 20", "by": "Århus",
     "kildenavne": {"lejemaal": "Dannebrogsgade 12 A-B/ Lundingsg… (afkortet i celle)",
                    "vedligehold": "Dannebrogsgade 12 mm", "gi": "Danneborsgade 12/ Lundingsgade 20",
                    "vaerdi": "Danneborsgade 12/ Lundingsgad… (afkortet i celle)",
                    "finansiering": "Danneborsgade 12/ Lundingsgade"}},
    {"id": "teglvaerksgade-6", "navn": "Teglværksgade 6", "by": "Århus",
     "kildenavne": {"lejemaal": "Teglværksgade 6", "vedligehold": "Teglværksgade 6",
                    "gi": "Teglværksgade 6", "vaerdi": "Teglværksgade 6",
                    "finansiering": "Teglværksgade 6"}},
    {"id": "adelgade-64", "navn": "Adelgade 64", "by": "Skanderborg",
     "kildenavne": {"lejemaal": "Adelgade 64", "vedligehold": "Adelgade 64", "gi": "Adelgade 64",
                    "vaerdi": "Adelgade 64", "finansiering": "Adelgade 64"}},
    {"id": "vestergade-25", "navn": "Vestergade 25 B-D", "by": "Skanderborg",
     "kildenavne": {"lejemaal": "Vestergade 25 B-D", "vedligehold": "Vestergade 5 BD (sic)",
                    "gi": "Vestergade 25B-D, st.", "vaerdi": "Vestergade 25B-D, st.",
                    "finansiering": "Vestergade 25"}},
    {"id": "vestre-ringgade-45", "navn": "Vestre Ringgade 45", "by": "Århus",
     "kildenavne": {"lejemaal": "Vestre Ringgade 45", "vedligehold": "Vestre Ringgade 45",
                    "gi": "Vestre Ringgade 45", "vaerdi": "Vestre Ringgade 45",
                    "finansiering": "Vestre Ringgade 45"}},
    {"id": "tietgens-plads-9", "navn": "Tietgens Plads 9", "by": "Århus",
     "kildenavne": {"lejemaal": "Tietgens Plads 9", "vedligehold": "Tietgens Plads 9",
                    "gi": "Tietgens Plads 9", "vaerdi": "Tietgens Plads 9",
                    "finansiering": "Tietgens Plads 9"}},
    {"id": "blegdammen-9", "navn": "Blegdammen 9 / Møllestien 59", "by": "Århus",
     "kildenavne": {"lejemaal": "Blegdammen 9 / Møllestien 59",
                    "vedligehold": "Blegdammen 59/Møllestien 59 (sic)",
                    "gi": "Blegdammen 9/ Møllestien 59", "vaerdi": "Blegdammen 9/ Møllestien 59",
                    "finansiering": "Blegdammen 9/Møllestien 59"}},
    {"id": "asylgade-21", "navn": "Asylgade 21-23", "by": "Skanderborg",
     "kildenavne": {"lejemaal": "Asylgade 21-23", "vedligehold": "Asylgade 21-23",
                    "gi": "Asylgade 21-23", "vaerdi": "Asylgade 21-23",
                    "finansiering": "Asylgade 21-23, Skanderborg"}},
]

# ---------------------------------------------------------------------------
# Lejemål pr. by, m2 – læst direkte fra word/charts/chart1.xml
# Diagramtitel: "Lejemål er beliggende i følgende byer, m2"
# ---------------------------------------------------------------------------
LEJEMAAL_PR_BY_M2 = {"Hobro": 4635, "Randers": 6904, "Århus": 4484, "Skanderborg": 1601}

# ---------------------------------------------------------------------------
# Lejemålstabel (image2.emf). Beløb i hele kroner, areal i m2.
# Kolonner pr. lejetype: (antal, m2, leje, leje_pr_m2). None = tom celle.
# "kaelder_pplads_leje" er kolonnen "kælder, p-plads mm." (lejebeløb, ingen m2).
# ---------------------------------------------------------------------------
LEJEMAAL = {
    #                        §19.1 omk.bestemt            §19.2 aftalt/fri leje          små huse                  erhverv                     kælder   i alt
    "hostrupvaenget-41":  {"19_1": (None, None, None, None), "19_2": (57, 4395, 3125515, 711),  "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (57, 4395, 3125515, 711)},
    "horsoevej-13":       {"19_1": (None, None, None, None), "19_2": (None,None,None,None),     "smaa_huse": (4, 240, 231705, 965), "erhverv": (1, None, 5400, None),    "kaelder_pplads_leje": None, "ialt": (5, 240, 237105, 988)},
    "adelgade-4":         {"19_1": (None, None, None, None), "19_2": (10, 880, 694593, 789),    "smaa_huse": (None,None,None,None), "erhverv": (2, 188, 146657, 780),   "kaelder_pplads_leje": None, "ialt": (12, 1068, 841250, 788)},
    "noerre-boulevard-74":{"19_1": (82, 5263, 3905306, 742), "19_2": (8, 528, 444930, 843),     "smaa_huse": (None,None,None,None), "erhverv": (1, 45, 38768, 862),     "kaelder_pplads_leje": 5487, "ialt": (91, 5836, 4394491, 753)},
    "dannebrogsgade-12":  {"19_1": (5, 325, 280202, 862),    "19_2": (19, 1184, 1691874, 1429), "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (24, 1509, 1972076, 1307)},
    "teglvaerksgade-6":   {"19_1": (1, 52, 35401, 681),      "19_2": (11, 674, 1024482, 1520),  "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (12, 726, 1059883, 1460)},
    "adelgade-64":        {"19_1": (None, None, None, None), "19_2": (None,None,None,None),     "smaa_huse": (None,None,None,None), "erhverv": (1, 216, 87492, 405),    "kaelder_pplads_leje": None, "ialt": (1, 216, 87492, 405)},
    "vestergade-25":      {"19_1": (None, None, None, None), "19_2": (3, 293, 322001, 1099),    "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (3, 293, 322001, 1099)},
    "vestre-ringgade-45": {"19_1": (None, None, None, None), "19_2": (9, 557, 785099, 1410),    "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (9, 557, 785099, 1410)},
    "tietgens-plads-9":   {"19_1": (1, 82, 67616, 825),      "19_2": (10, 789, 1209187, 1533),  "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (11, 871, 1276803, 1466)},
    "blegdammen-9":       {"19_1": (None, None, None, None), "19_2": (12, 821, 1162136, 1416),  "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (12, 821, 1162136, 1416)},
    "asylgade-21":        {"19_1": (3, 266, 194848, 733),    "19_2": (15, 826, 983991, 1191),   "smaa_huse": (None,None,None,None), "erhverv": (None,None,None,None),   "kaelder_pplads_leje": None, "ialt": (18, 1092, 1178839, 1080)},
}
# Sumrække "I alt" som den står i kilden
LEJEMAAL_IALT_KILDE = {
    "19_1": (92, 5988, 4483373, 749),
    "19_2": (154, 10947, 11443808, 1045),
    "smaa_huse": (4, 240, 231705, 965),
    "erhverv": (5, 449, 278317, 620),
    "kaelder_pplads_leje": 5487,
    "ialt": (255, 17624, 16442690, 933),
}

# ---------------------------------------------------------------------------
# Værdiansættelse (image5.emf). Beløb i hele kroner.
# (energimaerke, antal_lejemaal, areal_bolig, areal_erhverv, areal_ialt,
#  indtaegter, nettoleje, vaerdi, vaerdi_pr_m2, afkast_kilde_pct)
# "%" i energimærke-kolonnen = ingen værdi i kilden.
# ---------------------------------------------------------------------------
VAERDIANSAETTELSE = {
    "hostrupvaenget-41":  ("C",     57, 4395,   0, 4395, 3125717, 1870617, 31246146,  7109, 6.1),
    "horsoevej-13":       ("D",      5,  240,   0,  240,  236393,  145624,  2201176,  9172, 6.8),
    "adelgade-4":         ("D",     12,  880, 188, 1068,  852370,  488416, 11501978, 10770, 4.3),
    "noerre-boulevard-74":("B/C/D", 91, 5791,  45, 5836, 4209481, 2439098, 56982619,  9764, 4.4),
    "dannebrogsgade-12":  ("C",     24, 1509,   0, 1509, 2001118, 1404398, 37579518, 24904, 3.8),
    "teglvaerksgade-6":   ("C",     12,  726,   0,  726, 1077255,  830800, 22901246, 31544, 3.7),
    "adelgade-64":        (None,     1,    0, 216,  216,   87492,   41352,   714906,  3310, 6.2),
    "vestergade-25":      ("B",      3,  293,   0,  293,  337001,  226375,  4990791, 17033, 4.6),
    "vestre-ringgade-45": ("C",      9,  557,   0,  557,  782021,  570785, 14738049, 26460, 4.0),
    "tietgens-plads-9":   ("C",     11,  871,   0,  871, 1281967, 1009787, 28718018, 32971, 3.6),
    "blegdammen-9":       ("C",     13,  821,   0,  821, 1128136,  812588, 23648842, 28805, 3.5),
    "asylgade-21":        ("C",     18, 1092,   0, 1092, 1186839,  877479, 18250000, 16712, 4.9),
}
VAERDIANSAETTELSE_IALT_KILDE = {
    "antal_lejemaal": 256, "areal_bolig": 17175, "areal_erhverv": 449, "areal_ialt": 17624,
    "indtaegter": 16305790, "nettoleje": 10717319, "vaerdi": 253473288,
    "vaerdi_pr_m2": 14382, "afkast_pct": 4.3,
}

# ---------------------------------------------------------------------------
# Finansiering pr. 30.04.2026 (image6.emf). Beløb i hele kroner.
# (laangiver_kode, bogfoert_vaerdi, realkreditgaeld, gaeld_pct_kilde,
#  kursvaerdi, kursvaerdi_pct_kilde, rente_pct)
# None = tom celle i kilden.
# ---------------------------------------------------------------------------
FINANSIERING = {
    "hostrupvaenget-41":  ("JR", 31246146, 15800410, 51, 11702285, 37, 1.5),
    "horsoevej-13":       ("JR",  2201176,  1293480, 59,   957992, 44, 1.5),
    "adelgade-4":         ("JR", 11501978,  6179686, 54,  4576872, 40, 1.5),
    "noerre-boulevard-74":("JR", 56982619, 35122545, 62, 35332578, 62, 3.0),
    "dannebrogsgade-12":  ("JR", 37579518, 26323954, 70, 26425564, 70, 3.1),
    "teglvaerksgade-6":   ("RD", 22901246, 11477000, 50, 10609079, 46, 1.8),
    "adelgade-64":        (None,   714906,     None, None,    None, None, None),
    "vestergade-25":      ("RD",  4990791,  3104000, 62,  3119021, 62, 3.8),
    "vestre-ringgade-45": ("RD", 14738049,  9191000, 62,  9235478, 63, 3.8),
    "tietgens-plads-9":   ("RD", 28718018, 18382786, 64, 14224065, 50, 1.6),
    "blegdammen-9":       ("RD", 23648842, 15139000, 64, 14303845, 60, 2.9),
    "asylgade-21":        ("JR", 18250000, 13000000, 71, 13097171, 72, None),
}
FINANSIERING_IALT_KILDE = {
    "bogfoert_vaerdi": 253473288, "realkreditgaeld": 155013861, "gaeld_pct": 61,
    "kursvaerdi": 143583950, "kursvaerdi_pct": 57,
}

# ---------------------------------------------------------------------------
# Renteprofil pr. 30. april 2026 (image7.png, cirkeldiagram)
# (label, andel_pct, kategori)
# ---------------------------------------------------------------------------
RENTEPROFIL = [
    ("Obl. 0,5%", 21, "fast"),
    ("Obl. 1,0%",  6, "fast"),
    ("Obl. 1,5%",  0, "fast"),
    ("Obl. 2,0%",  0, "fast"),
    ("Obl. 0%",    0, "fast"),
    ("Cibor 3",   41, "variabel"),
    ("Cibor 6",    7, "variabel"),
    ("F5",        25, "rentetilpasning_kort"),
    ("Andet",      0, "ukendt"),
]

# ---------------------------------------------------------------------------
# Afdragsprofil pr. 30. april 2026 (image8.png, cirkeldiagram)
# (label, andel_pct) – "Afdrages nu" = den del der afdrages i dag,
# årstal = det år afdrag på den pågældende andel starter.
# ---------------------------------------------------------------------------
AFDRAGSPROFIL = [
    ("Afdrages nu", 15), ("2026", 17), ("2027", 0), ("2028", 23), ("2029", 13),
    ("2030", 0), ("2031", 0), ("2032", 9), ("2033", 15), ("2034", 0),
    ("2035", 0), ("2036", 8),
]

# ---------------------------------------------------------------------------
# Profit & Loss 26/27 (image1.emf). Alle tal i t.kr. (kildens egen enhed "i tDKK").
# Rækkeformat:
#   (id, navn, type, gruppe,
#    [aug_25_26_real, aug_26_27_budget, aug_26_27_real, aug_afvigelse],
#    [ytd_25_26_real, ytd_26_27_budget, ytd_26_27_real, ytd_afvigelse],
#    [aar_25_26_real, aar_26_27_budget, aar_26_27_estimat])
# type: "post" | "subtotal" | "resultat"
# ---------------------------------------------------------------------------
RESULTATOPGOERELSE = [
    ("beboelse_omkostningsbestemt", "Beboelse omkostningsbestemt", "post", "indtaegter",
     [381, 381, 380, -2], [1525, 1525, 1519, -6], [4579, 4579, 4573]),
    ("beboelse_aftalt_leje", "Beboelse aftalt leje", "post", "indtaegter",
     [882, 978, 986, 8], [3541, 3928, 3949, 21], [10752, 11814, 11835]),
    ("erhverv", "Erhverv", "post", "indtaegter",
     [14, 14, 14, 0], [58, 58, 75, 17], [226, 226, 243]),
    ("oevrige_indtaegter", "Øvrige", "post", "indtaegter",
     [17, 17, 17, 1], [80, 80, 60, -21], [247, 237, 216]),
    ("lejeindtaegter_brutto", "Lejeindtægter brutto", "subtotal", "indtaegter",
     [1293, 1390, 1398, 8], [5206, 5592, 5604, 11], [15803, 16855, 16866]),
    ("lejetab", "Lejetab", "post", "indtaegter",
     [-31, -25, -39, -14], [-123, -114, -124, -10], [-357, -333, -343]),
    ("lejeindtaegter", "Lejeindtægter", "subtotal", "indtaegter",
     [1263, 1365, 1359, -7], [5083, 5478, 5480, 1], [15447, 16522, 16524]),
    ("ejendomsskatter", "Ejendomsskatter", "post", "drift",
     [0, 0, 0, 0], [-95, -97, -98, -1], [-532, -377, -378]),
    ("vand", "Vand, vandafgift", "post", "drift",
     [0, -1, 0, 1], [0, -2, 0, 2], [0, -6, -4]),
    ("renovation", "Renovation", "post", "drift",
     [-142, -143, -125, 19], [-150, -176, -146, 31], [-638, -676, -646]),
    ("ejendomsforsikringer", "Ejendomsforsikringer", "post", "drift",
     [0, 0, 0, 0], [0, 0, 0, 0], [-279, -263, -263]),
    ("vicevaert", "Vicevært, trappevask", "post", "drift",
     [-9, -135, -183, -47], [-36, -538, -544, -6], [-862, -1613, -1620]),
    ("ejendomsadministration", "Ejendomsadministration", "post", "drift",
     [0, -12, -15, -3], [0, -48, -60, -12], [-60, -144, -156]),
    ("varmeregnskab", "Varmeregnskab", "post", "drift",
     [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0]),
    ("oevrige_driftsudgifter", "Øvrige driftsudgifter", "post", "drift",
     [-23, -16, -24, -8], [-153, -164, -146, 18], [-771, -741, -723]),
    ("driftsudgifter_ialt", "Driftsudgifter i alt", "subtotal", "drift",
     [-175, -307, -346, -39], [-435, -1025, -993, 32], [-3143, -3821, -3789]),
    ("netto_leje_foer_vedligehold", "Netto leje før vedligehold", "subtotal", "drift",
     [1088, 1058, 1012, -46], [4648, 4453, 4486, 33], [12304, 12702, 12735]),
    ("vedligehold", "Vedligehold", "post", "vedligehold",
     [-303, -121, -163, -42], [-861, -539, -860, -322], [-2473, -3259, -3581]),
    ("planlagt_vedligehold", "Planlagt vedligehold", "post", "vedligehold",
     [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0]),
    ("netto_leje", "Netto leje", "subtotal", "vedligehold",
     [785, 937, 850, -87], [3787, 3915, 3626, -289], [9830, 9443, 9154]),
    ("reklame", "Reklame m.m.", "post", "administration",
     [0, 0, 0, 0], [-2, 0, -2, -2], [-55, -50, -52]),
    ("oevrige_adm_omk", "Øvrige adm omk", "post", "administration",
     [-10, -82, -97, -15], [-49, -333, -768, -435], [-1184, -1211, -1646]),
    ("ebitda", "EBITDA-resultat før renter og afskr.", "subtotal", "resultat",
     [775, 855, 753, -102], [3737, 3582, 2856, -725], [8591, 8181, 7457]),
    ("afskrivninger", "Afskrivninger", "post", "resultat",
     [0, 0, 0, 0], [0, 0, 0, 0], [-10, 0, 0]),
    ("ebit", "EBIT-resultat før renter", "subtotal", "resultat",
     [775, 855, 753, -102], [3737, 3582, 2856, -725], [8581, 8181, 7457]),
    ("prioritetsrenter", "Prioritetsrenter", "post", "finansiering",
     [-145, -121, -116, 6], [-1085, -1223, -1153, 70], [-3591, -4392, -4322]),
    ("oevrige_renter", "Øvrige renter m.m.", "post", "finansiering",
     [0, 0, 0, 0], [1, 0, -28, -28], [-507, -18, -46]),
    ("vaerdiregulering_ejendom", "Værdiregulering ejendom", "post", "finansiering",
     [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0]),
    ("tab_gevinst_salg", "Tab/Gevinst ved salg af ejendom", "post", "finansiering",
     [0, 0, 0, 0], [0, 0, 286, 286], [0, 0, 286]),
    ("resultat_foer_skat", "Resultat før skat", "resultat", "resultat",
     [631, 733, 637, -96], [2652, 2359, 1961, -398], [4483, 3771, 3375]),
]
# Kildens egen stavemåde af to rækker, gengivet her for sporbarhed:
RESULTATOPGOERELSE_KILDESTAVNING = {
    "planlagt_vedligehold": "Plalagt vedligehold",
    "ebitda": "EBITDA-resultat før renter og afskr.",
}

# ---------------------------------------------------------------------------
# Vedligeholdelsesplan (image3.emf). Beløb i hele kroner.
# OBS: Kildens kolonneoverskrifter er "2026/27, 2027/28, 2028/29, 2028/29,
# 2030/31, 2031/32, 2032/33, 2033/34" – dvs. 2028/29 optræder to gange og
# 2029/30 mangler. Se VALIDERING.md, åbent spørgsmål Å1.
# ---------------------------------------------------------------------------
VEDLIGEHOLD_AAR_KILDE = ["2026/27", "2027/28", "2028/29", "2028/29",
                         "2030/31", "2031/32", "2032/33", "2033/34"]
VEDLIGEHOLD_AAR_NORMALISERET = ["2026/27", "2027/28", "2028/29", "2029/30",
                                "2030/31", "2031/32", "2032/33", "2033/34"]
# (ejendom_id, kategori, beskrivelse, aar_indeks, beloeb)
VEDLIGEHOLDSPROJEKTER = [
    ("hostrupvaenget-41", "Vinduer", "Nye træ/alu vinduer mod vest. Forventet forbedringsandel: 50%", 0, 1700000),
    ("hostrupvaenget-41", "Vinduer", "Nye træ/alu vinduer mod øst/nord. Forventet forbedringsandel: 50%", 1, 1300000),
    ("hostrupvaenget-41", "Façade", "Nye murstensoverligger mod øst", 1, 250000),
    ("hostrupvaenget-41", "Tag", "Ståltag (Decra) med eternit nedenunder. Tagrende og nedløb i zink", 4, 400000),
    ("horsoevej-13", "Vinduer", "Plastvinduer fra 2005", 5, 150000),
    ("adelgade-4", "Façade", "Udvendig trappe på bagfacade skal total renoveres", 1, 150000),
    ("noerre-boulevard-74", "Façade", "Udført med isolering og facepuds. Skal gennemgås", 2, 200000),
    ("dannebrogsgade-12", "Tag", "Skifertag mod gade skal skiftes og kviste gennemgås", 2, 500000),
    ("dannebrogsgade-12", "Tag", "Skifertag mod gade skal skiftes og kviste gennemgås", 3, 2000000),
    ("teglvaerksgade-6", "Vinduer", "Vinduer fra 2011 skal males", 4, 200000),
    ("adelgade-64", "Tag", "Tag mod gården er nedslidt eternit tag - skal skiftes", 5, 100000),
    ("vestergade-25", "Tag", "Tag er belagt med tagpap - skal udskiftes", 7, 150000),
    ("vestre-ringgade-45", "Opgang", "Nyt dørtelefonanlæg", 0, 100000),
    ("vestre-ringgade-45", "Vinduer", "Vinduer er 30 år gamle og skal enten males eller udskiftes", 2, 700000),
    ("tietgens-plads-9", "Vinduer", "Trævinduer ca 20 år gamle - skal males", 5, 250000),
    ("blegdammen-9", "Faldstammer", "Er af ældre dato - skal udskiftes", 6, 200000),
    ("asylgade-21", "Gård", "Der skal etableres udvendige cykelskur med opladning", 4, 200000),
]
VEDLIGEHOLD_IALT_KILDE = [1800000, 1700000, 1400000, 2000000, 800000, 500000, 200000, 150000]

# ---------------------------------------------------------------------------
# Grundejernes Investeringsfond (image4.emf). Beløb i hele kroner.
# (saldo_2026_119, saldo_2026_120, hensaettelse_119_kr_pr_m2,
#  hensaettelse_120_kr_pr_m2, aarets_uplanlagte_vedligehold,
#  planlagt_vedligehold, saldo_2027_119, saldo_2027_120)
# None = cellen viser "%" i kilden (ejendommen er ikke indberetningspligtig).
# ---------------------------------------------------------------------------
GI_INDESTAAENDER = {
    "hostrupvaenget-41":  (None, None, 0, 0, 351600, 1700000, 0, 0),
    "horsoevej-13":       (None, None, 0, 0, 19200, 0, 0, 0),
    "adelgade-4":         (None, None, 0, 0, 106800, 0, 0, 0),
    "noerre-boulevard-74":(0, -4978419, 96, 88, 466880, 0, 93376, -4464851),
    "dannebrogsgade-12":  (0, -2039367, 101, 92, 120720, 0, 31689, -1900539),
    "teglvaerksgade-6":   (0, -1135051, 105, 96, 58080, 0, 18150, -1065355),
    "adelgade-64":        (None, None, 0, 0, 8640, 0, 0, 0),
    "vestergade-25":      (None, None, 0, 0, 17580, 0, 0, 0),
    "vestre-ringgade-45": (82849, 225866, 107, 99, 44560, 100000, -2112, 281009),
    "tietgens-plads-9":   (0, -492171, 109, 100, 69680, 0, 25259, -405071),
    "blegdammen-9":       (0, -2674850, 106, 98, 65680, 0, 21346, -2594392),
    "asylgade-21":        (0, -438679, 92, 108, 87360, 0, 13104, -328951),
}
GI_IALT_KILDE = {"aarets_uplanlagte_vedligehold": 1416780, "planlagt_vedligehold": 1800000}

# ---------------------------------------------------------------------------
# Likviditetsbudget 2026/27 - 2035/36 (image9.emf). Beløb i hele kroner.
# ---------------------------------------------------------------------------
LIKVIDITET_AAR = ["2026/27", "2027/28", "2028/29", "2029/30", "2030/31",
                  "2031/32", "2032/33", "2033/34", "2034/35", "2035/36"]
# (id, navn, gruppe, type, regulering_pct, [10 årsværdier])
LIKVIDITETSBUDGET = [
    ("beboelse_omkostningsbestemt", "Beboelse omkostningsbestemt", "indtaegter", "post", 2.0,
     [4579000, 4670580, 4763992, 4859271, 4956457, 5055586, 5156698, 5259832, 5365028, 5472329]),
    ("beboelse_aftalt_leje", "Beboelse aftalt leje", "indtaegter", "post", 2.0,
     [11814000, 12050280, 12291286, 12537111, 12787854, 13043611, 13304483, 13570572, 13841984, 14118824]),
    ("erhverv", "Erhverv", "indtaegter", "post", 2.0,
     [226000, 230520, 235130, 239833, 244630, 249522, 254513, 259603, 264795, 270091]),
    ("oevrige_indtaegter", "Øvrige", "indtaegter", "post", 2.0,
     [237000, 241740, 246575, 251506, 256536, 261667, 266900, 272239, 277683, 283237]),
    ("lejetab", "Lejetab", "indtaegter", "post", 2.0,
     [-333000, -339660, -346453, -353382, -360450, -367659, -375012, -382512, -390163, -397966]),
    ("indtaegter_ialt", "Indtægter i alt", "indtaegter", "subtotal", None,
     [16523000, 16853460, 17190529, 17534340, 17885027, 18242727, 18607582, 18979733, 19359328, 19746515]),
    ("ejendomsskatter", "Ejendomsskatter", "udgifter", "post", 2.0,
     [-377000, -384540, -392231, -400075, -408077, -416238, -424563, -433054, -441716, -450550]),
    ("vand", "Vand, vandafgift", "udgifter", "post", 2.0,
     [-6000, -6120, -6242, -6367, -6495, -6624, -6757, -6892, -7030, -7171]),
    ("renovation", "Renovation", "udgifter", "post", 2.0,
     [-676000, -689520, -703310, -717377, -731724, -746359, -761286, -776512, -792042, -807883]),
    ("ejendomsforsikringer", "Ejendomsforsikringer", "udgifter", "post", 2.0,
     [-63000, -64260, -65545, -66856, -68193, -69557, -70948, -72367, -73815, -75291]),
    ("vicevaert", "Vicevært, trappevask", "udgifter", "post", 2.0,
     [-1613000, -1645260, -1678165, -1711729, -1745963, -1780882, -1816500, -1852830, -1889887, -1927684]),
    ("ejendomsadministration", "Ejendomsadministration", "udgifter", "post", 2.0,
     [-144000, -146880, -149818, -152814, -155870, -158988, -162167, -165411, -168719, -172093]),
    ("varmeregnskab", "Varmeregnskab", "udgifter", "post", 2.0,
     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    ("oevrige_driftsudgifter", "Øvrige driftsudgifter", "udgifter", "post", 2.0,
     [-741000, -755820, -770936, -786355, -802082, -818124, -834486, -851176, -868200, -885564]),
    ("uplanlagt_vedligehold", "Uplanlagt vedligehold", "udgifter", "post", 2.0,
     [-1459000, -1488180, -1517944, -1548302, -1579269, -1610854, -1643071, -1675932, -1709451, -1743640]),
    ("planlagt_vedligehold", "Planlagt vedligehold", "udgifter", "post", None,
     [-1800000, -1700000, -1400000, -2000000, -800000, -500000, -200000, -150000, 0, 0]),
    ("driftsudgifter_ialt", "Driftsudgifter i alt", "udgifter", "subtotal", None,
     [-6879000, -6880580, -6684192, -7389875, -6297673, -6107626, -5919779, -5984175, -5950858, -6069875]),
    ("nettoleje", "Nettoleje", "resultat", "subtotal", None,
     [9644000, 9972880, 10506338, 10144464, 11587354, 12135101, 12687803, 12995559, 13408470, 13676639]),
    ("oevrige_adm_omkostninger", "Øvrige adm. omkostninger", "resultat", "post", 2.0,
     [-1261000, -1286220, -1311944, -1338183, -1364947, -1392246, -1420091, -1448493, -1477462, -1507012]),
    ("ebit", "EBIT", "resultat", "subtotal", None,
     [8383000, 8686660, 9194393, 8806281, 10222407, 10742855, 11267712, 11547066, 11931007, 12169628]),
    ("afskrivninger", "Afskrivninger", "resultat", "post", None,
     [-40000, -40000, -40000, -40000, -40000, -40000, -40000, -40000, -40000, -40000]),
    ("prioritetsrenter", "Prioritetsrenter", "resultat", "post", None,
     [-4392000, -4392000, -4392000, -4392000, -4392000, -4392000, -4392000, -4392000, -4392000, -4392000]),
    ("bankrenter", "Bankrenter mm", "resultat", "post", None,
     [200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000]),
    ("resultat_foer_skat", "Resultat før skat", "resultat", "subtotal", None,
     [4151000, 4454660, 4962393, 4574281, 5990407, 6510855, 7035712, 7315066, 7699007, 7937628]),
    ("skat", "Skat", "resultat", "post", 22.0,
     [913220, 980025, 1091727, 1006342, 1317889, 1432388, 1547857, 1609315, 1693782, 1746278]),
    ("resultat_efter_skat", "Resultat efter skat", "resultat", "subtotal", None,
     [3237780, 3474635, 3870667, 3567939, 4672517, 5078467, 5487855, 5705752, 6005226, 6191350]),
    ("afdrag_realkredit", "Afdrag realkredit", "resultat", "post", None,
     [-914000, -914000, -914000, -914000, -914000, -914000, -914000, -914000, -914000, -914000]),
    ("likviditet", "Likviditet", "resultat", "resultat", None,
     [2323780, 2560635, 2956667, 2653939, 3758517, 4164467, 4573855, 4791752, 5091226, 5277350]),
]
CASH_FLOW = [
    ("bank_primo", "Bank primo", "subtotal",
     [727000, 2924000, 4511440, 6539808, 8068363, 11098427, 14337393, 17986717, 21799926, 25935619]),
    ("resultat_efter_skat", "Resultat efter skat", "post",
     [3237780, 3474635, 3870667, 3567939, 4672517, 5078467, 5487855, 5705752, 6005226, 6191350]),
    ("udbytte", "Udbytte", "post",
     [-1000000, -1000000, -1000000, -1000000, -1000000, -1000000, -1000000, -1000000, -1000000, -1000000]),
    ("regulering_udskudt_skat", "Regulering udskudt skat", "post",
     [913220, 66805, 111701, -85385, 311548, 114499, 115469, 61458, 84467, 52496]),
    ("regulering_deposita", "Regulering deposita / forudbetalt husleje", "post",
     [-40000, -40000, -40000, -40000, -40000, -40000, -40000, -40000, -40000, -40000]),
    ("afdrag_realkreditlaan", "Afdrag realkreditlån", "post",
     [-914000, -914000, -914000, -914000, -914000, -914000, -914000, -914000, -914000, -914000]),
    ("bank_ultimo", "Bank ultimo", "resultat",
     [2924000, 4511440, 6539808, 8068363, 11098427, 14337393, 17986717, 21799926, 25935619, 30225465]),
]
