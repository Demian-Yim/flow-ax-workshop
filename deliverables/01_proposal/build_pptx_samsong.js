// FLOW~ AX Master Proposal - PPTX Generator
// Palette: Midnight Executive — Navy 1E2761 / Ice Blue CADCFC / White / Accent Coral F96167
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Demian (FLOW~ : AX Design Lab)";
pres.title = "FLOW~ AX 컨설팅 제안서";
pres.company = "FLOW~ : AX Design Lab";

const NAVY = "1E2761";
const NAVY_DARK = "0F1535";
const ICE = "CADCFC";
const WHITE = "FFFFFF";
const CORAL = "F96167";
const GOLD = "F9E795";
const GRAY = "64748B";
const LIGHT = "F5F7FB";

const FONT_H = "맑은 고딕";
const FONT_B = "맑은 고딕";

// ── Helper: footer bar on every content slide ──
function addFooter(slide, pageNum, pageTotal) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 7.15, w: 13.3, h: 0.35, fill: { color: NAVY_DARK }, line: { color: NAVY_DARK }
  });
  slide.addText("FLOW~ : AX Design Lab", {
    x: 0.5, y: 7.18, w: 6, h: 0.3, fontSize: 10, fontFace: FONT_B, color: ICE, margin: 0
  });
  slide.addText(`${pageNum} / ${pageTotal}`, {
    x: 12.0, y: 7.18, w: 0.8, h: 0.3, fontSize: 10, fontFace: FONT_B, color: ICE, align: "right", margin: 0
  });
}

// ── Helper: title bar ──
function addTitle(slide, num, title, sub) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 1.1, fill: { color: NAVY }, line: { color: NAVY }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 1.1, w: 13.3, h: 0.08, fill: { color: CORAL }, line: { color: CORAL }
  });
  slide.addText(`${num.toString().padStart(2, "0")}`, {
    x: 0.5, y: 0.2, w: 1.0, h: 0.7, fontSize: 36, bold: true,
    fontFace: FONT_H, color: ICE, margin: 0
  });
  slide.addText(title, {
    x: 1.5, y: 0.18, w: 11.5, h: 0.55, fontSize: 26, bold: true,
    fontFace: FONT_H, color: WHITE, margin: 0, valign: "middle"
  });
  if (sub) {
    slide.addText(sub, {
      x: 1.5, y: 0.68, w: 11.5, h: 0.35, fontSize: 13,
      fontFace: FONT_B, color: ICE, margin: 0
    });
  }
}

const TOTAL = 14;

// ═══════════════ Slide 01 — Cover ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY_DARK };
  // diagonal accent
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 6.9, w: 13.3, h: 0.6, fill: { color: NAVY } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 6.85, w: 13.3, h: 0.08, fill: { color: CORAL } });

  s.addText("FLOW~ : AX Design Lab", {
    x: 0.7, y: 0.7, w: 12, h: 0.4, fontSize: 14, fontFace: FONT_B,
    color: ICE, charSpacing: 4, margin: 0
  });

  s.addText("삼송의 AI 전환,", {
    x: 0.7, y: 1.8, w: 12, h: 0.9, fontSize: 38, fontFace: FONT_H,
    color: WHITE, margin: 0
  });
  s.addText([
    { text: "'도구 도입'", options: { color: ICE, bold: true } },
    { text: "이 아닌 ", options: { color: WHITE } },
    { text: "'사람의 전환'", options: { color: CORAL, bold: true } },
    { text: "으로", options: { color: WHITE } }
  ], {
    x: 0.7, y: 2.7, w: 12, h: 0.9, fontSize: 38, fontFace: FONT_H, margin: 0
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 4.0, w: 1.5, h: 0.05, fill: { color: CORAL }, line: { color: CORAL }
  });

  s.addText("FLOW~ AX 컨설팅 제안서", {
    x: 0.7, y: 4.2, w: 12, h: 0.5, fontSize: 22, bold: true,
    fontFace: FONT_H, color: ICE, margin: 0
  });
  s.addText("2026년 4월 9일 · 담당 파트너 Demian (임정훈)", {
    x: 0.7, y: 4.75, w: 12, h: 0.4, fontSize: 14,
    fontFace: FONT_B, color: "9CA3AF", margin: 0
  });

  s.addText("플로우~ : AX 디자인 연구소", {
    x: 0.7, y: 6.95, w: 12, h: 0.5, fontSize: 11,
    fontFace: FONT_B, color: ICE, margin: 0
  });
}

