/**
 * FLOW~ AX Platform — Scoring Domain Service
 *
 * Pure functions for computing scores, levels, and growth indices.
 * No side effects, no I/O — easy to test and reason about.
 *
 * @module scoring
 */

/**
 * Group answers by axis and compute per-axis averages + totals.
 *
 * @param {Array<{questionId: string, value: number}>} answers
 * @param {Array<{id: string, axis: string}>} questions - Full question definitions
 * @returns {{byAxis: Object<string, {sum: number, avg: number, count: number}>, total: number, maxPossible: number}}
 */
function computeAxisScores(answers, questions) {
  const byAxis = {};
  const questionMap = new Map(questions.map(q => [q.id, q]));

  for (const answer of answers) {
    const q = questionMap.get(answer.questionId);
    if (!q) continue;
    if (!byAxis[q.axis]) {
      byAxis[q.axis] = { sum: 0, count: 0, avg: 0 };
    }
    byAxis[q.axis].sum += answer.value;
    byAxis[q.axis].count += 1;
  }

  let total = 0;
  for (const axis of Object.keys(byAxis)) {
    const entry = byAxis[axis];
    entry.avg = entry.count > 0 ? entry.sum / entry.count : 0;
    total += entry.sum;
  }

  const maxPossible = questions.length * 5; // assumes Likert-5
  return { byAxis, total, maxPossible };
}

/**
 * Map axis sum (5 questions × 1-5 = 5-25 range) to Level 1-5.
 *
 * @param {number} axisSum - Sum of 5 Likert responses
 * @returns {{level: string, name: string}}
 */
function axisLevelFromSum(axisSum) {
  if (axisSum <= 10) return { level: 'L1', name: '미경험', hint: '해당 역량 인식·경험 부재' };
  if (axisSum <= 14) return { level: 'L2', name: '입문', hint: '개념 이해 시작, 실천 부족' };
  if (axisSum <= 18) return { level: 'L3', name: '활용', hint: '일상 실천 진행, Champion 후보' };
  if (axisSum <= 22) return { level: 'L4', name: '전문', hint: '구조화·전파 단계' };
  return { level: 'L5', name: '혁신', hint: '조직 전략 기여' };
}

/**
 * Compute Gartner organizational average level.
 *
 * @param {Array<{questionId: string, value: number}>} answers
 * @returns {{avgLevel: number, classification: string}}
 */
function computeGartnerLevel(answers) {
  if (!answers.length) return { avgLevel: 0, classification: 'Unknown' };
  const sum = answers.reduce((acc, a) => acc + (a.value || 0), 0);
  const avg = sum / answers.length;

  let classification;
  if (avg < 1.5) classification = 'Awareness';
  else if (avg < 2.5) classification = 'Active';
  else if (avg < 3.5) classification = 'Operational';
  else if (avg < 4.5) classification = 'Systemic';
  else classification = 'Transformational';

  return { avgLevel: Math.round(avg * 100) / 100, classification };
}

/**
 * Compute Personal Growth Index (PGI) between pre and post assessments.
 *
 * Formula: (post - pre) / (100 - pre) × 100
 *
 * @param {number} preTotal
 * @param {number} postTotal
 * @param {number} [maxPossible=100]
 * @returns {{pgi: number, grade: string, description: string}}
 */
function computePGI(preTotal, postTotal, maxPossible = 100) {
  if (preTotal >= maxPossible) {
    return { pgi: 0, grade: 'N/A', description: '이미 최고 수준' };
  }
  const pgi = Math.round(((postTotal - preTotal) / (maxPossible - preTotal)) * 100);

  let grade, description;
  if (pgi >= 40) { grade = 'excellent'; description = '우수 (상위 20% 기대)'; }
  else if (pgi >= 20) { grade = 'normal'; description = '정상'; }
  else if (pgi >= 10) { grade = 'needs_support'; description = '보완 (멘토링 연결)'; }
  else if (pgi >= 0) { grade = 'at_risk'; description = '위험 (1:1 심층 상담)'; }
  else { grade = 'regression'; description = '퇴행 (긴급 개입)'; }

  return { pgi, grade, description };
}

/**
 * Compute Before/After delta for a single axis.
 *
 * @param {number} preAvg
 * @param {number} postAvg
 * @returns {{delta: number, direction: string, percentChange: number}}
 */
