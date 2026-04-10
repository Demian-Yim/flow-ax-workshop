// Samsong v2 — "보수적·실무" 톤 제안서
// Palette: Charcoal Minimal + Warm Accent
//   Primary Charcoal 36454F, Off-white F2F2F2, Deep Black 212121
//   Accent: Terracotta B85042 (heading ribbons)
//   Secondary: Sage A7BEAE (supporting)
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Demian";
pres.title = "FLOW~ AX Starter Track 제안서 — For 삼송";
pres.company = "FLOW~ : AX Design Lab";

const CHARCOAL = "36454F";
const CHARCOAL_D = "212121";
const OFFWHITE = "F2F2F2";
const TERRA = "B85042";
const SAND = "E7E8D1";
const SAGE = "A7BEAE";
const GRAY = "6B7280";
const GRAY_L = "9CA3AF";
const WHITE = "FFFFFF";

const F = "맑은 고딕";

// ───── Helpers ─────
const TOTAL = 12;

function addFooter(slide, pageNum) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 7.1, w: 12.3, h: 0, line: { color: SAND, width: 0.75 }
  });
  slide.addText("FLOW~ : AX Design Lab  ·  For 삼송", {
    x: 0.5, y: 7.2, w: 8, h: 0.3, fontSize: 9, fontFace: F, color: GRAY_L, margin: 0
  });
  slide.addText(`${pageNum.toString().padStart(2, "0")} / ${TOTAL.toString().padStart(2, "0")}`, {
    x: 11.5, y: 7.2, w: 1.3, h: 0.3, fontSize: 9, fontFace: F, color: GRAY_L, align: "right", margin: 0
  });
}

function addSectionHeader(slide, num, eyebrow, title) {
  // Left terracotta ribbon (motif)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.55, w: 0.15, h: 0.75, fill: { color: TERRA }, line: { color: TERRA }
  });
  slide.addText(eyebrow, {
    x: 0.8, y: 0.5, w: 12, h: 0.35, fontSize: 11, bold: true,
    fontFace: F, color: TERRA, charSpacing: 3, margin: 0
  });
  slide.addText(`${num.toString().padStart(2, "0")}  ${title}`, {
    x: 0.8, y: 0.85, w: 12, h: 0.6, fontSize: 28, bold: true,
    fontFace: F, color: CHARCOAL_D, margin: 0
  });
}

// ═══════════════ Slide 01 — Cover ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  // Dark band on left 1/3
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 4.5, h: 7.5, fill: { color: CHARCOAL_D }, line: { color: CHARCOAL_D }
  });
  // Terracotta accent line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 2.5, w: 0.15, h: 2.5, fill: { color: TERRA }, line: { color: TERRA }
  });
  s.addText("FLOW~", {
    x: 0.4, y: 2.55, w: 4, h: 0.55, fontSize: 22, bold: true,
    fontFace: F, color: OFFWHITE, charSpacing: 2, margin: 0
  });
  s.addText("AX DESIGN LAB", {
    x: 0.4, y: 3.05, w: 4, h: 0.4, fontSize: 11,
    fontFace: F, color: SAND, charSpacing: 4, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.4, y: 3.55, w: 1.0, h: 0, line: { color: TERRA, width: 2 }
  });
  s.addText("플로우~", {
    x: 0.4, y: 3.75, w: 4, h: 0.4, fontSize: 12,
    fontFace: F, color: GRAY_L, margin: 0
  });
  s.addText("AX 디자인 연구소", {
    x: 0.4, y: 4.05, w: 4, h: 0.4, fontSize: 12,
    fontFace: F, color: GRAY_L, margin: 0
  });

  // Footer on dark band
  s.addText("2026. 04. 09", {
    x: 0.4, y: 6.5, w: 4, h: 0.4, fontSize: 11,
    fontFace: F, color: SAND, margin: 0
  });
  s.addText("Demian (임정훈)", {
    x: 0.4, y: 6.85, w: 4, h: 0.4, fontSize: 11, bold: true,
    fontFace: F, color: WHITE, margin: 0
  });

  // Main title area (right side)
  s.addText("AX Starter Track", {
    x: 5.0, y: 1.5, w: 8, h: 0.5, fontSize: 14, bold: true,
    fontFace: F, color: TERRA, charSpacing: 3, margin: 0
  });
  s.addText("For 삼송", {
    x: 5.0, y: 2.0, w: 8, h: 0.55, fontSize: 16,
    fontFace: F, color: GRAY, margin: 0
  });

  s.addText([
    { text: "시작해볼 만한 ", options: { color: CHARCOAL_D } },
    { text: "최소 규모", options: { color: TERRA, bold: true } },
    { text: "의", options: { color: CHARCOAL_D } }
  ], {
    x: 5.0, y: 2.9, w: 8, h: 0.8, fontSize: 38, fontFace: F, margin: 0
  });
  s.addText("AI 전환 실무 접근 제안서", {
    x: 5.0, y: 3.75, w: 8, h: 0.7, fontSize: 34, bold: true,
    fontFace: F, color: CHARCOAL_D, margin: 0
  });

  // Quote
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 5.1, w: 0.08, h: 1.4, fill: { color: TERRA }, line: { color: TERRA }
  });
  s.addText([
    { text: "200 페이지 보고서보다,\n", options: { color: GRAY, fontSize: 15, italic: true } },
    { text: "3개 부서가 이번 달에 30분씩 아낄 수 있는 ", options: { color: CHARCOAL_D, fontSize: 15 } },
    { text: "실제 작동하는 변화", options: { color: TERRA, fontSize: 15, bold: true } },
    { text: ".", options: { color: CHARCOAL_D, fontSize: 15 } }
  ], {
    x: 5.25, y: 5.1, w: 7.5, h: 1.4, fontFace: F, margin: 0
  });

  s.addText("본 제안서는 삼송과의 협력 검토 목적으로 작성되었습니다.", {
    x: 5.0, y: 7.0, w: 8, h: 0.3, fontSize: 9, italic: true,
    fontFace: F, color: GRAY_L, margin: 0
  });
}

