/* ═══════════════════════════════════════════════════════════
   Instructor Dashboard — 통합 뷰 (좌:팀리스트, 우:상세 탭)
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  if (!sessionStorage.getItem('isAdmin')) {
    window.location.href = 'index.html';
    return;
  }
  if (typeof initFirebase === 'function') initFirebase();

  let workshops = [];
  let activeWs = null;
  let activeTeamId = null;
  let activeTab = 'progress';
  let teamsUnsub = null;
  let wsUnsub = null;
  let evalSaveTimer = null;

  // ──────────────────────────────────────────
  // 1. 워크샵 목록 로드
  // ──────────────────────────────────────────
  async function loadWorkshops() {
    const sel = document.getElementById('wsSelector');
    sel.innerHTML = '<option value="">로드 중...</option>';
    sel.onchange = (e) => {
      const wsId = e.target.value;
      if (wsId) selectWorkshop(wsId);
    };

    if (typeof db === 'undefined' || !db) {
      sel.innerHTML = '<option value="">⚠️ Firebase 미초기화 — 새로고침 필요</option>';
      showToast('Firebase 연결 실패. 페이지를 새로고침하세요.', 'error', 6000);
      return;
    }

    try {
      // 1차: status=active 쿼리
      const snap = await Promise.race([
        db.collection('workshops').where('status', '==', 'active').get(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 10s')), 10000))
      ]);
      workshops = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (workshops.length === 0) {
        // 2차 폴백: status 필터 없이 전체 조회 (status 미설정 워크샵 포착)
        try {
          const all = await db.collection('workshops').limit(50).get();
          workshops = all.docs.map(d => ({ id: d.id, ...d.data() })).filter(w => w.status !== 'archived');
        } catch (err2) { /* keep empty */ }
      }

      if (workshops.length === 0) {
        sel.innerHTML = '<option value="">활성 워크샵이 없습니다 — Admin에서 먼저 생성하세요</option>';
        showToast('워크샵이 없습니다. Admin에서 워크샵을 먼저 생성하세요.', 'warning', 6000);
        return;
      }

      sel.innerHTML = '<option value="">워크샵 선택...</option>' +
        workshops.map(w => `<option value="${w.id}">${w.name || '(이름 없음)'} (${w.code || '----'})</option>`).join('');
      showToast(`${workshops.length}개 워크샵 로드됨`, 'success', 2500);
    } catch (err) {
      console.error('워크샵 로드 실패:', err);
      sel.innerHTML = `<option value="">❌ 로드 실패: ${err.message || err}</option>`;
      showToast(`워크샵 로드 실패: ${err.message || err}. 새로고침하세요.`, 'error', 8000);
    }
  }

  function selectWorkshop(wsId) {
    if (teamsUnsub) { try { teamsUnsub(); } catch (e) {} teamsUnsub = null; }
    if (wsUnsub) { try { wsUnsub(); } catch (e) {} wsUnsub = null; }

    activeWs = workshops.find(w => w.id === wsId);
    if (!activeWs) return;
    document.getElementById('navWsName').textContent = `${activeWs.name} · 코드 ${activeWs.code}`;

    // 워크샵 doc 구독 (라운드 변경)
    wsUnsub = db.collection('workshops').doc(wsId).onSnapshot(doc => {
      if (!doc.exists) return;
      const data = doc.data();
      activeWs.currentRound = data.currentRound || 1;
      activeWs.rounds = data.rounds || [];
      renderRoundCtl();
    });

    // 팀 컬렉션 실시간 구독
    teamsUnsub = db.collection('workshops').doc(wsId).collection('teams')
      .onSnapshot(snap => {
        activeWs.teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderKPI();
        renderTeamList();
        // 활성 팀이 있으면 상세도 갱신
        if (activeTeamId) renderDetail();
      }, err => {
        console.warn('팀 실시간 구독 실패:', err);
        document.getElementById('liveDot').textContent = '○ OFFLINE';
        document.getElementById('liveDot').style.color = 'var(--c-warning)';
      });
  }

  // ──────────────────────────────────────────
  // 2. KPI / 라운드 컨트롤
  // ──────────────────────────────────────────
  function renderKPI() {
    if (!activeWs) return;
    const teams = activeWs.teams || [];
    const memberCount = teams.reduce((s, t) => s + (t.members?.length || 0), 0);
    const submitted = teams.filter(t => t.submission).length;
    const avgProg = teams.length ? Math.round(teams.reduce((s, t) => s + (t.progress || 0), 0) / teams.length) : 0;
    document.getElementById('kpiTeams').textContent = teams.length;
    document.getElementById('kpiMembers').textContent = memberCount;
    document.getElementById('kpiSubmitted').textContent = `${submitted}/${teams.length}`;
    document.getElementById('kpiAvgProg').textContent = `${avgProg}%`;
  }

  function renderRoundCtl() {
    if (!activeWs) return;
    const total = (activeWs.rounds || []).length;
    const cur = activeWs.currentRound || 1;
    document.getElementById('currentRoundNum').textContent = `${cur} / ${total}`;
    document.getElementById('currentRoundName').textContent = (activeWs.rounds || [])[cur - 1]?.name || '-';
  }

  document.getElementById('prevRoundBtn').onclick = () => broadcastRound(-1);
  document.getElementById('nextRoundBtn').onclick = () => broadcastRound(1);

  async function broadcastRound(delta) {
    if (!activeWs) { showToast('워크샵을 먼저 선택하세요.', 'warning'); return; }
    const total = (activeWs.rounds || []).length;
    const next = Math.max(1, Math.min(total, (activeWs.currentRound || 1) + delta));
    if (next === activeWs.currentRound) {
      showToast(`이미 ${delta > 0 ? '마지막' : '첫'} 라운드입니다.`, 'info');
      return;
    }
    try {
      await db.collection('workshops').doc(activeWs.id).update({
        currentRound: next,
        lastRoundChangeAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      const roundName = (activeWs.rounds || [])[next - 1]?.name || `Step ${next}`;
      showToast(`📡 라운드 ${next} (${roundName}) 안내됨`, 'success', 3000);
    } catch (err) {
      showToast(`브로드캐스트 실패: ${err.message}`, 'error');
    }
  }

  // ──────────────────────────────────────────
  // 3. 팀 카드 리스트
  // ──────────────────────────────────────────
  function renderTeamList() {
    const list = document.getElementById('teamList');
    if (!activeWs) return;
    const teams = activeWs.teams || [];
    if (teams.length === 0) {
      list.innerHTML = '<div class="empty-state empty-state--small"><div class="empty-state__icon">👥</div><div class="empty-state__title">아직 팀이 없습니다</div><p>참가자가 코드를 입력하고 팀을 생성하면 여기에 표시됩니다.</p></div>';
      return;
    }
    list.innerHTML = teams.map(t => {
      const isActive = t.id === activeTeamId;
      const stepLabel = t.submission ? '✓ 제출' : `STEP ${t.currentStep || 1}`;
      const stepClass = t.submission ? 'team-card__step--done' : '';
      const memberCount = (t.members || []).length;
      const hasSubmission = !!t.submission;
      return `
        <div class="team-card ${isActive ? 'team-card--active' : ''}" onclick="window.__selectTeam('${t.id}')">
          <div class="team-card__row1">
            <div class="team-card__name">${escapeHtml(t.name)}</div>
            <span class="team-card__step ${stepClass}">${stepLabel}</span>
          </div>
          <div class="team-card__row2">
            <span>👥 ${memberCount}명</span>
            <div class="team-card__progress">
              <div class="team-card__progress-fill" style="width:${t.progress || 0}%"></div>
            </div>
            <span class="team-card__pct">${t.progress || 0}%</span>
          </div>
          <div class="team-card__indicators">
            ${hasSubmission ? '<span class="pill pill--ok">제출 완료</span>' : '<span class="pill pill--warn">미제출</span>'}
            <span class="pill">PIN ${t.pin || '-'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  window.__selectTeam = (teamId) => {
    activeTeamId = teamId;
    renderTeamList();
    renderDetail();
    // KPI도 업데이트되도록 (active 표시)
  };

  // ──────────────────────────────────────────
  // 4. 우측 상세 (탭)
  // ──────────────────────────────────────────
  function renderDetail() {
    if (!activeWs || !activeTeamId) return;
    const team = (activeWs.teams || []).find(t => t.id === activeTeamId);
    if (!team) return;

    document.getElementById('detailHeader').style.display = 'flex';
    document.getElementById('detailTabs').style.display = 'flex';

    document.getElementById('detailTeamName').textContent = team.name;
    document.getElementById('detailStep').textContent = team.submission ? '✓ 제출 완료' : `STEP ${team.currentStep || 1}`;
    document.getElementById('detailMembers').textContent = `팀원 ${(team.members || []).length}명: ${(team.members || []).join(', ') || '-'}`;
    document.getElementById('detailProgress').textContent = `${team.progress || 0}% 진행`;
    document.getElementById('detailPin').textContent = `PIN ${team.pin || '-'}`;

    // 탭 컨텐츠
    if (activeTab === 'progress') renderProgressTab(team);
    else if (activeTab === 'submission') renderSubmissionTab(team);
    else if (activeTab === 'peer') renderPeerTab(team);
    else if (activeTab === 'instructor') renderInstructorEvalTab(team);
  }

  // 탭 클릭
  document.querySelectorAll('.instructor-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.instructor-tab').forEach(t => t.classList.remove('instructor-tab--active'));
      tab.classList.add('instructor-tab--active');
      activeTab = tab.dataset.tab;
      if (activeTeamId) renderDetail();
    });
  });

  // 이전/다음 팀
  document.getElementById('prevTeamBtn').onclick = () => navigateTeam(-1);
  document.getElementById('nextTeamBtn').onclick = () => navigateTeam(1);
  function navigateTeam(delta) {
    if (!activeWs?.teams || !activeTeamId) return;
    const idx = activeWs.teams.findIndex(t => t.id === activeTeamId);
    const next = (idx + delta + activeWs.teams.length) % activeWs.teams.length;
    activeTeamId = activeWs.teams[next].id;
    renderTeamList();
    renderDetail();
  }

  // ── 4-1. 진행 현황 탭
  async function renderProgressTab(team) {
    const body = document.getElementById('detailBody');
    const phases = activeWs.rounds || [];
    const cur = team.currentStep || 1;

    // 멤버별 응답 fetch
    let responses = [];
    try {
      const snap = await db.collection('workshops').doc(activeWs.id)
        .collection('teams').doc(team.id).collection('responses').get();
      responses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) { /* offline */ }

    const respByPhase = {};
    responses.forEach(r => {
      if (!respByPhase[r.phaseId]) respByPhase[r.phaseId] = [];
      respByPhase[r.phaseId].push(r);
    });

    body.innerHTML = `
      <div class="panel">
        <h3>📊 단계별 진행 현황 <small>(팀원 ${(team.members || []).length}명 기준)</small></h3>
        <div class="phase-grid">
          ${phases.map((p, i) => {
            const stepNum = i + 1;
            const phaseId = p.phaseId;
            const resps = phaseId ? (respByPhase[phaseId] || []) : [];
            const completed = stepNum < cur;
            const inProgress = stepNum === cur;
            const responded = resps.length;
            const memTotal = (team.members || []).length;
            const statusClass = completed ? 'done' : (inProgress ? 'prog' : '');
            const statusText = completed ? '✓ 완료' : (inProgress ? `진행 중 (${responded}/${memTotal})` : '대기');
            return `
              <div class="phase-cell ${completed ? 'phase-cell--done' : ''}">
                <div class="phase-cell__title">
                  <span>${p.icon || ''}</span>
                  <span>STEP ${stepNum}: ${p.name}</span>
                </div>
                <span class="phase-cell__status phase-cell__status--${statusClass}">${statusText}</span>
                ${memTotal > 0 ? `<div class="phase-cell__members">응답: ${responded} / ${memTotal}명</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ── 4-2. 결과물 탭
  function renderSubmissionTab(team) {
    const body = document.getElementById('detailBody');
    if (!team.submission) {
      body.innerHTML = '<div class="panel"><h3>📤 결과물</h3><p style="color:var(--t-muted);text-align:center;padding:40px 0;">아직 결과물이 제출되지 않았습니다.</p></div>';
      return;
    }
    const s = team.submission;
    body.innerHTML = `
      <div class="panel">
        <h3>📤 제출된 결과물</h3>
        <div class="submission-preview">
          <div class="submission-preview__title">${escapeHtml(s.serviceName || '-')}</div>
          ${s.tagline ? `<div class="submission-preview__tagline">"${escapeHtml(s.tagline)}"</div>` : ''}
          ${s.description ? `<div class="submission-preview__desc">${escapeHtml(s.description)}</div>` : ''}
          <div class="submission-preview__links">
            ${s.appLink ? `<a href="${escapeHtml(s.appLink)}" target="_blank" rel="noopener">🌐 앱 열기</a>` : ''}
            ${s.landingLink ? `<a href="${escapeHtml(s.landingLink)}" target="_blank" rel="noopener">📄 소개 페이지</a>` : ''}
            ${s.codeLink ? `<a href="${escapeHtml(s.codeLink)}" target="_blank" rel="noopener">💻 코드</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── 4-3. 동료 평가 탭
  async function renderPeerTab(team) {
    const body = document.getElementById('detailBody');
    body.innerHTML = '<div class="panel"><h3>🌟 동료 평가 로드 중...</h3></div>';
    try {
      const snap = await db.collection('peerReviews')
        .where('workshopId', '==', activeWs.id)
        .where('teamId', '==', team.id)
        .get();
      const reviews = snap.docs.map(d => d.data());
      if (reviews.length === 0) {
        body.innerHTML = '<div class="panel"><h3>🌟 동료 평가</h3><p style="color:var(--t-muted);text-align:center;padding:40px 0;">아직 동료 평가가 없습니다.</p></div>';
        return;
      }
      const axes = ['creativity', 'practicality', 'completeness', 'applicability'];
      const labels = { creativity: '🎨 창의성', practicality: '🛠️ 실용성', completeness: '✨ 완성도', applicability: '🚀 적용성' };
      const avgs = {};
      axes.forEach(a => {
        const scores = reviews.map(r => r.scores?.[a] || 0).filter(s => s > 0);
        avgs[a] = scores.length ? (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1) : '-';
      });
      body.innerHTML = `
        <div class="panel">
          <h3>🌟 동료 평가 요약 <small>(${reviews.length}명 평가)</small></h3>
          <div class="peer-summary">
            ${axes.map(a => `
              <div class="peer-axis-tile">
                <div class="peer-axis-tile__name">${labels[a]}</div>
                <div class="peer-axis-tile__score">${avgs[a]}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="panel">
          <h3>💬 코멘트 (${reviews.filter(r => r.comment).length})</h3>
          <div class="peer-comments">
            ${reviews.filter(r => r.comment).map(r => `
              <div class="peer-comment">
                <div class="peer-comment__author">${escapeHtml(r.reviewerId || '익명')} · 평균 ${(r.avgScore || 0).toFixed(1)}점</div>
                ${escapeHtml(r.comment)}
              </div>
            `).join('') || '<p style="color:var(--t-muted);">코멘트가 없습니다.</p>'}
          </div>
        </div>
      `;
    } catch (err) {
      body.innerHTML = `<div class="panel"><h3>🌟 동료 평가</h3><p style="color:var(--c-danger);">로드 실패: ${err.message}</p></div>`;
    }
  }

  // ── 4-4. 강사 평가 탭 (인라인 편집)
  async function renderInstructorEvalTab(team) {
    const body = document.getElementById('detailBody');
    body.innerHTML = '<div class="panel"><h3>✍️ 강사 평가 로드 중...</h3></div>';
    const evalId = `${activeWs.id}_${team.id}`;
    let existing = {};
    try {
      const doc = await db.collection('instructorEvaluations').doc(evalId).get();
      if (doc.exists) existing = doc.data();
    } catch (err) { /* offline */ }

    const dims = [
      { key: 'innovation', label: '💡 혁신성', desc: '시장이나 일터에서 처음 보는 접근인가?' },
      { key: 'feasibility', label: '🔧 실행 가능성', desc: '실제 구현/도입까지 갈 수 있는가?' },
      { key: 'impact', label: '📈 임팩트', desc: '문제를 해결하는 크기는?' },
      { key: 'presentation', label: '🎤 전달력', desc: '메시지가 명확하고 흡입력 있는가?' },
    ];

    body.innerHTML = `
      <div class="panel">
        <h3>✍️ 강사 평가 <small>(인라인 편집 — 자동 저장)</small></h3>
        <div class="instructor-eval">
          ${dims.map(d => `
            <div class="instructor-eval__row">
              <label>${d.label}<br><small style="color:var(--t-muted);font-weight:400;">${d.desc}</small></label>
              <div>
                <div class="instructor-eval__scale" data-key="${d.key}">
                  ${[1,2,3,4,5].map(n => `<button data-score="${n}" class="${(existing.scores?.[d.key] === n) ? 'active' : ''}">${n}</button>`).join('')}
                </div>
              </div>
            </div>
          `).join('')}
          <div class="instructor-eval__row">
            <label>📝 강점 / 인상적인 점</label>
            <textarea id="evalStrengths" placeholder="이 팀의 강점을 적어주세요...">${escapeHtml(existing.strengths || '')}</textarea>
          </div>
          <div class="instructor-eval__row">
            <label>🔧 개선 제안 / 다음 단계</label>
            <textarea id="evalImprovements" placeholder="개선 영역과 다음 단계 제안...">${escapeHtml(existing.improvements || '')}</textarea>
          </div>
          <div class="instructor-eval__row">
            <label>📊 종합 한 줄 평</label>
            <textarea id="evalSummary" placeholder="한 줄로 요약하면..." rows="2">${escapeHtml(existing.summary || '')}</textarea>
          </div>
          <div class="instructor-eval__save-row">
            <span class="instructor-eval__autosave" id="evalAutoSave">${existing.updatedAt ? '저장됨' : ''}</span>
            <button class="btn btn-primary btn-sm" id="evalManualSave">즉시 저장</button>
          </div>
        </div>
      </div>
    `;

    // 점수 클릭
    body.querySelectorAll('.instructor-eval__scale').forEach(scale => {
      scale.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-score]');
        if (!btn) return;
        scale.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        scheduleEvalSave(team);
      });
    });

    // 텍스트 자동 저장
    ['evalStrengths', 'evalImprovements', 'evalSummary'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => scheduleEvalSave(team));
    });
    document.getElementById('evalManualSave').onclick = () => saveInstructorEval(team, true);
  }

  function scheduleEvalSave(team) {
    if (evalSaveTimer) clearTimeout(evalSaveTimer);
    const status = document.getElementById('evalAutoSave');
    if (status) { status.textContent = '입력 중...'; status.className = 'instructor-eval__autosave saving'; }
    evalSaveTimer = setTimeout(() => saveInstructorEval(team, false), 1500);
  }

  async function saveInstructorEval(team, manual) {
    const status = document.getElementById('evalAutoSave');
    if (status) { status.textContent = '저장 중...'; status.className = 'instructor-eval__autosave saving'; }
    const scores = {};
    document.querySelectorAll('.instructor-eval__scale').forEach(scale => {
      const active = scale.querySelector('button.active');
      if (active) scores[scale.dataset.key] = parseInt(active.dataset.score);
    });
    const data = {
      workshopId: activeWs.id,
      teamId: team.id,
      teamName: team.name,
      scores,
      strengths: document.getElementById('evalStrengths')?.value || '',
      improvements: document.getElementById('evalImprovements')?.value || '',
      summary: document.getElementById('evalSummary')?.value || '',
    };
    try {
      const evalId = `${activeWs.id}_${team.id}`;
      await db.collection('instructorEvaluations').doc(evalId).set({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      if (status) {
        status.textContent = '✓ 저장됨 ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        status.className = 'instructor-eval__autosave saved';
      }
      if (manual) showToast('강사 평가 저장됨', 'success', 2000);
    } catch (err) {
      if (status) { status.textContent = '저장 실패: ' + err.message; status.className = 'instructor-eval__autosave'; }
      showToast(`저장 실패: ${err.message}`, 'error');
    }
  }

  // ──────────────────────────────────────────
  // Utilities
  // ──────────────────────────────────────────
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  window.showToast = window.showToast || function(msg, type = 'info', dur = 3000) {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    t.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0'; t.style.transform = 'translateX(120%)';
      t.style.transition = 'all 0.3s';
      setTimeout(() => t.remove(), 300);
    }, dur);
  };

  document.getElementById('logoutBtn').onclick = () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  };

  // 시작
  loadWorkshops();
});
