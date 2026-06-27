"""Calculs fiscaux — Belgique (revenus 2025 / EI 2026).

Couvre : IPP (barème + quotité exemptée + additionnels communaux),
cotisations sociales indépendant, ISOC.
"""

from __future__ import annotations

from .core import round2, round4, tax_from_brackets
from .loader import load_country

_D = lambda: load_country("BE")  # noqa: E731


def ipp(revenu_imposable: float, taux_communal: float = 0.0) -> dict:
    """Impôt des personnes physiques.

    Args:
        revenu_imposable: revenu imposable (€).
        taux_communal: taux des additionnels communaux (ex. 0.08 pour 8 %).
    """
    p = _D()["personnes_physiques"]["impot_revenu_ipp"]
    impot_bareme = tax_from_brackets(revenu_imposable, p["tranches"])

    # Quotité exemptée : exonérée au taux de base (1re tranche)
    taux_base = p["tranches"][0]["taux"]
    reduction_quotite = p["quotite_exemptee_base"] * taux_base
    impot_apres_quotite = max(0.0, impot_bareme - reduction_quotite)

    additionnels = impot_apres_quotite * taux_communal
    total = impot_apres_quotite + additionnels
    return {
        "impot_bareme": round2(impot_bareme),
        "reduction_quotite": round2(reduction_quotite),
        "impot_apres_quotite": round2(impot_apres_quotite),
        "additionnels_communaux": round2(additionnels),
        "impot_total": round2(total),
    }


def cotisations_independant(revenu_net: float) -> dict:
    """Cotisations sociales INASTI (titre principal), par paliers."""
    paliers = _D()["independants"]["cotisations_inasti"]["paliers"]
    cot = tax_from_brackets(revenu_net, paliers)
    return {
        "cotisations_annuelles": round2(cot),
        "cotisations_trimestrielles": round2(cot / 4),
    }


def impot_societes(benefice: float, pme_taux_reduit: bool = True) -> dict:
    """Impôt des sociétés (ISOC)."""
    s = _D()["societes"]["isoc"]
    plafond = s["plafond_taux_reduit"]
    if pme_taux_reduit and benefice > 0:
        part_reduite = min(benefice, plafond)
        part_normale = max(0.0, benefice - plafond)
        impot = part_reduite * s["taux_reduit"] + part_normale * s["taux_normal"]
    else:
        impot = benefice * s["taux_normal"]
    return {"impot": round2(impot), "taux_effectif": round4(impot / benefice) if benefice else 0.0}