// ═══════════════ Slide 02 — 왜 지금 AX인가 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 2, "왜 지금 AX인가", "생성형 AI 2년차, 게임이 바뀌었다");

  s.addText("\"AI 도입\"의 시대는 끝났다.", {
    x: 0.7, y: 1.7, w: 12, h: 0.6, fontSize: 22,
    fontFace: FONT_H, color: GRAY, italic: true, margin: 0
  });
  s.addText("이제 \"AI 전환(AX)\"의 시대다.", {
    x: 0.7, y: 2.25, w: 12, h: 0.7, fontSize: 30, bold: true,
    fontFace: FONT_H, color: NAVY, margin: 0
  });

  // 3 stat cards
  const cards = [
    { num: "83%", label: "한국 기업 생성형 AI 도입 실험", note: "McKinsey 2025" },
    { num: "7%", label: "전환에 성공한 조직", note: "도입의 역설" },
    { num: "2026", label: "전환 격차 원년", note: "EU AI Act · 국내 AI기본법" }
  ];
  cards.forEach((c, i) => {
    const x = 0.7 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 3.5, w: 3.9, h: 3.0, fill: { color: LIGHT }, line: { color: LIGHT },
      shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 90, opacity: 0.08 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 3.5, w: 3.9, h: 0.08, fill: { color: CORAL }, line: { color: CORAL }
    });
    s.addText(c.num, {
      x: x + 0.2, y: 3.7, w: 3.5, h: 1.4, fontSize: 60, bold: true,
      fontFace: FONT_H, color: NAVY, margin: 0
    });
    s.addText(c.label, {
      x: x + 0.2, y: 5.2, w: 3.5, h: 0.6, fontSize: 14, bold: true,
      fontFace: FONT_B, color: NAVY_DARK, margin: 0
    });
    s.addText(c.note, {
      x: x + 0.2, y: 5.85, w: 3.5, h: 0.4, fontSize: 11,
      fontFace: FONT_B, color: GRAY, italic: true, margin: 0
    });
  });

  addFooter(s, 2, TOTAL);
}

// ═══════════════ Slide 03 — 고객사 진단 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 3, "삼송 상황 진단", "사전 인터뷰 기반 — 우리가 이해한 현재");

  const headers = [
    { text: "영역", options: { fill: { color: NAVY }, color: WHITE, bold: true, align: "center", fontSize: 13 } },
    { text: "현황", options: { fill: { color: NAVY }, color: WHITE, bold: true, align: "center", fontSize: 13 } },
    { text: "페인포인트", options: { fill: { color: NAVY }, color: WHITE, bold: true, align: "center", fontSize: 13 } }
  ];
  const rows = [
    ["업무/생산성", "국내 본사 + 글로벌 5개 거점, OEM 6사 공급", "제조 노하우 디지털화 부족 · 거점 간 표준화 미흡"],
    ["AI 활용 수준", "개인 ChatGPT 산발적 사용, 전사 정책 미수립", "Shadow AI · 부서별 격차"],
    ["인력/문화", "170명 · 평균 근속 길어 변화관리 신중", "변화 피로 · 세대 간 격차"],
    ["거버넌스", "AI 정책 공백 · 글로벌 데이터 분류 미정", "정책 공백 · 보안 우려"]
  ];
  s.addTable([headers, ...rows.map(r => r.map(c => ({ text: c, options: { fontSize: 13, fontFace: FONT_B, color: NAVY_DARK, valign: "middle", margin: 8 } })))], {
    x: 0.7, y: 1.6, w: 11.9, colW: [2.5, 5.0, 4.4], rowH: 0.7,
    border: { pt: 1, color: ICE }
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 5.4, w: 11.9, h: 1.4, fill: { color: NAVY }, line: { color: NAVY }
  });
  s.addText([
    { text: "삼송이 풀어야 할 진짜 질문\n", options: { color: ICE, fontSize: 13, bold: true } },
    { text: "어떤 AI 도구를 살 것인가가 아니라,\n", options: { color: WHITE, fontSize: 18 } },
    { text: "우리 조직의 일하는 방식을 어떻게 다시 설계할 것인가", options: { color: CORAL, fontSize: 18, bold: true } }
  ], {
    x: 1.0, y: 5.5, w: 11.4, h: 1.2, fontFace: FONT_H, valign: "middle", margin: 0
  });

  addFooter(s, 3, TOTAL);
}

// ═══════════════ Slide 04 — 기존 접근 한계 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 4, "기존 접근의 한계", "많은 기업이 빠지는 3대 함정");

  const traps = [
    { n: "1", title: "도구 중심", body: "\"라이선스를 사면 변화가 온다\"", out: "→ 샀는데 아무도 안 쓴다" },
    { n: "2", title: "일회성 교육", body: "\"1일 특강으로 AI 이해시킨다\"", out: "→ 다음 날 잊힌다" },
    { n: "3", title: "IT 부서 주도", body: "\"AI는 기술팀의 일\"", out: "→ 현업은 방관자가 된다" }
  ];
  traps.forEach((t, i) => {
    const x = 0.7 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.6, w: 3.9, h: 3.6, fill: { color: WHITE }, line: { color: ICE, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 90, opacity: 0.08 }
    });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 3.9, h: 0.08, fill: { color: CORAL }, line: { color: CORAL } });
    s.addText("함정 " + t.n, { x: x + 0.3, y: 1.8, w: 2, h: 0.4, fontSize: 12, color: CORAL, bold: true, fontFace: FONT_B, margin: 0 });
    s.addText(t.title, { x: x + 0.3, y: 2.25, w: 3.5, h: 0.6, fontSize: 22, bold: true, color: NAVY, fontFace: FONT_H, margin: 0 });
    s.addText(t.body, { x: x + 0.3, y: 3.0, w: 3.5, h: 1.0, fontSize: 14, color: GRAY, italic: true, fontFace: FONT_B, margin: 0 });
    s.addText(t.out, { x: x + 0.3, y: 4.3, w: 3.5, h: 0.7, fontSize: 14, bold: true, color: NAVY_DARK, fontFace: FONT_B, margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.6, w: 11.9, h: 1.3, fill: { color: LIGHT }, line: { color: LIGHT } });
  s.addText([
    { text: "FLOW~의 관점  ", options: { color: CORAL, bold: true, fontSize: 13 } },
    { text: "AX는 ", options: { color: NAVY_DARK, fontSize: 16 } },
    { text: "교육(E) + 퍼실리테이션(F) + 코칭(C) + 컨설팅(Co)", options: { color: NAVY, bold: true, fontSize: 16 } },
    { text: "의 통합 설계로만 성공한다.", options: { color: NAVY_DARK, fontSize: 16 } }
  ], { x: 1.0, y: 5.7, w: 11.4, h: 1.1, fontFace: FONT_H, valign: "middle", margin: 0 });

  addFooter(s, 4, TOTAL);
}

