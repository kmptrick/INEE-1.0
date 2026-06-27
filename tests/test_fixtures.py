"""Tests du moteur fiscal — fixtures de docs/fiscalite/05-exemples-calculs.md.

Lancement :  python3 -m unittest discover -s tests   (depuis la racine)
"""

import unittest

from engine import france, belgique, luxembourg, allemagne


class TestFrance(unittest.TestCase):
    def test_fr1_ir_celibataire(self):
        r = france.impot_revenu(35000, parts=1, couple=False)
        self.assertAlmostEqual(r["impot_net"], 3665.48, delta=1)
        self.assertEqual(r["decote"], 0.0)

    def test_fr2_ir_couple_quotient_decote(self):
        r = france.impot_revenu(60000, parts=3, couple=True)
        self.assertAlmostEqual(r["impot_avant_decote"], 2805.99, delta=1)
        self.assertAlmostEqual(r["decote"], 200.29, delta=1)
        self.assertAlmostEqual(r["impot_net"], 2605.70, delta=1)
        self.assertEqual(r["plafonnement_applique"], 0.0)

    def test_fr3_pfu(self):
        self.assertAlmostEqual(france.pfu(10000, 2025)["impot"], 3000.0, delta=0.5)
        self.assertAlmostEqual(france.pfu(10000, 2026)["impot"], 3140.0, delta=0.5)

    def test_fr5_is_taux_reduit(self):
        self.assertAlmostEqual(france.impot_societes(60000)["impot"], 10750.0, delta=0.5)

    def test_fr4_micro(self):
        r = france.micro_entrepreneur(40000, "services_bic", versement_liberatoire=True)
        self.assertAlmostEqual(r["cotisations_sociales"], 8480.0, delta=0.5)
        self.assertAlmostEqual(r["versement_liberatoire_ir"], 680.0, delta=0.5)
        self.assertAlmostEqual(r["benefice_imposable"], 20000.0, delta=0.5)


class TestBelgique(unittest.TestCase):
    def test_be1_ipp(self):
        r = belgique.ipp(40000, taux_communal=0.08)
        self.assertAlmostEqual(r["impot_bareme"], 14231.0, delta=1)
        self.assertAlmostEqual(r["reduction_quotite"], 2727.50, delta=1)
        self.assertAlmostEqual(r["impot_total"], 12423.78, delta=1)

    def test_be2_cotisations_independant(self):
        r = belgique.cotisations_independant(50000)
        self.assertAlmostEqual(r["cotisations_annuelles"], 10250.0, delta=1)

    def test_be3_isoc(self):
        self.assertAlmostEqual(belgique.impot_societes(80000)["impot"], 16000.0, delta=0.5)


class TestLuxembourg(unittest.TestCase):
    def test_lu1_irpp_classe1(self):
        r = luxembourg.irpp(50000, classe="1")
        self.assertAlmostEqual(r["impot_bareme"], 7341.30, delta=1)
        self.assertAlmostEqual(r["impot_total"], 7855.19, delta=1)

    def test_lu2_irpp_classe2_splitting(self):
        r = luxembourg.irpp(100000, classe="2")
        self.assertAlmostEqual(r["impot_bareme"], 14682.60, delta=1)
        self.assertAlmostEqual(r["impot_total"], 15710.38, delta=1)

    def test_lu3_irc_icc(self):
        r = luxembourg.irc_icc(300000)  # Luxembourg-Ville par défaut
        self.assertAlmostEqual(r["charge_totale"], 71610.0, delta=1)
        self.assertAlmostEqual(r["taux_global"], 0.2387, delta=0.001)


class TestAllemagne(unittest.TestCase):
    def test_de1_einkommensteuer(self):
        self.assertEqual(allemagne.einkommensteuer(50000), 10691)
        self.assertEqual(allemagne.solidaritaetszuschlag(10691), 0.0)

    def test_de2_splitting(self):
        self.assertEqual(allemagne.splitting(100000), 21382)
        self.assertEqual(allemagne.einkommensteuer(100000), 31088)

    def test_de3_abgeltungsteuer(self):
        r = allemagne.abgeltungsteuer(10000)
        self.assertAlmostEqual(r["impot_total"], 2373.75, delta=0.5)

    def test_de4_gmbh(self):
        r = allemagne.gmbh(100000, hebesatz=4.0)
        self.assertAlmostEqual(r["charge_totale"], 29825.0, delta=0.5)
        self.assertAlmostEqual(r["taux_effectif"], 0.2983, delta=0.001)


if __name__ == "__main__":
    unittest.main()
