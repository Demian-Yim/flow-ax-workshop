# FLOW · AX 디자인연구소 — 관리자 사용 매뉴얼

> **배포 URL**: https://flow-ax-workshop.vercel.app
> **저장소**: https://github.com/Demian-Yim/flow-ax-workshop
> **최종 업데이트**: 2026-04-20

---

## 0. 한눈에 보기

| 항목 | 값 |
|---|---|
| 브랜드 | FLOW · AX 디자인연구소 (FLOW : AX Design Lab) |
| 포지셔닝 | AI 도구 도입이 아닌, 일과 사람의 관계를 다시 디자인 |
| 디자인 시스템 | Noir Playful v6 (B&W + Electric Lime #E3FF38) |
| 기술 스택 | Vanilla HTML/CSS/JS · Firebase Firestore · Vercel |
| 주요 URL | `/` 랜딩 · `/assessment` 자가진단 · `/report` 결과지 · `/admin` 관리자 |

---

## 1. 제공 서비스 (Service Map)

| No. | 서비스 | 한 줄 설명 | 진입점 |
|---|---|---|---|
| 01 | **진단** | Bevilacqua 4-Skill + Gartner Maturity 30문항 자가진단 (20분) | `/assessment` |
| 02 | **재설계** | RTC → ICEP → WHY·WHAT·HOW 직무 리디자인 (반나절~2일) | 대면 · 코드 입장 |
| 03 | **정착** | 90일 주간 체크인 + Champion 식별 | 대면 · 코드 입장 |

---

## 2. 참가자 이용 흐름

### A. 자가진단만 이용 (코드 불필요)
1. https://flow-ax-workshop.vercel.app 접속
2. 히어로 하단 **"코드 없이 자가진단"** 클릭 → `/assessment`
3. 부서 · 이름(선택) · 워크숍 코드 입력 → 30문항 응답
4. 완료 후 `/report?id=RES-xxx`로 개인 결과지 자동 이동
5. 결과지에서 PDF 다운로드 · 인쇄 가능

### B. 워크숍 참여 (강사에게 코드 수령)
1. 랜딩 페이지 "Enter" 섹션에 4자리 코드 입력
2. `Enter workshop` 클릭 → 대시보드 진입

---

## 3. 운영진 (Staff) 로그인

### 접속 방법
1. 랜딩 페이지 우측 상단 **`Staff`** 버튼 클릭
2. 역할 선택 (퍼실리테이터 / 심사위원 / 시스템 관리자)
3. 비밀번호 입력 → `Sign in`

### 역할별 비밀번호 (MVP)

| 역할 | 비밀번호 | 권한 |
|---|---|---|
| 퍼실리테이터 | `flow2026` | 워크숍 진행 · 팀 모니터링 |
| 심사위원 | `flow2026` | 결과물 심사 · 피드백 작성 |
| 시스템 관리자 | `admin2026` | 전체 시스템 · 데이터 |

> ⚠️ **보안 경고**: 현재 비밀번호는 `js/landing.js` 하드코딩. 실제 프로덕션 전환 시 반드시 Firebase Auth로 교체.

---

## 4. 진단 운영 프로세스

### 사전 준비 (강사)
1. `/admin` 에서 워크숍 생성 (4자리 자동 코드 발급)
2. 참여자에게 링크 + 코드 전달 (카톡/슬랙)

### 진단 실시 중 모니터링
- Firebase 콘솔 > Firestore Database > `assessmentResponses` 컬렉션에서 실시간 응답 확인
- 필드: `participant.workshopCode`, `phase` (pre/post), `scoreSummary`, `anomalyFlags`

### 응답 품질 점검 (자동 플래그)
`anomalyFlags` 배열에 자동 기록됨:
- **critical**: 문항당 3초 미만 응답, 모두 같은 값 선택
- **warn**: 문항당 6초 미만, 응답 종류 2가지 이하
- **info**: 제출까지 72시간 초과

### 사전(pre) → 사후(post) 비교
- `/report?id=RES-xxx` 접속 시 동일 `workshopCode + dept + name`의 pre 응답 자동 매칭
- PGI (Personal Growth Index) = (post − pre) / (100 − pre) × 100
- Before/After 레이더 오버레이 자동 표시

---

## 5. Firebase 설정

### 프로젝트
- Project ID: `flow-link-960e9`
- Region: `asia-northeast3` (서울)

### 배포 명령
```bash
cd "D:/00 Antigravity/ACTIVE/flow-ax-workshop"

# 규칙 + 인덱스 배포
firebase deploy --only firestore:rules,firestore:indexes

# Vercel 배포 (선택)
vercel --prod
```

### 주요 Firestore 컬렉션
| 컬렉션 | 용도 |
|---|---|
| `assessmentResponses` | 자가진단 응답 (참여자별) |
| `workshops` | 워크숍 클래스 정보 |
| `worksheets` | RTC / ICEP / EARS 워크시트 |
| `actionPlans` | 90일 실행 계획 + 체크인 |
| `trajectories` | 사전/사후 궤적 |
| `reports` | 개인/조직 리포트 캐시 |
| `hintRules` | Do & Don't 규칙 (관리자 편집) |

---

## 6. Git / 배포 워크플로

Vercel이 GitHub `master` 브랜치에 연결 → **push 시 자동 재배포**.

```bash
git add <file>
git commit -m "fix: <설명>"
git push origin master
# → Vercel 자동 배포 (1~2분)
```

수동 프로덕션 배포:
```bash
vercel --prod --yes
```

---

## 7. 디렉토리 구조 (2026-04 현재)

```
flow-ax-workshop/
├── index.html              # 랜딩 (AX Design Lab 히어로)
├── assessment.html         # 자가진단 UI
├── report.html             # 개인 결과지 (Chart.js 레이더)
├── admin.html              # 운영진 대시보드
├── dashboard.html          # 워크숍 실시간 현황
├── gallery.html            # 결과물 갤러리
│
├── css/
│   ├── landing.css         # Noir Playful v6 (랜딩)
│   ├── assessment.css      # 진단 UI (동일 팔레트)
│   ├── report.css          # 결과지 UI
│   ├── admin.css           # 관리자
│   └── dashboard.css
│
├── js/
│   ├── firebase-config.js  # Firestore 헬퍼
│   ├── landing.js          # 코드 입력 + 로그인
│   ├── landing-motion.js   # 마그넷틱 커서 + 모션
│   ├── admin.js
│   ├── dashboard.js
│   ├── ax-admin.js
│   ├── ax-phases.js
│   ├── app/
│   │   ├── assessment.js   # 진단 컨트롤러 (FlowApp)
│   │   └── report.js       # 결과지 컨트롤러 (FlowReport)
│   └── domain/             # 순수 도메인 로직
│       ├── questions-4skill.js  (20문항)
│       ├── questions-gartner.js (10문항)
│       ├── scoring.js           (PGI · 축별 · 360°)
│       ├── hint-rules.js        (Do&Don't DSL)
│       ├── hint-engine.js       (DSL 평가기)
│       └── anomaly-detector.js  (이상 응답 탐지)
│
├── deliverables/           # 교안 · 제안서 · 가이드 문서
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── vercel.json             # /assessment, /report 라우트
└── USER_GUIDE.md           # ← 이 문서
```

---

## 8. 디자인 시스템 (Noir Playful v6)

### 팔레트
- Base: **Pure Black** `#000000` + **White** `#FFFFFF`
- Accent: **Electric Lime** `#E3FF38` (단일 악센트)
- 보조: Hot Coral `#FF5B2E` (매우 제한적 사용)
- Cream panel: `#F5F3EE` (포인트 패널)

### 타이포
- Display: **Space Grotesk** 500 (geometric sans)
- Italic pops: **Instrument Serif** (세리프 악센트)
- Mono: **JetBrains Mono** (캡션 · 레이블)

### 참조
- 레퍼런스: [analogueagency.com](https://analogueagency.com) (Amsterdam)
- 철학: Seriously Playful — 미니멀 B&W + 마그넷틱 커서 · 라임 스윕 · 스태거 애니메이션

---

## 9. 자주 하는 작업

### 진단 문항 수정
- `js/domain/questions-4skill.js` — 4-Skill 20문항
- `js/domain/questions-gartner.js` — Gartner 10문항
- 변경 후 즉시 반영 (빌드 불필요) → git push

### Do & Don't 규칙 수정
- `js/domain/hint-rules.js` — 10개 JSON DSL 규칙
- 조건 타입: `axisAverage`, `questionValue`, `allAnswersEqual`, `responseDuration`, `consecutiveMisses`, `gartnerAvgLevel`
- 각 규칙에 `priority`, `scope`, `condition`, `do`, `dont`, `citation` 필드

### 워크숍 코드 생성
- `/admin` → 1. 워크숍 클래스 관리 탭 → 새 워크숍 생성 버튼
- 자동으로 4자리 영숫자 코드 발급 (`generateClassCode()` in `js/firebase-config.js`)

---

## 10. TODO (다음 스프린트)

- [ ] **보안**: 하드코딩 비밀번호 → Firebase Auth 이메일/링크 인증으로 교체
- [ ] **360° 평가**: 동료·상사·하위자·외부자 가중 평가 UI
- [ ] **조직 대시보드**: `/admin` 하단에 조직 히트맵 · Champion 풀 · 이상 응답 리스트
- [ ] **PDF 자동 생성**: 개인 결과지 → Firebase Storage 저장 후 공유 링크
- [ ] **Vercel 커스텀 도메인**: `flowdesign.ai.kr` 연결
- [ ] **Wave 2**: Kirkpatrick Level 4 ROI 계산기

---

## 11. 연락처 · 권한

- 운영: FLOW · AX 디자인연구소
- 웹사이트: [flowdesign.ai.kr](https://flowdesign.ai.kr)
- 저장소 관리자: @Demian-Yim
- 개발 담당 AI: MAX (Claude Opus 4.7)

---

**문서 이력**
- 2026-04-20: Noir Playful v6 + AX-first 개편 반영, 서비스 3종 정의 (진단/재설계/정착)
- 2026-04-19: 4-Skill + Gartner 자가진단 MVP 반영
- 2026-04-10: 최초 작성