// ═══════════════ Slide 05 — 방법론 7단계 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 5, "FLOW~ AX 방법론", "7단계 전환 플로우 (Phase -1 ~ Phase 5)");

  const phases = [
    { p: "P-1", t: "준비도 진단", d: "데이터·성숙도" },
    { p: "P 0", t: "AI 리터러시", d: "기본 + 실무" },
    { p: "P 1", t: "RTC 캔버스", d: "Role·Task·Comp." },
    { p: "P 2", t: "ICEP 매트릭스", d: "I·C·E·P 4축" },
    { p: "P 3", t: "AI-Native 재설계", d: "WHY·WHAT·HOW" },
    { p: "P 4", t: "파일럿+변화관리", d: "STAR-AR 코칭" },
    { p: "P 5", t: "측정·확산·거버넌스", d: "EARS · NIST" }
  ];
  const cw = 1.74, gap = 0.05;
  phases.forEach((ph, i) => {
    const x = 0.7 + i * (cw + gap);
    const isOdd = i % 2;
    const fill = isOdd ? NAVY : ICE;
    const fg = isOdd ? WHITE : NAVY_DARK;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.7, w: cw, h: 2.6, fill: { color: fill }, line: { color: fill } });
    s.addText(ph.p, { x: x + 0.05, y: 1.8, w: cw - 0.1, h: 0.5, fontSize: 16, bold: true, color: fg, align: "center", fontFace: FONT_B, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: x + 0.4, y: 2.35, w: cw - 0.8, h: 0, line: { color: fg, width: 1 } });
    s.addText(ph.t, { x: x + 0.05, y: 2.5, w: cw - 0.1, h: 0.9, fontSize: 13, bold: true, color: fg, align: "center", fontFace: FONT_H, margin: 0 });
    s.addText(ph.d, { x: x + 0.05, y: 3.5, w: cw - 0.1, h: 0.6, fontSize: 10, color: fg, align: "center", italic: true, fontFace: FONT_B, margin: 0 });
  });

  // 3 principles
  const pri = [
    { num: "01", title: "진단 먼저, 도구는 나중", desc: "업무 지도 없이는 AI도 길을 잃는다" },
    { num: "02", title: "사람이 먼저, 시스템은 나중", desc: "변화는 기술이 아닌 사람이 만든다" },
    { num: "03", title: "측정 가능·확산 가능", desc: "ROI 4축 입증, Wave로 확장" }
  ];
  pri.forEach((p, i) => {
    const x = 0.7 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 4.7, w: 3.9, h: 2.2, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addText(p.num, { x: x + 0.2, y: 4.85, w: 1, h: 0.6, fontSize: 22, bold: true, color: CORAL, fontFace: FONT_H, margin: 0 });
    s.addText(p.title, { x: x + 0.2, y: 5.5, w: 3.5, h: 0.5, fontSize: 15, bold: true, color: NAVY, fontFace: FONT_H, margin: 0 });
    s.addText(p.desc, { x: x + 0.2, y: 6.05, w: 3.5, h: 0.7, fontSize: 12, color: GRAY, fontFace: FONT_B, margin: 0 });
  });

  addFooter(s, 5, TOTAL);
}

// ═══════════════ Slide 06 — 3축 아키텍처 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 6, "3축 서비스 아키텍처", "교육(E) × 퍼실리테이션(F) × 코칭(C) + 컨설팅(Co)");

  const cols = [
    {
      title: "교육 (E)", sub: "Education",
      items: ["L1 Aware", "L2 Explore", "L3 Apply", "L4 Design", "L5 Lead", "L6 Scale"]
    },
    {
      title: "퍼실리테이션 (F)", sub: "Facilitation",
      items: ["L1 Kickoff", "L2 RTC 워크숍", "L3 ICEP 세션", "L4 WHY-WHAT-HOW", "L5 파일럿 리뷰", "L6 거버넌스 설계"]
    },
    {
      title: "코칭 (C)", sub: "Coaching",
      items: ["L1 1:1 진단", "L2 저항관리", "L3 Champion", "L4 리더 전환", "L5 팀 코칭", "L6 조직 코칭"]
    }
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 3.9, h: 4.3, fill: { color: WHITE }, line: { color: NAVY, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 3.9, h: 0.85, fill: { color: NAVY }, line: { color: NAVY } });
    s.addText(c.title, { x: x + 0.2, y: 1.65, w: 3.5, h: 0.45, fontSize: 18, bold: true, color: WHITE, fontFace: FONT_H, margin: 0 });
    s.addText(c.sub, { x: x + 0.2, y: 2.05, w: 3.5, h: 0.35, fontSize: 11, color: ICE, italic: true, fontFace: FONT_B, margin: 0 });
    c.items.forEach((it, j) => {
      s.addText(it, { x: x + 0.3, y: 2.65 + j * 0.5, w: 3.5, h: 0.45, fontSize: 13, color: NAVY_DARK, fontFace: FONT_B, margin: 0 });
    });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 6.15, w: 11.9, h: 0.85, fill: { color: CORAL }, line: { color: CORAL } });
  s.addText([
    { text: "컨설팅(Co) 총괄  ", options: { color: WHITE, bold: true, fontSize: 16 } },
    { text: "진단 → 설계 → 실행 → 측정", options: { color: WHITE, fontSize: 16 } }
  ], { x: 1.0, y: 6.2, w: 11.4, h: 0.75, fontFace: FONT_H, valign: "middle", margin: 0 });

  addFooter(s, 6, TOTAL);
}

