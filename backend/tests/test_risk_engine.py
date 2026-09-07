"""
Unit tests for Document Risk Level Scoring Engine (Python)
Verifies the exact 3-step mathematical scoring logic and business rules.
"""

import sys
import os
import unittest

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from utils.risk_engine import compute_risk_level, round_half_up


class TestRiskEngine(unittest.TestCase):

    def test_low_risk_output(self):
        """
        Test Case 1: Low Risk output
        Inputs: n = 5, s_max = 3 (all s_i < 8)
        Expected: Raw Score = 3 + (0.28 * 5) = 4.4 -> Clamped 4.4 -> Base Level 4 -> Level 4 (#2E7D32)
        """
        res = compute_risk_level(n=5, s_max=3, n_high=0)
        self.assertEqual(res["risk_level"], 4)
        self.assertEqual(res["risk_classification"], "Low Risk")
        self.assertEqual(res["color_code"], "#2E7D32")

    def test_single_critical_clause_trigger(self):
        """
        Test Case 2: Single critical clause trigger
        Inputs: n = 5, s_max = 8 (n_high = 1)
        Expected: Condition A is TRUE (n_high >= 1) -> Hard trigger minimum level 8 enforced.
                  Raw Score = 8 + (0.28 * 5) = 9.4 -> Base Level 9 -> max(8, 9) = 9 (Level >= 8 High Risk)
        """
        res = compute_risk_level(n=5, s_max=8, n_high=1)
        self.assertGreaterEqual(res["risk_level"], 8)
        self.assertEqual(res["risk_classification"], "High Risk")
        self.assertEqual(res["color_code"], "#C62828")

        # Test single clause n=1, s_max=8
        res_single = compute_risk_level(n=1, s_max=8, n_high=1)
        self.assertEqual(res_single["risk_level"], 8)
        self.assertEqual(res_single["risk_classification"], "High Risk")
        self.assertEqual(res_single["color_code"], "#C62828")

    def test_high_clause_density_floor(self):
        """
        Test Case 3: High clause density floor
        Inputs: n = 30, s_max = 2 (all s_i < 8, n_high = 0)
        Expected: Condition B is TRUE (n = 30 >= 26) -> Hard trigger minimum level 8 enforced.
                  Raw Score = 2 + (0.28 * 30) = 10.4 -> Clamped 10 -> Base Level 10 -> max(8, 10) = 10 (#C62828)
        """
        res = compute_risk_level(n=30, s_max=2, n_high=0)
        self.assertEqual(res["risk_level"], 10)
        self.assertEqual(res["risk_classification"], "High Risk")
        self.assertEqual(res["color_code"], "#C62828")

    def test_round_half_up_utility(self):
        """Test exact round half up mathematical rounding behavior."""
        self.assertEqual(round_half_up(4.4), 4)
        self.assertEqual(round_half_up(4.5), 5)
        self.assertEqual(round_half_up(9.4), 9)
        self.assertEqual(round_half_up(10.4), 10)

    def test_medium_risk_boundary(self):
        """Test medium risk classification range (5 to 7)."""
        res = compute_risk_level(n=10, s_max=3, n_high=0)
        # Raw = 3 + 2.8 = 5.8 -> 6
        self.assertEqual(res["risk_level"], 6)
        self.assertEqual(res["risk_classification"], "Medium Risk")
        self.assertEqual(res["color_code"], "#EF6C00")

    def test_boundary_cases(self):
        """Test explicit boundary cases required by specification."""
        # n=1, s_max=1 -> Level 1
        res1 = compute_risk_level(n=1, s_max=1, n_high=0)
        self.assertEqual(res1["risk_level"], 1)

        # n=5, s_max=5 -> Level 6
        res2 = compute_risk_level(n=5, s_max=5, n_high=0)
        self.assertEqual(res2["risk_level"], 6)

        # n=25, s_max=1 -> Raw 8 -> Level 8
        res3 = compute_risk_level(n=25, s_max=1, n_high=0)
        self.assertEqual(res3["risk_level"], 8)

        # n=26, s_max=1 -> High-density trigger -> Level 8
        res4 = compute_risk_level(n=26, s_max=1, n_high=0)
        self.assertEqual(res4["risk_level"], 8)

        # n=10, s_max=7, n_high=0 -> Level 10
        res5 = compute_risk_level(n=10, s_max=7, n_high=0)
        self.assertEqual(res5["risk_level"], 10)

        # n=10, s_max=8 -> High Risk
        res6 = compute_risk_level(n=10, s_max=8, n_high=1)
        self.assertEqual(res6["risk_level"], 10)
        self.assertEqual(res6["risk_classification"], "High Risk")


if __name__ == "__main__":
    unittest.main()