// ═══════════════ Slide 02 — 우리의 포지셔닝 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 1, "INTRO", "우리의 포지셔닝");

  s.addText([
    { text: "이 문서는 삼송의 현재 상황을 ", options: { color: CHARCOAL_D } },
    { text: "진단하거나 평가하기 위한 문서가 아닙니다.", options: { color: TERRA, bold: true } }
  ], {
    x: 0.8, y: 1.8, w: 12, h: 0.5, fontSize: 17, fontFace: F, margin: 0
  });

  // 3 statements
  const items = [
    {
      label: "질문의 이동",
      body: "\"AX가 필요한가?\"라는 질문은 이미 대부분의 제조 기업에서\n\"어떻게 시작할 것인가?\"로 넘어갔습니다."
    },
    {
      label: "본 제안의 초점",
      body: "무엇부터, 어떤 순서로, 어느 규모로 시작해야 하는가.\n실무 질문에 집중합니다."
    },
    {
      label: "FLOW~의 정체",
      body: "전략 컨설팅사가 아닙니다.\n15년 HRD 현장 + 200+ AI 앱 실전 개발자 기반의 실행 파트너입니다."
    }
  ];
  items.forEach((it, i) => {
    const y = 2.7 + i * 1.35;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: y, w: 0.08, h: 1.15, fill: { color: TERRA }, line: { color: TERRA }
    });
    s.addText(it.label, {
      x: 1.0, y: y, w: 11, h: 0.35, fontSize: 11, bold: true,
      fontFace: F, color: TERRA, charSpacing: 2, margin: 0
    });
    s.addText(it.body, {
      x: 1.0, y: y + 0.35, w: 11.5, h: 0.85, fontSize: 14,
      fontFace: F, color: CHARCOAL_D, margin: 0
    });
  });

  addFooter(s, 2);
}

// ═══════════════ Slide 03 — 업계 관찰 5가지 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 2, "OBSERVATION", "자동차 부품 중견 제조사 AX 공통 과제");

  s.addText("공개된 사례와 제조 부문 AX 프로젝트에서 반복 관찰되는 5가지 패턴", {
    x: 0.8, y: 1.55, w: 12, h: 0.35, fontSize: 12, italic: true,
    fontFace: F, color: GRAY, margin: 0
  });

  const obs = [
    { n: "①", t: "경험형 지식의 속인화", d: "30년+ 축적된 공정·품질·고객 대응 노하우가 개인에 머물러 있음" },
    { n: "②", t: "글로벌 거점 간 문서 비동기화", d: "국가별 언어·시스템·시차로 자료 표준화 비용이 큼" },
    { n: "③", t: "반복 사무 업무의 과부하", d: "영업·QA·R&D의 보고서·번역·사양정리·견적 대응" },
    { n: "④", t: "현장-본사 데이터 연결 미흡", d: "ERP·MES 데이터는 있지만 실시간 활용 여지 제한적" },
    { n: "⑤", t: "개인 단위 Shadow AI", d: "개별 AI 사용은 많지만 전사 정책은 공백" }
  ];

  obs.forEach((o, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.1;
    const y = 2.05 + row * 1.35;
    const w = i === 4 ? 12.2 : 5.9;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h: 1.2, fill: { color: WHITE }, line: { color: SAND, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 6, offset: 1, angle: 90, opacity: 0.06 }
    });
    s.addText(o.n, {
      x: x + 0.15, y: y + 0.15, w: 0.6, h: 0.6, fontSize: 24, bold: true,
      fontFace: F, color: TERRA, margin: 0
    });
    s.addText(o.t, {
      x: x + 0.8, y: y + 0.15, w: w - 0.95, h: 0.4, fontSize: 15, bold: true,
      fontFace: F, color: CHARCOAL_D, margin: 0
    });
    s.addText(o.d, {
      x: x + 0.8, y: y + 0.55, w: w - 0.95, h: 0.6, fontSize: 11,
      fontFace: F, color: GRAY, margin: 0
    });
  });

  // Callout
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 6.35, w: 12.2, h: 0.6, fill: { color: CHARCOAL_D }, line: { color: CHARCOAL_D }
  });
  s.addText([
    { text: "핵심 관찰  ", options: { color: TERRA, bold: true, fontSize: 11 } },
    { text: "위 5가지 중 1~2개는 대부분의 조직에 해당합니다. 삼송의 구체적 우선순위는 Phase -1 준비도 진단에서 함께 확인합니다.", options: { color: OFFWHITE, fontSize: 12 } }
  ], {
    x: 1.0, y: 6.4, w: 11.8, h: 0.5, fontFace: F, valign: "middle", margin: 0
  });

  addFooter(s, 3);
}

