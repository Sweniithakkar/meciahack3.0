"""
Document Risk Level Scoring Engine
Refactored calculation engine following the exact 3-step mathematical specification.

Metric: Risk Level (1–10 scale)

Reference Table:
  1 – 4: Low Risk    (#2E7D32)
  5 – 7: Medium Risk (#EF6C00)
  8 – 10: High Risk  (#C62828)

Mathematical Formulation:
  Inputs:
    - n: Total number of evaluated clauses in document D.
    - s_i in {1, 2, ..., 10}: Severity score of clause c_i.
    - s_max = max(s_1, s_2, ..., s_n): Highest single clause severity score in D.
    - n_high = count of {c_i | s_i >= 8}: Number of high-risk clauses.

  Step 1: Evaluate High-Risk Hard Triggers
    Condition A: n_high >= 1
    Condition B: n >= 26
    If Condition A or Condition B is TRUE -> Minimum allowed Risk Level = 8.

  Step 2: Base Accumulation Formula
    Raw Score = s_max + (0.28 * n)

  Step 3: Clamp, Round, & Output Final Risk Level
    1. Clamp: Clamped Score = min(10.0, max(1.0, Raw Score))
    2. Round: Base Level = round_half_up(Clamped Score)
    3. Apply Floor:
       S_D = max(8, Base Level) if (Condition A or Condition B is TRUE) else Base Level
"""

import math
from decimal import Decimal, ROUND_HALF_UP


def round_half_up(val):
    """Rounds numeric value to nearest integer using exact Decimal ROUND_HALF_UP rule."""
    return int(Decimal(str(val)).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def compute_risk_level(clauses=None, scores=None, n=None, s_max=None, n_high=None):
    """
    Computes Document Risk Level (1-10 scale) according to the 3-step mathematical specification.

    Returns dict:
        {
            "risk_level": integer (1-10),
            "risk_classification": string ("Low Risk" | "Medium Risk" | "High Risk"),
            "color_code": string ("#2E7D32" | "#EF6C00" | "#C62828"),
            "risk_score": string (e.g. "High Risk (8/10)")
        }
    """
    # Parse inputs
    if scores is not None:
        s_list = [int(s) for s in scores]
        n_calc = len(s_list) if n is None else int(n)
        s_max_calc = max(s_list) if s_list else (s_max if s_max is not None else 1)
        n_high_calc = sum(1 for s in s_list if s >= 8) if n_high is None else int(n_high)
    elif clauses is not None:
        s_list = []
        for c in clauses:
            if isinstance(c, (int, float)):
                s_list.append(int(c))
            elif isinstance(c, dict):
                sev = c.get("severity") or c.get("score") or c.get("level") or c.get("importance")
                if isinstance(sev, (int, float)):
                    s_list.append(int(sev))
                elif isinstance(sev, str):
                    sev_str = sev.lower().strip()
                    if "high" in sev_str or "critical" in sev_str:
                        s_list.append(8)
                    elif "med" in sev_str:
                        s_list.append(5)
                    elif "low" in sev_str:
                        s_list.append(2)
                    else:
                        s_list.append(3)
                else:
                    s_list.append(3)
        n_calc = len(clauses) if n is None else int(n)
        s_max_calc = max(s_list) if s_list else (s_max if s_max is not None else 1)
        n_high_calc = sum(1 for s in s_list if s >= 8) if n_high is None else int(n_high)
    else:
        n_calc = int(n) if n is not None else 0
        s_max_calc = int(s_max) if s_max is not None else 1
        n_high_calc = int(n_high) if n_high is not None else 0

    n_val = max(0, n_calc)
    s_max_val = max(1, min(10, s_max_calc)) if n_val > 0 else 0
    n_high_val = max(0, n_high_calc)

    # Step 1: Evaluate High-Risk Hard Triggers
    condition_a = (n_high_val >= 1)
    condition_b = (n_val >= 26)
    hard_trigger = condition_a or condition_b

    # Step 2: Base Accumulation Formula
    raw_score = float(s_max_val) + (0.28 * float(n_val))

    # Step 3: Clamp, Round, & Output Final Risk Level
    # 1. Clamp to [1.0, 10.0]
    clamped_score = min(10.0, max(1.0, raw_score))

    # 2. Round half up to nearest integer
    base_level = round_half_up(clamped_score)

    # 3. Apply Floor
    if hard_trigger:
        final_risk_level = max(8, base_level)
    else:
        final_risk_level = base_level

    final_risk_level = min(10, max(1, final_risk_level))

    # Classification & Color Reference Table
    if final_risk_level <= 4:
        classification = "Low Risk"
        color_code = "#2E7D32"
    elif final_risk_level <= 7:
        classification = "Medium Risk"
        color_code = "#EF6C00"
    else:
        classification = "High Risk"
        color_code = "#C62828"

    return {
        "risk_level": final_risk_level,
        "risk_classification": classification,
        "color_code": color_code,
        "risk_score": f"{classification} ({final_risk_level}/10)"
    }