// ═══════════════ Slide 07 — 5패키지 매트릭스 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 7, "5패키지 매트릭스", "삼송 맞춤 — SME + Leader AX 혼합 (경량 Mid-Corp)");

  const headers = [
    "패키지", "타겟", "규모", "기간", "투자 (원, VAT 별도)"
  ].map(h => ({ text: h, options: { fill: { color: NAVY }, color: WHITE, bold: true, align: "center", fontSize: 12, valign: "middle" } }));

  const rows = [
    ["🏢 Enterprise AX", "대기업 1000인+", "전사/사업부", "4~8개월", "1.5억 ~ 5억"],
    ["🏬 Mid-Corp AX", "중견 300~1000인", "부서/팀", "2~4개월", "4천 ~ 1.2억"],
    ["🏪 SME AX Workshop", "중소 300인 미만", "PBL 집약형", "4~6주", "800만 ~ 3천"],
    ["👔 Leader AX", "임원/팀장급", "코호트 10~20", "2일~4주", "1500만 ~ 5천"],
    ["⚡ Quick Start", "AI 검토 기업", "의사결정자", "반일~1일", "300만 ~ 800만"]
  ];
  s.addTable(
    [headers, ...rows.map(r => r.map((c, i) => ({
      text: c,
      options: {
        fontSize: 12, fontFace: FONT_B,
        color: NAVY_DARK, valign: "middle", margin: 6,
        bold: i === 0
      }
    })))],
    { x: 0.7, y: 1.6, w: 11.9, colW: [2.6, 2.4, 2.3, 2.0, 2.6], rowH: 0.55, border: { pt: 1, color: ICE } }
  );

  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.3, w: 11.9, h: 1.6, fill: { color: LIGHT }, line: { color: LIGHT } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.3, w: 0.12, h: 1.6, fill: { color: CORAL }, line: { color: CORAL } });
  s.addText("삼송 추천: SME + Leader AX 혼합 (경량 Mid-Corp)", { x: 1.0, y: 5.4, w: 11.4, h: 0.5, fontSize: 18, bold: true, color: NAVY, fontFace: FONT_H, margin: 0 });
  s.addText("선정 근거: 170명 + 첫 전사 AX, 8주 내 파일럿까지 가시화 가능한 균형형 트랙   ·   포함 Phase: Phase -1·0·1·2·4 핵심   ·   투입: 35 MD", {
    x: 1.0, y: 5.95, w: 11.4, h: 0.4, fontSize: 13, color: NAVY_DARK, fontFace: FONT_B, margin: 0
  });
  s.addText("산출물: 진단 리포트 · RTC 5종 · ICEP Top5 · 파일럿 1건 · EARS 베이스라인", { x: 1.0, y: 6.4, w: 11.4, h: 0.4, fontSize: 13, color: GRAY, fontFace: FONT_B, italic: true, margin: 0 });

  addFooter(s, 7, TOTAL);
}

