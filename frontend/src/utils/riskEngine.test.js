import { computeRiskLevel, roundHalfUp } from './riskEngine';

describe('Document Risk Level Scoring Engine', () => {
  test('Low Risk output (n=5, s_max=3 -> Level 4)', () => {
    const res = computeRiskLevel({ n: 5, s_max: 3, n_high: 0 });
    expect(res.risk_level).toBe(4);
    expect(res.risk_classification).toBe('Low Risk');
    expect(res.color_code).toBe('#2E7D32');
  });

  test('Single critical clause trigger (n=5, s_max=8 -> High Risk >= Level 8)', () => {
    const res = computeRiskLevel({ n: 5, s_max: 8, n_high: 1 });
    expect(res.risk_level).toBeGreaterThanOrEqual(8);
    expect(res.risk_classification).toBe('High Risk');
    expect(res.color_code).toBe('#C62828');

    const singleRes = computeRiskLevel({ n: 1, s_max: 8, n_high: 1 });
    expect(singleRes.risk_level).toBe(8);
    expect(singleRes.risk_classification).toBe('High Risk');
    expect(singleRes.color_code).toBe('#C62828');
  });

  test('High clause density floor (n=30, s_max=2 -> Level 10)', () => {
    const res = computeRiskLevel({ n: 30, s_max: 2, n_high: 0 });
    expect(res.risk_level).toBe(10);
    expect(res.risk_classification).toBe('High Risk');
    expect(res.color_code).toBe('#C62828');
  });

  test('roundHalfUp utility function', () => {
    expect(roundHalfUp(4.4)).toBe(4);
    expect(roundHalfUp(4.5)).toBe(5);
    expect(roundHalfUp(9.4)).toBe(9);
    expect(roundHalfUp(10.4)).toBe(10);
  });

  test('Medium Risk classification range (5 to 7)', () => {
    const res = computeRiskLevel({ n: 10, s_max: 3, n_high: 0 });
    expect(res.risk_level).toBe(6);
    expect(res.risk_classification).toBe('Medium Risk');
    expect(res.color_code).toBe('#EF6C00');
  });

  test('Boundary test cases required by specification', () => {
    expect(computeRiskLevel({ n: 1, s_max: 1, n_high: 0 }).risk_level).toBe(1);
    expect(computeRiskLevel({ n: 5, s_max: 5, n_high: 0 }).risk_level).toBe(6);
    expect(computeRiskLevel({ n: 25, s_max: 1, n_high: 0 }).risk_level).toBe(8);
    expect(computeRiskLevel({ n: 26, s_max: 1, n_high: 0 }).risk_level).toBe(8);
    expect(computeRiskLevel({ n: 10, s_max: 7, n_high: 0 }).risk_level).toBe(10);
    const res6 = computeRiskLevel({ n: 10, s_max: 8, n_high: 1 });
    expect(res6.risk_level).toBe(10);
    expect(res6.risk_classification).toBe('High Risk');
  });
});

