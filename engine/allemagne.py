"""Calculs fiscaux — Allemagne (année 2025).

Couvre : Einkommensteuer (formule progressive §32a EStG), splitting conjugal,
Solidaritätszuschlag, Abgeltungsteuer, imposition GmbH (KSt + Soli + GewSt).
"""

from __future__ import annotations

import math

from .core import round2, round4
from .loader import load_country

_D = lambda: load_country("DE")  # noqa: E731


def einkommensteuer(zve: float) -> int:
    """Impôt sur le revenu selon la formule §32a EStG 2025.

    Le revenu imposable (zvE) et l'impôt sont arrondis à l'euro inférieur,
    conformément à la loi.
    """
    x = math.floor(zve)
    g = _D()["personnes_physiques"]["impot_revenu_einkommensteuer"]
    gfb = g["grundfreibetrag"]          # 12 096
    seuil_42 = g["seuil_42pct"]         # 68 480
    seuil_45 = g["seuil_45pct_reichensteuer"]  # 277 826

    if x <= gfb:
        est = 0.0
    elif x <= 17443:
        y = (x - gfb) / 10000
        est = (932.30 * y + 1400) * y
    elif x <= seuil_42:
        z = (x - 17443) / 10000
        est = (176.64 * z + 2397) * z + 1015.13
    elif x < seuil_45:
        est = 0.42 * x - 10911.92
    else:
        est = 0.45 * x - 19246.67

    return math.floor(est)


def splitting(zve_couple: float) -> int:
    """Ehegattensplitting : 2 × impôt sur la moitié du revenu commun."""
    return 2 * einkommensteuer(zve_couple / 2)


def solidaritaetszuschlag(impot: float, couple: bool = False) -> float:
    """Solidaritätszuschlag (5,5 %) au-delà de la franchise (Freigrenze).

    Implémentation simplifiée (sans la zone d'atténuation) : 0 sous la
    franchise, 5,5 % au-delà.
    """
    s = _D()["personnes_physiques"]["solidaritaetszuschlag"]
    freigrenze = s["freigrenze_couple"] if couple else s["freigrenze_individuel"]
    if impot <= freigrenze:
        return 0.0
    return round2(impot * s["taux"])


def abgeltungsteuer(montant: float, couple: bool = False,
                    taux_kirchensteuer: float = 0.0) -> dict:
    """Impôt forfaitaire 25 % sur les revenus du capital.

    Args:
        montant: revenus du capital bruts (€).
        couple: True pour appliquer le Sparer-Pauschbetrag du couple.
        taux_kirchensteuer: 0.08 / 0.09 si assujetti, sinon 0.
    """
    a = _D()["personnes_physiques"]["abgeltungsteuer"]
    pausch = a["sparer_pauschbetrag_couple"] if couple else a["sparer_pauschbetrag"]
    imposable = max(0.0, montant - pausch)
    impot = imposable * a["taux"]
    soli = impot * 0.055
    kirche = impot * taux_kirchensteuer
    total = impot + soli + kirche
    return {
        "base_imposable": round2(imposable),
        "abgeltungsteuer": round2(impot),
        "soli": round2(soli),
        "kirchensteuer": round2(kirche),
        "impot_total": round2(total),
        "net": round2(montant - total),
    }


def gmbh(benefice: float, hebesatz: float = 4.0) -> dict:
    """Imposition d'une société de capitaux (GmbH/AG/UG).

    Args:
        benefice: bénéfice imposable (€).
        hebesatz: multiplicateur communal de Gewerbesteuer (ex. 4.0 = 400 %).
    """
    s = _D()["societes"]
    kst_cfg = s["koerperschaftsteuer"]
    gew_cfg = s["gewerbesteuer"]

    kst = benefice * kst_cfg["taux"]
    soli = kst * 0.055
    gewst = benefice * gew_cfg["steuermesszahl"] * hebesatz

    total = kst + soli + gewst
    return {
        "koerperschaftsteuer": round2(kst),
        "soli": round2(soli),
        "gewerbesteuer": round2(gewst),
        "charge_totale": round2(total),
        "taux_effectif": round4(total / benefice) if benefice else 0.0,
    }
