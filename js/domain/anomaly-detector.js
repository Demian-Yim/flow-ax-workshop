/**
 * FLOW~ AX Platform — Anomaly Detector
 *
 * Detects suspicious response patterns that undermine data quality:
 *  - Speed runs (too fast)
 *  - Zero variance (all same answer)
 *  - Incomplete submissions (early exit)
 *  - Late revisions (revisited after long gap)
 *
 * Returns AnomalyFlag[] with severity levels.
 *
 * @module anomaly-detector
 */

/**
 * Primary entry: run all checks on a response.
 *
 * @param {Object} response
 * @param {Array} response.answers
 * @param {number} response.durationSec
 * @param {Date|string} response.submittedAt
 * @param {Date|string} response.startedAt
 * @param {Array} [questions] - Question list for completeness check
 * @returns {Array} AnomalyFlag[]
 */
function detectAllAnomalies(response, questions) {
  const flags = [];

  const speedFlag = checkResponseSpeed(response);
  if (speedFlag) flags.push(speedFlag);

  const varianceFlag = checkVariance(response.answers);
  if (varianceFlag) flags.push(varianceFlag);

  if (questions) {
    const completenessFlag = checkCompleteness(response.answers, questions);
    if (completenessFlag) flags.push(completenessFlag);
  }

  const revisitFlag = checkLateRevision(response);
  if (revisitFlag) flags.push(revisitFlag);

  return flags;
}

/**
 * Flag responses completed in under 2 minutes (for 20-question assessment).
 */
function checkResponseSpeed(response) {
  const duration = response.durationSec || 0;
  const questionCount = (response.answers || []).length;
  if (!questionCount) return null;

  const secPerQuestion = duration / questionCount;

  if (secPerQuestion < 3) {
    return {
      type: 'speed_critical',
      severity: 'critical',
      message: `평균 문항당 ${secPerQuestion.toFixed(1)}초 — 신뢰도 심각 의심`,
      detectedAt: new Date().toISOString(),
      metric: { durationSec: duration, questionCount, secPerQuestion }
    };
  }
  if (secPerQuestion < 6) {
    return {
      type: 'speed_warning',
      severity: 'warn',
      message: `평균 문항당 ${secPerQuestion.toFixed(1)}초 — 빠른 응답`,
      detectedAt: new Date().toISOString(),
      metric: { durationSec: duration, questionCount, secPerQuestion }
    };
  }
  return null;
}

/**
 * Flag responses where all answers are identical (zero variance).
 */
function checkVariance(answers) {
  if (!Array.isArray(answers) || answers.length < 5) return null;
  const values = answers.map(a => a.value);
  const uniqueCount = new Set(values).size;

  if (uniqueCount === 1) {
    return {
      type: 'zero_variance',
      severity: 'critical',
      message: `모든 응답이 동일한 값(${values[0]}) — 중앙/극단 편향 의심`,
      detectedAt: new Date().toISOString(),
      metric: { uniqueCount, commonValue: values[0], totalAnswers: answers.length }
    };
  }
  if (uniqueCount === 2 && answers.length >= 10) {
    return {
      type: 'low_variance',
      severity: 'warn',
      message: `응답 종류가 2가지로만 구성 — 성찰 부족 의심`,
      detectedAt: new Date().toISOString(),
      metric: { uniqueCount, totalAnswers: answers.length }
    };
  }
  return null;
}

/**
 * Flag responses missing required questions.
 */
function checkCompleteness(answers, questions) {
  const answered = new Set((answers || []).map(a => a.questionId));
  const missing = (questions || []).filter(q => !answered.has(q.id));
  if (missing.length > 0) {
    return {
      type: 'incomplete',
      severity: missing.length > 3 ? 'critical' : 'warn',
      message: `${missing.length}개 문항 미응답`,
      detectedAt: new Date().toISOString(),
      metric: { missingIds: missing.map(q => q.id), missingCount: missing.length }
    };
  }
  return null;
}

/**
 * Flag if response was revisited after a long gap (> 24h) before submission.
 */
function checkLateRevision(response) {
  if (!response.startedAt || !response.submittedAt) return null;
  const start = new Date(response.startedAt).getTime();
  const end = new Date(response.submittedAt).getTime();
  const gapHours = (end - start) / (1000 * 60 * 60);

  if (gapHours > 72) {
    return {
      type: 'late_revision',
      severity: 'info',
      message: `응답 시작 후 ${gapHours.toFixed(1)}시간 경과 후 제출`,
      detectedAt: new Date().toISOString(),
      metric: { gapHours: Math.round(gapHours * 10) / 10 }
    };
  }
  return null;
}

/**
 * Aggregate severity from multiple flags.
 * 'critical' > 'warn' > 'info'
 */
function highestSeverity(flags) {
  if (!flags || !flags.length) return null;
  const order = { critical: 3, warn: 2, info: 1 };
  return flags.reduce((worst, f) => {
    const curr = order[f.severity] || 0;
    const prev = order[worst?.severity] || 0;
    return curr > prev ? f : worst;
  }, null);
}

/**
 * Check if checkin is overdue for a participant's action plan.
 *
 * @param {Object} actionPlan - { checkins: [{weekNumber, submittedAt}], committedAt }
 * @param {Date} [now]
 * @returns {AnomalyFlag|null}
 */
function checkCheckinDelay(actionPlan, now = new Date()) {
  const committed = actionPlan.committedAt ? new Date(actionPlan.committedAt) : null;
  if (!committed) return null;

  const weeksSinceCommit = Math.floor((now - committed) / (1000 * 60 * 60 * 24 * 7));
  const expectedCheckins = Math.min(weeksSinceCommit, 4);
  const submitted = (actionPlan.checkins || []).filter(c => c.submittedAt).length;

  const missed = expectedCheckins - submitted;
  if (missed >= 2) {
    return {
      type: 'checkin_missed',
      severity: missed >= 3 ? 'critical' : 'warn',
      message: `주간 체크인 ${missed}회 미완 (${expectedCheckins}회 예상 중 ${submitted}회 완료)`,
      detectedAt: now.toISOString(),
      metric: { expectedCheckins, submitted, missed }
    };
  }
  return null;
}

if (typeof window !== 'undefined') {
  window.FlowAnomalyDetector = {
    detectAllAnomalies,
    checkResponseSpeed,
    checkVariance,
    checkCompleteness,
    checkLateRevision,
    checkCheckinDelay,
    highestSeverity
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectAllAnomalies,
    checkResponseSpeed,
    checkVariance,
    checkCompleteness,
    checkLateRevision,
    checkCheckinDelay,
    highestSeverity
  };
}
