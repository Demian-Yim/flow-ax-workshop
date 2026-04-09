import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from "recharts";

const COLORS = { navy: "#1B2A4A", blue: "#2E5090", green: "#548235", orange: "#ED7D31", red: "#C00000", purple: "#7030A0", lightBlue: "#00B0F0", bg: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0", text: "#334155", sub: "#64748B" };

const initialData = {
  effectiveness: { timeReduction: 42, errorReduction: 35, outputIncrease: 28, costSaving: 15000000 },
  alignment: { bizGoalContribution: 78, crossDeptConsistency: 65 },
  relevance: { userSatisfaction: 82, reworkRate: 4.2, usage30: 88, usage60: 76, usage90: 71 },
  sustainability: { championRetention: 92, voluntaryAdoption: 3, skillTransition: 45 },
};

const arqScores = [
  { axis: "Accuracy", score: 8.2 }, { axis: "Relevance", score: 7.8 }, { axis: "Quality", score: 7.5 },
];

const monthlyTrend = [
  { month: "1월", E: 25, A: 60, R: 70, S: 30 }, { month: "2월", E: 32, A: 65, R: 75, S: 40 },
  { month: "3월", E: 38, A: 70, R: 78, S: 48 }, { month: "4월", E: 42, A: 75, R: 82, S: 55 },
  { month: "5월", E: 48, A: 78, R: 85, S: 62 }, { month: "6월", E: 55, A: 82, R: 88, S: 70 },
];

const waveData = [
  { wave: "Wave 1", tasks: 8, completed: 7, inProgress: 1, color: COLORS.green },
  { wave: "Wave 2", tasks: 12, completed: 5, inProgress: 4, color: COLORS.orange },
  { wave: "Wave 3", tasks: 6, completed: 0, inProgress: 2, color: COLORS.purple },
];

const KPICard = ({ label, value, unit, color, sub }) => (
  <div style={{ background: COLORS.card, borderRadius: 12, padding: "18px 20px", border: `1px solid ${COLORS.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", flex: 1, minWidth: 160 }}>
    <div style={{ fontSize: 12, color: COLORS.sub, marginBottom: 6, fontWeight: 500 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontSize: 28, fontWeight: 700, color: color || COLORS.navy }}>{value}</span>
      <span style={{ fontSize: 13, color: COLORS.sub }}>{unit}</span>
    </div>
    {sub && <div style={{ fontSize: 11, color: COLORS.sub, marginTop: 4 }}>{sub}</div>}
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 16, marginTop: 28 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{title}</h2>
    </div>
    {subtitle && <p style={{ fontSize: 12, color: COLORS.sub, margin: "4px 0 0 28px" }}>{subtitle}</p>}
  </div>
);

const ProgressBar = ({ value, max, color, label }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: COLORS.text, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}{typeof value === "number" && max ? `/${max}` : ""}</span>
    </div>
    <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(typeof value === "number" ? (value / (max || 100)) * 100 : value)}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  </div>
);

export default function EARSDashboard() {
  const [data] = useState(initialData);
  const [activeTab, setActiveTab] = useState("overview");

  const earsRadar = [
    { axis: "E 효과성", score: Math.round((data.effectiveness.timeReduction + data.effectiveness.errorReduction + data.effectiveness.outputIncrease) / 3) },
    { axis: "A 정렬도", score: Math.round((data.alignment.bizGoalContribution + data.alignment.crossDeptConsistency) / 2) },
    { axis: "R 적합도", score: Math.round((data.relevance.userSatisfaction + (100 - data.relevance.reworkRate * 10) + data.relevance.usage90) / 3) },
    { axis: "S 지속가능성", score: Math.round((data.sustainability.championRetention + data.sustainability.skillTransition) / 2) },
  ];

  const overallScore = Math.round(earsRadar.reduce((a, b) => a + b.score, 0) / 4);

  const tabs = [
    { id: "overview", label: "종합 현황" },
    { id: "ears", label: "EARS 상세" },
    { id: "wave", label: "Wave 진행" },
    { id: "arq", label: "ARQ 검증" },
  ];

  return (
    <div style={{ fontFamily: "'Pretendard', -apple-system, sans-serif", background: COLORS.bg, minHeight: "100vh", padding: 24, maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.blue})`, borderRadius: 16, padding: "24px 28px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>FLOW~ EARS 대시보드</h1>
            <p style={{ fontSize: 13, opacity: 0.8, margin: "4px 0 0" }}>효과성 · 정렬도 · 적합도 · 지속가능성 — 실시간 AX 성과 트래킹</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{overallScore}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>EARS 종합 점수</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: activeTab === t.id ? COLORS.navy : COLORS.card,
            color: activeTab === t.id ? "white" : COLORS.text,
            boxShadow: activeTab === t.id ? "0 2px 8px rgba(27,42,74,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
            transition: "all 0.2s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <KPICard label="처리 시간 단축" value={`${data.effectiveness.timeReduction}%`} unit="" color={COLORS.green} sub="목표: 40%" />
            <KPICard label="사용자 만족도" value={data.relevance.userSatisfaction} unit="점" color={COLORS.blue} sub="목표: 80점" />
            <KPICard label="비용 절감" value={(data.effectiveness.costSaving / 10000).toLocaleString()} unit="만원" color={COLORS.orange} sub="월간 기준" />
            <KPICard label="90일 지속 사용률" value={`${data.relevance.usage90}%`} unit="" color={COLORS.purple} sub="목표: 70%" />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}`, flex: 1, minWidth: 300 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginTop: 0 }}>EARS 4축 레이더</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={earsRadar}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: COLORS.text }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="현재" dataKey="score" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}`, flex: 1, minWidth: 300 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginTop: 0 }}>월별 EARS 추이</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="E" name="효과성" stroke={COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="A" name="정렬도" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="R" name="적합도" stroke={COLORS.orange} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="S" name="지속가능성" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* EARS Detail Tab */}
      {activeTab === "ears" && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { title: "E — Effectiveness (효과성)", color: COLORS.green, items: [
              { label: "처리 시간 단축률", value: data.effectiveness.timeReduction, max: 100 },
              { label: "오류율 감소", value: data.effectiveness.errorReduction, max: 100 },
              { label: "시간당 산출물 증가", value: data.effectiveness.outputIncrease, max: 100 },
            ]},
            { title: "A — Alignment (정렬도)", color: COLORS.blue, items: [
              { label: "비즈니스 목표 기여도", value: data.alignment.bizGoalContribution, max: 100 },
              { label: "부서 간 AI 활용 일관성", value: data.alignment.crossDeptConsistency, max: 100 },
            ]},
            { title: "R — Relevance (적합도)", color: COLORS.orange, items: [
              { label: "사용자 만족도", value: data.relevance.userSatisfaction, max: 100 },
              { label: `재수정률 (${data.relevance.reworkRate}%)`, value: 100 - data.relevance.reworkRate * 10, max: 100 },
              { label: "30일 사용률", value: data.relevance.usage30, max: 100 },
              { label: "60일 사용률", value: data.relevance.usage60, max: 100 },
              { label: "90일 사용률", value: data.relevance.usage90, max: 100 },
            ]},
            { title: "S — Sustainability (지속가능성)", color: COLORS.purple, items: [
              { label: "Champion 활동 지속률", value: data.sustainability.championRetention, max: 100 },
              { label: `자발적 확산 (${data.sustainability.voluntaryAdoption}팀)`, value: data.sustainability.voluntaryAdoption * 20, max: 100 },
              { label: "역량 전환 진행도", value: data.sustainability.skillTransition, max: 100 },
            ]},
          ].map((section, idx) => (
            <div key={idx} style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}`, flex: "1 1 calc(50% - 8px)", minWidth: 280 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: section.color, marginTop: 0, borderBottom: `2px solid ${section.color}`, paddingBottom: 8 }}>{section.title}</h3>
              {section.items.map((item, i) => (
                <ProgressBar key={i} label={item.label} value={item.value} max={item.max} color={section.color} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Wave Tab */}
      {activeTab === "wave" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {waveData.map((w, i) => (
              <div key={i} style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}`, flex: 1, minWidth: 200, borderTop: `4px solid ${w.color}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: w.color, marginTop: 0 }}>{w.wave}</h3>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <div><div style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy }}>{w.tasks}</div><div style={{ fontSize: 11, color: COLORS.sub }}>전체 과제</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 800, color: COLORS.green }}>{w.completed}</div><div style={{ fontSize: 11, color: COLORS.sub }}>완료</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 800, color: COLORS.orange }}>{w.inProgress}</div><div style={{ fontSize: 11, color: COLORS.sub }}>진행 중</div></div>
                </div>
                <ProgressBar label="완료율" value={Math.round(w.completed / w.tasks * 100)} max={100} color={w.color} />
              </div>
            ))}
          </div>

          <div style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginTop: 0 }}>Wave별 과제 진행 현황</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={waveData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="wave" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completed" name="완료" stackId="a" fill={COLORS.green} radius={[0, 0, 0, 0]} />
                <Bar dataKey="inProgress" name="진행 중" stackId="a" fill={COLORS.orange} />
                <Bar dataKey="tasks" name="전체" fill="#E2E8F0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ARQ Tab */}
      {activeTab === "arq" && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}`, flex: 1, minWidth: 300 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginTop: 0 }}>ARQ 3중 검증 점수</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={arqScores}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: COLORS.text }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Radar name="ARQ" dataKey="score" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.sub }}>ARQ 평균: </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy }}>{(arqScores.reduce((a, b) => a + b.score, 0) / 3).toFixed(1)}</span>
              <span style={{ fontSize: 12, color: COLORS.sub }}> / 10</span>
            </div>
          </div>

          <div style={{ background: COLORS.card, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}`, flex: 1, minWidth: 300 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginTop: 0 }}>ARQ 상세 평가</h3>
            {[
              { name: "Accuracy (정확성)", score: 8.2, desc: "측정 데이터의 정확도. 소스 데이터 오류율 < 2%", color: COLORS.green },
              { name: "Relevance (적합성)", score: 7.8, desc: "지표가 비즈니스 목표에 적합한 정도. 핵심 KPI 연결률 85%", color: COLORS.blue },
              { name: "Quality (품질)", score: 7.5, desc: "측정 방법론의 신뢰도. 교차검증 통과율 78%", color: COLORS.orange },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 16, padding: 14, background: COLORS.bg, borderRadius: 8, borderLeft: `4px solid ${item.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.name}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.score}</span>
                </div>
                <div style={{ fontSize: 11, color: COLORS.sub }}>{item.desc}</div>
                <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, marginTop: 8 }}>
                  <div style={{ height: "100%", width: `${item.score * 10}%`, background: item.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 28, padding: "16px 0", borderTop: `1px solid ${COLORS.border}` }}>
        <span style={{ fontSize: 11, color: COLORS.sub }}>
          © 2026 FLOW~ | EARS + ARQ 성과 체계 | flowdesign.ai.kr | AI 코디네이터 임정훈
        </span>
      </div>
    </div>
  );
}
