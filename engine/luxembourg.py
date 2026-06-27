"""Calculs fiscaux — Luxembourg (année d'imposition 2025).

Couvre : IRPP (classes 1/1a/2 avec splitting + fonds pour l'emploi),
IRC + impôt commercial communal (ICC).
"""

from __future__ import annotations

from .core import round2, round4, tax_from_brackets
from .loader import load_country

_D = lambda: load_country("LU")  # noqa: E731


def irpp(revenu_imposable: float, classe: str = "1") -> dict:
    """Impôt sur le revenu des personnes physiques.

    Args:
        revenu_imposable: revenu imposable (€).
        classe: "1", "1a" ou "2" (classe 2 = splitting des conjoints).
    """
    ir = _D()["personnes_physiques"]["impot_revenu_irpp"]
    tranches = ir["tranches"]

    if classe == "2":
        impot = tax_from_brackets(revenu_imposable / 2, tranches) * 2
    else:
        impot = tax_from_brackets(revenu_imposable, tranches)

    fe = ir["fonds_pour_emploi"]
    seuil = fe["seuil_classe_2"] if classe == "2" else fe["seuil_classe_1_1a"]
    taux_fe = fe["taux_eleve"] if revenu_imposable > seuil else fe["taux_general"]
    fonds = impot * taux_fe

    total = impot + fonds
    return {
        "impot_bareme": round2(impot),
        "fonds_pour_emploi": round2(fonds),
        "impot_total": round2(total),
        "taux_moyen": round4(total / revenu_imposable) if revenu_imposable else 0.0,
    }


def irc_icc(benefice: float, multiplicateur_communal: float | None = None) -> dict:
    """IRC + impôt commercial communal (ICC).

    Args:
        benefice: bénéfice imposable (€).
        multiplicateur_communal: multiplicateur ICC de la commune (ex. 2.25
            pour Luxembourg-Ville). Par défaut, Luxembourg-Ville.
    """
    s = _D()["societes"]
    irc_cfg = s["irc"]
    icc_cfg = s["icc"]

    if multiplicateur_communal is None:
        multiplicateur_communal = icc_cfg["multiplicateur_luxembourg_ville"]

    # IRC avec lissage de la tranche 175 000 – 200 001 €
    if benefice <= irc_cfg["taux_pme_plafond_benefice"]:
        irc = benefice * irc_cfg["taux_pme"]
    elif benefice > irc_cfg["seuil_taux_normal"]:
        irc = benefice * irc_cfg["taux_normal"]
    else:  # zone de lissage : 24 500 € + 30 % de la part > 175 000 €
        irc = 24500 + 0.30 * (benefice - irc_cfg["taux_pme_plafond_benefice"])

    fonds = irc * irc_cfg["fonds_pour_emploi"]
    icc = benefice * icc_cfg["taux_assiette"] * multiplicateur_communal

    total = irc + fonds + icc
    return {
        "irc": round2(irc),
        "fonds_pour_emploi": round2(fonds),
        "icc": round2(icc),
        "charge_totale": round2(total),
        "taux_global": round4(total / benefice) if benefice else 0.0,
    }
