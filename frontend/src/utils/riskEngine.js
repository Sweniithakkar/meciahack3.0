/**
 * Document Risk Level Scoring Engine (Frontend)
 * Refactored calculation engine following exact 3-step mathematical specification.
 * 
 * Metric: Risk Level (1–10 scale)
 * Reference Table:
 *   1 – 4: Low Risk    (#2E7D32)
 *   5 – 7: Medium Risk (#EF6C00)
 *   8 – 10: High Risk  (#C62828)
 */

export function roundHalfUp(val) {
  return Math.floor(Number(val) + 0.5);
}

export function computeRiskLevel({ clauses, scores, n, s_max, n_high } = {}) {
  let nCalc = 0;
  let sMaxCalc = 1;
  let nHighCalc = 0;

  if (Array.isArray(scores)) {
    const sList = scores.map((s) => Math.round(Number(s)));
    nCalc = n !== undefined ? Number(n) : sList.length;
    sMaxCalc = sList.length > 0 ? Math.max(...sList) : (s_max !== undefined ? Number(s_max) : 1);
    nHighCalc = n_high !== undefined ? Number(n_high) : sList.filter((s) => s >= 8).length;
  } else if (Array.isArray(clauses)) {
    const sList = clauses.map((c) => {
      if (typeof c === 'number') return Math.round(c);
      if (c && typeof c === 'object') {
        const sev = c.severity || c.score || c.level || c.importance;
        if (typeof sev === 'number') return Math.round(sev);
        if (typeof sev === 'string') {
          const lower = sev.toLowerCase().trim();
          if (lower.includes('high') || lower.includes('critical')) return 8;
          if (lower.includes('med')) return 5;
          if (lower.includes('low')) return 2;
          return 3;
        }
      }
      return 3;
    });
    nCalc = n !== undefined ? Number(n) : clauses.length;
    sMaxCalc = sList.length > 0 ? Math.max(...sList) : (s_max !== undefined ? Number(s_max) : 1);
    nHighCalc = n_high !== undefined ? Number(n_high) : sList.filter((s) => s >= 8).length;
  } else {
    nCalc = n !== undefined ? Number(n) : 0;
    sMaxCalc = s_max !== undefined ? Number(s_max) : 1;
    nHighCalc = n_high !== undefined ? Number(n_high) : 0;
  }

  const nVal = Math.max(0, nCalc);
  const sMaxVal = nVal > 0 ? Math.max(1, Math.min(10, sMaxCalc)) : 0;
  const nHighVal = Math.max(0, nHighCalc);

  // Step 1: Evaluate High-Risk Hard Triggers
  const conditionA = nHighVal >= 1;
  const conditionB = nVal >= 26;
  const hardTrigger = conditionA || conditionB;

  // Step 2: Base Accumulation Formula
  const rawScore = Number(sMaxVal) + 0.28 * Number(nVal);

  // Step 3: Clamp, Round, & Output Final Risk Level
  // 1. Clamp to [1.0, 10.0]
  const clampedScore = Math.min(10.0, Math.max(1.0, rawScore));

  // 2. Round half up to nearest integer
  const baseLevel = roundHalfUp(clampedScore);

  // 3. Apply Floor
  let finalRiskLevel = hardTrigger ? Math.max(8, baseLevel) : baseLevel;
  finalRiskLevel = Math.min(10, Math.max(1, finalRiskLevel));

  // Reference Table Classification & Color Code
  let riskClassification = 'Low Risk';
  let colorCode = '#2E7D32';

  if (finalRiskLevel <= 4) {
    riskClassification = 'Low Risk';
    colorCode = '#2E7D32';
  } else if (finalRiskLevel <= 7) {
    riskClassification = 'Medium Risk';
    colorCode = '#EF6C00';
  } else {
    riskClassification = 'High Risk';
    colorCode = '#C62828';
  }

  return {
    risk_level: finalRiskLevel,
    risk_classification: riskClassification,
    color_code: colorCode,
    risk_score: `${riskClassification} (${finalRiskLevel}/10)`
  };
}
