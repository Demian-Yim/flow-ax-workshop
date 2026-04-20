/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Admin — 참가자 응답 취합 + 내보내기
   ═══════════════════════════════════════════════════════════ */

const AXAdmin = (() => {

  const PHASES = [
    { id: 'phase-0', name: 'AI 리터러시', icon: '🧠' },
    { id: 'phase-1', name: 'RTC 캔버스', icon: '📋' },
    { id: 'phase-1-2', name: 'ICEP 매트릭스', icon: '📊' },
    { id: 'phase-2', name: 'WHY-WHAT-HOW', icon: '🎯' },
    { id: 'phase-5', name: 'EARS 대시보드', icon: '📈' },
  ];

  // ── 메인 렌더러 ──
  async function renderAXMonitoring(workshopId, container) {
    container.innerHTML = '<div class="ax-admin-loading">📊 AX 응답 취합 중...</div>';

    const teamResponses = await getAllTeamResponses(workshopId);
    if (!teamResponses.length) {
      container.innerHTML = '<div class="ax-admin-empty">아직 참가자 응답이 없습니다.</div>';
      return;
    }

    const allResponses = [];
    teamResponses.forEach(({ team, responses }) => {
      if (!responses) return;
      responses.forEach(r => {
        allResponses.push({ teamName: team?.name || '?', memberId: r.memberId, phaseId: r.phaseId, data: r.data, completedAt: r.completedAt });
      });
    });

    container.innerHTML = `
      <div class="ax-admin">
        <div class="ax-admin__header">
          <h3>📊 AX 워크숍 취합 대시보드</h3>
          <div class="ax-admin__actions">
            <button class="btn btn-primary btn-sm" onclick="AXAdmin.exportJSON('${workshopId}')">📥 JSON 내보내기</button>
            <button class="btn btn-ghost btn-sm" onclick="AXAdmin.exportCSV('${workshopId}')">📥 CSV 내보내기</button>
          </div>
        </div>

        <div class="ax-admin__overview">
          ${renderCompletionOverview(allResponses, teamResponses)}
        </div>

        <div class="ax-admin__tabs">
          ${PHASES.map(p => `<button class="ax-admin__tab" onclick="AXAdmin.showPhaseDetail('${p.id}', '${workshopId}')">${p.icon} ${p.name}</button>`).join('')}
        </div>

        <div id="axAdminPhaseDetail"></div>
      </div>
    `;
  }

  // ── 완료율 개요 ──
  function renderCompletionOverview(allResponses, teamResponses) {
    const totalParticipants = new Set(allResponses.map(r => r.memberId)).size;
    const phaseStats = PHASES.map(p => {
      const completed = allResponses.filter(r => r.phaseId === p.id && r.completedAt).length;
      const started = allResponses.filter(r => r.phaseId === p.id).length;
      const pct = totalParticipants > 0 ? Math.round((started / totalParticipants) * 100) : 0;
      return { ...p, completed, started, pct };
    });

    return `
      <div class="ax-overview-grid">
        <div class="ax-overview-stat">
          <div class="ax-overview-stat__num">${teamResponses.length}</div>
          <div class="ax-overview-stat__label">팀</div>
        </div>
        <div class="ax-overview-stat">
          <div class="ax-overview-stat__num">${totalParticipants}</div>
          <div class="ax-overview-stat__label">참가자</div>
        </div>
        ${phaseStats.map(p => `
          <div class="ax-overview-phase">
            <div class="ax-overview-phase__icon">${p.icon}</div>
            <div class="ax-overview-phase__name">${p.name}</div>
            <div class="ax-overview-phase__bar">
              <div class="ax-overview-phase__fill" style="width:${p.pct}%"></div>
            </div>
            <div class="ax-overview-phase__pct">${p.started}/${totalParticipants}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Phase별 상세 보기 ──
  async function showPhaseDetail(phaseId, workshopId) {
    const container = document.getElementById('axAdminPhaseDetail');
    if (!container) return;

    const teamResponses = await getAllTeamResponses(workshopId);
    const phaseData = [];
    teamResponses.forEach(({ team, responses }) => {
      if (!responses) return;
      responses.filter(r => r.phaseId === phaseId).forEach(r => {
        phaseData.push({ teamName: team?.name || '?', memberId: r.memberId, data: r.data || {} });
      });
    });

    if (!phaseData.length) {
      container.innerHTML = '<p style="text-align:center;color:#9ca3af;">이 Phase의 응답이 아직 없습니다.</p>';
      return;
    }

    const renderers = {
      'phase-0': renderPhase0Detail,
      'phase-1': renderPhase1Detail,
      'phase-1-2': renderPhase12Detail,
      'phase-2': renderPhase2Detail,
      'phase-5': renderPhase5Detail,
    };

    const renderer = renderers[phaseId];
    container.innerHTML = renderer ? renderer(phaseData) : '<p>상세 보기 준비 중</p>';
  }

  function renderPhase0Detail(data) {
    const scores = data.map(d => {
      let total = 0;
      for (let i = 1; i <= 5; i++) total += parseInt(d.data[`q${i}`]) || 0;
      return { ...d, total };
    });
    const avg = scores.length ? (scores.reduce((s, d) => s + d.total, 0) / scores.length).toFixed(1) : 0;
    const levels = { '입문': 0, '중급': 0, '활용': 0 };
    scores.forEach(s => {
      if (s.total <= 10) levels['입문']++;
      else if (s.total <= 17) levels['중급']++;
      else levels['활용']++;
    });

    return `
      <div class="ax-detail">
        <h4>🧠 AI 리터러시 — 전체 결과</h4>
        <div class="ax-detail__stats">
          <span>평균 점수: <strong>${avg}/25</strong></span>
          <span>입문: ${levels['입문']}명</span>
          <span>중급: ${levels['중급']}명</span>
          <span>활용: ${levels['활용']}명</span>
        </div>
        <table class="ax-detail__table">
          <thead><tr><th>팀</th><th>참가자</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th><th>합계</th><th>수준</th></tr></thead>
          <tbody>
            ${scores.map(s => {
              const level = s.total <= 10 ? '입문' : s.total <= 17 ? '중급' : '활용';
              return `<tr><td>${s.teamName}</td><td>${s.memberId}</td>
                ${[1,2,3,4,5].map(i => `<td>${s.data[`q${i}`] || '-'}</td>`).join('')}
                <td><strong>${s.total}</strong></td><td>${level}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPhase1Detail(data) {
    return `
      <div class="ax-detail">
        <h4>📋 RTC 캔버스 — 전체 응답</h4>
        <table class="ax-detail__table">
          <thead><tr><th>팀</th><th>참가자</th><th>핵심 가치</th><th>역할 경계</th><th>성장 벡터</th><th>업무 수</th></tr></thead>
          <tbody>
            ${data.map(d => {
              let taskCount = 0;
              for (let i = 1; i <= 7; i++) { if (d.data[`task_${i}_name`]) taskCount++; }
              return `<tr><td>${d.teamName}</td><td>${d.memberId}</td>
                <td>${d.data.role_coreValue || '-'}</td>
                <td>${d.data.role_boundary || '-'}</td>
                <td>${d.data.role_growth || '-'}</td>
                <td>${taskCount}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPhase12Detail(data) {
    const allTasks = [];
    data.forEach(d => {
      for (let i = 1; i <= 10; i++) {
        const name = d.data[`icep_${i}_name`];
        const I = parseFloat(d.data[`icep_${i}_I`]) || 0;
        const C = parseFloat(d.data[`icep_${i}_C`]) || 0;
        const E = parseFloat(d.data[`icep_${i}_E`]) || 0;
        const P = parseFloat(d.data[`icep_${i}_P`]) || 0;
        const score = I * 0.3 + C * 0.2 + E * 0.2 + P * 0.3;
        if (name && score > 0) allTasks.push({ teamName: d.teamName, memberId: d.memberId, name, I, C, E, P, score });
      }
    });
    allTasks.sort((a, b) => b.score - a.score);

    return `
      <div class="ax-detail">
        <h4>📊 ICEP 매트릭스 — 조직 차원 우선순위</h4>
        <table class="ax-detail__table">
          <thead><tr><th>#</th><th>업무명</th><th>팀</th><th>참가자</th><th>I</th><th>C</th><th>E</th><th>P</th><th>합계</th></tr></thead>
          <tbody>
            ${allTasks.slice(0, 20).map((t, i) =>
              `<tr class="${i < 5 ? 'ax-row--highlight' : ''}"><td>${i+1}</td><td><strong>${t.name}</strong></td>
              <td>${t.teamName}</td><td>${t.memberId}</td>
              <td>${t.I}</td><td>${t.C}</td><td>${t.E}</td><td>${t.P}</td>
              <td><strong>${t.score.toFixed(1)}</strong></td></tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPhase2Detail(data) {
    return `
      <div class="ax-detail">
        <h4>🎯 WHY-WHAT-HOW — 재설계 요약</h4>
        ${data.map(d => `
          <div class="ax-detail__card">
            <div class="ax-detail__card-header">${d.teamName} — ${d.memberId}</div>
            <p><strong>WHY:</strong> ${d.data.why_reason || '-'}</p>
            <p><strong>기대효과:</strong> 처리시간 ${d.data.impact_time_current || '?'} → ${d.data.impact_time_target || '?'}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderPhase5Detail(data) {
    return `
      <div class="ax-detail">
        <h4>📈 EARS — 전체 KPI + 액션플랜</h4>
        <table class="ax-detail__table">
          <thead><tr><th>팀</th><th>참가자</th><th>30일 약속</th><th>기한</th><th>버디</th></tr></thead>
          <tbody>
            ${data.map(d => `
              <tr><td>${d.teamName}</td><td>${d.memberId}</td>
              <td>${d.data.commit_action || '-'}</td>
              <td>${d.data.commit_deadline || '-'}</td>
              <td>${d.data.commit_buddy || '-'}</td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ── 내보내기 ──
  async function exportJSON(workshopId) {
    const data = await getAllTeamResponses(workshopId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `AX_Workshop_${workshopId}_${new Date().toISOString().slice(0,10)}.json`);
  }

  async function exportCSV(workshopId) {
    const teamResponses = await getAllTeamResponses(workshopId);
    const rows = [['팀', '참가자', 'Phase', '필드', '값']];

    teamResponses.forEach(({ team, responses }) => {
      if (!responses) return;
      responses.forEach(r => {
        const d = r.data || {};
        Object.entries(d).forEach(([key, val]) => {
          if (key !== 'phaseId') {
            rows.push([team?.name || '', r.memberId || '', r.phaseId || '', key, String(val)]);
          }
        });
      });
    });

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `AX_Workshop_${workshopId}_${new Date().toISOString().slice(0,10)}.csv`);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    renderAXMonitoring,
    showPhaseDetail,
    exportJSON,
    exportCSV,
  };
})();