// ═══════════════ Slide 04 — 실무 접근 원칙 4가지 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 3, "PRINCIPLES", "실무 접근 원칙 4가지");

  const pr = [
    { n: "01", t: "큰 전략보다 작은 실행", s: "Small Execution > Big Strategy",
      d: "200p 보고서보다 3개 부서가 이번 달에 30분씩 아낄 수 있는 실제 변화" },
    { n: "02", t: "도입이 아닌 역량 이전", s: "Capability Transfer",
      d: "AX Champion 3~5명을 내부 육성. FLOW~는 종료 후 3개월 Q&A 핫라인으로 자립 지원" },
    { n: "03", t: "기술보다 사람의 루틴", s: "Routine > Tools",
      d: "도구는 3개월마다 바뀐다. 하지만 '학습하는 문화'는 지속된다" },
    { n: "04", t: "속도보다 정합성", s: "Alignment > Speed",
      d: "보안·거버넌스·인사·고객사 요구를 선(先) 반영. 최소 정책(MVG)부터" }
  ];

  pr.forEach((p, i) => {
    const x = 0.8 + (i % 2) * 6.15;
    const y = 1.75 + Math.floor(i / 2) * 2.6;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 5.95, h: 2.4, fill: { color: WHITE }, line: { color: SAND, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 90, opacity: 0.06 }
    });
    s.addText(p.n, {
      x: x + 0.3, y: y + 0.2, w: 1.0, h: 0.6, fontSize: 28, bold: true,
      fontFace: F, color: TERRA, margin: 0
    });
    s.addShape(pres.shapes.LINE, {
      x: x + 0.3, y: y + 0.85, w: 0.8, h: 0, line: { color: TERRA, width: 1.5 }
    });
    s.addText(p.t, {
      x: x + 0.3, y: y + 0.95, w: 5.4, h: 0.5, fontSize: 17, bold: true,
      fontFace: F, color: CHARCOAL_D, margin: 0
    });
    s.addText(p.s, {
      x: x + 0.3, y: y + 1.42, w: 5.4, h: 0.3, fontSize: 10, italic: true,
      fontFace: F, color: SAGE, charSpacing: 1, margin: 0
    });
    s.addText(p.d, {
      x: x + 0.3, y: y + 1.75, w: 5.5, h: 0.6, fontSize: 11,
      fontFace: F, color: GRAY, margin: 0
    });
  });

  addFooter(s, 4);
}

