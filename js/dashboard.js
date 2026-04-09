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
  document.getElementById('confirmCreateTeam').addEventListener('click', () => {
    const teamName = document.getElementById('newTeamName').value.trim();
    const memberName = document.getElementById('newMemberName').value.trim();

    if (!teamName) { showToast('팀 이름을 입력해주세요.', 'warning'); return; }
    if (!memberName) { showToast('이름을 입력해주세요.', 'warning'); return; }

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

    // Save to workshop
    const wsIndex = workshops.findIndex(w => w.id === workshopData.id);
    if (wsIndex >= 0) {
      workshops[wsIndex].teams.push(currentTeam);
      localStorage.setItem('flow-workshops', JSON.stringify(workshops));
    }

    sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
    showToast(`팀 "${teamName}" 생성! PIN: ${pin}`, 'success');
    showSprintPhase();
  });

  // Join team
  document.getElementById('confirmJoinTeam').addEventListener('click', () => {
    const pin = document.getElementById('teamPin').value.trim();
    const memberName = document.getElementById('joinMemberName').value.trim();

    if (!pin || pin.length !== 4) { showToast('4자리 PIN을 입력해주세요.', 'warning'); return; }
    if (!memberName) { showToast('이름을 입력해주세요.', 'warning'); return; }

    // Find team by PIN
    let foundTeam = null;
    let foundWsIndex = -1;
    let foundTeamIndex = -1;

    workshops.forEach((ws, wi) => {
      (ws.teams || []).forEach((t, ti) => {
        if (t.pin === pin) {
          foundTeam = t;
          foundWsIndex = wi;
          foundTeamIndex = ti;
        }
      });
    });

    if (foundTeam) {
      foundTeam.members.push(memberName);
      workshops[foundWsIndex].teams[foundTeamIndex] = foundTeam;
      localStorage.setItem('flow-workshops', JSON.stringify(workshops));
      
      currentTeam = foundTeam;
      sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
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

    // Render steps
    renderSteps();
    updateProgress();
  }

  // ── Render Steps ──
  function renderSteps() {
    const timeline = document.getElementById('stepsTimeline');
    const rounds = workshopData.rounds || [];
    const currentStep = currentTeam.currentStep || 1;

    timeline.innerHTML = rounds.map((round, index) => {
      const stepNum = index + 1;
      let status = 'locked';
      if (stepNum < currentStep) status = 'completed';
      else if (stepNum === currentStep) status = 'active';

      return `
        <div class="step-card step-card--${status}" data-step="${stepNum}">
          <div class="step-card__number">
            ${status === 'completed' ? '✅' : round.icon || stepNum}
          </div>
          <div class="step-card__content">
            <div class="step-card__title">
              Step ${stepNum}: ${round.name}
              ${status === 'active' ? '<span class="badge badge-primary" style="font-size:10px;">현재 단계</span>' : ''}
            </div>
            <p class="step-card__desc">${round.desc}</p>
            ${round.aiTip ? `
              <div class="step-card__ai-tip">
                <span class="step-card__ai-tip-label">💡 AI Tip:</span>
                <span>${round.aiTip}</span>
              </div>
            ` : ''}
            ${status === 'active' ? `
              <div class="step-card__actions">
                <button class="btn btn-primary btn-sm" onclick="completeStep(${stepNum})">
                  ✅ 이 단계 완료
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Complete Step ──
  window.completeStep = function(stepNum) {
    const rounds = workshopData.rounds || [];
    if (stepNum < rounds.length) {
      currentTeam.currentStep = stepNum + 1;
      currentTeam.progress = Math.round((stepNum / rounds.length) * 100);
    } else {
      currentTeam.currentStep = rounds.length;
      currentTeam.progress = 100;
    }

    // Update local storage
    const wsIndex = workshops.findIndex(w => w.id === workshopData.id);
    if (wsIndex >= 0) {
      const teamIndex = workshops[wsIndex].teams.findIndex(t => t.id === currentTeam.id);
      if (teamIndex >= 0) {
        workshops[wsIndex].teams[teamIndex] = currentTeam;
        localStorage.setItem('flow-workshops', JSON.stringify(workshops));
      }
    }

    sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
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
  document.getElementById('submitProjectBtn').addEventListener('click', () => {
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

    currentTeam.submission = submission;
    currentTeam.progress = 100;

    // Update local storage
    const wsIndex = workshops.findIndex(w => w.id === workshopData.id);
    if (wsIndex >= 0) {
      const teamIndex = workshops[wsIndex].teams.findIndex(t => t.id === currentTeam.id);
      if (teamIndex >= 0) {
        workshops[wsIndex].teams[teamIndex] = currentTeam;
        localStorage.setItem('flow-workshops', JSON.stringify(workshops));
      }
    }

    sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
    updateProgress();
    showToast('🎉 결과물이 성공적으로 제출되었습니다!', 'success', 5000);
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
