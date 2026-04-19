/**
 * FLOW~ AX Platform — 4-Skill Assessment Questions (20 items)
 *
 * Based on: Bevilacqua et al. (2025) — AI Leadership 4-Skill Framework
 * Journal of Business Research, Vol. 205
 * https://www.sciencedirect.com/science/article/pii/S0148296325007015
 *
 * 4 Axes × 5 Questions each = 20 Likert-5 items
 * @module questions-4skill
 */

const QUESTIONS_4SKILL = {
  metadata: {
    id: 'assessment-4skill',
    title: 'FLOW~ AI 리더십 4-Skill 자가진단',
    titleEn: 'FLOW~ AI Leadership 4-Skill Self-Assessment',
    version: '2026.04.1',
    source: 'Bevilacqua et al. (2025) Journal of Business Research',
    scale: 'likert5',
    estimatedMinutes: 15,
    totalQuestions: 20,
    axes: {
      A: { name: 'AI Open Mindset', nameKo: 'AI 개방적 사고', color: '#3B82F6' },
      B: { name: 'AI Strategic Co-Thinker', nameKo: 'AI 전략적 파트너', color: '#10B981' },
      C: { name: 'Multi-Level Connector', nameKo: '다층 연결자', color: '#F59E0B' },
      D: { name: 'Ethics & Risk Management', nameKo: '윤리·리스크 관리', color: '#EF4444' }
    }
  },
  scaleLabels: [
    { value: 1, label: '전혀 아니다', labelEn: 'Strongly disagree' },
    { value: 2, label: '아니다', labelEn: 'Disagree' },
    { value: 3, label: '보통', labelEn: 'Neutral' },
    { value: 4, label: '그렇다', labelEn: 'Agree' },
    { value: 5, label: '매우 그렇다', labelEn: 'Strongly agree' }
  ],
  questions: [
    // ── A. AI Open Mindset (5 items) ──
    {
      id: '4skill-A1',
      axis: 'A',
      order: 1,
      text: '나는 AI 도구 앞에서 모르는 것을 인정하는 데 편안함을 느낀다.',
      textEn: 'I feel comfortable admitting what I don\'t know when using AI tools.'
    },
    {
      id: '4skill-A2',
      axis: 'A',
      order: 2,
      text: '나는 팀원·동료에게 내가 AI로 실패한 경험을 공개적으로 공유한다.',
      textEn: 'I openly share my AI failure experiences with team members and peers.'
    },
    {
      id: '4skill-A3',
      axis: 'A',
      order: 3,
      text: '나는 월 1회 이상 새로운 AI 기능을 의도적으로 실험한다.',
      textEn: 'I deliberately experiment with new AI features at least monthly.'
    },
    {
      id: '4skill-A4',
      axis: 'A',
      order: 4,
      text: '나는 AI가 내 경영 판단에 반론을 제기했을 때 이를 진지하게 검토한다.',
      textEn: 'I seriously consider AI\'s counterarguments to my management decisions.'
    },
    {
      id: '4skill-A5',
      axis: 'A',
      order: 5,
      text: '나는 내 전문성이 AI 앞에서 상대화될 수 있음을 수용한다.',
      textEn: 'I accept that my expertise can be relativized by AI.'
    },

    // ── B. AI Strategic Co-Thinker (5 items) ──
    {
      id: '4skill-B1',
      axis: 'B',
      order: 6,
      text: '나는 AI에게 3단계 질문(정보 탐색 → 시나리오 → 가정 도전)을 설계할 수 있다.',
      textEn: 'I can design 3-stage questions for AI (information → scenario → challenge assumptions).'
    },
    {
      id: '4skill-B2',
      axis: 'B',
      order: 7,
      text: '나는 AI의 편향·환각·맥락 부재를 구조적으로 이해하고 있다.',
      textEn: 'I structurally understand AI\'s biases, hallucinations, and lack of context.'
    },
    {
      id: '4skill-B3',
      axis: 'B',
      order: 8,
      text: '나는 AI 결과물을 경험과 맥락으로 필터링하여 판단한다.',
      textEn: 'I filter AI outputs through my experience and context to make judgments.'
    },
    {
      id: '4skill-B4',
      axis: 'B',
      order: 9,
      text: '나는 주 1회 이상 중요 의사결정에 AI를 파트너로 활용한다.',
      textEn: 'I use AI as a partner for important decisions at least weekly.'
    },
    {
      id: '4skill-B5',
      axis: 'B',
      order: 10,
      text: '나는 AI 결과물의 근거와 출처를 비판적으로 검증한다.',
      textEn: 'I critically verify the evidence and sources behind AI outputs.'
    },

    // ── C. Multi-Level Connector (5 items) ──
    {
      id: '4skill-C1',
      axis: 'C',
      order: 11,
      text: '나는 AX 전략을 현장 언어로 번역하여 팀원과 소통할 수 있다.',
      textEn: 'I can translate AX strategy into field language to communicate with team members.'
    },
    {
      id: '4skill-C2',
      axis: 'C',
      order: 12,
      text: '나는 중간관리자의 역할을 "실행자"에서 "번역자"로 재정의하고 있다.',
      textEn: 'I am redefining the middle manager role from "executor" to "translator".'
    },
    {
      id: '4skill-C3',
      axis: 'C',
      order: 13,
      text: '나는 타 부서의 AI 활용 사례를 본부로 가져오는 행동을 한다.',
      textEn: 'I actively bring AI use cases from other departments into my unit.'
    },
    {
      id: '4skill-C4',
      axis: 'C',
      order: 14,
      text: '나는 Champion·Data Translator 같은 하이브리드 역할을 의도적으로 육성한다.',
      textEn: 'I deliberately cultivate hybrid roles like Champion or Data Translator.'
    },
    {
      id: '4skill-C5',
      axis: 'C',
      order: 15,
      text: '나는 현장의 AI 실험에 자율성과 예산을 위임한다.',
      textEn: 'I delegate autonomy and budget for AI experiments in the field.'
    },

    // ── D. Ethics & Risk Management (5 items) ──
    {
      id: '4skill-D1',
      axis: 'D',
      order: 16,
      text: '나는 공공기관 AI 사용에 3가지 이상의 원칙을 명시할 수 있다.',
      textEn: 'I can articulate at least 3 principles for AI use in public institutions.'
    },
    {
      id: '4skill-D2',
      axis: 'D',
      order: 17,
      text: '나는 AI 윤리 리스크를 전략적 자산으로 인식한다 (컴플라이언스가 아닌).',
      textEn: 'I view AI ethics risks as strategic assets, not just compliance.'
    },
    {
      id: '4skill-D3',
      axis: 'D',
      order: 18,
      text: '나는 팀의 AI 사용 전 거버넌스 체크리스트를 적용한다.',
      textEn: 'I apply a governance checklist before my team uses AI.'
    },
    {
      id: '4skill-D4',
      axis: 'D',
      order: 19,
      text: '나는 노조·직원 대표와 AX 관련 투명 소통을 지속한다.',
      textEn: 'I maintain transparent communication with unions and employee representatives on AX.'
    },
    {
      id: '4skill-D5',
      axis: 'D',
      order: 20,
      text: '나는 AI 출력물의 편향·환각 위험을 2차 검증한다.',
      textEn: 'I perform secondary verification on bias and hallucination risks in AI outputs.'
    }
  ]
};

// Expose to global scope for vanilla JS consumers
if (typeof window !== 'undefined') {
  window.QUESTIONS_4SKILL = QUESTIONS_4SKILL;
}

// Optional CommonJS/ESM compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS_4SKILL;
}
