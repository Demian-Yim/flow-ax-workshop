/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Workshop Platform — Gallery Logic
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Data ──
  let workshops = JSON.parse(localStorage.getItem('flow-workshops') || '[]');
  let votedTeams = JSON.parse(localStorage.getItem('flow-voted-teams') || '[]');
  let currentFilter = 'all';

  // ── Collect all projects from all workshops ──
  function getAllProjects() {
    const projects = [];
    workshops.forEach(ws => {
      (ws.teams || []).forEach(team => {
        if (team.submission) {
          projects.push({
            ...team,
            workshopType: ws.type,
            workshopName: ws.name,
            votes: team.votes || 0,
          });
        }
      });
    });
    return projects;
  }

  // ── Random Project Icons ──
  const projectIcons = ['💡', '🚀', '🔬', '🎯', '⚡', '🌟', '🧠', '🎨', '🔮', '🌊', '🦾', '🎪'];

  function getProjectIcon(index) {
    return projectIcons[index % projectIcons.length];
  }

  // ── Render Gallery ──
  function renderGallery() {
    let projects = getAllProjects();
    const grid = document.getElementById('galleryGrid');
    const empty = document.getElementById('galleryEmpty');

    // Apply filter
    if (currentFilter === 'top') {
      projects.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (currentFilter !== 'all') {
      projects = projects.filter(p => p.workshopType === currentFilter);
    }

    if (projects.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    grid.innerHTML = projects.map((project, index) => {
      const typeInfo = getWorkshopTypeLabel(project.workshopType);
      const icon = getProjectIcon(index);
      const isVoted = votedTeams.includes(project.id);
      const rank = currentFilter === 'top' ? index + 1 : null;

      // Generate gradient based on type
      const gradients = {
        'hackathon': 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(162, 155, 254, 0.1))',
        'vibe-coding': 'linear-gradient(135deg, rgba(0, 184, 148, 0.2), rgba(85, 239, 196, 0.1))',
        'ax-redesign': 'linear-gradient(135deg, rgba(225, 112, 85, 0.2), rgba(250, 177, 160, 0.1))',
      };

      return `
        <div class="project-card" data-type="${project.workshopType}" data-team-id="${project.id}">
          <div class="project-card__visual" style="background: ${gradients[project.workshopType] || gradients['hackathon']}">
            ${rank ? `<div class="project-card__rank">#${rank}</div>` : ''}
            <div class="project-card__icon">${icon}</div>
          </div>
          <div class="project-card__body">
            <div class="project-card__team">${project.name}</div>
            <div class="project-card__service">${project.submission.serviceName || '프로젝트'}</div>
            <p class="project-card__desc">
              ${project.submission.tagline ? `"${project.submission.tagline}"` : ''}
              ${project.submission.description ? `<br>${project.submission.description}` : ''}
            </p>
            
            <div class="project-card__footer">
              <button class="vote-btn ${isVoted ? 'voted' : ''}" onclick="toggleVote('${project.id}')">
                ❤️ <span class="vote-count">${project.votes || 0}</span>
              </button>
              <div class="project-card__actions">
                ${project.submission.appLink ? `
                  <a href="${project.submission.appLink}" target="_blank" class="view-app-btn">🔗 앱 보기</a>
                ` : ''}
                ${project.submission.landingLink ? `
                  <a href="${project.submission.landingLink}" target="_blank" class="landing-btn">📄 소개 페이지</a>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Vote Toggle ──
  window.toggleVote = function(teamId) {
    const index = votedTeams.indexOf(teamId);
    
    // Find team in workshops
    workshops.forEach(ws => {
      (ws.teams || []).forEach(team => {
        if (team.id === teamId) {
          if (index === -1) {
            // Add vote
            team.votes = (team.votes || 0) + 1;
            votedTeams.push(teamId);
            showToast('❤️ 투표 완료!', 'success');
          } else {
            // Remove vote
            team.votes = Math.max(0, (team.votes || 0) - 1);
            votedTeams.splice(index, 1);
            showToast('투표가 취소되었습니다.', 'info');
          }
        }
      });
    });

    localStorage.setItem('flow-workshops', JSON.stringify(workshops));
    localStorage.setItem('flow-voted-teams', JSON.stringify(votedTeams));
    renderGallery();
  };

  // ── Filters ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderGallery();
    });
  });

  // ── Help ──
  document.getElementById('helpBtn').addEventListener('click', () => {
    showToast('💡 팀 프로젝트를 살펴보고, ❤️를 눌러 마음에 드는 프로젝트에 투표하세요!', 'info', 5000);
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

  // ── Firestore 동기화 (제출된 팀 포함) ──
  async function syncFromFirestore() {
    try {
      if (typeof db === 'undefined' || !db) return;
      const wsSnap = await Promise.race([
        db.collection('workshops').where('status', '==', 'active').get(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000))
      ]);

      const remoteWorkshops = [];
      for (const wsDoc of wsSnap.docs) {
        const wsData = wsDoc.data();
        const teamsSnap = await wsDoc.ref.collection('teams').get();
        const teams = teamsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
        remoteWorkshops.push({
          ...wsData,
          id: wsData.id || wsDoc.id,
          teams,
          rounds: wsData.rounds && wsData.rounds.length ? wsData.rounds : getDefaultRounds(wsData.type || 'hackathon'),
        });
      }

      const remoteIds = new Set(remoteWorkshops.map(w => w.id));
      const localOnly = workshops.filter(w => !remoteIds.has(w.id));
      workshops = [...remoteWorkshops, ...localOnly];
      localStorage.setItem('flow-workshops', JSON.stringify(workshops));
      renderGallery();
    } catch (err) {
      console.warn('Gallery Firestore 동기화 실패:', err);
    }
  }

  // ── Init ──
  initFirebase();
  renderGallery();
  syncFromFirestore();
});