// ═══════════════ Slide 08 — Phase 로드맵 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 8, "Phase 로드맵", "예시: 12주 Mid-Corp AX 기준 — 실제 일정은 Kickoff 후 조정");

  // gantt-like bars
  const phasesG = [
    { name: "Phase -1  준비도 진단",   start: 1, len: 1 },
    { name: "Phase 0   AI 리터러시",   start: 2, len: 2 },
    { name: "Phase 1   RTC 캔버스",    start: 3, len: 2 },
    { name: "Phase 2   ICEP 매트릭스", start: 4, len: 2 },
    { name: "Phase 3   재설계",        start: 5, len: 2 },
    { name: "Phase 4   파일럿+변화관리", start: 6, len: 4 },
    { name: "Phase 5   측정·확산",     start: 9, len: 4 }
  ];
  const colors = [NAVY, NAVY, NAVY, NAVY, NAVY, CORAL, CORAL];
  const baseX = 4.2, weekW = 0.75, baseY = 1.8, rowH = 0.42;
  // weeks header
  for (let w = 1; w <= 12; w++) {
    s.addText(`W${w}`, { x: baseX + (w - 1) * weekW, y: baseY - 0.4, w: weekW, h: 0.3, fontSize: 10, color: GRAY, align: "center", fontFace: FONT_B, margin: 0 });
  }
  phasesG.forEach((p, i) => {
    const y = baseY + i * (rowH + 0.1);
    s.addText(p.name, { x: 0.7, y: y, w: 3.4, h: rowH, fontSize: 12, color: NAVY_DARK, bold: true, fontFace: FONT_B, margin: 0, valign: "middle" });
    // grid background
    s.addShape(pres.shapes.RECTANGLE, { x: baseX, y: y + 0.05, w: 12 * weekW, h: rowH - 0.1, fill: { color: LIGHT }, line: { color: LIGHT } });
    // bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: baseX + (p.start - 1) * weekW, y: y + 0.05, w: p.len * weekW, h: rowH - 0.1,
      fill: { color: colors[i] }, line: { color: colors[i] }
    });
  });

  // milestones
  const ms = [
    "W2  데이터·성숙도 진단 리포트",
    "W4  AI 리터러시 교육 완료",
    "W6  RTC 핵심 업무 지도화",
    "W8  ICEP 우선순위 + Top 5 과제",
    "W10  파일럿 중간 리뷰",
    "W12  EARS 대시보드 + 확산 로드맵"
  ];
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.7, w: 11.9, h: 1.3, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("주요 마일스톤", { x: 0.9, y: 5.78, w: 11.5, h: 0.35, fontSize: 12, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  ms.forEach((m, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    s.addText("● " + m, {
      x: 0.9 + col * 4.0, y: 6.15 + row * 0.4, w: 3.9, h: 0.35,
      fontSize: 11, color: WHITE, fontFace: FONT_B, margin: 0
    });
  });

  addFooter(s, 8, TOTAL);
}

// ═══════════════ Slide 09 — 산출물 샘플 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 9, "주요 산출물 샘플", "Phase별 핵심 워크시트·도구");

  const outs = [
    {
      name: "RTC 캔버스",
      phase: "Phase 1",
      lines: ["Role · Task · Competency", "각 Task별 AI 접점", "현재 역량 × 필요 역량"]
    },
    {
      name: "ICEP 매트릭스",
      phase: "Phase 2",
      lines: ["Impact × Confidence", "× Ease × People Readiness", "Top 우선순위 자동 도출"]
    },
    {
      name: "EARS 대시보드",
      phase: "Phase 5",
      lines: ["Efficiency · Adoption", "Revenue · Sustainability", "월간 측정·시각화"]
    }
  ];
  outs.forEach((o, i) => {
    const x = 0.7 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.7, w: 3.9, h: 5.0, fill: { color: WHITE }, line: { color: ICE, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 90, opacity: 0.08 } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.7, w: 3.9, h: 1.1, fill: { color: NAVY }, line: { color: NAVY } });
    s.addText(o.phase, { x: x + 0.2, y: 1.78, w: 3.5, h: 0.35, fontSize: 11, color: CORAL, bold: true, fontFace: FONT_B, margin: 0 });
    s.addText(o.name, { x: x + 0.2, y: 2.1, w: 3.5, h: 0.6, fontSize: 22, bold: true, color: WHITE, fontFace: FONT_H, margin: 0 });
    o.lines.forEach((l, j) => {
      s.addText("· " + l, { x: x + 0.3, y: 3.1 + j * 0.55, w: 3.5, h: 0.5, fontSize: 13, color: NAVY_DARK, fontFace: FONT_B, margin: 0 });
    });
    // mini visual
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: 5.1, w: 3.3, h: 1.4, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addText("[ 샘플 시각화 ]", { x: x + 0.3, y: 5.5, w: 3.3, h: 0.6, fontSize: 12, color: GRAY, italic: true, align: "center", fontFace: FONT_B, margin: 0 });
  });

  addFooter(s, 9, TOTAL);
}

