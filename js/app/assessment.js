/**
 * FLOW~ AX Platform — Assessment Controller (FlowApp)
 *
 * Orchestrates the 3-stage diagnostic flow:
 *  Stage 1: Participant registration (dept + workshop code)
 *  Stage 2: 20 × 4-Skill + 10 × Gartner questions, one per screen
 *  Stage 3: Completion summary + link to report
 *
 * Storage strategy:
 *  - Primary: Firestore (assessmentResponses collection)
 *  - Fallback: localStorage (flow-ax-assessment-{responseId})
 *  - Auto-save on every answer + manual save button
 *
 * Dependencies (loaded via <script> tags in assessment.html):
 *  - firebase-config.js         → window.db, initFirebase()
 *  - questions-4skill.js        → window.QUESTIONS_4SKILL
 *  - questions-gartner.js       → window.QUESTIONS_GARTNER
 *  - scoring.js                 → window.FlowScoring
 *  - hint-rules.js              → window.HINT_RULES
 *  - hint-engine.js             → window.FlowHintEngine
 *  - anomaly-detector.js        → window.FlowAnomalyDetector
 *
 * @module app/assessment
 */

(function () {
  'use strict';

  // ─── Immutable state container ──────────────────────────────
  let state = {
    stage: 'intro',           // 'intro' | 'questions' | 'complete'
    responseId: null,         // generated on form submit
    participant: {
      name: '',
      dept: '',
      role: '',
      workshopCode: ''
    },
    phase: 'pre',             // 'pre' | 'post'
    assessmentType: '4skill', // '4skill' | 'gartner' (sequential)
    questionIndex: 0,         // index within current assessmentType
    answers: {
      '4skill': [],           // Array<{questionId, value, answeredAt}>
      'gartner': []
    },
    startedAt: null,          // ISO string
    lastSavedAt: null,
    anomalyFlags: []
  };

  const LS_KEY_PREFIX = 'flow-ax-assessment-';
  const LS_DRAFT_KEY = 'flow-ax-assessment-draft';

  // ─── Pure helpers ───────────────────────────────────────────
  function getAllQuestions() {
    const fourSkill = (window.QUESTIONS_4SKILL && window.QUESTIONS_4SKILL.questions) || [];
    const gartner = (window.QUESTIONS_GARTNER && window.QUESTIONS_GARTNER.questions) || [];
    return { fourSkill, gartner, total: fourSkill.length + gartner.length };
  }

  function currentQuestionList() {
    const all = getAllQuestions();
    return state.assessmentType === '4skill' ? all.fourSkill : all.gartner;
  }

  function currentQuestion() {
    const list = currentQuestionList();
    return list[state.questionIndex] || null;
  }

  function currentAnswer() {
    const q = currentQuestion();
    if (!q) return null;
    return state.answers[state.assessmentType].find(a => a.questionId === q.id) || null;
  }

  function globalProgress() {
    const all = getAllQuestions();
    const answered4 = state.answers['4skill'].length;
    const answeredG = state.answers.gartner.length;
    const current = state.assessmentType === '4skill'
      ? state.questionIndex + 1
      : all.fourSkill.length + state.questionIndex + 1;
    return { current, total: all.total, answered: answered4 + answeredG };
  }

  function generateResponseId() {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase();
    return `RES-${ts}-${rand}`;
  }

  function autoNickname() {
    return 'P' + String(Math.floor(Math.random() * 90) + 10);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  // ─── Persistence ────────────────────────────────────────────
  function buildResponseDoc() {
    const all = getAllQuestions();
    const answers = [
      ...state.answers['4skill'],
      ...state.answers.gartner
    ];
    const startedAt = state.startedAt;
    const submittedAt = nowIso();
    const durationSec = startedAt
      ? Math.round((new Date(submittedAt) - new Date(startedAt)) / 1000)
      : 0;

    return {
      responseId: state.responseId,
      participant: { ...state.participant },
      phase: state.phase,
      answers,
      startedAt,
      submittedAt,
      durationSec,
      questionCount: all.total,
      version: '2026.04.1'
    };
  }

  function saveLocal() {
    try {
      const doc = buildResponseDoc();
      localStorage.setItem(LS_KEY_PREFIX + state.responseId, JSON.stringify(doc));
      localStorage.setItem(LS_DRAFT_KEY, JSON.stringify({ ...state }));
      state = { ...state, lastSavedAt: nowIso() };
    } catch (err) {
      console.warn('localStorage save failed:', err);
    }
  }

  async function saveRemote() {
    if (typeof db === 'undefined' || !db) return false;
    try {
      const doc = buildResponseDoc();
      await db.collection('assessmentResponses').doc(state.responseId).set({
        ...doc,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore save failed — falling back to local:', err);
      return false;
    }
  }

  async function autoSave() {
    saveLocal();
    await saveRemote();
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function clearDraft() {
    try { localStorage.removeItem(LS_DRAFT_KEY); } catch (err) { /* noop */ }
  }

  // ─── UI rendering ───────────────────────────────────────────
  function showStage(stageName) {
    document.querySelectorAll('.stage').forEach(el => el.removeAttribute('data-active'));
    const target = document.getElementById('stage-' + stageName);
    if (target) target.setAttribute('data-active', '');
    state = { ...state, stage: stageName };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion() {
    const q = currentQuestion();
    if (!q) {
      // End of current assessment → advance or complete
      return advanceAssessment();
    }

    const list = currentQuestionList();
    const prog = globalProgress();

    // Progress bar
    const qCurrent = document.getElementById('q-current');
    const qTotal = document.getElementById('q-total');
    if (qCurrent) qCurrent.textContent = prog.current;
    if (qTotal) qTotal.textContent = prog.total;
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = ((prog.current / prog.total) * 100) + '%';

    // Axis badge
    const axisDot = document.getElementById('axis-dot');
    const axisName = document.getElementById('axis-name');
    if (state.assessmentType === '4skill') {
      const meta = window.QUESTIONS_4SKILL.metadata.axes[q.axis];
      if (axisDot) axisDot.style.background = meta ? meta.color : '#999';
      if (axisName) axisName.textContent = meta ? `${q.axis}. ${meta.nameKo}` : q.axis;
    } else {
      const meta = window.QUESTIONS_GARTNER.metadata.domains[q.domain];
      if (axisDot) axisDot.style.background = '#264653';
      if (axisName) axisName.textContent = meta ? meta.name : (q.domain || 'Gartner');
    }

    // Question text
    const qNumber = document.getElementById('q-number');
    const qText = document.getElementById('q-text');
    if (qNumber) qNumber.textContent = `Q${state.questionIndex + 1} / ${list.length}`;
    if (qText) qText.textContent = q.text;

    // Choices
    const container = document.getElementById('q-choices');
    if (container) {
      container.innerHTML = '';
      const answer = currentAnswer();
      const choices = state.assessmentType === '4skill'
        ? window.QUESTIONS_4SKILL.scaleLabels
        : q.choices;

      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.dataset.value = String(choice.value);
        if (answer && answer.value === choice.value) {
          btn.classList.add('selected');
        }
        btn.innerHTML = `
          <span class="choice-value">${choice.value}</span>
          <span class="choice-label">${choice.label}</span>
        `;
        btn.addEventListener('click', () => selectChoice(choice.value));
        container.appendChild(btn);
      });
    }

    // Hint area — clear until answered
    const hint = document.getElementById('q-hint');
    if (hint) hint.innerHTML = '';

    // Button states
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    const isFirstOverall = state.assessmentType === '4skill' && state.questionIndex === 0;
    if (prev) prev.disabled = isFirstOverall;
    if (next) next.disabled = !currentAnswer();
  }

  function selectChoice(value) {
    const q = currentQuestion();
    if (!q) return;
    const bucket = state.assessmentType;
    const existing = state.answers[bucket].find(a => a.questionId === q.id);
    const newAnswer = {
      questionId: q.id,
      value,
      answeredAt: nowIso()
    };
    const updatedList = existing
      ? state.answers[bucket].map(a => a.questionId === q.id ? newAnswer : a)
      : [...state.answers[bucket], newAnswer];

    state = {
      ...state,
      answers: { ...state.answers, [bucket]: updatedList }
    };

    // UI update
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.classList.toggle('selected', Number(btn.dataset.value) === value);
    });
    const next = document.getElementById('btn-next');
    if (next) next.disabled = false;

    // Auto-save (debounced via fire-and-forget)
    autoSave();
  }

  function advanceAssessment() {
    if (state.assessmentType === '4skill') {
      state = { ...state, assessmentType: 'gartner', questionIndex: 0 };
      renderQuestion();
    } else {
      completeAssessment();
    }
  }

  // ─── Completion ─────────────────────────────────────────────
  async function completeAssessment() {
    // Build summary
    const fourSkillQs = window.QUESTIONS_4SKILL.questions;
    const gartnerQs = window.QUESTIONS_GARTNER.questions;
    const summary4Skill = window.FlowScoring.buildScoreSummary(
      state.answers['4skill'], fourSkillQs
    );
    const gartnerScore = window.FlowScoring.computeGartnerLevel(state.answers.gartner);

    // Anomaly detection
    const responseDoc = buildResponseDoc();
    const flags = window.FlowAnomalyDetector.detectAllAnomalies(
      responseDoc,
      [...fourSkillQs, ...gartnerQs]
    );
    state = { ...state, anomalyFlags: flags };

    // Evaluate hints
    const context = {
      scope: 'assessment_complete',
      assessmentType: '4skill',
      answers: [...state.answers['4skill'], ...state.answers.gartner],
      questions: [...fourSkillQs, ...gartnerQs],
      scoreSummary: summary4Skill,
      gartnerAvgLevel: gartnerScore.avgLevel,
      durationSec: responseDoc.durationSec
    };
    const hints = window.FlowHintEngine.evaluateAndRender(
      context, window.HINT_RULES, { maxDisplay: 3 }
    );

    // Final persist with enriched data
    await persistFinal({
      summary4Skill,
      gartnerScore,
      anomalyFlags: flags,
      hints
    });

    renderCompleteStage({ summary4Skill, gartnerScore, hints, flags });
    showStage('complete');
    clearDraft();
  }

  async function persistFinal(enrichment) {
    const doc = {
      ...buildResponseDoc(),
      scoreSummary: enrichment.summary4Skill,
      gartnerScore: enrichment.gartnerScore,
      anomalyFlags: enrichment.anomalyFlags,
      hints: enrichment.hints,
      status: 'submitted'
    };
    try {
      localStorage.setItem(LS_KEY_PREFIX + state.responseId, JSON.stringify(doc));
    } catch (err) { /* noop */ }

    if (typeof db !== 'undefined' && db) {
      try {
        await db.collection('assessmentResponses').doc(state.responseId).set({
          ...doc,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Final save to Firestore failed — localStorage retained:', err);
      }
    }
  }

  function renderCompleteStage({ summary4Skill, gartnerScore, hints, flags }) {
    const container = document.getElementById('complete-summary');
    if (!container) return;

    const axes = window.QUESTIONS_4SKILL.metadata.axes;
    const axisRows = Object.keys(axes).map(axisKey => {
      const entry = summary4Skill.byAxis[axisKey];
      const level = entry && summary4Skill.axisLevels[axisKey];
      const avg = entry ? entry.avg.toFixed(2) : '–';
      return `
        <div class="axis-row">
          <span class="axis-pill" style="background:${axes[axisKey].color}">${axisKey}</span>
          <span class="axis-label">${axes[axisKey].nameKo}</span>
          <span class="axis-score">${avg} / 5.0</span>
          <span class="axis-level">${level ? level.level : ''}</span>
        </div>
      `;
    }).join('');

    const hintHtml = hints.length ? `
      <div class="hint-section">
        <h3>🎯 Do & Don't</h3>
        ${hints.map(h => `
          <div class="hint-card">
            <div class="hint-do"><strong>✅ Do:</strong> ${(h.do && h.do.ko) || ''}</div>
            <div class="hint-dont"><strong>❌ Don't:</strong> ${(h.dont && h.dont.ko) || ''}</div>
            <div class="hint-citation">📚 ${h.citation || ''}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const flagHtml = flags.length ? `
      <div class="flag-section">
        <h4>⚠️ 응답 품질 점검</h4>
        ${flags.map(f => `<div class="flag-item flag-${f.severity}">${f.message}</div>`).join('')}
      </div>
    ` : '';

    container.innerHTML = `
      <div class="summary-header">
        <div class="summary-total">
          <div class="total-score">${summary4Skill.total} / ${summary4Skill.maxPossible}</div>
          <div class="total-level">Overall ${summary4Skill.overallLevel}</div>
        </div>
        <div class="summary-gartner">
          <div class="gartner-label">조직 성숙도</div>
          <div class="gartner-level">${gartnerScore.classification}</div>
          <div class="gartner-avg">평균 ${gartnerScore.avgLevel} / 5.0</div>
        </div>
      </div>
      <div class="axis-breakdown">${axisRows}</div>
      ${hintHtml}
      ${flagHtml}
    `;

    const reportLink = document.getElementById('btn-view-report');
    if (reportLink) {
      reportLink.href = `/report.html?id=${encodeURIComponent(state.responseId)}`;
    }
  }

  // ─── Toast ──────────────────────────────────────────────────
  let toastTimer = null;
  function showToast(msg, ms = 2200) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), ms);
  }

  // ─── Public API (FlowApp) ───────────────────────────────────
  const FlowApp = {
    async init() {
      if (typeof initFirebase === 'function') initFirebase();

      // Draft recovery
      const draft = loadDraft();
      if (draft && draft.responseId && draft.stage === 'questions') {
        const resume = confirm('이전 진행 중인 진단이 있습니다. 이어서 진행할까요?');
        if (resume) {
          state = draft;
          showStage('questions');
          renderQuestion();
          return;
        } else {
          clearDraft();
        }
      }

      // Wire intro form
      const form = document.getElementById('form-participant');
      if (form) form.addEventListener('submit', FlowApp.startAssessment);

      // Workshop code uppercasing
      const codeInput = document.getElementById('workshop-code');
      if (codeInput) {
        codeInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
        });
      }

      showStage('intro');
    },

    startAssessment(evt) {
      if (evt && evt.preventDefault) evt.preventDefault();

      const name = (document.getElementById('participant-name').value || '').trim();
      const dept = (document.getElementById('participant-dept').value || '').trim();
      const role = document.getElementById('participant-role').value;
      const code = (document.getElementById('workshop-code').value || '').trim().toUpperCase();

      if (!dept) { showToast('소속 본부/부서를 입력해주세요.'); return; }
      if (!/^[A-Z0-9]{4}$/.test(code)) { showToast('워크숍 코드 4자리를 확인해주세요.'); return; }

      state = {
        ...state,
        responseId: generateResponseId(),
        participant: {
          name: name || autoNickname(),
          dept,
          role,
          workshopCode: code
        },
        startedAt: nowIso(),
        stage: 'questions',
        assessmentType: '4skill',
        questionIndex: 0
      };

      autoSave();
      showStage('questions');
      renderQuestion();
    },

    nextQuestion() {
      if (!currentAnswer()) {
        showToast('응답을 선택해주세요.');
        return;
      }
      const list = currentQuestionList();
      if (state.questionIndex < list.length - 1) {
        state = { ...state, questionIndex: state.questionIndex + 1 };
        renderQuestion();
      } else {
        advanceAssessment();
      }
    },

    prevQuestion() {
      if (state.assessmentType === 'gartner' && state.questionIndex === 0) {
        // Jump back into 4skill tail
        const prevList = window.QUESTIONS_4SKILL.questions;
        state = {
          ...state,
          assessmentType: '4skill',
          questionIndex: prevList.length - 1
        };
        renderQuestion();
        return;
      }
      if (state.questionIndex > 0) {
        state = { ...state, questionIndex: state.questionIndex - 1 };
        renderQuestion();
      }
    },

    goBack() {
      if (state.stage === 'questions') {
        const confirmExit = confirm('진단을 중단하시겠습니까? 응답은 저장됩니다.');
        if (confirmExit) {
          saveLocal();
          showStage('intro');
        }
      } else {
        showStage('intro');
      }
    },

    async manualSave() {
      await autoSave();
      showToast('💾 저장되었습니다 — ' + (state.lastSavedAt || '').slice(11, 19));
    },

    exitApp() {
      clearDraft();
      window.location.href = '/';
    },

    // Exposed for debugging
    _getState() { return { ...state }; }
  };

  window.FlowApp = FlowApp;
})();