function computeAxisDelta(preAvg, postAvg) {
  const delta = postAvg - preAvg;
  const direction = delta > 0.3 ? 'improved'
                  : delta < -0.3 ? 'declined'
                  : 'stable';
  const percentChange = preAvg > 0
    ? Math.round(((postAvg - preAvg) / preAvg) * 100)
    : 0;
  return { delta: Math.round(delta * 100) / 100, direction, percentChange };
}

/**
 * 360-degree weighted average.
 * Default weights per FLOW~ spec.
 *
 * @param {{supervisor: number[], peer: number[], self: number[], subordinate: number[], external: number[]}} answersByRole
 * @returns {{weighted: number, byRole: Object}}
 */
function compute360Weighted(answersByRole) {
  const weights = {
    supervisor: 0.30,
    peer: 0.25,
    self: 0.20,
    subordinate: 0.10,
    external: 0.15
  };
  const byRole = {};
  let weighted = 0;
  let totalWeight = 0;

  for (const role of Object.keys(weights)) {
    const vals = answersByRole[role] || [];
    if (!vals.length) continue;
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    byRole[role] = Math.round(avg * 100) / 100;
    weighted += avg * weights[role];
    totalWeight += weights[role];
  }

  // Normalize if some roles are missing
  if (totalWeight > 0) weighted = weighted / totalWeight;

  return { weighted: Math.round(weighted * 100) / 100, byRole };
}

/**
 * Identify Champion candidates based on multiple criteria.
 *
 * @param {Object} participantData
 * @param {number} participantData.pgi
 * @param {number} participantData.behavior360Avg
 * @param {number} participantData.propagationCount
 * @param {Array<{severity: string}>} participantData.anomalyFlags
 * @returns {{isChampion: boolean, reasons: string[], missingCriteria: string[]}}
 */
function identifyChampion({ pgi, behavior360Avg, propagationCount, anomalyFlags }) {
  const criteria = {
    pgiHigh: { met: pgi >= 40, label: 'PGI ≥ 40%' },
    behavior360High: { met: (behavior360Avg || 0) >= 4.0, label: '360도 평균 ≥ 4.0' },
    propagated: { met: (propagationCount || 0) >= 1, label: '팀원 전파 1명 이상' },
    noCritical: {
      met: !(anomalyFlags || []).some(f => f.severity === 'critical'),
      label: '심각한 이상 플래그 없음'
    }
  };

  const reasons = [];
  const missingCriteria = [];
  let allMet = true;

  for (const [key, c] of Object.entries(criteria)) {
    if (c.met) reasons.push(c.label);
    else { missingCriteria.push(c.label); allMet = false; }
  }

  return { isChampion: allMet, reasons, missingCriteria };
}

/**
 * Build a complete ScoreSummary from raw answers.
 *
 * @param {Array} answers
 * @param {Array} questions
 * @returns {{byAxis, total, maxPossible, overallLevel, axisLevels}}
 */
function buildScoreSummary(answers, questions) {
  const { byAxis, total, maxPossible } = computeAxisScores(answers, questions);
  const axisLevels = {};

  for (const [axis, score] of Object.entries(byAxis)) {
    axisLevels[axis] = axisLevelFromSum(score.sum);
  }

  // Overall level based on total score (for 20-question 4-Skill: 20-100 scale)
  const totalPct = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
  let overallLevel;
  if (totalPct < 40) overallLevel = 'L1';
  else if (totalPct < 56) overallLevel = 'L2';
  else if (totalPct < 72) overallLevel = 'L3';
  else if (totalPct < 88) overallLevel = 'L4';
  else overallLevel = 'L5';

  return {
    byAxis,
    total,
    maxPossible,
    totalPct: Math.round(totalPct * 10) / 10,
    overallLevel,
    axisLevels
  };
}

// Expose to global scope
if (typeof window !== 'undefined') {
  window.FlowScoring = {
    computeAxisScores,
    axisLevelFromSum,
    computeGartnerLevel,
    computePGI,
    computeAxisDelta,
    compute360Weighted,
    identifyChampion,
    buildScoreSummary
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeAxisScores,
    axisLevelFromSum,
    computeGartnerLevel,
    computePGI,
    computeAxisDelta,
    compute360Weighted,
    identifyChampion,
    buildScoreSummary
  };
}
