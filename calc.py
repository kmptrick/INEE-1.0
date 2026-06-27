#!/usr/bin/env python3
"""Démo en ligne de commande du moteur fiscal INEE2.0.

Exemples :
    python3 calc.py fr-ir 35000 --parts 1
    python3 calc.py fr-ir 60000 --parts 3 --couple
    python3 calc.py be-ipp 40000 --communal 0.08
    python3 calc.py lu-irpp 100000 --classe 2
    python3 calc.py de-est 50000
    python3 calc.py de-gmbh 100000 --hebesatz 4.9
"""

import argparse
import json

from engine import france, belgique, luxembourg, allemagne


def main() -> None:
    p = argparse.ArgumentParser(description="Moteur fiscal INEE2.0 (démo)")
    sub = p.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("fr-ir", help="France : impôt sur le revenu")
    a.add_argument("revenu", type=float)
    a.add_argument("--parts", type=float, default=1.0)
    a.add_argument("--couple", action="store_true")

    a = sub.add_parser("be-ipp", help="Belgique : IPP")
    a.add_argument("revenu", type=float)
    a.add_argument("--communal", type=float, default=0.0)

    a = sub.add_parser("lu-irpp", help="Luxembourg : IRPP")
    a.add_argument("revenu", type=float)
    a.add_argument("--classe", default="1")

    a = sub.add_parser("de-est", help="Allemagne : Einkommensteuer")
    a.add_argument("revenu", type=float)
    a.add_argument("--couple", action="store_true")

    a = sub.add_parser("de-gmbh", help="Allemagne : imposition GmbH")
    a.add_argument("benefice", type=float)
    a.add_argument("--hebesatz", type=float, default=4.0)

    args = p.parse_args()

    if args.cmd == "fr-ir":
        res = france.impot_revenu(args.revenu, parts=args.parts, couple=args.couple)
    elif args.cmd == "be-ipp":
        res = belgique.ipp(args.revenu, taux_communal=args.communal)
    elif args.cmd == "lu-irpp":
        res = luxembourg.irpp(args.revenu, classe=args.classe)
    elif args.cmd == "de-est":
        impot = allemagne.splitting(args.revenu) if args.couple else allemagne.einkommensteuer(args.revenu)
        res = {"einkommensteuer": impot,
               "soli": allemagne.solidaritaetszuschlag(impot, couple=args.couple)}
    elif args.cmd == "de-gmbh":
        res = allemagne.gmbh(args.benefice, hebesatz=args.hebesatz)

    print(json.dumps(res, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
