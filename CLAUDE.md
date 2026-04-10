# flow-ax-workshop — CLAUDE.md

> FLOW~ AX Design Lab — 기업 AI 전환 (AX) 워크숍 플랫폼

## 프로젝트 개요

기업 AI 전환(AX) 워크숍 운영을 위한 웹 플랫폼 + 산출물 자산 모음.
Firebase Hosting 기반 정적 웹앱 + 워크숍 교안 및 제안서 자료.

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Vanilla JS + HTML/CSS |
| DB | Firebase Firestore |
| 배포 | Firebase Hosting + Vercel |
| 산출물 | Markdown, DOCX (deliverables/) |

## 폴더 구조

```
flow-ax-workshop/
├── index.html          ← 메인 랜딩 페이지
├── dashboard.html      ← 워크숍 대시보드
├── admin.html          ← 관리자 페이지
├── gallery.html        ← 갤러리 페이지
├── js/                 ← 클라이언트 스크립트
├── css/                ← 스타일시트
├── AX Project/         ← AX 전략 문서 (txt)
├── deliverables/       ← 워크숍 산출물 자산
│   ├── 01_proposal/    ← 제안서
│   ├── 02_curriculum/  ← 교안
│   ├── 03_guides/      ← 가이드
│   ├── 04_pricing_contracts/ ← 견적/계약
│   ├── 05_notion_export/ ← Notion 내보내기
│   └── 06_differentiator/ ← 차별화 자료
├── AI시대 리더십/       ← 리더십 프로그램 자료
├── DDD_AI_워크숍/       ← DDD 워크숍 자료
├── HRDK_AX_2026/       ← HRDK AX 2026 프로그램
├── firebase.json       ← Firebase Hosting 설정
├── firestore.rules     ← Firestore 보안 규칙
└── vercel.json         ← Vercel 라우팅 설정
```

## 실행 방법

```bash
# Firebase Hosting 로컬 에뮬레이터
npm run dev
# 또는
firebase serve

# Vercel 로컬
vercel dev
```

## 배포

```bash
# Firebase Hosting
firebase deploy

# Vercel
vercel --prod
```

## .workspace/

`.workspace/` 폴더는 Claude Code 작업 추적용 — git에서 제외됨.

## 보안 원칙

- API 키, Firebase 설정은 `.env` / `.env.local`에 저장 (gitignore됨)
- `firestore.rules`로 DB 접근 제어