// ═══════════════ Slide 05 — 방법론 7단계 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 4, "METHODOLOGY", "FLOW~ AX 7단계");

  const ph = [
    { p: "P-1", t: "준비도 진단", d: "데이터·성숙도" },
    { p: "P 0", t: "AI 리터러시", d: "기본·실무" },
    { p: "P 1", t: "RTC 캔버스", d: "Role·Task·Comp" },
    { p: "P 2", t: "ICEP 매트릭스", d: "I·C·E·P 4축" },
    { p: "P 3", t: "재설계", d: "WHY·WHAT·HOW" },
    { p: "P 4", t: "파일럿+코칭", d: "STAR-AR" },
    { p: "P 5", t: "측정·확산", d: "EARS·거버넌스" }
  ];
  const cw = 1.74, gap = 0.05;
  ph.forEach((item, i) => {
    const x = 0.8 + i * (cw + gap);
    // Starter Track highlighted phases: -1, 0, 1, 2, 4 (index 0,1,2,3,5)
    const inTrack = [0, 1, 2, 3, 5].includes(i);
    const fill = inTrack ? CHARCOAL_D : WHITE;
    const fg = inTrack ? OFFWHITE : GRAY;
    const accent = inTrack ? TERRA : SAND;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.7, w: cw, h: 3.0, fill: { color: fill },
      line: { color: inTrack ? CHARCOAL_D : SAND, width: 1 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.7, w: cw, h: 0.12, fill: { color: accent }, line: { color: accent }
    });
    s.addText(item.p, {
      x, y: 2.0, w: cw, h: 0.45, fontSize: 14, bold: true,
      fontFace: F, color: fg, align: "center", margin: 0
    });
    s.addText(item.t, {
      x: x + 0.1, y: 2.55, w: cw - 0.2, h: 0.7, fontSize: 13, bold: true,
      fontFace: F, color: inTrack ? OFFWHITE : CHARCOAL_D, align: "center", margin: 0
    });
    s.addText(item.d, {
      x: x + 0.1, y: 3.3, w: cw - 0.2, h: 0.4, fontSize: 9, italic: true,
      fontFace: F, color: inTrack ? SAND : GRAY_L, align: "center", margin: 0
    });
    if (inTrack) {
      s.addText("◆ STARTER", {
        x: x + 0.1, y: 4.25, w: cw - 0.2, h: 0.3, fontSize: 8, bold: true,
        fontFace: F, color: TERRA, align: "center", charSpacing: 1, margin: 0
      });
    }
  });

  // Bottom note
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 5.3, w: 12.2, h: 1.6, fill: { color: SAND }, line: { color: SAND } });
  s.addText("Starter Track 5개 Phase", {
    x: 1.0, y: 5.45, w: 12, h: 0.4, fontSize: 11, bold: true,
    fontFace: F, color: TERRA, charSpacing: 2, margin: 0
  });
  s.addText([
    { text: "Phase -1 · 0 · 1 · 2 · 4", options: { bold: true, color: CHARCOAL_D, fontSize: 17 } },
    { text: "  를 8주 경량형으로 구성  ·  ", options: { color: CHARCOAL_D, fontSize: 14 } },
    { text: "Phase 3 · 5", options: { bold: true, color: CHARCOAL_D, fontSize: 14 } },
    { text: "는 파일럿 성공 후 확장 협의", options: { color: CHARCOAL_D, fontSize: 14 } }
  ], { x: 1.0, y: 5.85, w: 12, h: 0.5, fontFace: F, margin: 0 });
  s.addText("각 Phase는 독립적으로 일시 중단·재개 가능. 조직 여건에 따라 확장·축소할 수 있습니다.", {
    x: 1.0, y: 6.4, w: 12, h: 0.4, fontSize: 11, italic: true,
    fontFace: F, color: GRAY, margin: 0
  });

  addFooter(s, 5);
}

// ═══════════════ Slide 06 — Starter Track 구성 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 5, "STARTER TRACK", "8주 경량형 권장 구성");

  // Left: spec table
  const rows = [
    ["패키지", "AX Starter Track (경량 Mid-Corp)"],
    ["기간", "8주"],
    ["포함 Phase", "-1 · 0 · 1 · 2 · 4 (핵심 5단계)"],
    ["대상 범위", "파일럿 부서 1~2개 (15~25명)"],
    ["리더 코호트", "10~15명"],
    ["투입 규모", "35 MD"],
    ["현장 워크숍", "6회 (온·오프 혼합)"],
    ["1:1 코칭", "8회"]
  ];

  // table manually drawn
  const tx = 0.8, ty = 1.7, rowH = 0.42;
  rows.forEach((r, i) => {
    const y = ty + i * rowH;
    s.addShape(pres.shapes.RECTANGLE, {
      x: tx, y, w: 6.2, h: rowH, fill: { color: i % 2 ? WHITE : SAND }, line: { color: SAND, width: 0.5 }
    });
    s.addText(r[0], {
      x: tx + 0.2, y: y + 0.05, w: 2, h: rowH - 0.1, fontSize: 11, bold: true,
      fontFace: F, color: TERRA, margin: 0, valign: "middle"
    });
    s.addText(r[1], {
      x: tx + 2.2, y: y + 0.05, w: 4.0, h: rowH - 0.1, fontSize: 12,
      fontFace: F, color: CHARCOAL_D, margin: 0, valign: "middle"
    });
  });

  // Right: why this size
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.3, y: 1.7, w: 5.7, h: rowH * 8, fill: { color: CHARCOAL_D }, line: { color: CHARCOAL_D }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.3, y: 1.7, w: 5.7, h: 0.1, fill: { color: TERRA }, line: { color: TERRA }
  });
  s.addText("왜 이 규모인가", {
    x: 7.5, y: 1.95, w: 5.3, h: 0.4, fontSize: 11, bold: true,
    fontFace: F, color: TERRA, charSpacing: 2, margin: 0
  });
  s.addText("검증 가능한 최소 규모", {
    x: 7.5, y: 2.35, w: 5.3, h: 0.6, fontSize: 22, bold: true,
    fontFace: F, color: OFFWHITE, margin: 0
  });
  const reasons = [
    "첫 도입 조직에게 필요한 것은",
    "실패해도 회복 가능한 규모",
    "",
    "8주 후 의사결정 시점에서",
    "확장 여부를 다시 판단",
    "",
    "대형 컨설팅 부담 없이",
    "파일럿까지 완주 가능한 금액"
  ];
  reasons.forEach((r, i) => {
    s.addText(r, {
      x: 7.5, y: 3.2 + i * 0.22, w: 5.3, h: 0.3, fontSize: 11,
      fontFace: F, color: r === "" ? CHARCOAL_D : SAND, margin: 0
    });
  });

  // Price ribbon
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 5.5, w: 12.2, h: 1.4, fill: { color: TERRA }, line: { color: TERRA } });
  s.addText("투자 규모 · VAT 별도", {
    x: 1.0, y: 5.6, w: 6, h: 0.35, fontSize: 10, bold: true,
    fontFace: F, color: SAND, charSpacing: 2, margin: 0
  });
  s.addText("4,500만원", {
    x: 1.0, y: 5.95, w: 6, h: 0.85, fontSize: 44, bold: true,
    fontFace: F, color: WHITE, margin: 0
  });
  s.addText([
    { text: "청구 일정  ", options: { bold: true, fontSize: 11, color: SAND } },
    { text: "Kickoff 30% / W4 중간 40% / W8 완료 30%\n", options: { fontSize: 11, color: OFFWHITE, breakLine: true } },
    { text: "포함 범위  ", options: { bold: true, fontSize: 11, color: SAND } },
    { text: "Kickoff · 워크숍 6회 · 리더 코호트 4회 · 1:1 코칭 8회 · 산출물 일체", options: { fontSize: 11, color: OFFWHITE } }
  ], { x: 7.2, y: 5.7, w: 5.8, h: 1.2, fontFace: F, margin: 0 });

  addFooter(s, 6);
}

