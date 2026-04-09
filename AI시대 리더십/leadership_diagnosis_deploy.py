#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Leadership Diagnosis 배포 스크립트
Antigravity AI Ecosystem - D.A.E_Setup

목적:
  - leadership-diagnosis 서비스를 dae_web_api.py에 통합
  - Anthropic Claude API 기반 리더십 진단 엔드포인트 추가
  - Notion에 진단 결과 자동 저장

사용법:
  python leadership_diagnosis_deploy.py --mode [local|server]
"""

import os
import sys
import json
import asyncio
import argparse
from datetime import datetime
from typing import Optional, Dict, Any

# ─────────────────────────────────────────────────────
# 필수 패키지 자동 설치
# ─────────────────────────────────────────────────────
def install_requirements():
    """필수 패키지 확인 및 설치"""
    required = ['anthropic', 'fastapi', 'uvicorn', 'notion-client', 'python-dotenv']
    import subprocess
    for pkg in required:
        try:
            __import__(pkg.replace('-', '_'))
        except ImportError:
            print(f"📦 {pkg} 설치 중...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg, '-q'])

install_requirements()

# ─────────────────────────────────────────────────────
# Leadership Diagnosis 핵심 모듈
# ─────────────────────────────────────────────────────
import anthropic
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 환경변수 로드
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
NOTION_API_KEY = os.getenv('NOTION_API_KEY')
NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')


# ─────────────────────────────────────────────────────
# 데이터 모델
# ─────────────────────────────────────────────────────
class DiagnosisRequest(BaseModel):
    name: str
    role: str
    organization: Optional[str] = "미기재"
    context: Optional[str] = ""
    focus_areas: Optional[list] = ["소통", "의사결정", "팀빌딩", "성과관리"]
    language: Optional[str] = "ko"


class DiagnosisResult(BaseModel):
    diagnosis_id: str
    name: str
    timestamp: str
    summary: str
    strengths: list
    growth_areas: list
    action_plan: list
    score: Dict[str, Any]
    notion_url: Optional[str] = None


# ─────────────────────────────────────────────────────
# Leadership Diagnosis 엔진
# ─────────────────────────────────────────────────────
class LeadershipDiagnosisEngine:
    """Claude API 기반 리더십 진단 엔진"""

    def __init__(self):
        if not ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.")
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-6"

    async def diagnose(self, request: DiagnosisRequest) -> DiagnosisResult:
        """리더십 진단 실행"""
        prompt = self._build_prompt(request)

        # Claude API 호출
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        raw_response = message.content[0].text

        # 결과 파싱
        result = self._parse_response(raw_response, request)
        return result

    def _build_prompt(self, req: DiagnosisRequest) -> str:
        """진단 프롬프트 구성"""
        focus_str = ", ".join(req.focus_areas)
        return f"""당신은 20년 경력의 조직개발 및 리더십 전문가입니다.
다음 리더에 대한 심층 진단을 JSON 형태로 제공해주세요.

[진단 대상]
- 이름: {req.name}
- 역할: {req.role}
- 조직: {req.organization}
- 맥락: {req.context if req.context else "별도 맥락 없음"}
- 진단 초점: {focus_str}

[요청 사항]
다음 JSON 형식으로 정확히 응답해주세요:
{{
  "summary": "리더십 전반 요약 (2-3문장)",
  "strengths": [
    {{"area": "강점 영역", "description": "설명", "evidence": "근거"}},
    {{"area": "강점 영역2", "description": "설명", "evidence": "근거"}},
    {{"area": "강점 영역3", "description": "설명", "evidence": "근거"}}
  ],
  "growth_areas": [
    {{"area": "성장 필요 영역", "description": "설명", "priority": "high/medium/low"}},
    {{"area": "성장 필요 영역2", "description": "설명", "priority": "high/medium/low"}}
  ],
  "action_plan": [
    {{"action": "실행 항목", "timeline": "1주/1달/3달", "expected_outcome": "기대 결과"}},
    {{"action": "실행 항목2", "timeline": "기간", "expected_outcome": "기대 결과"}},
    {{"action": "실행 항목3", "timeline": "기간", "expected_outcome": "기대 결과"}}
  ],
  "score": {{
    "communication": 0-10 숫자,
    "decision_making": 0-10 숫자,
    "team_building": 0-10 숫자,
    "performance_management": 0-10 숫자,
    "overall": 0-10 숫자
  }}
}}

