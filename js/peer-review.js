/* ═══════════════════════════════════════════════════════════
   FLOW~ AX Workshop — Peer Review (참가자 간 결과물 평가)
   ═══════════════════════════════════════════════════════════ */

(function() {
  let currentReview = {
    workshopId: null,
    teamId: null,
    teamName: null,
    serviceName: null,
    scores: {},
    reviewerId: null,
  };

  const AXES = ['creativity', 'practicality', 'completeness', 'applicability'];

  // 모달 열기 (gallery.js에서 호출)
  window.openPeerReview = function(workshopId, teamId, teamName, serviceName) {
    currentReview = {
      workshopId,
      teamId,
      teamName,
      serviceName,
      scores: {},
      reviewerId: null,
    };
    document.getElementById('prTeamName').textContent = teamName;
    document.getElementById('prServiceName').textContent = serviceName || '';

    // 본인 닉네임 자동 채움
    const myName = sessionStorage.getItem('memberName') || '';
    document.getElementById('prReviewerName').value = myName;

    // 점수 초기화
    AXES.forEach(axis => {
      document.querySelectorAll(`.peer-rating[data-axis="${axis}"] button`).forEach(b => b.classList.remove('peer-rating__btn--active'));
    });
    document.getElementById('prComment').value = '';

    // 기존 평가 불러오기
    loadExistingReview();

    document.getElementById('peerReviewModal').classList.remove('hidden');
  };

  window.closePeerReview = function() {
    document.getElementById('peerReviewModal').classList.add('hidden');
  };

  async function loadExistingReview() {
    if (!currentReview.workshopId || !currentReview.teamId) return;
    const myName = sessionStorage.getItem('memberName') || '';
    if (!myName) return;
    try {
      const id = `${currentReview.workshopId}_${myName}_${currentReview.teamId}`;
      if (typeof db !== 'undefined' && db) {
        const doc = await db.collection('peerReviews').doc(id).get();
        if (doc.exists) {
          const data = doc.data();
          currentReview.scores = data.scores || {};
          AXES.forEach(axis => {
            const score = data.scores?.[axis];
            if (score) {
              document.querySelectorAll(`.peer-rating[data-axis="${axis}"] button`).forEach(b => {
                b.classList.toggle('peer-rating__btn--active', parseInt(b.dataset.score) === score);
              });
            }
          });
          document.getElementById('prComment').value = data.comment || '';
        }
      }
    } catch (err) {
      console.warn('기존 평가 로드 실패:', err);
    }
  }

  // 점수 버튼 클릭 핸들러 (이벤트 위임)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.peer-rating button[data-score]');
    if (!btn) return;
    const rating = btn.closest('.peer-rating');
    const axis = rating.dataset.axis;
    const score = parseInt(btn.dataset.score);
    rating.querySelectorAll('button').forEach(b => b.classList.remove('peer-rating__btn--active'));
    btn.classList.add('peer-rating__btn--active');
    currentReview.scores[axis] = score;
  });

  // 제출 버튼
  document.addEventListener('click', async (e) => {
    if (e.target.id !== 'prSubmitBtn') return;
    const reviewerName = document.getElementById('prReviewerName').value.trim();
    if (!reviewerName) {
      showToast('평가자 닉네임을 입력해주세요.', 'warning');
      return;
    }
    const filledAxes = AXES.filter(a => currentReview.scores[a]);
    if (filledAxes.length < 4) {
      showToast(`4개 항목 모두 평가해주세요. (현재 ${filledAxes.length}/4)`, 'warning');
      return;
    }

    const btn = document.getElementById('prSubmitBtn');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = '제출 중...';

    const review = {
      workshopId: currentReview.workshopId,
      teamId: currentReview.teamId,
      teamName: currentReview.teamName,
      reviewerId: reviewerName,
      scores: currentReview.scores,
      comment: document.getElementById('prComment').value.trim(),
      avgScore: AXES.reduce((s, a) => s + (currentReview.scores[a] || 0), 0) / 4,
    };

    try {
      if (typeof db !== 'undefined' && db) {
        const id = `${currentReview.workshopId}_${reviewerName}_${currentReview.teamId}`;
        await Promise.race([
          db.collection('peerReviews').doc(id).set({
            ...review,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('타임아웃')), 8000))
        ]);
        sessionStorage.setItem('memberName', reviewerName);
        showToast('🌟 평가가 저장되었습니다. 감사합니다!', 'success', 4000);
        closePeerReview();
        // 갤러리 평균 점수 업데이트
        if (typeof window.refreshPeerScores === 'function') window.refreshPeerScores();
      } else {
        showToast('네트워크 연결을 확인해주세요.', 'error');
      }
    } catch (err) {
      console.error('평가 저장 실패:', err);
      showToast(`저장 실패: ${err.message || err}`, 'error', 5000);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // 갤러리 카드의 평균 피어 점수 표시 (gallery.js에서 호출)
  window.fetchTeamPeerStats = async function(workshopId, teamId) {
    if (typeof db === 'undefined' || !db) return null;
    try {
      const snap = await db.collection('peerReviews')
        .where('workshopId', '==', workshopId)
        .where('teamId', '==', teamId)
        .get();
      if (snap.empty) return { count: 0, avg: 0 };
      const reviews = snap.docs.map(d => d.data());
      const avg = reviews.reduce((s, r) => s + (r.avgScore || 0), 0) / reviews.length;
      return { count: reviews.length, avg: Number(avg.toFixed(2)) };
    } catch (err) {
      console.warn('피어 통계 로드 실패:', err);
      return null;
    }
  };
})();
