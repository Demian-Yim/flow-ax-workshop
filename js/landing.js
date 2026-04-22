/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Workshop Platform — Landing Page Logic
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ──
  const codeInputs = document.querySelectorAll('.code-input');
  const enterBtn = document.getElementById('enterBtn');
  const adminTrigger = document.getElementById('adminTrigger');
  const adminModal = document.getElementById('adminModal');
  const adminCancelBtn = document.getElementById('adminCancelBtn');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminPassword = document.getElementById('adminPassword');
  const roleOptions = document.querySelectorAll('.role-option');
  const tutorialOverlay = document.getElementById('tutorialOverlay');
  const tutorialSkip = document.getElementById('tutorialSkip');
  const tutorialNext = document.getElementById('tutorialNext');

  let selectedRole = null;

  // ── Code Input Logic ──
  codeInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      e.target.value = value;

      if (value) {
        input.classList.add('filled');
        // Auto-focus next
        if (index < codeInputs.length - 1) {
          codeInputs[index + 1].focus();
        }
      } else {
        input.classList.remove('filled');
      }

      checkCodeComplete();
    });

    input.addEventListener('keydown', (e) => {
      // Backspace → go to previous
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        codeInputs[index - 1].focus();
        codeInputs[index - 1].value = '';
        codeInputs[index - 1].classList.remove('filled');
        checkCodeComplete();
      }
      // Enter → submit
      if (e.key === 'Enter') {
        handleEnter();
      }
    });

    input.addEventListener('focus', () => {
      input.select();
    });

    // Paste support
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text')
        .toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
      pasted.split('').forEach((char, i) => {
        if (codeInputs[i]) {
          codeInputs[i].value = char;
          codeInputs[i].classList.add('filled');
        }
      });
      if (pasted.length > 0) {
        const focusIndex = Math.min(pasted.length, codeInputs.length - 1);
        codeInputs[focusIndex].focus();
      }
      checkCodeComplete();
    });
  });

  function getCode() {
    return Array.from(codeInputs).map(i => i.value).join('').toUpperCase();
  }

  function checkCodeComplete() {
    const code = getCode();
    enterBtn.disabled = code.length < 4;
  }

  // ── Enter Button ──
  enterBtn.addEventListener('click', handleEnter);

  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} 타임아웃 (${ms/1000}s)`)), ms))
    ]);
  }

  async function handleEnter() {
    const code = getCode();
    if (code.length < 4) return;

    enterBtn.disabled = true;
    const originalInnerHTML = enterBtn.innerHTML;
    enterBtn.innerHTML = '<span>⏳ 접속 중...</span>';

    try {
      // Firebase가 설정되어 있으면 실제 조회 (8초 타임아웃)
      if (typeof db !== 'undefined' && db) {
        const workshop = await withTimeout(getWorkshopByCode(code), 8000, 'Firestore 코드 조회');
        if (workshop) {
          // 세션 저장 후 대시보드로 이동
          sessionStorage.setItem('workshopId', workshop.id);
          sessionStorage.setItem('workshopData', JSON.stringify(workshop));
          sessionStorage.setItem('userRole', 'participant');
          window.location.href = 'dashboard.html';
          return;
        } else {
          showToast('유효하지 않은 코드입니다. 다시 확인해주세요.', 'error');
        }
      } else {
        // 오프라인 모드: localStorage에서 워크샵 조회
        const localWorkshops = JSON.parse(localStorage.getItem('flow-workshops') || '[]');
        const found = localWorkshops.find(w => w.code === code && w.status === 'active');
        
        if (found) {
          sessionStorage.setItem('workshopId', found.id);
          sessionStorage.setItem('workshopData', JSON.stringify(found));
          sessionStorage.setItem('userRole', 'participant');
          window.location.href = 'dashboard.html';
          return;
        } else {
          // 코드가 일치하는 워크샵 없음 → 데모 모드 (아무 코드나 입력 가능)
          sessionStorage.setItem('workshopId', 'demo-' + code);
          sessionStorage.setItem('workshopData', JSON.stringify({
            id: 'demo-' + code,
            name: 'FLOW~ AX Workshop (Demo)',
            type: 'hackathon',
            code: code,
            rounds: getDefaultRounds('hackathon'),
            currentRound: 1,
            status: 'active',
            teams: [],
            demo: true,
          }));
          sessionStorage.setItem('userRole', 'participant');
          showToast('데모 모드로 접속합니다.', 'info');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
          return;
        }
      }
    } catch (err) {
      console.error('입장 실패:', err);
      showToast(`접속 실패: ${err.message || err}`, 'error', 5000);
    }

    enterBtn.disabled = false;
    enterBtn.innerHTML = originalInnerHTML;
  }

  // ── Admin Modal ──
  adminTrigger.addEventListener('click', () => {
    adminModal.classList.add('active');
    selectedRole = null;
    roleOptions.forEach(o => o.classList.remove('selected'));
    adminPassword.value = '';
  });

  adminCancelBtn.addEventListener('click', () => {
    adminModal.classList.remove('active');
  });

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
      adminModal.classList.remove('active');
    }
  });

  // Role selection
  roleOptions.forEach(option => {
    option.addEventListener('click', () => {
      roleOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedRole = option.dataset.role;
    });
  });

  // Admin login
  adminLoginBtn.addEventListener('click', handleAdminLogin);
  adminPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdminLogin();
  });

  function handleAdminLogin() {
    if (!selectedRole) {
      showToast('역할을 선택해주세요.', 'warning');
      return;
    }

    const password = adminPassword.value;
    if (!password) {
      showToast('비밀번호를 입력해주세요.', 'warning');
      return;
    }

    // 간단한 비밀번호 체크 (실제로는 Firebase Auth 활용)
    const validPasswords = {
      'facilitator': 'flow2026',
      'judge': 'flow2026',
      'admin': 'admin2026',
    };

    if (password === validPasswords[selectedRole] || password === 'admin2026') {
      sessionStorage.setItem('userRole', selectedRole);
      sessionStorage.setItem('isAdmin', 'true');
      adminModal.classList.remove('active');
      showToast(`${getRoleLabel(selectedRole)} 접속 성공!`, 'success');
      
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 800);
    } else {
      showToast('비밀번호가 올바르지 않습니다.', 'error');
      adminPassword.value = '';
      adminPassword.focus();
    }
  }

  function getRoleLabel(role) {
    const labels = { facilitator: '퍼실리테이터', judge: '심사위원', admin: '시스템 관리자' };
    return labels[role] || role;
  }

  // ── Tutorial System ──
  const tutorialSteps = [
    {
      icon: '👋',
      title: '환영합니다!',
      desc: 'FLOW~ AX Workshop Platform에 오신 것을 환영합니다.\nAI와 함께 일의 흐름을 디자인하는 실전 워크샵 플랫폼입니다.',
    },
    {
      icon: '🔑',
      title: '참가자 입장',
      desc: '퍼실리테이터로부터 받은 4자리 코드를 입력하면\n해당 워크샵에 참가할 수 있습니다.',
    },
    {
      icon: '⚙️',
      title: '관리자 접속',
      desc: '우측 상단의 톱니바퀴(⚙️) 아이콘을 클릭하면\n퍼실리테이터, 심사위원, 관리자로 접속할 수 있습니다.',
    },
  ];

  let currentTutorialStep = 0;

  function showTutorial() {
    // 첫 방문 체크
    if (localStorage.getItem('flow-ax-tutorial-done')) return;
    tutorialOverlay.classList.remove('hidden');
    updateTutorialStep();
  }

  function updateTutorialStep() {
    const step = tutorialSteps[currentTutorialStep];
    document.getElementById('tutorialStep').textContent = `STEP ${currentTutorialStep + 1} / ${tutorialSteps.length}`;
    document.getElementById('tutorialIcon').textContent = step.icon;
    document.getElementById('tutorialTitle').textContent = step.title;
    document.getElementById('tutorialDesc').textContent = step.desc;
    
    if (currentTutorialStep === tutorialSteps.length - 1) {
      tutorialNext.textContent = '시작하기 🚀';
    } else {
      tutorialNext.textContent = '다음 →';
    }
  }

  tutorialNext.addEventListener('click', () => {
    currentTutorialStep++;
    if (currentTutorialStep >= tutorialSteps.length) {
      closeTutorial();
    } else {
      updateTutorialStep();
    }
  });

  tutorialSkip.addEventListener('click', closeTutorial);

  function closeTutorial() {
    tutorialOverlay.classList.add('hidden');
    localStorage.setItem('flow-ax-tutorial-done', 'true');
  }

  // ── Toast Notification ──
  window.showToast = function(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `
      <span>${icons[type] || 'ℹ️'}</span>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ── Help Button (Usage Guide) ──
  // 우측 상단 사용법 버튼은 admin/dashboard 페이지에서 추가

  // ── Initialize ──
  initFirebase();
  
  // 첫 방문시 튜토리얼 표시 (500ms 딜레이)
  setTimeout(showTutorial, 500);

  // 첫 번째 코드 인풋에 포커스
  setTimeout(() => codeInputs[0].focus(), 1000);
});