// ═══════════════ Slide 07 — 8주 흐름 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 6, "ROADMAP", "8주 주차별 흐름");

  const weeks = [
    { w: "W1", p: "P-1", a: "Kickoff + 인터뷰 + 진단", o: "진단 리포트" },
    { w: "W2", p: "P 0", a: "AI 리터러시 기본반 (4h)", o: "정책 초안" },
    { w: "W3", p: "P 0", a: "실무반 (8h) + 부서별 실습", o: "프롬프트 라이브러리" },
    { w: "W4", p: "P 1", a: "RTC 캔버스 워크숍 (직무 5종)", o: "RTC 캔버스 5종" },
    { w: "W5", p: "P 2", a: "ICEP 매트릭스 세션", o: "Top 5 과제 선정표" },
    { w: "W6", p: "P 4", a: "파일럿 Kickoff + 코칭 1~3차", o: "실행 계획서" },
    { w: "W7", p: "P 4", a: "중간 리뷰 + 코칭 4~6차", o: "중간 점검 보고서" },
    { w: "W8", p: "P 4", a: "결과 측정 + 확산 권고", o: "EARS 베이스라인 · 최종 리포트" }
  ];

  // Header row
  const cols = [0.9, 1.3, 6.0, 4.8];
  const xs = [0.8];
  cols.forEach((c, i) => xs.push(xs[i] + c));
  const headerY = 1.65;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: headerY, w: 12.2, h: 0.45, fill: { color: CHARCOAL_D }, line: { color: CHARCOAL_D }
  });
  ["주차", "Phase", "활동", "산출물"].forEach((h, i) => {
    s.addText(h, {
      x: xs[i] + 0.15, y: headerY + 0.08, w: cols[i] - 0.3, h: 0.3, fontSize: 11, bold: true,
      fontFace: F, color: SAND, charSpacing: 2, margin: 0, valign: "middle"
    });
  });

  weeks.forEach((wk, i) => {
    const y = headerY + 0.45 + i * 0.55;
    const bg = i % 2 ? WHITE : SAND;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 12.2, h: 0.55, fill: { color: bg }, line: { color: SAND, width: 0.5 } });
    // Week number in terracotta
    s.addText(wk.w, {
      x: xs[0] + 0.15, y: y + 0.1, w: cols[0] - 0.3, h: 0.35, fontSize: 14, bold: true,
      fontFace: F, color: TERRA, margin: 0, valign: "middle"
    });
    s.addText(wk.p, {
      x: xs[1] + 0.15, y: y + 0.1, w: cols[1] - 0.3, h: 0.35, fontSize: 11,
      fontFace: F, color: SAGE, bold: true, margin: 0, valign: "middle"
    });
    s.addText(wk.a, {
      x: xs[2] + 0.15, y: y + 0.1, w: cols[2] - 0.3, h: 0.35, fontSize: 12,
      fontFace: F, color: CHARCOAL_D, margin: 0, valign: "middle"
    });
    s.addText(wk.o, {
      x: xs[3] + 0.15, y: y + 0.1, w: cols[3] - 0.3, h: 0.35, fontSize: 11, italic: true,
      fontFace: F, color: GRAY, margin: 0, valign: "middle"
    });
  });

  addFooter(s, 7);
}