JSON만 응답하세요. 다른 텍스트 없이."""

    def _parse_response(self, raw: str, req: DiagnosisRequest) -> DiagnosisResult:
        """Claude 응답 파싱"""
        try:
            # JSON 추출
            start = raw.find('{')
            end = raw.rfind('}') + 1
            json_str = raw[start:end]
            data = json.loads(json_str)
        except (json.JSONDecodeError, ValueError):
            data = {
                "summary": raw[:200],
                "strengths": [],
                "growth_areas": [],
                "action_plan": [],
                "score": {"overall": 7}
            }

        diagnosis_id = f"DIAG-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return DiagnosisResult(
            diagnosis_id=diagnosis_id,
            name=req.name,
            timestamp=datetime.now().isoformat(),
            summary=data.get("summary", ""),
            strengths=data.get("strengths", []),
            growth_areas=data.get("growth_areas", []),
            action_plan=data.get("action_plan", []),
            score=data.get("score", {})
        )


# ─────────────────────────────────────────────────────
# Notion 저장 모듈
# ─────────────────────────────────────────────────────
async def save_to_notion(result: DiagnosisResult) -> Optional[str]:
    """진단 결과를 Notion에 저장"""
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("⚠️ Notion API 키 미설정 - 저장 스킵")
        return None

    try:
        from notion_client import Client
        notion = Client(auth=NOTION_API_KEY)

        page = notion.pages.create(
            parent={"database_id": NOTION_DATABASE_ID},
            properties={
                "Name": {"title": [{"text": {"content": f"[진단] {result.name} - {result.timestamp[:10]}"}}]},
                "상태": {"select": {"name": "완료"}},
                "종합점수": {"number": result.score.get("overall", 0)},
                "날짜": {"date": {"start": result.timestamp[:10]}}
            },
            children=[
                {"object": "block", "type": "heading_2",
                 "heading_2": {"rich_text": [{"type": "text", "text": {"content": "📋 리더십 진단 결과"}}]}},
                {"object": "block", "type": "paragraph",
                 "paragraph": {"rich_text": [{"type": "text", "text": {"content": result.summary}}]}},
            ]
        )
        return page.get("url")
    except Exception as e:
        print(f"⚠️ Notion 저장 실패: {e}")
        return None


# ─────────────────────────────────────────────────────
# FastAPI 앱
# ─────────────────────────────────────────────────────
app = FastAPI(
    title="Antigravity Leadership Diagnosis API",
    description="D.A.E 리더십 진단 서비스",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = None


@app.on_event("startup")
async def startup_event():
    global engine
    try:
        engine = LeadershipDiagnosisEngine()
        print("✅ Leadership Diagnosis Engine 초기화 완료")
    except ValueError as e:
        print(f"⚠️ 엔진 초기화 실패: {e}")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "leadership-diagnosis",
        "timestamp": datetime.now().isoformat(),
        "engine_ready": engine is not None,
        "notion_connected": bool(NOTION_API_KEY)
    }


@app.post("/diagnose", response_model=DiagnosisResult)
async def run_diagnosis(request: DiagnosisRequest, background: BackgroundTasks):
    """리더십 진단 실행"""
    if not engine:
        raise HTTPException(status_code=503, detail="진단 엔진이 초기화되지 않았습니다. ANTHROPIC_API_KEY를 확인하세요.")

    result = await engine.diagnose(request)

    # Notion 저장은 백그라운드에서
    async def save_bg():
        url = await save_to_notion(result)
        if url:
            result.notion_url = url

    background.add_task(save_bg)
    return result


@app.get("/diagnose/{diagnosis_id}")
async def get_diagnosis(diagnosis_id: str):
    """진단 결과 조회 (Notion 연동 시)"""
    return {"message": "Notion 연동 후 조회 가능", "diagnosis_id": diagnosis_id}


# ─────────────────────────────────────────────────────
# 실행 진입점
# ─────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Leadership Diagnosis 서버')
    parser.add_argument('--mode', choices=['local', 'server'], default='local')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    import uvicorn

    host = "127.0.0.1" if args.mode == 'local' else "0.0.0.0"
    print(f"\n🚀 Leadership Diagnosis API 시작")
    print(f"   모드: {args.mode}")
    print(f"   주소: http://{host}:{args.port}")
    print(f"   문서: http://{host}:{args.port}/docs\n")

    uvicorn.run("leadership_diagnosis_deploy:app", host=host, port=args.port, reload=(args.mode == 'local'))
