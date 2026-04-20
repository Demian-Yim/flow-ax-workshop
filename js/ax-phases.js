/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Phase Forms — 5 Phase 온라인 워크시트 렌더러
   ═══════════════════════════════════════════════════════════ */

const AXPhases = (() => {
  let _autoSaveTimer = null;

  // ── Phase 0: AI 리터러시 자가진단 ──
  function renderPhase0(container) {
    const questions = [
      { id: 'q1', text: 'AI(ChatGPT, Claude 등)를 업무에 사용해본 적 있다' },
      { id: 'q2', text: 'AI에게 좋은 결과를 얻기 위한 프롬프트를 쓸 수 있다' },
      { id: 'q3', text: '생성AI / 에이전트 / 자동화의 차이를 설명할 수 있다' },
      { id: 'q4', text: 'AI 결과물의 정확성을 판단할 수 있다' },
      { id: 'q5', text: '내 업무 중 AI에 적합한 것을 3개 이상 말할 수 있다' },
    ];

    container.innerHTML = `
      <div class="ax-phase-form" data-phase="phase-0">
        <div class="ax-phase-header">
          <h3>🧠 AI 리터러시 자가진단</h3>
          <p>각 항목에 대해 1(전혀 아님)~5(매우 그렇다)로 체크하세요</p>
        </div>
        ${questions.map(q => `
          <div class="ax-question">
            <label class="ax-question__text">${q.text}</label>
            <div class="ax-likert" data-qid="${q.id}">
              ${[1,2,3,4,5].map(n => `
                <label class="ax-likert__option">
                  <input type="radio" name="${q.id}" value="${n}">
                  <span class="ax-likert__circle">${n}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div class="ax-score-display">
          <span class="ax-score-label">합계:</span>
          <span id="axPhase0Total" class="ax-score-value">0</span>
          <span>/25</span>
          <span id="axPhase0Level" class="ax-score-badge">—</span>
        </div>
        <div class="ax-section">
          <h4>핸즈온 메모</h4>
          <label>AI에게 시켜본 업무</label>
          <textarea name="handson_task" rows="2" placeholder="예: 보고서 초안 작성, 이메일 번역..."></textarea>
          <label>결과는 어떠했나?</label>
          <textarea name="handson_result" rows="2" placeholder="좋았던 점, 아쉬웠던 점..."></textarea>
          <label>이건 진짜 쓸 수 있겠다</label>
          <textarea name="handson_usable" rows="2" placeholder="실제 업무에 적용 가능한 것..."></textarea>
        </div>
      </div>
    `;

    container.querySelectorAll('.ax-likert input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => updatePhase0Score(container));
    });
  }

  function updatePhase0Score(container) {
    let total = 0;
    for (let i = 1; i <= 5; i++) {
      const checked = container.querySelector(`input[name="q${i}"]:checked`);
      if (checked) total += parseInt(checked.value);
    }
    const el = container.querySelector('#axPhase0Total');
    const badge = container.querySelector('#axPhase0Level');
    if (el) el.textContent = total;
    if (badge) {
      if (total <= 10) { badge.textContent = '입문'; badge.className = 'ax-score-badge ax-badge--beginner'; }
      else if (total <= 17) { badge.textContent = '중급'; badge.className = 'ax-score-badge ax-badge--intermediate'; }
      else { badge.textContent = '활용'; badge.className = 'ax-score-badge ax-badge--advanced'; }
    }
  }

  // ── Phase 1: RTC 캔버스 ──
  function renderPhase1(container) {
    container.innerHTML = `
      <div class="ax-phase-form" data-phase="phase-1">
        <div class="ax-phase-header">
          <h3>📋 RTC 캔버스</h3>
          <p>내 역할(R) · 업무(T) · 역량(C)을 가시화합니다</p>
        </div>

        <div class="ax-section ax-section--role">
          <h4>R — 역할 (Role)</h4>
          <label>R1. 핵심 가치 — 내가 조직에 제공하는 가치는?</label>
          <input type="text" name="role_coreValue" placeholder="예: 브랜드 커뮤니케이션, 고객 불만 해결...">
          <label>R2. 역할 경계 — 내 책임 범위는 어디까지?</label>
          <input type="text" name="role_boundary" placeholder="예: 수입 검사 ~ 출하 검사, 1차 상담 ~ 환불 처리...">
          <label>R3. 성장 벡터 — 1년 후 어떤 역할로 성장하고 싶은가?</label>
          <input type="text" name="role_growth" placeholder="예: 데이터 기반 예측 품질관리자, CX 전략가...">
        </div>

        <div class="ax-section ax-section--tasks">
          <h4>T — 업무 (Task) <button class="btn-add" onclick="AXPhases.addTaskRow(this)">+ 추가</button></h4>
          <div class="ax-tasks-list" id="axTasksList">
            ${renderTaskRow(1)}
            ${renderTaskRow(2)}
            ${renderTaskRow(3)}
          </div>
        </div>

        <div class="ax-section ax-section--comp">
          <h4>C — 역량 (Competency) <button class="btn-add" onclick="AXPhases.addCompRow(this)">+ 추가</button></h4>
          <div class="ax-comp-list" id="axCompList">
            ${renderCompRow(1)}
            ${renderCompRow(2)}
            ${renderCompRow(3)}
          </div>
        </div>
      </div>
    `;
  }

  function renderTaskRow(n) {
    return `
      <div class="ax-task-row" data-idx="${n}">
        <input type="text" name="task_${n}_name" placeholder="업무명" class="ax-input--name">
        <input type="number" name="task_${n}_hours" placeholder="주간(h)" class="ax-input--hours" min="0" max="60" step="0.5">
        <input type="text" name="task_${n}_input" placeholder="Input" class="ax-input--io">
        <input type="text" name="task_${n}_output" placeholder="Output" class="ax-input--io">
        <select name="task_${n}_ai" class="ax-select--stars">
          <option value="">AI적합도</option>
          <option value="1">★</option>
          <option value="2">★★</option>
          <option value="3">★★★</option>
        </select>
        <button class="btn-remove" onclick="this.parentElement.remove()">×</button>
      </div>
    `;
  }

  function renderCompRow(n) {
    return `
      <div class="ax-comp-row" data-idx="${n}">
        <input type="text" name="comp_${n}_name" placeholder="역량명" class="ax-input--name">
        <select name="comp_${n}_current" class="ax-select--level">
          <option value="">현재</option><option value="상">상</option><option value="중">중</option><option value="하">하</option>
        </select>
        <select name="comp_${n}_required" class="ax-select--level">
          <option value="">필요</option><option value="상">상</option><option value="중">중</option><option value="하">하</option>
        </select>
        <input type="text" name="comp_${n}_gap" placeholder="갭 메모" class="ax-input--gap">
        <button class="btn-remove" onclick="this.parentElement.remove()">×</button>
      </div>
    `;
  }

  // ── Phase 1→2: ICEP 매트릭스 ──
  function renderPhase12(container, context) {
    const tasks = context?.phase1Tasks || [];
    const noPhase1Data = tasks.length === 0 && context?.workshopId;
    const taskRows = tasks.length > 0
      ? tasks.map((t, i) => renderICEPRow(i + 1, t.name))
      : [1,2,3].map(n => renderICEPRow(n, ''));

    container.innerHTML = `
      <div class="ax-phase-form" data-phase="phase-1-2">
        <div class="ax-phase-header">
          <h3>📊 ICEP 매트릭스</h3>
          <p>각 업무의 AI 전환 우선순위를 4축으로 점수화합니다</p>
          ${noPhase1Data ? '<div class="ax-top-task" style="background:#fef3c7;color:#92400e;">💡 Phase 1(RTC 캔버스)의 업무를 먼저 작성하면, 여기에 자동으로 불러옵니다.</div>' : ''}
          <div class="ax-icep-legend">
            <span><b>I</b> 영향도</span> <span><b>C</b> 확신도</span>
            <span><b>E</b> 용이성</span> <span><b>P</b> 사람준비도</span>
            <span class="ax-icep-formula">가중합계 = I×0.3 + C×0.2 + E×0.2 + P×0.3</span>
          </div>
        </div>
        <div class="ax-section">
          <div class="ax-icep-header-row">
            <span class="ax-icep-col--name">업무명</span>
            <span class="ax-icep-col--score">I</span>
            <span class="ax-icep-col--score">C</span>
            <span class="ax-icep-col--score">E</span>
            <span class="ax-icep-col--score">P</span>
            <span class="ax-icep-col--result">합계</span>
            <span class="ax-icep-col--rank">순위</span>
          </div>
          <div id="axICEPList">
            ${taskRows.join('')}
          </div>
          <button class="btn-add" onclick="AXPhases.addICEPRow()">+ 업무 추가</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.ax-icep-row select').forEach(sel => {
      sel.addEventListener('change', () => recalcICEP(container));
    });
  }

  function renderICEPRow(n, taskName) {
    const scoreOptions = '<option value="">-</option>' + [1,2,3,4,5].map(v => `<option value="${v}">${v}</option>`).join('');
    return `
      <div class="ax-icep-row" data-idx="${n}">
        <input type="text" name="icep_${n}_name" value="${taskName}" placeholder="업무명" class="ax-icep-col--name">
        <select name="icep_${n}_I" class="ax-icep-col--score">${scoreOptions}</select>
        <select name="icep_${n}_C" class="ax-icep-col--score">${scoreOptions}</select>
        <select name="icep_${n}_E" class="ax-icep-col--score">${scoreOptions}</select>
        <select name="icep_${n}_P" class="ax-icep-col--score">${scoreOptions}</select>
        <span class="ax-icep-col--result ax-icep-weighted" data-row="${n}">—</span>
        <span class="ax-icep-col--rank ax-icep-rank" data-row="${n}">—</span>
      </div>
    `;
  }

  function recalcICEP(container) {
    const rows = container.querySelectorAll('.ax-icep-row');
    const scores = [];
    rows.forEach((row, idx) => {
      const I = parseInt(row.querySelector('[name$="_I"]')?.value) || 0;
      const C = parseInt(row.querySelector('[name$="_C"]')?.value) || 0;
      const E = parseInt(row.querySelector('[name$="_E"]')?.value) || 0;
      const P = parseInt(row.querySelector('[name$="_P"]')?.value) || 0;
      const w = I > 0 && C > 0 && E > 0 && P > 0
        ? (I * 0.3 + C * 0.2 + E * 0.2 + P * 0.3).toFixed(1)
        : '—';
      row.querySelector('.ax-icep-weighted').textContent = w;
      if (w !== '—') scores.push({ idx, score: parseFloat(w) });
    });
    scores.sort((a, b) => b.score - a.score);
    rows.forEach(row => row.querySelector('.ax-icep-rank').textContent = '—');
    scores.forEach((s, rank) => {
      const row = rows[s.idx];
      if (row) {
        row.querySelector('.ax-icep-rank').textContent = rank + 1;
        row.classList.toggle('ax-icep-row--top3', rank < 3);
      }
    });
  }

  // ── Phase 2: WHY-WHAT-HOW ──
  function renderPhase2(container, context) {
    const topTask = context?.icepTop1 || '';
    container.innerHTML = `
      <div class="ax-phase-form" data-phase="phase-2">
        <div class="ax-phase-header">
          <h3>🎯 WHY-WHAT-HOW 재설계</h3>
          <p>ICEP Top 1 과제를 AI-Native로 재설계합니다</p>
          ${topTask ? `<div class="ax-top-task">대상 업무: <strong>${topTask}</strong></div>` : ''}
        </div>

        <div class="ax-section">
          <h4>WHY — 왜 바꿔야 하는가</h4>
          <textarea name="why_reason" rows="3" placeholder="이 업무를 바꿔야 하는 핵심 이유 (고통점, 시간 낭비, 오류 등)"></textarea>
        </div>

        <div class="ax-redesign-split">
          <div class="ax-section ax-section--asis">
            <h4>AS-IS (현재 프로세스)</h4>
            <div id="axAsIsSteps">
              ${[1,2,3].map(n => renderProcessStep('asis', n)).join('')}
            </div>
            <button class="btn-add" onclick="AXPhases.addProcessStep('asis')">+ 단계 추가</button>
          </div>

          <div class="ax-section ax-section--tobe">
            <h4>TO-BE (AI 적용 후)</h4>
            <div id="axToBeSteps">
              ${[1,2,3].map(n => renderProcessStep('tobe', n, true)).join('')}
            </div>
            <button class="btn-add" onclick="AXPhases.addProcessStep('tobe')">+ 단계 추가</button>
          </div>
        </div>

        <div class="ax-section">
          <h4>기대 효과</h4>
          <div class="ax-impact-grid">
            <div class="ax-impact-item">
              <label>처리 시간</label>
              <input type="text" name="impact_time_current" placeholder="현재 (예: 30분)">
              <span>→</span>
              <input type="text" name="impact_time_target" placeholder="목표 (예: 5분)">
            </div>
            <div class="ax-impact-item">
              <label>오류율</label>
              <input type="text" name="impact_error_current" placeholder="현재">
              <span>→</span>
              <input type="text" name="impact_error_target" placeholder="목표">
            </div>
            <div class="ax-impact-item">
              <label>비용</label>
              <input type="text" name="impact_cost_current" placeholder="현재">
              <span>→</span>
              <input type="text" name="impact_cost_target" placeholder="목표">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderProcessStep(prefix, n, withActor) {
    const actorSelect = withActor
      ? `<select name="${prefix}_${n}_actor" class="ax-select--actor">
           <option value="">수행자</option><option value="AI">AI</option><option value="인간">인간</option><option value="협업">AI+인간</option>
         </select>`
      : '';
    return `
      <div class="ax-process-step" data-idx="${n}">
        <span class="ax-step-num">${n}</span>
        <input type="text" name="${prefix}_${n}_activity" placeholder="활동 내용" class="ax-input--activity">
        ${actorSelect}
        <input type="text" name="${prefix}_${n}_duration" placeholder="소요시간" class="ax-input--duration">
        <button class="btn-remove" onclick="this.parentElement.remove()">×</button>
      </div>
    `;
  }

  // ── Phase 5: EARS 대시보드 ──
  function renderPhase5(container) {
    const axes = [
      { code: 'E', name: 'Effectiveness (효율성)', color: 'blue', examples: '처리 시간, 처리량, 오류율' },
      { code: 'A', name: 'Alignment (정렬성)', color: 'green', examples: '전략 부합도, 고객 만족도' },
      { code: 'R', name: 'Relevance (연관성)', color: 'orange', examples: '매출 연동, NPS, 비즈니스 임팩트' },
      { code: 'S', name: 'Sustainability (지속성)', color: 'purple', examples: '사용률, 변화 유지율, 팀 만족도' },
    ];

    container.innerHTML = `
      <div class="ax-phase-form" data-phase="phase-5">
        <div class="ax-phase-header">
          <h3>📈 EARS 대시보드</h3>
          <p>성과 지표를 설정하고 30일 실행 계획을 수립합니다</p>
        </div>

        <div class="ax-ears-grid">
          ${axes.map(axis => `
            <div class="ax-ears-axis ax-ears-axis--${axis.color}">
              <div class="ax-ears-axis__header">${axis.code} — ${axis.name}</div>
              <div class="ax-ears-axis__hint">${axis.examples}</div>
              ${[1,2].map(n => `
                <div class="ax-kpi-card">
                  <input type="text" name="ears_${axis.code}_${n}_name" placeholder="KPI ${n} 이름">
                  <div class="ax-kpi-values">
                    <input type="text" name="ears_${axis.code}_${n}_current" placeholder="현재값">
                    <span>→</span>
                    <input type="text" name="ears_${axis.code}_${n}_target" placeholder="30일 목표">
                  </div>
                  <input type="text" name="ears_${axis.code}_${n}_method" placeholder="측정 방법">
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>

        <div class="ax-section">
          <h4>30일 액션 플랜</h4>
          <div class="ax-action-plan">
            ${[1,2,3].map(n => `
              <div class="ax-action-row">
                <span class="ax-action-num">${n}</span>
                <input type="text" name="action_${n}_desc" placeholder="돌아가서 바로 할 것" class="ax-input--action">
                <input type="date" name="action_${n}_deadline" class="ax-input--deadline">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="ax-section ax-section--commitment">
          <h4>나의 서약</h4>
          <div class="ax-commitment">
            <span>나</span>
            <input type="text" name="commit_name" placeholder="이름" class="ax-input--commit">
            <span>은(는) AI 전환의 첫 걸음으로</span>
            <input type="text" name="commit_action" placeholder="무엇을" class="ax-input--commit ax-input--commit-wide">
            <span>을(를)</span>
            <input type="date" name="commit_deadline" class="ax-input--commit">
            <span>까지 실행하겠습니다.</span>
          </div>
          <div class="ax-buddy">
            <label>버디 (서로 체크인할 파트너):</label>
            <input type="text" name="commit_buddy" placeholder="이름">
          </div>
        </div>
      </div>
    `;
  }

  // ── 공통: 데이터 수집 ──
  function collectFormData(container) {
    const form = container.querySelector('.ax-phase-form');
    if (!form) return {};
    const phaseId = form.dataset.phase;
    const data = { phaseId };
    form.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.name) {
        if (el.type === 'radio') {
          if (el.checked) data[el.name] = el.value;
        } else {
          data[el.name] = el.value;
        }
      }
    });
    return data;
  }

  // ── 공통: 데이터 복원 ──
  function loadSavedData(container, savedData) {
    if (!savedData?.data) return;
    const d = savedData.data;

    // Phase 1: 동적 행 확장 (task_4~7, comp_4+ 등)
    if (d.phaseId === 'phase-1') {
      const taskList = container.querySelector('#axTasksList');
      const compList = container.querySelector('#axCompList');
      if (taskList) {
        for (let i = 4; i <= 7; i++) {
          if (d[`task_${i}_name`] && !container.querySelector(`[name="task_${i}_name"]`)) {
            taskList.insertAdjacentHTML('beforeend', renderTaskRow(i));
          }
        }
      }
      if (compList) {
        for (let i = 4; i <= 10; i++) {
          if (d[`comp_${i}_name`] && !container.querySelector(`[name="comp_${i}_name"]`)) {
            compList.insertAdjacentHTML('beforeend', renderCompRow(i));
          }
        }
      }
    }

    // Phase 1-2: 동적 ICEP 행 확장
    if (d.phaseId === 'phase-1-2') {
      const icepList = container.querySelector('#axICEPList');
      if (icepList) {
        for (let i = 4; i <= 10; i++) {
          if (d[`icep_${i}_name`] && !container.querySelector(`[name="icep_${i}_name"]`)) {
            icepList.insertAdjacentHTML('beforeend', renderICEPRow(i, ''));
          }
        }
      }
    }

    // Phase 2: 동적 프로세스 스텝 확장
    if (d.phaseId === 'phase-2') {
      const asisSteps = container.querySelector('#axAsIsSteps');
      const tobeSteps = container.querySelector('#axToBeSteps');
      if (asisSteps) {
        for (let i = 4; i <= 8; i++) {
          if (d[`asis_${i}_activity`] && !container.querySelector(`[name="asis_${i}_activity"]`)) {
            asisSteps.insertAdjacentHTML('beforeend', renderProcessStep('asis', i));
          }
        }
      }
      if (tobeSteps) {
        for (let i = 4; i <= 8; i++) {
          if (d[`tobe_${i}_activity`] && !container.querySelector(`[name="tobe_${i}_activity"]`)) {
            tobeSteps.insertAdjacentHTML('beforeend', renderProcessStep('tobe', i, true));
          }
        }
      }
    }

    // 데이터 복원
    Object.entries(d).forEach(([key, val]) => {
      if (key === 'phaseId') return;
      const el = container.querySelector(`[name="${key}"]`);
      if (!el) return;
      if (el.type === 'radio') {
        const radio = container.querySelector(`[name="${key}"][value="${val}"]`);
        if (radio) radio.checked = true;
      } else {
        el.value = val;
      }
    });
    if (d.phaseId === 'phase-0') updatePhase0Score(container);
    if (d.phaseId === 'phase-1-2') recalcICEP(container);
  }

  // ── 공통: 자동저장 ──
  function setupAutoSave(container, workshopId, teamId, memberId, phaseId) {
    const indicator = document.getElementById('axAutoSaveStatus');
    const handler = () => {
      if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
      if (indicator) { indicator.textContent = '저장 중...'; indicator.className = 'ax-autosave ax-autosave--saving'; }
      _autoSaveTimer = setTimeout(async () => {
        const data = collectFormData(container);
        const ok = await savePhaseResponse(workshopId, teamId, memberId, phaseId, data);
        if (indicator) {
          indicator.textContent = ok ? '✅ 저장됨' : '💾 로컬 저장';
          indicator.className = ok ? 'ax-autosave ax-autosave--saved' : 'ax-autosave ax-autosave--local';
          setTimeout(() => { indicator.textContent = ''; }, 2000);
        }
      }, 1500);
    };
    container.addEventListener('input', handler);
    container.addEventListener('change', handler);
  }

  // ── 공통: 요약 뷰 ──
  function renderSummary(container, allData) {
    const p0 = allData['phase-0']?.data || {};
    const p1 = allData['phase-1']?.data || {};
    const p12 = allData['phase-1-2']?.data || {};
    const p2 = allData['phase-2']?.data || {};
    const p5 = allData['phase-5']?.data || {};

    let total = 0;
    for (let i = 1; i <= 5; i++) { total += parseInt(p0[`q${i}`]) || 0; }
    const level = total <= 10 ? '입문' : total <= 17 ? '중급' : '활용';

    // ICEP Top 3 추출
    const icepTasks = [];
    for (let i = 1; i <= 10; i++) {
      const name = p12[`icep_${i}_name`];
      if (!name) continue;
      const I = parseFloat(p12[`icep_${i}_I`]) || 0;
      const C = parseFloat(p12[`icep_${i}_C`]) || 0;
      const E = parseFloat(p12[`icep_${i}_E`]) || 0;
      const P = parseFloat(p12[`icep_${i}_P`]) || 0;
      const score = I * 0.3 + C * 0.2 + E * 0.2 + P * 0.3;
      if (score > 0) icepTasks.push({ name, score });
    }
    icepTasks.sort((a, b) => b.score - a.score);
    const top3Html = icepTasks.slice(0, 3).map((t, i) =>
      `<div style="margin:4px 0;"><strong>${i+1}.</strong> ${t.name} <span style="color:#6366f1;">(${t.score.toFixed(1)})</span></div>`
    ).join('') || '<p>—</p>';

    // 업무 수 집계
    let taskCount = 0;
    for (let i = 1; i <= 7; i++) { if (p1[`task_${i}_name`]) taskCount++; }

    container.innerHTML = `
      <div class="ax-summary">
        <div class="ax-summary__header">
          <h3>🎉 AX Quick Start 완료!</h3>
          <p>모든 Phase를 완료했습니다. 아래는 오늘의 결과 요약입니다.</p>
        </div>
        <div class="ax-summary__cards">
          <div class="ax-summary__card">
            <h4>🧠 AI 리터러시</h4>
            <div class="ax-summary__score">${total}/25 (${level})</div>
          </div>
          <div class="ax-summary__card">
            <h4>📋 RTC 캔버스</h4>
            <p><strong>역할:</strong> ${p1.role_coreValue || '—'}</p>
            <p><strong>성장:</strong> ${p1.role_growth || '—'}</p>
            <p><strong>분석 업무:</strong> ${taskCount}개</p>
          </div>
          <div class="ax-summary__card">
            <h4>📊 ICEP Top 3</h4>
            ${top3Html}
          </div>
          <div class="ax-summary__card">
            <h4>🎯 재설계 기대효과</h4>
            <p>처리시간: ${p2.impact_time_current || '?'} → ${p2.impact_time_target || '?'}</p>
            <p>오류율: ${p2.impact_error_current || '?'} → ${p2.impact_error_target || '?'}</p>
          </div>
          <div class="ax-summary__card">
            <h4>📈 30일 약속</h4>
            <p><strong>${p5.commit_action || '—'}</strong></p>
            <p>기한: ${p5.commit_deadline || '—'}</p>
            <p>버디: ${p5.commit_buddy || '—'}</p>
          </div>
        </div>
      </div>
    `;
  }

  // ── 메인 디스패처 ──
  async function renderPhaseForm(phaseId, container, context) {
    const renderers = {
      'phase-0': renderPhase0,
      'phase-1': renderPhase1,
      'phase-1-2': renderPhase12,
      'phase-2': renderPhase2,
      'phase-5': renderPhase5,
    };
    const renderer = renderers[phaseId];
    if (renderer) {
      renderer(container, context);
      const { workshopId, teamId, memberId } = context || {};
      if (workshopId && teamId && memberId) {
        const saved = await getPhaseResponse(workshopId, teamId, memberId, phaseId);
        if (saved) loadSavedData(container, saved);
        setupAutoSave(container, workshopId, teamId, memberId, phaseId);
      }
    }
  }

  // ── Public API ──
  return {
    renderPhaseForm,
    collectFormData,
    loadSavedData,
    renderSummary,

    addTaskRow(btn) {
      const list = btn.closest('.ax-section--tasks').querySelector('.ax-tasks-list');
      const n = list.children.length + 1;
      if (n > 7) return;
      list.insertAdjacentHTML('beforeend', renderTaskRow(n));
    },

    addCompRow(btn) {
      const list = btn.closest('.ax-section--comp').querySelector('.ax-comp-list');
      const n = list.children.length + 1;
      list.insertAdjacentHTML('beforeend', renderCompRow(n));
    },

    addICEPRow() {
      const list = document.getElementById('axICEPList');
      if (!list) return;
      const n = list.children.length + 1;
      list.insertAdjacentHTML('beforeend', renderICEPRow(n, ''));
      list.querySelectorAll('.ax-icep-row:last-child select').forEach(sel => {
        sel.addEventListener('change', () => recalcICEP(list.closest('.ax-phase-form').parentElement));
      });
    },

    addProcessStep(prefix) {
      const listId = prefix === 'asis' ? 'axAsIsSteps' : 'axToBeSteps';
      const list = document.getElementById(listId);
      if (!list) return;
      const n = list.children.length + 1;
      list.insertAdjacentHTML('beforeend', renderProcessStep(prefix, n, prefix === 'tobe'));
    },
  };
})();