// ═══════════════ Slide 08 — 핵심 산출물 9종 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 7, "DELIVERABLES", "핵심 산출물 9종");

  const outs = [
    ["1", "진단 리포트", "조직 현황 스냅샷 (A4 10~15매)"],
    ["2", "AI 리터러시 수료 확인서", "참가자 개별 수여"],
    ["3", "RTC 캔버스 5종", "핵심 직무 가시화"],
    ["4", "ICEP 우선순위 Top 5", "재설계 대상 과제"],
    ["5", "프롬프트 라이브러리 30선", "업무별 바로 쓰는 양식"],
    ["6", "AX 파일럿 실행 결과", "실제 업무 적용 1건"],
    ["7", "Leader AX 코호트 수료", "리더급 10~15명"],
    ["8", "EARS 베이스라인", "효율·정착·매출·지속가능성"],
    ["9", "최소 AI 거버넌스 (MVG)", "실행 가능한 3p 정책"]
  ];

  outs.forEach((o, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.8 + col * 4.15;
    const y = 1.7 + row * 1.55;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 3.95, h: 1.4, fill: { color: WHITE }, line: { color: SAND, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 6, offset: 1, angle: 90, opacity: 0.06 }
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.25, y: y + 0.25, w: 0.65, h: 0.65, fill: { color: TERRA }, line: { color: TERRA }
    });
    s.addText(o[0], {
      x: x + 0.25, y: y + 0.3, w: 0.65, h: 0.55, fontSize: 18, bold: true,
      fontFace: F, color: WHITE, align: "center", margin: 0
    });
    s.addText(o[1], {
      x: x + 1.05, y: y + 0.25, w: 2.9, h: 0.45, fontSize: 14, bold: true,
      fontFace: F, color: CHARCOAL_D, margin: 0
    });
    s.addText(o[2], {
      x: x + 1.05, y: y + 0.7, w: 2.9, h: 0.6, fontSize: 10,
      fontFace: F, color: GRAY, margin: 0
    });
  });

  // IP note
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 6.35, w: 12.2, h: 0.5, fill: { color: CHARCOAL_D }, line: { color: CHARCOAL_D } });
  s.addText([
    { text: "지식재산권  ", options: { bold: true, color: TERRA, fontSize: 11 } },
    { text: "모든 산출물은 삼송에 귀속됩니다. FLOW~는 방법론·프레임워크의 권리만 보유합니다.", options: { color: OFFWHITE, fontSize: 11 } }
  ], { x: 1.0, y: 6.4, w: 11.8, h: 0.4, fontFace: F, valign: "middle", margin: 0 });

  addFooter(s, 8);
}

// ═══════════════ Slide 09 — 거버넌스 & 보안 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 8, "GOVERNANCE", "최소 거버넌스 · 보안 접근");

  s.addText("초회 도입 단계에서 필요한 최소한만 먼저 정리합니다.  ·  Minimum Viable Governance", {
    x: 0.8, y: 1.55, w: 12, h: 0.35, fontSize: 12, italic: true,
    fontFace: F, color: GRAY, margin: 0
  });

  // MVG 3 sets
  const mvg = [
    { t: "AI 사용 가이드라인", d: "Enterprise/Team vs 무료, 금지·허용 업무 구분", own: "인사·경영지원" },
    { t: "데이터 분류 3단계", d: "공개 / 내부 / 기밀, 단계별 AI 투입 가능 여부", own: "IT·경영지원" },
    { t: "프롬프트 로그 관리", d: "저장 위치·보존 기간·파기 기준", own: "IT" }
  ];
  mvg.forEach((m, i) => {
    const x = 0.8 + i * 4.15;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.0, w: 3.95, h: 2.0, fill: { color: WHITE }, line: { color: SAND, width: 1 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 3.95, h: 0.1, fill: { color: TERRA }, line: { color: TERRA } });
    s.addText(`MVG ${i + 1}`, {
      x: x + 0.2, y: 2.2, w: 3.5, h: 0.3, fontSize: 10, bold: true,
      fontFace: F, color: TERRA, charSpacing: 2, margin: 0
    });
    s.addText(m.t, {
      x: x + 0.2, y: 2.55, w: 3.5, h: 0.5, fontSize: 16, bold: true,
      fontFace: F, color: CHARCOAL_D, margin: 0
    });
    s.addText(m.d, {
      x: x + 0.2, y: 3.1, w: 3.5, h: 0.6, fontSize: 11,
      fontFace: F, color: GRAY, margin: 0
    });
    s.addText([
      { text: "담당 · ", options: { color: SAGE, bold: true } },
      { text: m.own, options: { color: CHARCOAL_D, bold: true } }
    ], {
      x: x + 0.2, y: 3.65, w: 3.5, h: 0.3, fontSize: 10, fontFace: F, margin: 0
    });
  });

  // Standards row
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.35, w: 12.2, h: 1.4, fill: { color: SAND }, line: { color: SAND } });
  s.addText("글로벌 준거", {
    x: 1.0, y: 4.5, w: 12, h: 0.35, fontSize: 11, bold: true,
    fontFace: F, color: TERRA, charSpacing: 2, margin: 0
  });
  const std = [
    ["NIST AI RMF", "GOVERN · MAP · MEASURE · MANAGE"],
    ["EU AI Act", "Risk 분류 (유럽 거점 대응)"],
    ["국내 AI기본법", "2026 시행 대응"]
  ];
  std.forEach((d, i) => {
    const x = 1.0 + i * 4.05;
    s.addText(d[0], { x, y: 4.85, w: 4, h: 0.35, fontSize: 13, bold: true, fontFace: F, color: CHARCOAL_D, margin: 0 });
    s.addText(d[1], { x, y: 5.2, w: 4, h: 0.4, fontSize: 11, fontFace: F, color: GRAY, margin: 0 });
  });

  // Project promise
  s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 6.1, w: 12.2, h: 0.85, fill: { color: CHARCOAL_D }, line: { color: CHARCOAL_D } });
  s.addText("프로젝트 보안 약속", {
    x: 1.0, y: 6.18, w: 12, h: 0.3, fontSize: 10, bold: true,
    fontFace: F, color: TERRA, charSpacing: 2, margin: 0
  });
  s.addText("NDA 이후 수령  ·  전용 저장소 격리  ·  종료 시 파기 증빙  ·  Enterprise/Team·API 전용  ·  개인정보 가명처리", {
    x: 1.0, y: 6.48, w: 12, h: 0.4, fontSize: 11, fontFace: F, color: OFFWHITE, margin: 0
  });

  addFooter(s, 9);
}