// ═══════════════ Slide 10 — 4축 ROI ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 10, "기대효과 — 4축 ROI", "정량 효과 (6개월 기준)");

  const roi = [
    { icon: "⚡", title: "효율성", metric: "반복 업무 시간 단축", val: "25~40%", color: NAVY },
    { icon: "💰", title: "매출/가치", metric: "고객대응·제안 속도", val: "+30%", color: NAVY },
    { icon: "🛡️", title: "리스크", metric: "Shadow AI 제거율", val: "90%+", color: CORAL },
    { icon: "🏃", title: "민첩성", metric: "의사결정 사이클", val: "-50%", color: CORAL }
  ];
  roi.forEach((r, i) => {
    const x = 0.7 + (i % 4) * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.7, w: 2.95, h: 3.0, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.7, w: 2.95, h: 0.08, fill: { color: r.color }, line: { color: r.color } });
    s.addText(r.icon, { x: x + 0.2, y: 1.85, w: 1, h: 0.6, fontSize: 28, margin: 0 });
    s.addText(r.title, { x: x + 0.2, y: 2.5, w: 2.7, h: 0.4, fontSize: 14, bold: true, color: NAVY_DARK, fontFace: FONT_H, margin: 0 });
    s.addText(r.metric, { x: x + 0.2, y: 2.9, w: 2.7, h: 0.4, fontSize: 11, color: GRAY, fontFace: FONT_B, margin: 0 });
    s.addText(r.val, { x: x + 0.2, y: 3.4, w: 2.7, h: 1.0, fontSize: 36, bold: true, color: r.color, fontFace: FONT_H, margin: 0 });
  });

  // qualitative + ROI formula
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.0, w: 5.85, h: 1.95, fill: { color: WHITE }, line: { color: ICE, width: 1 } });
  s.addText("정성 효과", { x: 0.9, y: 5.1, w: 5.5, h: 0.4, fontSize: 13, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  s.addText([
    { text: "· 'AI를 써야 한다'는 부담 → 'AI와 함께 일한다'는 자신감", options: { breakLine: true } },
    { text: "· 부서 간 격차 해소 · AX Champion 네트워크 형성", options: { breakLine: true } },
    { text: "· 거버넌스 내재화 — 통제 없는 자율의 문화" }
  ], { x: 0.9, y: 5.4, w: 5.6, h: 1.5, fontSize: 12, color: NAVY_DARK, fontFace: FONT_B, margin: 0 });

  s.addShape(pres.shapes.RECTANGLE, { x: 6.75, y: 5.0, w: 5.85, h: 1.95, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("ROI 산식", { x: 6.95, y: 5.1, w: 5.5, h: 0.4, fontSize: 13, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  s.addText("ROI = (절감시간 × 시간단가 + 신규창출가치 − 투자) / 투자", {
    x: 6.95, y: 5.5, w: 5.5, h: 0.6, fontSize: 13, color: WHITE, fontFace: FONT_B, margin: 0
  });
  s.addText("→ 일반적으로 6개월 내 1.8 ~ 3.5배 회수", {
    x: 6.95, y: 6.1, w: 5.5, h: 0.6, fontSize: 16, bold: true, color: ICE, fontFace: FONT_H, margin: 0
  });

  addFooter(s, 10, TOTAL);
}

// ═══════════════ Slide 11 — 팀 & 차별점 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 11, "팀 & 방법론 배경", "왜 FLOW~인가 — 3대 차별점");

  // Lead partner card
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.7, w: 4.0, h: 5.2, fill: { color: NAVY }, line: { color: NAVY } });
  s.addShape(pres.shapes.OVAL, { x: 1.6, y: 2.0, w: 2.2, h: 2.2, fill: { color: ICE }, line: { color: ICE } });
  s.addText("DEMIAN", { x: 1.6, y: 2.7, w: 2.2, h: 0.8, fontSize: 22, bold: true, color: NAVY, align: "center", fontFace: FONT_H, margin: 0 });
  s.addText("Lead Partner", { x: 0.9, y: 4.4, w: 3.6, h: 0.4, fontSize: 12, color: CORAL, bold: true, align: "center", fontFace: FONT_B, margin: 0 });
  s.addText("임정훈 (Demian)", { x: 0.9, y: 4.8, w: 3.6, h: 0.5, fontSize: 20, bold: true, color: WHITE, align: "center", fontFace: FONT_H, margin: 0 });
  s.addText([
    { text: "HRD 15년 경력", options: { color: ICE, breakLine: true, fontSize: 12 } },
    { text: "200+ AI 앱 실전 개발", options: { color: ICE, breakLine: true, fontSize: 12 } },
    { text: "FLOW~ : AX Design Lab 대표", options: { color: ICE, fontSize: 12 } }
  ], { x: 0.9, y: 5.4, w: 3.6, h: 1.4, align: "center", fontFace: FONT_B, margin: 0 });

  // 3 differentiators
  const diff = [
    { num: "01", title: "HRD DNA", desc: "어떤 AI 컨설팅사보다 '사람의 학습과 변화'를 깊이 이해합니다." },
    { num: "02", title: "200앱 실전", desc: "PPT로만 말하지 않습니다. 우리가 만든 도구로 고객의 문제를 풉니다." },
    { num: "03", title: "전환 완수 파트너십", desc: "리포트 주고 떠나지 않습니다. 조직이 전환을 완료할 때까지 함께합니다." }
  ];
  diff.forEach((d, i) => {
    const y = 1.7 + i * 1.75;
    s.addShape(pres.shapes.RECTANGLE, { x: 4.95, y: y, w: 7.65, h: 1.6, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addShape(pres.shapes.RECTANGLE, { x: 4.95, y: y, w: 0.12, h: 1.6, fill: { color: CORAL }, line: { color: CORAL } });
    s.addText(d.num, { x: 5.2, y: y + 0.15, w: 1.2, h: 0.5, fontSize: 22, bold: true, color: CORAL, fontFace: FONT_H, margin: 0 });
    s.addText(d.title, { x: 6.3, y: y + 0.15, w: 6.2, h: 0.5, fontSize: 18, bold: true, color: NAVY, fontFace: FONT_H, margin: 0 });
    s.addText(d.desc, { x: 5.2, y: y + 0.75, w: 7.3, h: 0.7, fontSize: 13, color: NAVY_DARK, fontFace: FONT_B, margin: 0 });
  });

  addFooter(s, 11, TOTAL);
}

// ═══════════════ Slide 12 — 보안 & 거버넌스 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 12, "보안 · 거버넌스", "프로젝트 표준 + 글로벌 프레임워크 준수");

  const headers = ["영역", "FLOW~ 표준"].map(h => ({ text: h, options: { fill: { color: NAVY }, color: WHITE, bold: true, align: "center", fontSize: 13, valign: "middle" } }));
  const rows = [
    ["데이터 분류", "Level 1(공개) · Level 2(내부) · Level 3(기밀) 3단계 운영"],
    ["AI 플랫폼", "Enterprise/Team 플랜 또는 API — 학습 반영 차단 확인"],
    ["NDA", "Kickoff 전 필수 체결 — 구체 업무·파일은 NDA 이후 수령"],
    ["프롬프트 로그", "고객사 전용 저장소 격리, 종료 시 파기 증빙"],
    ["개인정보", "가명처리 후 실습, 개인정보보호법 2025 개정안 준수"]
  ];
  s.addTable(
    [headers, ...rows.map(r => r.map((c, i) => ({
      text: c, options: { fontSize: 12, fontFace: FONT_B, color: NAVY_DARK, valign: "middle", margin: 6, bold: i === 0 }
    })))],
    { x: 0.7, y: 1.6, w: 7.6, colW: [2.0, 5.6], rowH: 0.55, border: { pt: 1, color: ICE } }
  );

  // governance frameworks
  s.addShape(pres.shapes.RECTANGLE, { x: 8.5, y: 1.6, w: 4.1, h: 4.6, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("거버넌스 프레임워크", { x: 8.7, y: 1.75, w: 3.8, h: 0.4, fontSize: 13, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  const fws = [
    { t: "NIST AI RMF", d: "GOVERN · MAP · MEASURE · MANAGE 체크리스트 제공" },
    { t: "EU AI Act", d: "Risk 분류 맵핑" },
    { t: "국내 AI기본법(2026)", d: "대응 가이드" }
  ];
  fws.forEach((f, i) => {
    const y = 2.3 + i * 1.3;
    s.addText(f.t, { x: 8.7, y: y, w: 3.8, h: 0.4, fontSize: 14, bold: true, color: WHITE, fontFace: FONT_H, margin: 0 });
    s.addText(f.d, { x: 8.7, y: y + 0.4, w: 3.8, h: 0.7, fontSize: 11, color: ICE, fontFace: FONT_B, margin: 0 });
  });

  // IP
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 6.4, w: 11.9, h: 0.65, fill: { color: LIGHT }, line: { color: LIGHT } });
  s.addText([
    { text: "지식재산권 ", options: { color: CORAL, bold: true, fontSize: 12 } },
    { text: "방법론·프레임워크 = FLOW~ 귀속  ·  고객사 데이터·결과물 = 삼송 귀속", options: { color: NAVY_DARK, fontSize: 12 } }
  ], { x: 0.9, y: 6.45, w: 11.5, h: 0.55, fontFace: FONT_B, valign: "middle", margin: 0 });

  addFooter(s, 12, TOTAL);
}

// ═══════════════ Slide 13 — 레퍼런스 & 비교 ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addTitle(s, 13, "레퍼런스 & 차별점", "경쟁사 대비 FLOW~ 포지셔닝");

  s.addText("주요 레퍼런스", { x: 0.7, y: 1.6, w: 12, h: 0.4, fontSize: 13, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  const refs = [
    "H그룹 임원 코칭 — 2026 진행 협의 중",
    "HRDK 중소기업 AX 워크숍 — 커리큘럼 공급",
    "20+ 기업 AI 리터러시 & 리더십 교육",
    "200+ AI 앱 실전 개발 포트폴리오"
  ];
  refs.forEach((r, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7 + (i % 2) * 6.0, y: 2.05 + Math.floor(i / 2) * 0.7, w: 5.85, h: 0.6, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addText("● " + r, { x: 0.9 + (i % 2) * 6.0, y: 2.1 + Math.floor(i / 2) * 0.7, w: 5.6, h: 0.5, fontSize: 12, color: NAVY_DARK, fontFace: FONT_B, margin: 0, valign: "middle" });
  });
  s.addText("* 상세 레퍼런스는 NDA 체결 후 개별 공유", { x: 0.7, y: 3.55, w: 12, h: 0.3, fontSize: 10, color: GRAY, italic: true, fontFace: FONT_B, margin: 0 });

  // Comparison table
  s.addText("경쟁사 대비 차별점", { x: 0.7, y: 4.0, w: 12, h: 0.4, fontSize: 13, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  const ch = ["항목", "대형 컨설팅사", "IT SI", "FLOW~"].map((h, i) => ({
    text: h,
    options: {
      fill: { color: i === 3 ? CORAL : NAVY }, color: WHITE, bold: true,
      align: "center", fontSize: 12, valign: "middle"
    }
  }));
  const cr = [
    ["관점", "전략·보고서", "시스템 구축", "사람·업무·조직"],
    ["산출물", "PPT 리포트", "시스템", "교육+퍼실+코칭+도구"],
    ["기간/비용", "장기·고가", "개발 중심", "현실적·실행 중심"],
    ["종료 후", "리포트 전달", "유지보수", "Champion 네트워크 자립"]
  ];
  s.addTable(
    [ch, ...cr.map(r => r.map((c, i) => ({
      text: c,
      options: {
        fontSize: 11, fontFace: FONT_B,
        color: i === 3 ? NAVY : NAVY_DARK,
        bold: i === 0 || i === 3,
        valign: "middle", margin: 5,
        fill: { color: i === 3 ? LIGHT : WHITE }
      }
    })))],
    { x: 0.7, y: 4.45, w: 11.9, colW: [1.9, 3.3, 3.3, 3.4], rowH: 0.5, border: { pt: 1, color: ICE } }
  );

  addFooter(s, 13, TOTAL);
}

// ═══════════════ Slide 14 — 투자 & Next Step ═══════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY_DARK };
  // Title bar (dark variant)
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 13.3, h: 1.1, fill: { color: NAVY }, line: { color: NAVY } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 13.3, h: 0.08, fill: { color: CORAL }, line: { color: CORAL } });
  s.addText("14", { x: 0.5, y: 0.2, w: 1.0, h: 0.7, fontSize: 36, bold: true, fontFace: FONT_H, color: ICE, margin: 0 });
  s.addText("투자 & Next Step", { x: 1.5, y: 0.18, w: 11.5, h: 0.55, fontSize: 26, bold: true, fontFace: FONT_H, color: WHITE, margin: 0, valign: "middle" });
  s.addText("삼송의 AX, 끝까지 함께 가겠습니다.", { x: 1.5, y: 0.68, w: 11.5, h: 0.35, fontSize: 13, fontFace: FONT_B, color: ICE, margin: 0 });

  // Investment box
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.6, w: 6.0, h: 5.3, fill: { color: WHITE }, line: { color: WHITE } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.6, w: 6.0, h: 0.08, fill: { color: CORAL }, line: { color: CORAL } });
  s.addText("투자 제안", { x: 0.9, y: 1.8, w: 5.6, h: 0.4, fontSize: 13, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  const inv = [
    ["패키지", "SME + Leader AX 혼합 (경량 Mid-Corp)"],
    ["기간", "8주 (5~6월)"],
    ["투입 공수", "35 MD"],
    ["청구 일정", "Kickoff 30% / 중간 40% / 완료 30%"],
    ["포함 범위", "Kickoff · 워크숍 6회 · 임원 코호트 4회 · 1:1 코칭 8회"]
  ];
  inv.forEach((p, i) => {
    s.addText(p[0], { x: 0.9, y: 2.3 + i * 0.45, w: 1.5, h: 0.4, fontSize: 12, color: GRAY, fontFace: FONT_B, margin: 0 });
    s.addText(p[1], { x: 2.5, y: 2.3 + i * 0.45, w: 4.0, h: 0.4, fontSize: 12, bold: true, color: NAVY_DARK, fontFace: FONT_B, margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: 4.6, w: 5.6, h: 0.05, fill: { color: ICE }, line: { color: ICE } });
  s.addText("총 투자 (VAT 별도)", { x: 0.9, y: 4.75, w: 5.6, h: 0.4, fontSize: 12, color: GRAY, fontFace: FONT_B, margin: 0 });
  s.addText("4,500만원", { x: 0.9, y: 5.15, w: 5.6, h: 1.0, fontSize: 36, bold: true, color: NAVY, fontFace: FONT_H, margin: 0 });
  s.addText("* 출장비, 인쇄물, 외부 강사 초청은 별도 협의", { x: 0.9, y: 6.3, w: 5.6, h: 0.4, fontSize: 10, italic: true, color: GRAY, fontFace: FONT_B, margin: 0 });

  // Next Step
  s.addText("Next Step — 3단계", { x: 7.0, y: 1.8, w: 5.8, h: 0.4, fontSize: 13, bold: true, color: CORAL, fontFace: FONT_B, margin: 0 });
  const steps = [
    { n: "1", t: "본 제안 검토 + 1차 미팅 (60분)", d: "요구사항 상세화, 패키지 조정" },
    { n: "2", t: "NDA 체결 + 사전 진단 (1주)", d: "Phase -1 준비도 간이 진단 무상 제공" },
    { n: "3", t: "SOW 확정 + Kickoff", d: "8주 (5~6월) 전환 여정 시작" }
  ];
  steps.forEach((st, i) => {
    const y = 2.3 + i * 1.25;
    s.addShape(pres.shapes.OVAL, { x: 7.0, y: y, w: 0.7, h: 0.7, fill: { color: CORAL }, line: { color: CORAL } });
    s.addText(st.n, { x: 7.0, y: y + 0.05, w: 0.7, h: 0.6, fontSize: 22, bold: true, color: WHITE, align: "center", fontFace: FONT_H, margin: 0 });
    s.addText(st.t, { x: 7.85, y: y, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: WHITE, fontFace: FONT_H, margin: 0 });
    s.addText(st.d, { x: 7.85, y: y + 0.4, w: 5.0, h: 0.4, fontSize: 11, color: ICE, fontFace: FONT_B, margin: 0 });
  });

  // Contact
  s.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 6.2, w: 5.8, h: 0.7, fill: { color: NAVY }, line: { color: CORAL, width: 1 } });
  s.addText([
    { text: "Demian (임정훈)  ", options: { color: WHITE, bold: true, fontSize: 13 } },
    { text: "[데미안 메일] · [데미안 연락처]", options: { color: ICE, fontSize: 11 } }
  ], { x: 7.2, y: 6.25, w: 5.6, h: 0.6, fontFace: FONT_B, valign: "middle", margin: 0 });

  // bottom bar with thank-you
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 7.15, w: 13.3, h: 0.35, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText("FLOW~ : AX Design Lab", { x: 0.5, y: 7.18, w: 6, h: 0.3, fontSize: 10, color: ICE, fontFace: FONT_B, margin: 0 });
  s.addText("14 / 14", { x: 12.0, y: 7.18, w: 0.8, h: 0.3, fontSize: 10, color: ICE, fontFace: FONT_B, align: "right", margin: 0 });
}

pres.writeFile({ fileName: "clients/samsong/FLOW_AX_Proposal_삼송_20260409.pptx" })
  .then(fn => console.log("✓ PPTX 생성 완료: " + fn));
