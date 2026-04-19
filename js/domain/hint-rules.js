/**
 * FLOW~ AX Platform — Do & Don't Hint Rules (JSON DSL)
 *
 * Rules are evaluated by hint-engine.js against assessment/worksheet context.
 * Each rule has a condition (DSL) and do/dont hint messages with source citations.
 *
 * @module hint-rules
 */

const HINT_RULES = [
  // ══════════════════════════════════════════════
  // A축 (AI Open Mindset) 저점 힌트
  // ══════════════════════════════════════════════
  {
    id: 'rule-a-axis-low',
    scope: 'assessment_complete',
    priority: 10,
    condition: {
      type: 'axisAverage',
      assessmentType: '4skill',
      axis: 'A',
      operator: '<=',
      value: 2.5
    },
    do: {
      ko: '팀 미팅에서 본인의 AI 실패 경험 1개를 먼저 공유해보세요. 심리적 안전감이 학습 조직의 출발점입니다.',
      en: 'Start by sharing one of your own AI failures in team meetings. Psychological safety is the foundation of a learning organization.'
    },
    dont: {
      ko: '모르는 것을 감추면 팀 전체가 공개 학습을 피합니다 (MIT SMR 2025: 91% 문화 장벽).',
      en: 'Hiding uncertainty makes the whole team avoid open learning (MIT SMR 2025: 91% cultural barrier).'
    },
    citation: 'MIT SMR 2025 · Why AI Demands a New Breed of Leaders'
  },

  // ══════════════════════════════════════════════
  // B1 (3단계 질문) 저점
  // ══════════════════════════════════════════════
  {
    id: 'rule-b1-3stage-low',
    scope: 'assessment_complete',
    priority: 8,
    condition: {
      type: 'questionValue',
      questionId: '4skill-B1',
      operator: '<=',
      value: 2
    },
    do: {
      ko: '다음 중요 의사결정 전 Claude/Gemini에게 (1) 정보 탐색 → (2) 시나리오 → (3) 가정 도전 3단계로 질문해보세요.',
      en: 'Before your next key decision, ask Claude/Gemini in 3 stages: (1) Inform → (2) Simulate → (3) Challenge assumptions.'
    },
    dont: {
      ko: '1회성 검색으로 AI 답변을 그대로 쓰면 편향·환각 리스크가 누적됩니다.',
      en: 'Using AI as a one-shot search accumulates bias and hallucination risks.'
    },
    citation: 'Bevilacqua et al. (2025) — Strategic Co-Thinker'
  },

  // ══════════════════════════════════════════════
  // C3 (Champion 지원) 저점
  // ══════════════════════════════════════════════
  {
    id: 'rule-c3-champion-support-low',
    scope: 'assessment_complete',
    priority: 9,
    condition: {
      type: 'questionValue',
      questionId: '4skill-C3',
      operator: '<=',
      value: 2
    },
    do: {
      ko: 'Champion에게 주 1회 30분 자율 시간 + 도구 예산을 공식 배정하세요. 권한·예산·자율성 3종 세트가 필수입니다.',
      en: 'Officially allocate 30min/week autonomous time and tool budget to Champions. Authority/budget/autonomy triad is essential.'
    },
    dont: {
      ko: 'Champion에게 "부가 업무"로 떠넘기면 3개월 내 이탈합니다 (MIT NANDA 95% 실패 패턴).',
      en: 'Treating Champion role as "extra work" causes 3-month attrition (MIT NANDA 95% failure pattern).'
    },
    citation: 'MIT NANDA 2025 — GenAI Divide Report'
  },

  // ══════════════════════════════════════════════
  // D축 (Ethics & Risk) 저점
  // ══════════════════════════════════════════════
  {
    id: 'rule-d-axis-low',
    scope: 'assessment_complete',
    priority: 7,
    condition: {
      type: 'axisAverage',
      assessmentType: '4skill',
      axis: 'D',
      operator: '<=',
      value: 2.5
    },
    do: {
      ko: 'WS09 거버넌스 체크리스트 4영역(데이터·품질·도구·책임)을 본부장에게 1페이지로 요약 보고하세요.',
      en: 'Summarize WS09 Governance 4 domains (data·quality·tools·accountability) into a 1-page report for your executive.'
    },
    dont: {
      ko: '규정이 나중에 따라오기를 기다리지 마세요 — 리스크가 먼저 현실화됩니다 (Zillow $300M 사례).',
      en: 'Don\'t wait for regulations to catch up — risks materialize first (Zillow $300M case).'
    },
    citation: 'MIT SMR 2025 — Zillow case'
  },

  // ══════════════════════════════════════════════
  // 모든 응답이 5점 (자가진단 과신)
  // ══════════════════════════════════════════════
  {
    id: 'rule-all-max',
    scope: 'assessment_complete',
    priority: 10,
    condition: {
      type: 'allAnswersEqual',
      value: 5,
      minQuestions: 15
    },
    do: {
      ko: '동료·하위자·외부 평가자 3명 이상에게 같은 문항을 요청해 교차 검증해보세요 (360도).',
      en: 'Cross-verify by requesting 3+ evaluators (peer/subordinate/external) to answer the same questions (360°).'
    },
    dont: {
      ko: '자가진단 과신은 Upper Echelons Theory의 인지 편향을 강화합니다 — 전략 선택이 왜곡됩니다.',
      en: 'Self-assessment overconfidence reinforces Upper Echelons Theory cognitive bias — strategic choices become distorted.'
    },
    citation: 'Hambrick & Mason (1984) — Upper Echelons Theory'
  },

  // ══════════════════════════════════════════════
  // 모든 응답이 3점 (중앙 편향)
  // ══════════════════════════════════════════════
  {
    id: 'rule-all-middle',
    scope: 'assessment_complete',
    priority: 8,
    condition: {
      type: 'allAnswersEqual',
      value: 3,
      minQuestions: 10
    },
    do: {
      ko: '각 문항을 "최근 3개월 동안 실제 있었던 행동"으로 재해석하고 1점 또는 5점에 가까운 답을 다시 시도해보세요.',
      en: 'Re-interpret each item as "actual behavior over the past 3 months" and try answers closer to 1 or 5.'
    },
    dont: {
      ko: '중앙 편향(모두 3점)은 개선 포인트를 숨겨 학습 기회를 놓치게 합니다.',
      en: 'Central tendency bias (all 3s) hides improvement points and forfeits learning opportunities.'
    },
    citation: 'Kirkpatrick Level 2 Learning'
  },

  // ══════════════════════════════════════════════
  // 주간 체크인 2주 연속 미응답
  // ══════════════════════════════════════════════
  {
    id: 'rule-checkin-missed-2wk',
    scope: 'checkin_missed',
    priority: 9,
    condition: {
      type: 'consecutiveMisses',
      weeks: 2
    },
    do: {
      ko: '15분 자가 체크인 루틴을 금요일 16:45에 달력 블록하세요. 작은 단위가 지속 가능성을 만듭니다.',
      en: 'Block 15-minute self-checkin on Friday 16:45 in your calendar. Small units create sustainability.'
    },
    dont: {
      ko: '"다음 주에 몰아서"는 행동 변화를 90% 무력화합니다 (Kirkpatrick Level 3 Behavior).',
      en: '"I\'ll catch up next week" neutralizes 90% of behavior change (Kirkpatrick Level 3).'
    },
    citation: 'Kirkpatrick 4-Level — Level 3 Behavior'
  },

  // ══════════════════════════════════════════════
  // 응답 시간 과소 (날림)
  // ══════════════════════════════════════════════
  {
    id: 'rule-speed-run',
    scope: 'anomaly',
    priority: 10,
    condition: {
      type: 'responseDuration',
      operator: '<',
      value: 120,
      unit: 'seconds'
    },
    do: {
      ko: '진단은 15~20분이 적정입니다. 각 문항을 최근 3개월 경험에 비추어 답해주세요. 재응답하시겠습니까?',
      en: 'The assessment should take 15-20 minutes. Reflect on your past 3 months. Would you like to retake?'
    },
    dont: {
      ko: '날림 응답은 PGI 지표 신뢰도를 무너뜨리고 결과지 해석을 왜곡합니다.',
      en: 'Rushed responses destroy PGI reliability and distort report interpretation.'
    },
    citation: 'FLOW~ Anomaly Detection'
  },

  // ══════════════════════════════════════════════
  // Gartner 조직 성숙도 Level 1 (Awareness)
  // ══════════════════════════════════════════════
  {
    id: 'rule-gartner-awareness',
    scope: 'assessment_complete',
    priority: 8,
    condition: {
      type: 'gartnerAvgLevel',
      operator: '<',
      value: 1.5
    },
    do: {
      ko: '전사 AI 비전 선포 + 인식 워크숍 2시간 세션으로 시작하세요. 리더가 먼저 모델링해야 합니다.',
      en: 'Start with org-wide AI vision + 2-hour awareness workshop. Leaders must model first.'
    },
    dont: {
      ko: 'Awareness 단계에서 기술 도입부터 시작하면 MIT NANDA 95% 실패 패턴에 들어갑니다.',
      en: 'Starting tech adoption at Awareness stage enters the MIT NANDA 95% failure pattern.'
    },
    citation: 'Gartner AI Maturity Model + MIT NANDA 2025'
  },

  // ══════════════════════════════════════════════
  // Gartner Level 3 (Operational) 진입 — 긍정 힌트
  // ══════════════════════════════════════════════
  {
    id: 'rule-gartner-operational',
    scope: 'assessment_complete',
    priority: 5,
    condition: {
      type: 'gartnerAvgLevel',
      operator: '>=',
      value: 2.5
    },
    do: {
      ko: '🎯 Operational 진입! Wave 2 전사 확산을 위해 거버넌스 공식화 + 인사 평가 연동을 시작하세요.',
      en: '🎯 Reached Operational! Start formalizing governance + HR evaluation integration for Wave 2 org-wide expansion.'
    },
    dont: {
      ko: 'Operational에서 멈추지 마세요 — McKinsey State of AI 2025에 따르면 이 단계의 기업 중 5.5%만 EBIT 5%+ 기여.',
      en: 'Don\'t stall at Operational — only 5.5% of firms at this stage achieve 5%+ EBIT impact (McKinsey 2025).'
    },
    citation: 'McKinsey State of AI 2025'
  }
];

if (typeof window !== 'undefined') {
  window.HINT_RULES = HINT_RULES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HINT_RULES;
}
