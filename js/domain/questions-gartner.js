/**
 * FLOW~ AX Platform — Gartner AI Maturity Assessment (10 items)
 *
 * Based on: Gartner AI Maturity Model (5 stages)
 * https://www.gartner.com/en/chief-information-officer/research/ai-maturity-model-toolkit
 *
 * 5 domains × 2 questions = 10 multi-choice items (5-level Likert)
 * @module questions-gartner
 */

const QUESTIONS_GARTNER = {
  metadata: {
    id: 'assessment-gartner',
    title: 'Gartner AI Maturity 조직 자가진단',
    titleEn: 'Gartner AI Maturity Organizational Self-Assessment',
    version: '2026.04.1',
    source: 'Gartner AI Maturity Model (5 Stages)',
    scale: 'choice5',
    estimatedMinutes: 10,
    totalQuestions: 10,
    levelLabels: [
      { value: 1, label: 'Awareness (인식)', color: '#fdeaa8' },
      { value: 2, label: 'Active (활동)', color: '#f9c784' },
      { value: 3, label: 'Operational (운영)', color: '#f4a261' },
      { value: 4, label: 'Systemic (체계)', color: '#e76f51' },
      { value: 5, label: 'Transformational (전환)', color: '#264653' }
    ],
    domains: {
      strategy: { name: 'AI 전략', nameEn: 'AI Strategy' },
      people: { name: '인재·역량', nameEn: 'People & Capability' },
      technology: { name: '기술·인프라', nameEn: 'Technology & Infrastructure' },
      culture: { name: '문화·변화', nameEn: 'Culture & Change' },
      governance: { name: '거버넌스', nameEn: 'Governance' }
    }
  },
  questions: [
    // ── I. AI 전략 ──
    {
      id: 'gartner-Q1',
      domain: 'strategy',
      order: 1,
      text: '우리 조직의 AI 전략은 어느 수준인가?',
      choices: [
        { value: 1, label: '언급은 되지만 문서화 없음' },
        { value: 2, label: '부분 문서화, 일부 부서만 공유' },
        { value: 3, label: '본부 공식 문서, 전 부서 공유' },
        { value: 4, label: '전사 전략과 정렬, KPI 연계' },
        { value: 5, label: '비즈니스 모델 재설계 수준' }
      ]
    },
    {
      id: 'gartner-Q2',
      domain: 'strategy',
      order: 2,
      text: 'AI 사용 사례(Use Case) 포트폴리오는?',
      choices: [
        { value: 1, label: '1-2개 실험' },
        { value: 2, label: '5개 내 파일럿' },
        { value: 3, label: '10개 내 운영' },
        { value: 4, label: '30개 이상 확장' },
        { value: 5, label: '100+ 전 프로세스 통합' }
      ]
    },

    // ── II. 인재·역량 ──
    {
      id: 'gartner-Q3',
      domain: 'people',
      order: 3,
      text: 'AI 활용 인재 분포는?',
      choices: [
        { value: 1, label: 'L1(미경험) 다수' },
        { value: 2, label: 'L2(입문) 30%+' },
        { value: 3, label: 'L3(활용) 40%+' },
        { value: 4, label: 'L4(전문) 20%+' },
        { value: 5, label: 'L5(혁신) 5%+' }
      ]
    },
    {
      id: 'gartner-Q4',
      domain: 'people',
      order: 4,
      text: 'Champion·Data Translator 체계는?',
      choices: [
        { value: 1, label: '없음' },
        { value: 2, label: '자발 활동' },
        { value: 3, label: '공식 지정' },
        { value: 4, label: '직제화 + 예산' },
        { value: 5, label: '전사 네트워크' }
      ]
    },

    // ── III. 기술·인프라 ──
    {
      id: 'gartner-Q5',
      domain: 'technology',
      order: 5,
      text: '승인 AI 도구 목록은?',
      choices: [
        { value: 1, label: '없음' },
        { value: 2, label: '1-2개' },
        { value: 3, label: '3-5개 + 심사 체계' },
        { value: 4, label: '다중 + 통합 관리' },
        { value: 5, label: '자체 AI 플랫폼' }
      ]
    },
    {
      id: 'gartner-Q6',
      domain: 'technology',
      order: 6,
      text: '데이터 등급·정책은?',
      choices: [
        { value: 1, label: '없음' },
        { value: 2, label: '일부 부서 운영' },
        { value: 3, label: '공식 문서화' },
        { value: 4, label: '자동 분류 시스템' },
        { value: 5, label: '실시간 거버넌스' }
      ]
    },

    // ── IV. 문화·변화 ──
    {
      id: 'gartner-Q7',
      domain: 'culture',
      order: 7,
      text: '실패 허용·공개 학습 문화는?',
      choices: [
        { value: 1, label: '미형성' },
        { value: 2, label: '특정 부서만' },
        { value: 3, label: '본부 전반' },
        { value: 4, label: '제도화 (보상 연동)' },
        { value: 5, label: '자발적 확산' }
      ]
    },
    {
      id: 'gartner-Q8',
      domain: 'culture',
      order: 8,
      text: 'AI 관련 내부 커뮤니케이션은?',
      choices: [
        { value: 1, label: '없음' },
        { value: 2, label: '월 1회 공지' },
        { value: 3, label: '정기 공유회' },
        { value: 4, label: '전용 채널·뉴스레터' },
        { value: 5, label: '참여형 플랫폼' }
      ]
    },

    // ── V. 거버넌스 ──
    {
      id: 'gartner-Q9',
      domain: 'governance',
      order: 9,
      text: 'AI 윤리·리스크 체계는?',
      choices: [
        { value: 1, label: '없음' },
        { value: 2, label: '가이드라인 초안' },
        { value: 3, label: '공식 문서 + 책임자' },
        { value: 4, label: '위원회 + 프로세스' },
        { value: 5, label: '상시 감사·외부 검증' }
      ]
    },
    {
      id: 'gartner-Q10',
      domain: 'governance',
      order: 10,
      text: '평가·인사 연동은?',
      choices: [
        { value: 1, label: '없음' },
        { value: 2, label: '검토 중' },
        { value: 3, label: '일부 반영' },
        { value: 4, label: '전사 적용' },
        { value: 5, label: '승진 필수 요건' }
      ]
    }
  ]
};

if (typeof window !== 'undefined') {
  window.QUESTIONS_GARTNER = QUESTIONS_GARTNER;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS_GARTNER;
}
