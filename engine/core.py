"""Primitives de calcul partagées par tous les pays."""

from __future__ import annotations

from typing import Iterable, Mapping

Bracket = Mapping[str, object]  # {"min": float, "max": float|None, "taux": float}


def tax_from_brackets(base: float, brackets: Iterable[Bracket]) -> float:
    """Impôt selon un barème **marginal** (chaque tranche taxée à son taux).

    Chaque tranche est un dict ``{"min", "max", "taux"}`` ; ``max == None``
    signifie tranche supérieure illimitée.
    """
    total = 0.0
    for b in brackets:
        lo = float(b["min"])
        hi = b["max"]
        hi = float("inf") if hi is None else float(hi)
        if base > lo:
            total += (min(base, hi) - lo) * float(b["taux"])
    return total


def marginal_rate(base: float, brackets: Iterable[Bracket]) -> float:
    """Taux marginal applicable à ``base``."""
    rate = 0.0
    for b in brackets:
        lo = float(b["min"])
        hi = b["max"]
        hi = float("inf") if hi is None else float(hi)
        if lo < base <= hi or (hi == float("inf") and base > lo):
            rate = float(b["taux"])
    return rate


def round2(x: float) -> float:
    """Arrondi à 2 décimales (centime)."""
    return round(x + 1e-9, 2)


def round4(x: float) -> float:
    """Arrondi à 4 décimales (pour les taux/ratios)."""
    return round(x + 1e-12, 4)
