"""Chargement des barèmes fiscaux depuis /data/fiscalite/*.json."""

from __future__ import annotations

import json
import os
from functools import lru_cache

# Racine du dépôt = dossier parent de /engine
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(_ROOT, "data", "fiscalite")

_FILES = {
    "FR": "fr-2025.json",
    "BE": "be-2025.json",
    "LU": "lu-2025.json",
    "DE": "de-2025.json",
}


@lru_cache(maxsize=None)
def load_country(code: str) -> dict:
    """Retourne le dict des barèmes pour un code pays (FR, BE, LU, DE)."""
    code = code.upper()
    if code not in _FILES:
        raise ValueError(f"Pays inconnu: {code!r} (attendu: {sorted(_FILES)})")
    path = os.path.join(DATA_DIR, _FILES[code])
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)