// ═══════════════ Slide 10 — 진행 절차 3단계 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 9, "PROCESS", "진행 절차 3단계");

  const steps = [
    { n: "1", t: "본 제안 검토 + 60분 미팅", d: "목적 · 범위 · 일정 협의\n파일럿 후보 부서 사전 선정\n사내 이해관계자 정리", tag: "Day 0" },
    { n: "2", t: "NDA 체결 + 사전 진단", d: "Phase -1 간이 진단 (설문 + 1:1 2~3건)\n결과 공유 → 범위 최종 조정\n무상 제공", tag: "Day 1~7" },
    { n: "3", t: "SOW 확정 + Kickoff", d: "산출물·완료기준·변경관리 합의\n8주 여정 시작", tag: "Day 8~" }
  ];

  steps.forEach((st, i) => {
    const y = 1.9 + i * 1.65;
    // number circle
    s.addShape(pres.shapes.OVAL, {
      x: 0.9, y: y, w: 1.1, h: 1.1, fill: { color: CHARCOAL_D }, line: { color: TERRA, width: 3 }
    });
    s.addText(st.n, {
      x: 0.9, y: y + 0.15, w: 1.1, h: 0.85, fontSize: 36, bold: true,
      fontFace: F, color: TERRA, align: "center", margin: 0
    });
    // content
    s.addShape(pres.shapes.LINE, { x: 2.3, y: y + 0.55, w: 0.3, h: 0, line: { color: TERRA, width: 1.5 } });
    s.addText(st.tag, {
      x: 2.7, y: y, w: 8, h: 0.3, fontSize: 10, bold: true,
      fontFace: F, color: SAGE, charSpacing: 2, margin: 0
    });
    s.addText(st.t, {
      x: 2.7, y: y + 0.28, w: 10, h: 0.5, fontSize: 18, bold: true,
      fontFace: F, color: CHARCOAL_D, margin: 0
    });
    s.addText(st.d, {
      x: 2.7, y: y + 0.8, w: 10, h: 0.8, fontSize: 11,
      fontFace: F, color: GRAY, margin: 0
    });
    // connector line
    if (i < 2) {
      s.addShape(pres.shapes.LINE, {
        x: 1.45, y: y + 1.1, w: 0, h: 0.55, line: { color: SAND, width: 2, dashType: "dash" }
      });
    }
  });

  addFooter(s, 10);
}

// ═══════════════ Slide 11 — 3가지 약속 & Lead Partner ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };
  addSectionHeader(s, 10, "COMMITMENT", "3가지 약속 · Lead Partner");

  // Left: 3 promises
  const pr = [
    { t: "전환 완수까지 함께", d: "종료 후 3개월 Q&A 핫라인으로 자립 지원" },
    { t: "조직 자산으로 귀속", d: "방법론 외 모든 산출물 = 삼송 자산" },
    { t: "현장형 실행", d: "PPT 보고서가 아닌, 내일 바로 쓸 수 있는 도구" }
  ];
  pr.forEach((p, i) => {
    const y = 1.8 + i * 1.6;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y, w: 6.8, h: 1.4, fill: { color: WHITE }, line: { color: SAND, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 6, offset: 1, angle: 90, opacity: 0.06 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 0.12, h: 1.4, fill: { color: TERRA }, line: { color: TERRA } });
    s.addText(`0${i + 1}`, { x: 1.1, y: y + 0.2, w: 1, h: 0.4, fontSize: 18, bold: true, fontFace: F, color: TERRA, margin: 0 });
    s.addText(p.t, { x: 1.95, y: y + 0.2, w: 5.5, h: 0.5, fontSize: 17, bold: true, fontFace: F, color: CHARCOAL_D, margin: 0 });
    s.addText(p.d, { x: 1.95, y: y + 0.7, w: 5.5, h: 0.6, fontSize: 12, fontFace: F, color: GRAY, margin: 0 });
  });

  // Right: partner card
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.9, y: 1.8, w: 5.1, h: 5.1, fill: { color: CHARCOAL_D }, line: { color: CHARCOAL_D }
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.9, y: 1.8, w: 5.1, h: 0.12, fill: { color: TERRA }, line: { color: TERRA } });
  s.addShape(pres.shapes.OVAL, { x: 9.45, y: 2.2, w: 2.0, h: 2.0, fill: { color: SAND }, line: { color: SAND } });
  s.addText("DEMIAN", { x: 9.45, y: 2.8, w: 2.0, h: 0.8, fontSize: 20, bold: true, fontFace: F, color: TERRA, align: "center", margin: 0 });

  s.addText("LEAD PARTNER", {
    x: 8.1, y: 4.35, w: 4.7, h: 0.3, fontSize: 10, bold: true,
    fontFace: F, color: TERRA, align: "center", charSpacing: 3, margin: 0
  });
  s.addText("임정훈  ·  Demian", {
    x: 8.1, y: 4.7, w: 4.7, h: 0.5, fontSize: 20, bold: true,
    fontFace: F, color: WHITE, align: "center", margin: 0
  });
  s.addShape(pres.shapes.LINE, { x: 9.7, y: 5.25, w: 1.5, h: 0, line: { color: TERRA, width: 1.5 } });

  const bio = [
    "HRD 현장 경력 15년",
    "200+ AI 앱 실전 개발",
    "HRDK 커리큘럼 공급",
    "20+ 기업 교육 진행"
  ];
  bio.forEach((b, i) => {
    s.addText("· " + b, {
      x: 8.3, y: 5.45 + i * 0.28, w: 4.5, h: 0.3, fontSize: 11,
      fontFace: F, color: SAND, align: "center", margin: 0
    });
  });

  addFooter(s, 11);
}

