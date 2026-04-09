# 07. 제안서 AI Agent (PropAI) 베타 배포 계획

> 목표: HRDK 신청서 제출 시점에 **공개 데모 URL + 스크린샷**을 "AI 솔루션 보유 증빙"으로 첨부

## 0. 기존 자산 확인

- **위치**: `D:\00 Antigravity\ACTIVE\20260226 Agent\flow-proposal-generator\`
- **스택**: React 19 + Vite 7 + TypeScript + Tailwind v4 + Gemini API (`@google/generative-ai`)
- **출력**: PPTX 생성 (`pptxgenjs`), ZIP 패키징 (`jszip`), 파일 저장 (`file-saver`)
- **상태**: 빌드 가능 (`dist/` 존재), 즉시 배포 가능

## 1. 배포 목표

| 항목 | 목표 |
|---|---|
| 공개 URL | `https://propai.flowdesign.ai.kr` 또는 `propai-flow.vercel.app` |
| 인증 | 베타 키 또는 Google 로그인 (선택) |
| 데모 | 게스트 모드로 RFP 1건 → 제안서 1편 생성 가능 |
| 안정성 | 500 에러 0건 / 응답 30초 이내 |

## 2. 배포 단계 (3일 스프린트)

### Day 1 — 환경 점검 + Gemini API 키
1. `npm install` → `npm run build` 무오류 확인
2. Gemini API 키 발급 (Google AI Studio 무료 등급으로 시작)
3. `.env.local`에 `VITE_GEMINI_API_KEY` 설정
4. 로컬 `npm run dev`에서 RFP 입력 → 제안서 생성 검증
5. 핵심 버그/UX 5건 이내 수정

### Day 2 — Vercel 배포
1. Vercel CLI 설치 / 또는 GitHub 연동
2. `vercel` 프로젝트 생성, 환경변수 등록 (`VITE_GEMINI_API_KEY`)
3. 첫 배포 → 프리뷰 URL 확보
4. 커스텀 도메인 연결 (`propai.flowdesign.ai.kr`) — DNS A/CNAME 설정
5. SSL 자동 발급 확인

### Day 3 — 증빙 자료 패키징
1. **스크린샷 5장**: 메인 / RFP 입력 / 생성 중 / 결과 / 다운로드
2. **튜토리얼 영상 1편** (2~3분, Loom/OBS) — RFP 1건 → 제안서 출력 풀 시연
3. **저작권 등록 신청** — 컴퓨터프로그램 저작권 (한국저작권위원회 ccr.copyright.or.kr)
   - 등록비 약 5만원, 처리 1~2주
   - 등록증을 "AI 솔루션 보유 증빙"으로 신청서 첨부
4. **솔루션 소개 1pager** PDF 생성

## 3. 산출물 위치

```
D:\00 Antigravity\ACTIVE\HRDK_AX_2026\
└── 08_솔루션_증빙\
    ├── PropAI_데모URL.txt
    ├── 스크린샷_01_메인.png
    ├── 스크린샷_02_RFP입력.png
    ├── 스크린샷_03_생성.png
    ├── 스크린샷_04_결과.png
    ├── 스크린샷_05_다운로드.png
    ├── PropAI_튜토리얼.mp4
    ├── PropAI_소개_1pager.pdf
    └── 저작권등록증.pdf  ← 등록 후
```

## 4. 보안·운영 체크

- [ ] Gemini API 키는 **환경변수**로만 관리, 코드 하드코딩 금지
- [ ] `.env.local`이 `.gitignore`에 포함되었는지 확인
- [ ] Vercel 환경변수에서 키 분리 관리
- [ ] 무료 등급 한도 모니터링 (월 사용량 알림)
- [ ] 데모 사용자 입력 RFP는 **저장하지 않음** (개인정보 회피)
- [ ] 약관·개인정보처리방침 페이지 추가

## 5. 신청서 활용 포인트

운영계획서 「Ⅱ. AI 솔루션 소개」 섹션에 다음 추가:
- ✅ 베타 서비스 URL: `https://propai.flowdesign.ai.kr`
- ✅ 시연 영상 URL: 〔YouTube/Loom 링크〕
- ✅ 한국저작권위원회 컴퓨터프로그램 저작권 등록증
- ✅ 스크린샷 5장
- ✅ 기술 스택 다이어그램

## 6. 후속 확장 (선정 후 운영 단계)
- 사용자 인증·과금 (Firebase Auth + Stripe)
- 회사 자료 RAG 색인 기능
- 협업·버전관리
- 훈련생용 학습 모드 (PBL 단계별 가이드)
