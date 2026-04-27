/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Workshop Platform — Dashboard (Participant) Logic
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Session Data ──
  const workshopData = JSON.parse(sessionStorage.getItem('workshopData') || 'null');
  if (!workshopData) {
    window.location.href = 'index.html';
    return;
  }

  let currentTeam = JSON.parse(sessionStorage.getItem('currentTeam') || 'null');
  let workshops = JSON.parse(localStorage.getItem('flow-workshops') || '[]');

  // 타임아웃 래퍼 (Firestore hang 방지)
  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} 타임아웃 (${ms/1000}s)`)), ms))
    ]);
  }

  // ── Elements ──
  const teamSetupPhase = document.getElementById('teamSetupPhase');
  const sprintPhase = document.getElementById('sprintPhase');
  const createTeamOption = document.getElementById('createTeamOption');
  const joinTeamOption = document.getElementById('joinTeamOption');
  const createTeamForm = document.getElementById('createTeamForm');
  const joinTeamForm = document.getElementById('joinTeamForm');

  // ── If team already exists, skip setup ──
  if (currentTeam) {
    showSprintPhase();
  }

  // ── Team Setup ──
  createTeamOption.addEventListener('click', () => {
    createTeamForm.classList.remove('hidden');
    joinTeamForm.classList.add('hidden');
  });

  joinTeamOption.addEventListener('click', () => {
    joinTeamForm.classList.remove('hidden');
    createTeamForm.classList.add('hidden');
  });

  // Create team
  document.getElementById('confirmCreateTeam').addEventListener('click', async () => {
    const teamName = document.getElementById('newTeamName').value.trim();
    const memberName = document.getElementById('newMemberName').value.trim();

    if (!teamName) { showToast('팀 이름을 입력해주세요.', 'warning'); return; }
    if (!memberName) { showToast('이름을 입력해주세요.', 'warning'); return; }

    const btn = document.getElementById('confirmCreateTeam');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ 생성 중...';

    const pin = generateTeamPin();
    currentTeam = {
      id: 'team-' + Date.now(),
      name: teamName,
      pin,
      members: [memberName],
      currentStep: 1,
      progress: 0,
      submission: null,
    };

    // 1) Firestore 저장 (관리자 모니터링 연동)
    try {
      if (typeof db !== 'undefined' && db && workshopData?.id && !workshopData.demo) {
        await withTimeout(
          db.collection('workshops').doc(workshopData.id)
            .collection('teams').doc(currentTeam.id)
            .set({ ...currentTeam, createdAt: firebase.firestore.FieldValue.serverTimestamp() }),
          8000, 'Firestore 팀 저장'
        );
      }
    } catch (err) {
      console.warn('Firestore 팀 저장 실패 (로컬만 저장):', err);
      showToast(`⚠️ 클라우드 연결 실패 — 로컬에만 저장됨`, 'warning', 4000);
    }

    // 2) 로컬 저장
    const wsIndex = workshops.findIndex(w => w.id === workshopData.id);
    if (wsIndex >= 0) {
      workshops[wsIndex].teams = workshops[wsIndex].teams || [];
      workshops[wsIndex].teams.push(currentTeam);
      localStorage.setItem('flow-workshops', JSON.stringify(workshops));
    }

    sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
    sessionStorage.setItem('memberName', memberName);
    btn.disabled = false;
    btn.textContent = originalText;
    showToast(`팀 "${teamName}" 생성! PIN: ${pin}`, 'success');
    showSprintPhase();
  });

  // Join team
  document.getElementById('confirmJoinTeam').addEventListener('click', async () => {
    const pin = document.getElementById('teamPin').value.trim();
    const memberName = document.getElementById('joinMemberName').value.trim();

    if (!pin || pin.length !== 4) { showToast('4자리 PIN을 입력해주세요.', 'warning'); return; }
    if (!memberName) { showToast('이름을 입력해주세요.', 'warning'); return; }

    const btn = document.getElementById('confirmJoinTeam');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ 검색 중...';

    let foundTeam = null;
    let foundTeamDocRef = null;

    // 1) Firestore에서 PIN으로 팀 검색 (크로스 디바이스)
    try {
      if (typeof db !== 'undefined' && db && workshopData?.id && !workshopData.demo) {
        const snap = await withTimeout(
          db.collection('workshops').doc(workshopData.id)
            .collection('teams').where('pin', '==', pin).limit(1).get(),
          8000, 'Firestore 팀 검색'
        );
        if (!snap.empty) {
          const doc = snap.docs[0];
          foundTeam = { id: doc.id, ...doc.data() };
          foundTeamDocRef = doc.ref;
        }
      }
    } catch (err) {
      console.warn('Firestore 팀 검색 실패, 로컬 폴백:', err);
    }

    // 2) 로컬 폴백 (Firestore에 없을 때)
    if (!foundTeam) {
      let foundWsIndex = -1, foundTeamIndex = -1;
      workshops.forEach((ws, wi) => {
        (ws.teams || []).forEach((t, ti) => {
          if (t.pin === pin && ws.id === workshopData.id) {
            foundTeam = t;
            foundWsIndex = wi;
            foundTeamIndex = ti;
          }
        });
      });
      if (foundTeam) {
        if (!foundTeam.members.includes(memberName)) foundTeam.members.push(memberName);
        workshops[foundWsIndex].teams[foundTeamIndex] = foundTeam;
        localStorage.setItem('flow-workshops', JSON.stringify(workshops));
      }
    } else {
      // Firestore에서 찾은 경우 — members 배열에 추가 업데이트
      if (!foundTeam.members) foundTeam.members = [];
      if (!foundTeam.members.includes(memberName)) {
        foundTeam.members.push(memberName);
        try {
          await withTimeout(
            foundTeamDocRef.update({ members: foundTeam.members }),
            8000, 'Firestore 합류'
          );
        } catch (err) {
          console.warn('Firestore 합류 저장 실패:', err);
        }
      }
    }

    btn.disabled = false;
    btn.textContent = originalText;

    if (foundTeam) {
      currentTeam = foundTeam;
      sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
      sessionStorage.setItem('memberName', memberName);
      showToast(`"${foundTeam.name}" 팀에 합류했습니다!`, 'success');
      showSprintPhase();
    } else {
      showToast('해당 PIN의 팀을 찾을 수 없습니다.', 'error');
    }
  });

  // ── Show Sprint Phase ──
  function showSprintPhase() {
    teamSetupPhase.classList.add('hidden');
    sprintPhase.classList.remove('hidden');

    // Update header
    document.getElementById('workshopTitle').textContent = workshopData.name || 'FLOW~ AX Workshop';
    
    const typeInfo = getWorkshopTypeLabel(workshopData.type);
    const typeBadge = document.getElementById('workshopTypeBadge');
    typeBadge.textContent = `${typeInfo.emoji} ${typeInfo.label}`;
    typeBadge.className = `badge badge-${typeInfo.color}`;

    document.getElementById('teamDisplay').textContent = `팀: ${currentTeam.name}`;
    document.getElementById('teamPinDisplay').textContent = currentTeam.pin;

    const codeEl = document.getElementById('workshopCodeDisplay');
    if (codeEl) codeEl.textContent = workshopData.code || '----';

    renderTeamMembers();

    // Render steps
    renderSteps();
    updateProgress();

    // 팀 정보 실시간 구독 시작
    subscribeToTeam();
    subscribeToWorkshop();
  }

  // ── 워크샵 문서 구독 (강사 라운드 브로드캐스트 수신) ──
  let workshopUnsubscribe = null;
  let lastBroadcastRound = workshopData?.currentRound || 1;
  function subscribeToWorkshop() {
    if (workshopUnsubscribe) { try { workshopUnsubscribe(); } catch (e) {} workshopUnsubscribe = null; }
    if (typeof db === 'undefined' || !db || !workshopData?.id || workshopData.demo) return;
    try {
      workshopUnsubscribe = db.collection('workshops').doc(workshopData.id)
        .onSnapshot(doc => {
          if (!doc.exists) return;
          const remote = doc.data();
          const newRound = remote.currentRound || 1;
          if (newRound !== lastBroadcastRound && newRound !== (workshopData.currentRound || 1)) {
            const roundName = (workshopData.rounds || [])[newRound - 1]?.name || `Step ${newRound}`;
            showToast(`📡 강사 안내: 모두 "${roundName}" 단계로 진행해 주세요`, 'info', 8000);
            workshopData.currentRound = newRound;
            sessionStorage.setItem('workshopData', JSON.stringify(workshopData));
            lastBroadcastRound = newRound;
            highlightRecommendedStep(newRound);
          }
        }, err => console.warn('워크샵 구독 실패:', err));
    } catch (err) {
      console.warn('워크샵 onSnapshot 시작 실패:', err);
    }
  }

  function highlightRecommendedStep(stepNum) {
    document.querySelectorAll('.step-tab').forEach(t => t.classList.remove('step-tab--recommended'));
    const target = document.querySelector(`.step-tab[data-step="${stepNum}"]`);
    if (target) {
      target.classList.add('step-tab--recommended');
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  // ── Team Members 렌더 ──
  function renderTeamMembers() {
    const el = document.getElementById('teamMembersLive');
    if (!el || !currentTeam) return;
    const members = currentTeam.members || [];
    const dot = document.getElementById('liveSyncDot');
    el.innerHTML = members.length
      ? `👥 팀원 (${members.length}): ${members.map(m => `<span class="member-chip" style="display:inline-block;padding:3px 10px;background:rgba(107,92,229,0.12);border-radius:12px;margin-right:6px;color:var(--t-primary);font-weight:500;">${m}</span>`).join('')}`
      : '<span style="color:var(--t-muted);">팀원 없음 — PIN을 공유해 합류받으세요</span>';
    if (dot) { dot.textContent = '● LIVE'; dot.style.color = 'var(--c-secondary)'; }
  }

  // ── 팀 정보 실시간 구독 (멤버 합류, 다른 디바이스 진행도 동기화) ──
  let teamUnsubscribe = null;
  function subscribeToTeam() {
    if (teamUnsubscribe) { try { teamUnsubscribe(); } catch (e) {} teamUnsubscribe = null; }
    if (typeof db === 'undefined' || !db || !workshopData?.id || workshopData.demo || !currentTeam?.id) return;
    try {
      teamUnsubscribe = db.collection('workshops').doc(workshopData.id)
        .collection('teams').doc(currentTeam.id)
        .onSnapshot(doc => {
          if (!doc.exists) return;
          const remoteTeam = { id: doc.id, ...doc.data() };
          // 본인의 진행 중 데이터를 잃지 않기 위해 members와 progress만 반영
          const wasProgress = currentTeam.progress;
          const wasStep = currentTeam.currentStep;
          currentTeam = {
            ...currentTeam,
            ...remoteTeam,
            // 본인 진행도가 더 앞이면 유지 (race 방지)
            currentStep: Math.max(wasStep || 1, remoteTeam.currentStep || 1),
            progress: Math.max(wasProgress || 0, remoteTeam.progress || 0),
          };
          sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
          renderTeamMembers();
          renderSteps();
          updateProgress();
        }, err => {
          console.warn('팀 실시간 구독 실패:', err);
          const dot = document.getElementById('liveSyncDot');
          if (dot) { dot.textContent = '○ OFFLINE'; dot.style.color = 'var(--c-warning)'; }
        });
    } catch (err) {
      console.warn('팀 onSnapshot 시작 실패:', err);
    }
  }

  // ── Tab-based Step UI ──
  let activeTabIndex = 0; // 0..rounds.length (마지막은 submission)

  function renderSteps() {
    const tabs = document.getElementById('stepTabs');
    const rounds = workshopData.rounds || [];
    const currentStep = currentTeam.currentStep || 1;
    if (!tabs) return;

    // 활성 탭 초기값: 현재 진행 중인 step
    if (activeTabIndex === 0 || activeTabIndex >= rounds.length + 1) {
      activeTabIndex = Math.max(0, currentStep - 1);
    }

    // 탭 렌더
    tabs.innerHTML = rounds.map((round, index) => {
      const stepNum = index + 1;
      let status = 'locked';
      if (stepNum < currentStep) status = 'completed';
      else if (stepNum === currentStep) status = 'active';
      const isActiveTab = index === activeTabIndex;

      return `
        <button class="step-tab step-tab--${status} ${isActiveTab ? 'step-tab--current' : ''}" data-step="${stepNum}" data-tab-index="${index}">
          <span class="step-tab__num">STEP ${String(stepNum).padStart(2, '0')}</span>
          <span class="step-tab__name">${round.icon || ''} ${round.name}</span>
          <span class="step-tab__status">${
            status === 'completed' ? '✓ 완료' :
            status === 'active' ? '● 진행 중' :
            '🔒 잠김'
          }</span>
        </button>
      `;
    }).join('') + `
      <button class="step-tab ${currentStep > rounds.length ? 'step-tab--active' : 'step-tab--locked'} ${activeTabIndex === rounds.length ? 'step-tab--current' : ''}" data-step="${rounds.length + 1}" data-tab-index="${rounds.length}">
        <span class="step-tab__num">FINAL</span>
        <span class="step-tab__name">📤 결과물 제출</span>
        <span class="step-tab__status">${currentStep > rounds.length ? '제출 가능' : '단계 완료 후'}</span>
      </button>
    `;

    // 탭 클릭 핸들러
    tabs.querySelectorAll('.step-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.dataset.tabIndex);
        const stepNum = parseInt(tab.dataset.step);
        // 잠긴 탭 방지 (단, 늦은 합류 모드에서는 hasForm 단계만 미리 보기 허용)
        if (tab.classList.contains('step-tab--locked')) {
          if (idx === rounds.length) {
            showStepValidation(`결과물 제출은 모든 단계를 완료한 후 가능합니다. (현재 Step ${currentStep} / ${rounds.length})`);
            return;
          }
          const round = rounds[idx];
          if (!round?.hasForm) {
            showStepValidation('이 단계는 아직 잠겨 있습니다. 이전 단계를 먼저 완료하세요.');
            return;
          }
        }
        activateTab(idx);
      });
    });

    // 활성 탭 컨텐츠 렌더
    activateTab(activeTabIndex, false);

    // 진행률
    const pct = Math.round(((currentStep - 1) / Math.max(1, rounds.length)) * 100);
    const fillEl = document.getElementById('progressFill');
    const pctEl = document.getElementById('progressPct');
    const stepEl = document.getElementById('progressText');
    const titleEl = document.getElementById('currentStepTitle');
    if (fillEl) fillEl.style.width = `${Math.min(100, pct)}%`;
    if (pctEl) pctEl.textContent = `${Math.min(100, pct)}%`;
    if (stepEl) stepEl.textContent = `Step ${Math.min(currentStep, rounds.length)} / ${rounds.length}`;
    if (titleEl) titleEl.textContent = (rounds[Math.min(currentStep, rounds.length) - 1]?.name) || '완료';
  }

  // ── 탭 활성화 ──
  function activateTab(index, scrollIntoView = true) {
    const rounds = workshopData.rounds || [];
    activeTabIndex = index;
    const isSubmission = index === rounds.length;

    // 탭 UI 갱신
    document.querySelectorAll('.step-tab').forEach((t, i) => {
      t.classList.toggle('step-tab--current', i === index);
    });
    if (scrollIntoView) {
      const tab = document.querySelector(`.step-tab[data-tab-index="${index}"]`);
      if (tab) tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    const pane = document.getElementById('stepPane');
    const submission = document.getElementById('submissionSection');
    const formContainer = document.getElementById('axPhaseFormContainer');
    const genericBody = document.getElementById('genericStepBody');
    const validation = document.getElementById('paneValidation');

    if (validation) { validation.classList.add('hidden'); validation.innerHTML = ''; }

    if (isSubmission) {
      // 제출 탭
      if (pane) pane.style.display = 'none';
      if (submission) submission.classList.remove('hidden');
      return;
    }

    // 단계 탭
    if (pane) pane.style.display = 'block';
    if (submission) submission.classList.add('hidden');

    const stepNum = index + 1;
    const round = rounds[index];
    if (!round) return;

    document.getElementById('paneNum').textContent = String(stepNum).padStart(2, '0');
    document.getElementById('paneTitle').textContent = `${round.icon || ''} ${round.name}`;
    document.getElementById('paneDesc').textContent = round.desc || '';
    const tipEl = document.getElementById('paneTip');
    if (round.aiTip) {
      tipEl.style.display = 'block';
      tipEl.innerHTML = `💡 <strong>AI Tip:</strong> ${round.aiTip}`;
    } else {
      tipEl.style.display = 'none';
    }

    // 필수/옵션 배지
    const badge = document.getElementById('paneRequired');
    const isRequired = round.hasForm; // 폼 있는 단계 = 필수
    badge.textContent = isRequired ? '필수' : '선택';
    badge.className = 'step-pane__badge ' + (isRequired ? 'required' : 'optional');

    // 폼 컨테이너 / 일반 단계 분기
    if (round.hasForm && round.phaseId) {
      formContainer.classList.remove('hidden');
      genericBody.classList.add('hidden');
      // ax-phases.js의 폼 렌더링 호출
      if (typeof openAXPhaseForm === 'function') openAXPhaseForm(round.phaseId, stepNum);
    } else {
      formContainer.classList.add('hidden');
      formContainer.innerHTML = '';
      genericBody.classList.remove('hidden');
      // generic 완료 버튼은 현재 step에서만 활성
      const genBtn = document.getElementById('genericCompleteBtn');
      if (genBtn) {
        const isCurrent = stepNum === (currentTeam.currentStep || 1);
        genBtn.disabled = !isCurrent;
        genBtn.textContent = isCurrent ? '✅ 단계 완료' : (stepNum < (currentTeam.currentStep || 1) ? '✓ 완료된 단계' : '🔒 아직 진행할 수 없음');
        genBtn.onclick = isCurrent ? () => completeStep(stepNum) : null;
      }
    }

    // 이전/다음 버튼 상태
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    if (prevBtn) {
      prevBtn.disabled = index === 0;
      prevBtn.onclick = () => activateTab(Math.max(0, index - 1));
    }
    if (nextBtn) {
      const isLast = index >= rounds.length;
      nextBtn.textContent = isLast ? '결과물 제출 →' : '다음 단계 →';
      nextBtn.onclick = () => handleNextClick(index);
    }
  }

  // ── 다음 버튼: 검증 + 단계 완료 + 탭 이동 ──
  async function handleNextClick(index) {
    const rounds = workshopData.rounds || [];
    const stepNum = index + 1;
    const round = rounds[index];
    const isCurrentStep = stepNum === (currentTeam.currentStep || 1);

    // 현재 진행 step일 때만 완료 처리
    if (isCurrentStep && round) {
      if (round.hasForm) {
        // 필수 폼 검증
        const validation = validateRequiredFields();
        if (!validation.ok) {
          showStepValidation(`<strong>입력 누락:</strong> ${validation.message}`);
          return;
        }
      }
      await completeStep(stepNum);
    }

    // 탭 이동
    if (index + 1 <= rounds.length) {
      activateTab(index + 1);
    }
  }

  // ── 필수 필드 검증 (현재 폼 컨테이너 내부) ──
  function validateRequiredFields() {
    const container = document.getElementById('axPhaseFormContainer');
    if (!container) return { ok: true };
    const inputs = container.querySelectorAll('input[required], textarea[required], select[required]');
    if (inputs.length === 0) {
      // required 마킹이 없으면 모든 텍스트/숫자 입력 중 비어 있는지 점검 (관대)
      const all = container.querySelectorAll('input[type="text"], input[type="number"], textarea');
      const filled = Array.from(all).filter(el => (el.value || '').trim() !== '').length;
      if (all.length > 0 && filled / all.length < 0.5) {
        return { ok: false, message: `${all.length}개 항목 중 ${filled}개만 작성됨. 절반 이상 작성 후 진행하세요.` };
      }
      return { ok: true };
    }
    const empty = Array.from(inputs).filter(el => (el.value || '').trim() === '');
    if (empty.length > 0) {
      const labels = empty.slice(0, 3).map(el => el.closest('label')?.textContent || el.name || '항목').join(', ');
      return { ok: false, message: `${empty.length}개 필수 항목 미작성 (예: ${labels})` };
    }
    return { ok: true };
  }

  function showStepValidation(html) {
    const v = document.getElementById('paneValidation');
    if (!v) return;
    v.innerHTML = html;
    v.classList.remove('hidden');
    v.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 탭 스크롤 버튼
  document.addEventListener('DOMContentLoaded', () => {
    const left = document.getElementById('tabsScrollLeft');
    const right = document.getElementById('tabsScrollRight');
    const tabs = document.getElementById('stepTabs');
    if (left && tabs) left.onclick = () => tabs.scrollBy({ left: -200, behavior: 'smooth' });
    if (right && tabs) right.onclick = () => tabs.scrollBy({ left: 200, behavior: 'smooth' });
  });

  // ── AX Summary ──
  async function showAXSummary() {
    const container = document.getElementById('axPhaseFormContainer');
    if (!container) return;
    container.classList.remove('hidden');
    const memberId = sessionStorage.getItem('memberName') || currentTeam?.members?.[0] || 'participant';
    const phases = ['phase-0', 'phase-1', 'phase-1-2', 'phase-2', 'phase-5'];
    const allData = {};
    for (const p of phases) {
      allData[p] = await getPhaseResponse(workshopData.id, currentTeam.id, memberId, p);
    }
    AXPhases.renderSummary(container, allData);
    const sub = document.getElementById('submissionSection');
    if (sub && workshopData.type === 'ax-redesign') sub.classList.add('hidden');
  }

  // ── AX Phase Form ──
  window.openAXPhaseForm = async function(phaseId, stepNum) {
    const container = document.getElementById('axPhaseFormContainer');
    if (!container) return;
    container.classList.remove('hidden');
    // 탭 시스템에서는 활성 탭 컨텐츠 영역으로 부드럽게 스크롤 (폼 시작점 X, 헤더 보존)
    const pane = document.getElementById('stepPane');
    if (pane) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const memberId = sessionStorage.getItem('memberName') || currentTeam?.members?.[0] || 'participant';
    const context = {
      workshopId: workshopData?.id,
      teamId: currentTeam?.id,
      memberId,
    };

    if (phaseId === 'phase-1-2') {
      const p1 = await getPhaseResponse(context.workshopId, context.teamId, memberId, 'phase-1');
      if (p1?.data) {
        const tasks = [];
        for (let i = 1; i <= 7; i++) {
          const name = p1.data[`task_${i}_name`];
          const ai = parseInt(p1.data[`task_${i}_ai`]) || 0;
          if (name && ai >= 2) tasks.push({ name, ai });
        }
        context.phase1Tasks = tasks;
      }
    }

    if (phaseId === 'phase-2') {
      const p12 = await getPhaseResponse(context.workshopId, context.teamId, memberId, 'phase-1-2');
      if (p12?.data) {
        let bestName = '', bestScore = 0;
        for (let i = 1; i <= 10; i++) {
          const name = p12.data[`icep_${i}_name`];
          const I = parseFloat(p12.data[`icep_${i}_I`]) || 0;
          const C = parseFloat(p12.data[`icep_${i}_C`]) || 0;
          const E = parseFloat(p12.data[`icep_${i}_E`]) || 0;
          const P = parseFloat(p12.data[`icep_${i}_P`]) || 0;
          const score = I * 0.3 + C * 0.2 + E * 0.2 + P * 0.3;
          if (name && score > bestScore) { bestScore = score; bestName = name; }
        }
        context.icepTop1 = bestName;
      }
    }

    await AXPhases.renderPhaseForm(phaseId, container, context);
  };

  // ── Complete Step ──
  window.completeStep = async function(stepNum) {
    const rounds = workshopData.rounds || [];
    if (stepNum < rounds.length) {
      currentTeam.currentStep = stepNum + 1;
      currentTeam.progress = Math.round((stepNum / rounds.length) * 100);
    } else {
      currentTeam.currentStep = rounds.length;
      currentTeam.progress = 100;
    }

    // Firestore 진행도 업데이트
    try {
      if (typeof db !== 'undefined' && db && workshopData?.id && !workshopData.demo) {
        await withTimeout(
          db.collection('workshops').doc(workshopData.id)
            .collection('teams').doc(currentTeam.id)
            .update({ currentStep: currentTeam.currentStep, progress: currentTeam.progress }),
          5000, 'Firestore 진행도'
        );
      }
    } catch (err) {
      console.warn('Firestore 진행도 업데이트 실패:', err);
    }

    // 로컬 저장
    const wsIndex = workshops.findIndex(w => w.id === workshopData.id);
    if (wsIndex >= 0) {
      workshops[wsIndex].teams = workshops[wsIndex].teams || [];
      const teamIndex = workshops[wsIndex].teams.findIndex(t => t.id === currentTeam.id);
      if (teamIndex >= 0) {
        workshops[wsIndex].teams[teamIndex] = currentTeam;
        localStorage.setItem('flow-workshops', JSON.stringify(workshops));
      }
    }

    sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));

    // AX Phase 완료 마킹
    const round = (workshopData.rounds || [])[stepNum - 1];
    if (round?.hasForm && round.phaseId) {
      const memberId = sessionStorage.getItem('memberName') || currentTeam?.members?.[0] || 'participant';
      completePhaseResponse(workshopData.id, currentTeam.id, memberId, round.phaseId);
    }

    // 전체 완료 시 요약 뷰
    if (currentTeam.progress >= 100 && workshopData.type === 'ax-redesign') {
      showAXSummary();
    }

    renderSteps();
    updateProgress();
    showToast(`Step ${stepNum} 완료! 🎉`, 'success');
  };

  // ── Update Progress ──
  function updateProgress() {
    const rounds = workshopData.rounds || [];
    const progress = currentTeam.progress || 0;
    const currentStep = currentTeam.currentStep || 1;

    document.getElementById('progressText').textContent = `Step ${currentStep} / ${rounds.length}`;
    document.getElementById('progressFill').style.width = `${progress}%`;
  }

  // ── Submit Project ──
  document.getElementById('submitProjectBtn').addEventListener('click', async () => {
    const submission = {
      serviceName: document.getElementById('subServiceName').value.trim(),
      tagline: document.getElementById('subTagline').value.trim(),
      description: document.getElementById('subDescription').value.trim(),
      appLink: document.getElementById('subAppLink').value.trim(),
      landingLink: document.getElementById('subLandingLink').value.trim(),
      codeLink: document.getElementById('subCodeLink').value.trim(),
      submittedAt: new Date().toISOString(),
    };

    if (!submission.serviceName) {
      showToast('서비스 이름을 입력해주세요.', 'warning');
      return;
    }

    const btn = document.getElementById('submitProjectBtn');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = '⏳ 제출 중...';

    currentTeam.submission = submission;
    currentTeam.progress = 100;

    // Firestore 제출
    let firestoreOk = false;
    try {
      if (typeof db !== 'undefined' && db && workshopData?.id && !workshopData.demo) {
        await withTimeout(
          db.collection('workshops').doc(workshopData.id)
            .collection('teams').doc(currentTeam.id)
            .update({ submission, progress: 100 }),
          8000, 'Firestore 제출'
        );
        firestoreOk = true;
      }
    } catch (err) {
      console.warn('Firestore 제출 실패:', err);
    }

    // 로컬 저장
    const wsIndex = workshops.findIndex(w => w.id === workshopData.id);
    if (wsIndex >= 0) {
      workshops[wsIndex].teams = workshops[wsIndex].teams || [];
      const teamIndex = workshops[wsIndex].teams.findIndex(t => t.id === currentTeam.id);
      if (teamIndex >= 0) {
        workshops[wsIndex].teams[teamIndex] = currentTeam;
        localStorage.setItem('flow-workshops', JSON.stringify(workshops));
      }
    }

    sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
    btn.disabled = false;
    btn.textContent = originalText;
    updateProgress();
    showToast(firestoreOk ? '🎉 결과물이 성공적으로 제출되었습니다!' : '⚠️ 로컬만 저장됨 (네트워크 확인)', firestoreOk ? 'success' : 'warning', 5000);
  });

  // ── Share Team PIN ──
  document.getElementById('shareTeamPin').addEventListener('click', () => {
    const pin = currentTeam.pin;
    navigator.clipboard.writeText(pin).then(() => {
      showToast(`팀 PIN "${pin}" 복사됨! 팀원에게 공유하세요.`, 'success');
    });
  });

  // ── Help ──
  document.getElementById('helpBtn').addEventListener('click', () => {
    showToast('💡 스프린트 단계를 순서대로 진행하고, 마지막에 결과물을 제출하세요!', 'info', 6000);
  });

  // ── Toast ──
  window.showToast = window.showToast || function(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ── Init Firebase ──
  initFirebase();
});