// ═══════════════ Slide 12 — Closing ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: CHARCOAL_D };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.15, h: 7.5, fill: { color: TERRA }, line: { color: TERRA }
  });

  s.addText("CLOSING", {
    x: 0.8, y: 1.0, w: 12, h: 0.4, fontSize: 11, bold: true,
    fontFace: F, color: TERRA, charSpacing: 4, margin: 0
  });
  s.addText("맺음말", {
    x: 0.8, y: 1.4, w: 12, h: 0.6, fontSize: 28, bold: true,
    fontFace: F, color: OFFWHITE, margin: 0
  });
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 2.15, w: 1.5, h: 0, line: { color: TERRA, width: 2 } });

  s.addText("본 제안서는", {
    x: 0.8, y: 2.6, w: 12, h: 0.5, fontSize: 18,
    fontFace: F, color: GRAY_L, margin: 0
  });
  s.addText([
    { text: "\"시작해볼 만한 ", options: { color: OFFWHITE, fontSize: 28 } },
    { text: "최소 규모", options: { color: TERRA, fontSize: 28, bold: true } },
    { text: "\"", options: { color: OFFWHITE, fontSize: 28 } }
  ], {
    x: 0.8, y: 3.1, w: 12, h: 0.7, fontFace: F, margin: 0
  });
  s.addText("에 초점을 맞췄습니다.", {
    x: 0.8, y: 3.8, w: 12, h: 0.6, fontSize: 22,
    fontFace: F, color: OFFWHITE, margin: 0
  });

  s.addText([
    { text: "삼송의 ", options: { color: OFFWHITE } },
    { text: "글로벌 네트워크", options: { color: SAND, bold: true } },
    { text: " · ", options: { color: OFFWHITE } },
    { text: "30년 제조 노하우", options: { color: SAND, bold: true } },
    { text: " · ", options: { color: OFFWHITE } },
    { text: "안전이라는 가치", options: { color: SAND, bold: true } },
    { text: "는,\nAX가 가장 잘 적용될 수 있는 환경입니다.", options: { color: OFFWHITE } }
  ], {
    x: 0.8, y: 4.7, w: 12, h: 1.0, fontSize: 16, fontFace: F, margin: 0
  });

  // Bottom band
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 6.0, w: 13.3, h: 1.5, fill: { color: "000000" }, line: { color: "000000" }
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 6.0, w: 13.3, h: 0.05, fill: { color: TERRA }, line: { color: TERRA } });

  s.addText("우리는 전략을 판매하러 온 것이 아닙니다.", {
    x: 0.8, y: 6.2, w: 12, h: 0.4, fontSize: 13, italic: true,
    fontFace: F, color: GRAY_L, margin: 0
  });
  s.addText("함께 8주를 뛸 파트너로서 제안드립니다.", {
    x: 0.8, y: 6.55, w: 12, h: 0.5, fontSize: 20, bold: true,
    fontFace: F, color: OFFWHITE, margin: 0
  });

  s.addText("Demian  ·  FLOW~ : AX Design Lab  ·  2026. 04. 09", {
    x: 0.8, y: 7.15, w: 12, h: 0.3, fontSize: 10,
    fontFace: F, color: TERRA, margin: 0
  });
}

pres.writeFile({ fileName: "FLOW_AX_Proposal_Samsong_v2.pptx" })
  .then(fn => console.log("✓ PPTX v2 생성 완료: " + fn));
