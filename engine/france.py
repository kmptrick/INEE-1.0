"""Calculs fiscaux — France (barème 2025, revenus 2024).

Couvre : impôt sur le revenu (quotient familial + plafonnement + décote),
PFU/flat tax, impôt sur les sociétés, cotisations micro-entrepreneur.
"""

from __future__ import annotations

from .core import round2, round4, tax_from_brackets
from .loader import load_country

_D = lambda: load_country("FR")  # noqa: E731


# --------------------------------------------------------------------------- #
# Impôt sur le revenu
# --------------------------------------------------------------------------- #
def impot_revenu(revenu_imposable: float, parts: float = 1.0,
                 couple: bool = False) -> dict:
    """Impôt sur le revenu d'un foyer.

    Args:
        revenu_imposable: revenu net imposable du foyer (€).
        parts: nombre de parts de quotient familial.
        couple: True si imposition commune (2 parts de base), sinon 1.

    Returns:
        dict avec impôt brut, plafonnement appliqué, décote et impôt net.
    """
    ir = _D()["personnes_physiques"]["impot_revenu"]
    tranches = ir["tranches"]
    base_parts = 2.0 if couple else 1.0

    # Impôt réel avec le quotient familial complet
    impot_reel = tax_from_brackets(revenu_imposable / parts, tranches) * parts

    # Plafonnement de l'avantage des demi-parts additionnelles
    plafonnement = 0.0
    if parts > base_parts:
        impot_base = tax_from_brackets(revenu_imposable / base_parts, tranches) * base_parts
        avantage = impot_base - impot_reel
        nb_demi_parts = (parts - base_parts) / 0.5
        plafond = nb_demi_parts * ir["plafond_demi_part"]
        if avantage > plafond:
            impot_reel = impot_base - plafond
            plafonnement = avantage - plafond

    # Décote
    dec = ir["decote"]
    seuil = dec["seuil_impot_couple"] if couple else dec["seuil_impot_seul"]
    montant = dec["montant_couple"] if couple else dec["montant_seul"]
    decote = 0.0
    if impot_reel < seuil:
        decote = max(0.0, montant - dec["taux"] * impot_reel)

    impot_net = max(0.0, impot_reel - decote)
    return {
        "impot_avant_decote": round2(impot_reel),
        "plafonnement_applique": round2(plafonnement),
        "decote": round2(decote),
        "impot_net": round2(impot_net),
        "taux_moyen": round4(impot_net / revenu_imposable) if revenu_imposable else 0.0,
    }


# --------------------------------------------------------------------------- #
# Fiscalité du capital
# --------------------------------------------------------------------------- #
def pfu(montant: float, annee: int = 2025) -> dict:
    """Prélèvement forfaitaire unique (flat tax) sur dividendes/plus-values."""
    p = _D()["personnes_physiques"]["pfu_flat_tax"]
    taux = p["taux_total_2026"] if annee >= 2026 else p["taux_total"]
    impot = montant * taux
    return {"taux": taux, "impot": round2(impot), "net": round2(montant - impot)}


# --------------------------------------------------------------------------- #
# Sociétés
# --------------------------------------------------------------------------- #
def impot_societes(benefice: float, taux_reduit_eligible: bool = True) -> dict:
    """Impôt sur les sociétés (IS)."""
    s = _D()["societes"]["is"]
    plafond = s["plafond_taux_reduit"]
    if taux_reduit_eligible and benefice > 0:
        part_reduite = min(benefice, plafond)
        part_normale = max(0.0, benefice - plafond)
        impot = part_reduite * s["taux_reduit"] + part_normale * s["taux_normal"]
    else:
        impot = benefice * s["taux_normal"]
    return {"impot": round2(impot), "taux_effectif": round4(impot / benefice) if benefice else 0.0}


# --------------------------------------------------------------------------- #
# Indépendants — micro-entrepreneur
# --------------------------------------------------------------------------- #
def micro_entrepreneur(ca: float, activite: str = "services_bic",
                       versement_liberatoire: bool = False) -> dict:
    """Cotisations sociales et (option) versement libératoire d'un micro.

    activite ∈ {"vente_bic", "services_bic", "bnc_hors_cipav", "liberal_cipav"}
    """
    m = _D()["independants"]["micro_entrepreneur"]
    taux_cot = m["cotisations_urssaf"][activite]
    cotisations = ca * taux_cot
    out = {"cotisations_sociales": round2(cotisations)}

    if versement_liberatoire:
        vl = m["versement_liberatoire"]
        key = {"vente_bic": "vente", "services_bic": "services_bic"}.get(activite, "bnc")
        out["versement_liberatoire_ir"] = round2(ca * vl[key])

    ab = m["abattement_forfaitaire_benefice"]
    key_ab = {"vente_bic": "vente", "services_bic": "services_bic"}.get(activite, "bnc")
    out["benefice_imposable"] = round2(ca * (1 - ab[key_ab]))
    return out
