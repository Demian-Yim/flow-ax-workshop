/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Workshop Platform — Admin Dashboard Logic
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Auth Check ──
  const role = sessionStorage.getItem('userRole');
  const isAdmin = sessionStorage.getItem('isAdmin');
  if (!isAdmin) {
    window.location.href = 'index.html';
    return;
  }

  // ── Role Display ──
  const roleLabels = { facilitator: '퍼실리테이터', judge: '심사위원', admin: '시스템 관리자' };
  const roleDisplay = document.getElementById('roleDisplay');
  const roleBadge = document.getElementById('roleBadge');
  if (role && roleLabels[role]) {
    roleDisplay.textContent = `${roleLabels[role].toUpperCase()} 모드 활성화`;
    roleBadge.textContent = `${roleLabels[role]} 권한 활성화`;
  }

  // ── LocalStorage-based data (works without Firebase) ──
  let workshops = JSON.parse(localStorage.getItem('flow-workshops') || '[]');

  function saveWorkshops() {
    localStorage.setItem('flow-workshops', JSON.stringify(workshops));
  }

  // ── Tab Logic ──
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ── Workshop Type Selection ──
  let selectedType = null;
  const typeCards = document.querySelectorAll('.type-card');

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedType = card.dataset.type;
    });
  });

  // ── Create Workshop ──
  document.getElementById('createWorkshopBtn').addEventListener('click', () => {
    const name = document.getElementById('workshopName').value.trim();
    
    if (!name) {
      showToast('워크샵 이름을 입력해주세요.', 'warning');
      return;
    }
    if (!selectedType) {
      showToast('워크샵 유형을 선택해주세요.', 'warning');
      return;
    }

    const code = generateClassCode();
    const workshop = {
      id: 'ws-' + Date.now(),
      name,
      type: selectedType,
      code,
      rounds: getDefaultRounds(selectedType),
      currentRound: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      teams: [],
    };

    workshops.push(workshop);
    saveWorkshops();

    // Reset form
    document.getElementById('workshopName').value = '';
    typeCards.forEach(c => c.classList.remove('selected'));
    selectedType = null;

    renderWorkshopList();
    updateStats();
    showToast(`워크샵 "${name}" 생성 완료! 코드: ${code}`, 'success');
  });

  // ── Render Workshop List ──
  function renderWorkshopList() {
    const list = document.getElementById('workshopList');
    
    if (workshops.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📭</div>
          <div class="empty-state__title">아직 워크샵이 없습니다</div>
          <p>위에서 새 워크샵을 생성해주세요.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = workshops.map(ws => {
      const typeInfo = getWorkshopTypeLabel(ws.type);
      const teamCount = ws.teams ? ws.teams.length : 0;
      return `
        <div class="workshop-item">
          <div class="workshop-item__info">
            <div class="workshop-item__name">
              <span>${typeInfo.emoji}</span>
              ${ws.name}
              <span class="badge badge-${typeInfo.color}">${typeInfo.label}</span>
            </div>
            <div class="workshop-item__meta">
              <span>👥 ${teamCount}개 팀</span>
              <span>📅 ${new Date(ws.createdAt).toLocaleDateString('ko-KR')}</span>
              <span>${ws.rounds.length}단계 스프린트</span>
            </div>
          </div>
          <div class="workshop-item__code" onclick="copyCode('${ws.code}')" title="클릭하여 복사">
            ${ws.code}
          </div>
          <div class="action-btns">
            <button class="action-btn" onclick="viewWorkshop('${ws.id}')" title="모니터링">📊</button>
            <button class="action-btn action-btn--danger" onclick="deleteWorkshop('${ws.id}')" title="삭제">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // Update monitoring dropdown
    updateMonitorDropdown();
  }

  // ── Copy Code ──
  window.copyCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`코드 "${code}" 복사됨!`, 'success');
    }).catch(() => {
      showToast(`코드: ${code}`, 'info');
    });
  };

  // ── View Workshop (switch to monitoring tab) ──
  window.viewWorkshop = function(id) {
    document.querySelector('[data-tab="monitoring"]').click();
    document.getElementById('monitorWorkshopSelect').value = id;
    loadTeamMonitoring(id);
  };

  // ── Delete Workshop ──
  window.deleteWorkshop = function(id) {
    if (!confirm('이 워크샵을 삭제하시겠습니까? 모든 팀 데이터도 함께 삭제됩니다.')) return;
    workshops = workshops.filter(w => w.id !== id);
    saveWorkshops();
    renderWorkshopList();
    updateStats();
    showToast('워크샵이 삭제되었습니다.', 'info');
  };

  // ── Update Stats ──
  function updateStats() {
    const totalTeams = workshops.reduce((sum, ws) => sum + (ws.teams ? ws.teams.length : 0), 0);
    const totalMembers = workshops.reduce((sum, ws) => {
      return sum + (ws.teams || []).reduce((s, t) => s + (t.members ? t.members.length : 0), 0);
    }, 0);
    const totalSubmissions = workshops.reduce((sum, ws) => {
      return sum + (ws.teams || []).filter(t => t.submission).length;
    }, 0);

    document.getElementById('statWorkshops').textContent = workshops.length;
    document.getElementById('statTeams').textContent = totalTeams;
    document.getElementById('statMembers').textContent = totalMembers;
    document.getElementById('statSubmissions').textContent = totalSubmissions;
    document.getElementById('sysWorkshopCount').textContent = workshops.length;
    document.getElementById('sysTeamCount').textContent = totalTeams;
  }

  // ── Monitoring Dropdown ──
  function updateMonitorDropdown() {
    const select = document.getElementById('monitorWorkshopSelect');
    select.innerHTML = '<option value="">워크샵을 선택하세요</option>';
    workshops.forEach(ws => {
      const typeInfo = getWorkshopTypeLabel(ws.type);
      select.innerHTML += `<option value="${ws.id}">${typeInfo.emoji} ${ws.name} (${ws.code})</option>`;
    });
  }

  document.getElementById('monitorWorkshopSelect').addEventListener('change', (e) => {
    if (e.target.value) {
      loadTeamMonitoring(e.target.value);
    } else {
      document.getElementById('monitoringHeader').style.display = 'none';
      document.getElementById('teamTableWrapper').style.display = 'none';
      document.getElementById('monitoringEmpty').style.display = 'block';
    }
  });

  // ── Load Team Monitoring ──
  function loadTeamMonitoring(workshopId) {
    const ws = workshops.find(w => w.id === workshopId);
    if (!ws) return;

    document.getElementById('monitoringEmpty').style.display = 'none';
    document.getElementById('monitoringHeader').style.display = 'block';
    document.getElementById('teamTableWrapper').style.display = 'block';

    const typeInfo = getWorkshopTypeLabel(ws.type);
    document.getElementById('monitorWorkshopName').innerHTML = `
      <span style="cursor:pointer" onclick="document.getElementById('monitorWorkshopSelect').value='';document.getElementById('monitoringEmpty').style.display='block';document.getElementById('monitoringHeader').style.display='none';document.getElementById('teamTableWrapper').style.display='none';">←</span>
      ${typeInfo.emoji} ${ws.name}
    `;

    renderTeamTable(ws);
  }

  function renderTeamTable(ws) {
    const tbody = document.getElementById('teamTableBody');
    const teams = ws.teams || [];

    if (teams.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
            아직 참여한 팀이 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = teams.map(team => {
      const roundName = ws.rounds[team.currentStep - 1]?.name || '-';
      const progressWidth = team.progress || 0;
      
      return `
        <tr>
          <td><span class="team-name">${team.name}</span></td>
          <td>
            <div class="team-members">
              ${(team.members || []).map(m => `<span class="member-chip">${m}</span>`).join('')}
            </div>
          </td>
          <td>
            <span class="step-indicator step-indicator--active">STEP${team.currentStep}</span>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="progress-bar" style="width:100px;">
                <div class="progress-bar__fill" style="width:${progressWidth}%"></div>
              </div>
              <span style="font-size:var(--fs-xs);font-weight:var(--fw-semibold);">${progressWidth}%</span>
            </div>
          </td>
          <td>
            <div class="submission-links">
              ${team.submission ? `
                <a href="${team.submission.appLink || '#'}" target="_blank" class="submission-link">App Link</a>
                <a href="${team.submission.landingLink || '#'}" target="_blank" class="submission-link">Landing</a>
              ` : '<span style="color:var(--text-muted);font-size:var(--fs-xs);">미제출</span>'}
            </div>
          </td>
          <td>
            ${team.submission?.codeLink ? `
              <a href="${team.submission.codeLink}" target="_blank" class="submission-link submission-link--code">View Code</a>
            ` : '<span style="color:var(--text-muted);font-size:var(--fs-xs);">No Code</span>'}
          </td>
          <td>
            <div class="action-btns">
              <button class="action-btn" title="상세보기">👁️</button>
              <button class="action-btn action-btn--danger" title="삭제">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ── System Data ──
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const data = JSON.stringify(workshops, null, 2);
    document.getElementById('systemDataView').textContent = data;
    
    // Download as file
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-ax-workshop-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('데이터 내보내기 완료!', 'success');
  });

  document.getElementById('backupBtn').addEventListener('click', () => {
    const data = JSON.stringify({ workshops, exportedAt: new Date().toISOString() }, null, 2);
    document.getElementById('systemDataView').textContent = data;
    showToast('백업 데이터가 뷰어에 표시되었습니다.', 'info');
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('⚠️ 정말로 모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    if (!confirm('📛 마지막 확인: 모든 워크샵, 팀, 제출물 데이터가 영구 삭제됩니다.')) return;
    workshops = [];
    saveWorkshops();
    renderWorkshopList();
    updateStats();
    showToast('모든 데이터가 초기화되었습니다.', 'warning');
  });

  // ── Logout ──
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  });

  // ── Help ──
  document.getElementById('helpBtn').addEventListener('click', () => {
    showHelpModal();
  });

  function showHelpModal() {
    showToast('📖 사용법: 워크샵 생성 → 코드 공유 → 팀 모니터링 → 갤러리 확인', 'info', 6000);
  }

  // ── Toast (reuse from landing) ──
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

  // ── Theme (inherit from system) ──
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    // Keep dark by default for admin
  }

  // ── Init ──
  initFirebase();
  renderWorkshopList();
  updateStats();
});
