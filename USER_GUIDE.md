# FLOW~ AX Workshop Platform — 사용자 가이드

> **배포 URL**: https://flow-ax-workshop.vercel.app
> **저장소**: https://github.com/Demian-Yim/flow-ax-workshop (private)
> **최종 업데이트**: 2026-04-10

---

## 1. 플랫폼 개요

FLOW~ AX Workshop Platform은 AI × 사람의 협업으로 일의 새 흐름을 만드는 실전 워크샵 운영 플랫폼입니다. 참가자는 입장 코드로 워크샵에 접속하고, 운영진은 퍼실리테이터/심사위원/시스템 관리자 역할로 로그인하여 운영합니다.

### 기술 스택
- Frontend: HTML + CSS + Vanilla JS (No framework)
- Backend: Firebase (Firestore + Auth)
- Hosting: Vercel (GitHub 자동 배포)

---

## 2. 페이지 구조

| 경로 | 파일 | 용도 |
|---|---|---|
| `/` | `index.html` | 랜딩 + 참가자 입장 코드 입력 |
| `/admin` | `admin.html` | 운영진 대시보드 (워크샵 생성, 모니터링, 설정) |
| `/dashboard` | `dashboard.html` | 워크샵 진행 중 팀 현황 |
| `/gallery` | `gallery.html` | 결과물 갤러리 |

---

## 3. 참가자 이용 흐름

1. https://flow-ax-workshop.vercel.app 접속
2. 운영자로부터 전달받은 **4자리 입장 코드** 입력
3. `✨ 참여하기` 버튼 클릭 → 워크샵 진입

---

## 4. 운영진 로그인

### 접속 방법
1. 우측 상단 `⚙️` 아이콘 클릭
2. 역할 선택 (퍼실리테이터 / 심사위원 / 시스템 관리자)
3. 비밀번호 입력

### 역할별 비밀번호 (현재 버전)

| 역할 | 비밀번호 | 권한 |
|---|---|---|
| 퍼실리테이터 | `flow2026` | 워크샵 진행, 팀 모니터링 |
| 심사위원 | `flow2026` | 결과물 심사, 피드백 작성 |
| 시스템 관리자 | `admin2026` | 전체 시스템 설정, 데이터 관리 |

> ⚠️ **보안 주의**: 현재 비밀번호는 `js/landing.js`에 하드코딩되어 있습니다. 실제 운영 전 반드시 **Firebase Auth**로 전환하세요. (`js/landing.js:196-200`)

### 마스터 패스워드
`admin2026`은 모든 역할로 접속 가능한 마스터 패스워드입니다.

---

## 5. 로컬 개발

```bash
cd "D:/00 Antigravity/ACTIVE/flow-ax-workshop"

# 로컬 서버 (택 1)
npx serve .
# 또는
python -m http.server 8000
```

정적 사이트이므로 빌드 단계 없이 바로 브라우저에서 열어볼 수 있습니다.

---

## 6. 배포 프로세스

Vercel이 GitHub `master` 브랜치에 연결되어 있어 **push 시 자동 재배포**됩니다.

```bash
git add <변경파일>
git commit -m "fix: 설명"
git push origin master
# → Vercel이 1~2분 내 자동 배포
```

수동 배포:
```bash
vercel --prod
```

---

## 7. Firebase 설정

프로젝트: `flow-link-960e9`
- 설정 파일: `js/firebase-config.js`
- 규칙: `firestore.rules`
- 인덱스: `firestore.indexes.json`

> API 키는 공개되어도 되지만, **Firebase 콘솔에서 도메인 제한**(Authorized domains) 설정이 필수입니다.

---

## 8. 디렉토리 구조

```
flow-ax-workshop/
├── index.html            # 랜딩 (참가자 진입)
├── admin.html            # 운영진 대시보드
├── dashboard.html        # 실시간 워크샵 현황
├── gallery.html          # 결과물 갤러리
├── css/
│   ├── global.css        # 디자인 토큰 (White Aura v3)
│   ├── landing.css       # 랜딩 전용 (hero, entry-card)
│   ├── admin.css         # 관리자 페이지
│   ├── dashboard.css
│   └── gallery.css
├── js/
│   ├── particles.js      # 파티클 배경 애니메이션
│   ├── landing.js        # 입장 코드 + 로그인 로직
│   ├── firebase-config.js
│   ├── admin.js
│   ├── dashboard.js
│   └── gallery.js
├── firebase.json
├── firestore.rules
├── vercel.json           # Vercel rewrites + 보안 헤더
└── README.md
```

---

## 9. 디자인 시스템 (v3.0 White Aura)

### 컬러 토큰 (`css/global.css`)
- `--c-primary`: 인디고 (`#6366f1`)
- `--c-aura-1 ~ 6`: 오로라 그라디언트 컬러 6종
- FLOW~ 로고: 블루 그라디언트 `#1e40af → #3b82f6 → #06b6d4`

### 배경
- 화이트 베이스 + 다층 radial gradient
- 상단 애니메이션 그라디언트 액센트 라인
- 파티클 캔버스 (`hero__particles`)

---

## 10. 알려진 이슈 / TODO

- [ ] **보안**: 관리자 비밀번호 Firebase Auth로 교체
- [ ] **admin.html 인코딩 깨짐**: 한글 문자열이 mojibake 상태 (UTF-8 재저장 필요)
- [ ] **입장 코드 발급 UI**: admin.html에서 4자리 코드 생성/관리 기능 확인
- [ ] **Vercel 커스텀 도메인**: `flowdesign.ai.kr` 연결 검토

---

## 11. 문의

- 운영: FLOW~ AX디자인연구소
- 웹사이트: https://flowdesign.ai.kr
- 개발 담당 AI: MAX (Claude Code CLI)
