/**
 * FLOW~ AX Platform — Hint Engine (Do & Don't Evaluator)
 *
 * Pure functions that evaluate HINT_RULES against assessment/worksheet context
 * and return Hint[] for UI rendering.
 *
 * Works in two phases:
 *  1. evaluateRules(context, rules) → Hint[]
 *  2. suppressDuplicates + prioritize → DisplayableHint[]
 *
 * @module hint-engine
 */

/**
 * Main evaluation entrypoint.
 *
 * @param {Object} context - Assessment / worksheet state at evaluation time
 * @param {string} context.scope - 'assessment_complete' | 'checkin_missed' | 'anomaly' | ...
 * @param {string} [context.assessmentType] - '4skill' | 'gartner' | ...
 * @param {Array} [context.answers] - Array of { questionId, value }
 * @param {Array} [context.questions] - Question definitions for axis lookup
 * @param {Object} [context.scoreSummary] - Pre-computed { byAxis, total, ... }
 * @param {number} [context.durationSec] - Response duration
 * @param {number} [context.consecutiveMisses]
 * @param {number} [context.gartnerAvgLevel]
 * @param {Array} rules - HINT_RULES (from hint-rules.js)
 * @returns {Array} Ordered Hint[] (highest priority first)
 */
function evaluateRules(context, rules) {
  if (!Array.isArray(rules)) return [];
  const matched = [];

  for (const rule of rules) {
    if (rule.scope !== context.scope) continue;
    if (evaluateCondition(rule.condition, context)) {
      matched.push({
        ruleId: rule.id,
        priority: rule.priority || 0,
        do: rule.do,
        dont: rule.dont,
        citation: rule.citation
      });
    }
  }

  // Sort by priority desc, then by ruleId for stability
  matched.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.ruleId.localeCompare(b.ruleId);
  });

  return matched;
}

/**
 * Condition evaluator — DSL interpreter.
 *
 * Supported types:
 *  - axisAverage: check if axis average meets operator/value
 *  - questionValue: check specific question response
 *  - allAnswersEqual: all answers equal given value
 *  - responseDuration: duration check
 *  - consecutiveMisses: missed check-ins
 *  - gartnerAvgLevel: Gartner average comparison
 *
 * @param {Object} condition
 * @param {Object} context
 * @returns {boolean}
 */
function evaluateCondition(condition, context) {
  if (!condition || typeof condition !== 'object') return false;

  switch (condition.type) {
    case 'axisAverage': {
      if (condition.assessmentType && context.assessmentType !== condition.assessmentType) return false;
      const byAxis = (context.scoreSummary && context.scoreSummary.byAxis) || {};
      const entry = byAxis[condition.axis];
      if (!entry) return false;
      return compareValue(entry.avg, condition.operator, condition.value);
    }

    case 'questionValue': {
      const answer = (context.answers || []).find(a => a.questionId === condition.questionId);
      if (!answer) return false;
      return compareValue(answer.value, condition.operator, condition.value);
    }

    case 'allAnswersEqual': {
      const answers = context.answers || [];
      const threshold = condition.minQuestions || 1;
      if (answers.length < threshold) return false;
      return answers.every(a => a.value === condition.value);
    }

    case 'responseDuration': {
      const duration = context.durationSec;
      if (typeof duration !== 'number') return false;
      const valueInSeconds = condition.unit === 'minutes' ? condition.value * 60 : condition.value;
      return compareValue(duration, condition.operator, valueInSeconds);
    }

    case 'consecutiveMisses': {
      return (context.consecutiveMisses || 0) >= (condition.weeks || 1);
    }

    case 'gartnerAvgLevel': {
      const level = context.gartnerAvgLevel;
      if (typeof level !== 'number') return false;
      return compareValue(level, condition.operator, condition.value);
    }

    default:
      // Unknown condition type — fail safe: not matched
      return false;
  }
}

/**
 * Compare helper supporting operators: '==', '<', '<=', '>', '>=', '!='
 */
function compareValue(actual, operator, expected) {
  switch (operator) {
    case '==': return actual === expected;
    case '!=': return actual !== expected;
    case '<':  return actual < expected;
    case '<=': return actual <= expected;
    case '>':  return actual > expected;
    case '>=': return actual >= expected;
    default:   return false;
  }
}

/**
 * De-duplicate hints and limit display count.
 *
 * @param {Array} hints
 * @param {{maxDisplay?: number}} [options]
 * @returns {Array}
 */
function renderHints(hints, options = {}) {
  const maxDisplay = options.maxDisplay || 3;
  const seen = new Set();
  const deduped = [];
  for (const h of hints) {
    if (seen.has(h.ruleId)) continue;
    seen.add(h.ruleId);
    deduped.push(h);
    if (deduped.length >= maxDisplay) break;
  }
  return deduped;
}

/**
 * Convenience: evaluate and render in one call.
 */
function evaluateAndRender(context, rules, options) {
  return renderHints(evaluateRules(context, rules), options);
}

if (typeof window !== 'undefined') {
  window.FlowHintEngine = {
    evaluateRules,
    evaluateCondition,
    renderHints,
    evaluateAndRender
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { evaluateRules, evaluateCondition, renderHints, evaluateAndRender };
}
