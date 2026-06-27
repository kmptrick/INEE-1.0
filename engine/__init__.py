"""Moteur de calcul fiscal INEE2.0.

Calculs d'impôts pour la France, la Belgique, le Luxembourg et l'Allemagne,
fondés sur les barèmes versionnés de /data/fiscalite/*.json.

Implémentation de référence (Python, sans dépendance). Portable vers toute
autre stack — la logique métier est isolée dans des fonctions pures.
"""

from . import france, belgique, luxembourg, allemagne  # noqa: F401
from .loader import load_country, DATA_DIR  # noqa: F401

__all__ = ["france", "belgique", "luxembourg", "allemagne", "load_country", "DATA_DIR"]
