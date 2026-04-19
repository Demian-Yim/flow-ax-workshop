/**
 * FLOW~ AX Platform — Report Controller
 *
 * Loads a submitted assessmentResponse and renders:
 *  - Meta (participant, date, duration)
 *  - Overall score + Gartner stage
 *  - 4-Skill radar chart (pre vs post overlay if applicable)
 *  - Axis breakdown with level + hints
 *  - PGI (if post phase + pre available)
 *  - Do & Don't personalized hints
 *  - Anomaly flags
 *  - PDF export
 *
 * Loading precedence:
 *  1. Query string ?id=RES-xxx
 *  2. localStorage flow-ax-assessment-{id}
 *  3. Firestore assessmentResponses/{id}
 *
 * @module app/report
 */

(function () {
  'use strict';

  let chartInstance = null;
  let currentDoc = null;

  // ─── Utilities ──────────────────────────────────────────────
  function qs(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function show(id) {
    const el = document.getElementById(id);
    if (el) el.hidden = false;
  }
  function hide(id) {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  }
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    } catch (err) {
      return String(iso).slice(0, 16);
    }
  }

  function formatDuration(sec) {
    if (!sec || sec < 0) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      return `${h}시간 ${m % 60}분`;
    }
    return `${m}분 ${s}초`;
  }

  // ─── Data loading ───────────────────────────────────────────
  function loadLocal(id) {
    try {
      const raw = localStorage.getItem('flow-ax-assessment-' + id);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  async function loadRemote(id) {
    if (typeof db === 'undefined' || !db) return null;
    try {
      const doc = await db.collection('assessmentResponses').doc(id).get();
      if (!doc.exists) return null;
      const data = doc.data();
      // Convert Firestore Timestamps to ISO where needed
      if (data.submittedAt && data.submittedAt.toDate) {
        data.submittedAt = data.submittedAt.toDate().toISOString();
      }
      if (data.startedAt && data.startedAt.toDate) {
        data.startedAt = data.startedAt.toDate().toISOString();
      }
      return data;
    } catch (err) {
      console.warn('Firestore load failed:', err);
      return null;
    }
  }

  async function loadPrePostPair(doc) {
    // Try to find a "pre" response for the same participant when the current is post.
    // Uses Firestore query on participant.workshopCode + participant.dept + phase.
    if (!doc || doc.phase !== 'post') return null;
    if (typeof db === 'undefined' || !db) return null;

    try {
      const snap = await db.collection('assessmentResponses')
        .where('participant.workshopCode', '==', doc.participant.workshopCode)
        .where('participant.dept', '==', doc.participant.dept)
        .where('participant.name', '==', doc.participant.name)
        .where('phase', '==', 'pre')
        .limit(1)
        .get();
      if (snap.empty) return null;
      return snap.docs[0].data();
    } catch (err) {
      return null;
    }
  }

  // ─── Rendering ──────────────────────────────────────────────
  function renderMeta(doc) {
    const p = doc.participant || {};
    setText('m-name', p.name || '—');
    setText('m-dept', p.dept || '—');
    setText('m-date', formatDate(doc.submittedAt || doc.startedAt));
    setText('m-duration', formatDuration(doc.durationSec));
    setText('r-id', doc.responseId || '—');
  }

  function renderScore(summary, gartner) {
    setText('s-total', summary.total);
    setText('s-max', summary.maxPossible);
    setText('s-level', summary.overallLevel);
    const levelNames = {
      L1: '미경험', L2: '입문', L3: '활용', L4: '전문', L5: '혁신'
    };
    setText('s-level-name', levelNames[summary.overallLevel] || '');

    setText('g-stage', gartner.classification);
    setText('g-avg', gartner.avgLevel.toFixed(2));
  }

  function renderRadar(summary, preSummary) {
    const ctx = document.getElementById('radar-chart');
    if (!ctx || !window.Chart) return;

    const axes = window.QUESTIONS_4SKILL.metadata.axes;
    const axisKeys = Object.keys(axes);
    const labels = axisKeys.map(k => `${k}. ${axes[k].nameKo}`);
    const values = axisKeys.map(k => {
      const entry = summary.byAxis[k];
      return entry ? Math.round(entry.avg * 100) / 100 : 0;
    });

    const datasets = [{
      label: '현재',
      data: values,
      backgroundColor: 'rgba(227,255,56,0.28)',
      borderColor: 'rgba(227,255,56,1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(227,255,56,1)',
      pointBorderColor: '#000',
      pointRadius: 5
    }];

    if (preSummary) {
      const preValues = axisKeys.map(k => {
        const e = preSummary.byAxis[k];
        return e ? Math.round(e.avg * 100) / 100 : 0;
      });
      datasets.unshift({
        label: '사전',
        data: preValues,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.6)',
        borderWidth: 2,
        borderDash: [6, 4],
        pointBackgroundColor: 'rgba(255,255,255,0.8)',
        pointRadius: 3
      });
    }

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1,
              color: 'rgba(255,255,255,0.4)',
              backdropColor: 'transparent',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            },
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: {
              color: '#FFFFFF',
              font: { family: "'Space Grotesk', sans-serif", size: 13, weight: '600' }
            }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#FFFFFF', font: { family: "'Space Grotesk', sans-serif", size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.r.toFixed(2)}`
            }
          }
        }
      }
    });

    // Legend with axis colors
    const legendEl = document.getElementById('chart-legend');
    if (legendEl) {
      legendEl.innerHTML = axisKeys.map(k => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${axes[k].color}"></span>
          <span class="legend-label">${k}</span>
          <span class="legend-name">${axes[k].nameKo}</span>
        </div>
      `).join('');
    }
  }

  function renderAxisBreakdown(summary, preSummary) {
    const listEl = document.getElementById('axis-list');
    if (!listEl) return;

    const axes = window.QUESTIONS_4SKILL.metadata.axes;
    listEl.innerHTML = Object.keys(axes).map(k => {
      const entry = summary.byAxis[k];
      const avg = entry ? entry.avg : 0;
      const sum = entry ? entry.sum : 0;
      const level = summary.axisLevels[k] || { level: '-', name: '-', hint: '' };
      const fillPct = Math.round((avg / 5) * 100);

      let deltaHtml = '';
      if (preSummary && preSummary.byAxis[k]) {
        const delta = window.FlowScoring.computeAxisDelta(
          preSummary.byAxis[k].avg, avg
        );
        const arrow = delta.direction === 'improved' ? '▲'
                    : delta.direction === 'declined' ? '▼'
                    : '—';
        const cls = 'delta-' + delta.direction;
        deltaHtml = `<span class="axis-delta ${cls}">${arrow} ${Math.abs(delta.delta).toFixed(2)}</span>`;
      }

      return `
        <div class="axis-item">
          <div class="axis-head">
            <span class="axis-pill" style="background:${axes[k].color}">${k}</span>
            <div class="axis-name-group">
              <div class="axis-name">${axes[k].nameKo}</div>
              <div class="axis-name-en">${axes[k].name}</div>
            </div>
            <div class="axis-score-group">
              <div class="axis-avg">${avg.toFixed(2)}</div>
              <div class="axis-sum">${sum} / 25</div>
            </div>
            ${deltaHtml}
          </div>
          <div class="axis-bar">
            <div class="axis-bar-fill" style="width:${fillPct}%; background:${axes[k].color}"></div>
          </div>
          <div class="axis-level-row">
            <span class="axis-level-badge">${level.level}</span>
            <span class="axis-level-name">${level.name}</span>
            <span class="axis-level-hint">${level.hint}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderPGI(preDoc, postDoc) {
    if (!preDoc || !postDoc) { hide('pgi-card'); return; }

    const preTotal = (preDoc.scoreSummary && preDoc.scoreSummary.total)
      || recomputeTotal(preDoc);
    const postTotal = (postDoc.scoreSummary && postDoc.scoreSummary.total)
      || recomputeTotal(postDoc);
    const max = (preDoc.scoreSummary && preDoc.scoreSummary.maxPossible) || 100;

    const pgi = window.FlowScoring.computePGI(preTotal, postTotal, max);
    show('pgi-card');
    setText('pgi-number', pgi.pgi);
    setText('pgi-grade', pgi.grade.toUpperCase());
    setText('pgi-desc', pgi.description);

    const gradeEl = document.getElementById('pgi-grade');
    if (gradeEl) gradeEl.className = 'pgi-grade pgi-grade-' + pgi.grade;
  }

  function recomputeTotal(doc) {
    const only4 = (doc.answers || []).filter(a =>
      (a.questionId || '').startsWith('4skill-')
    );
    return only4.reduce((s, a) => s + (a.value || 0), 0);
  }

  function renderHints(hints) {
    const el = document.getElementById('hints-list');
    if (!el) return;
    if (!hints || !hints.length) {
      el.innerHTML = `<div class="no-hints">맞춤 힌트가 없습니다. 축별 점수가 고르게 분포되어 있어 일반적 행동 권고를 참고하세요.</div>`;
      return;
    }
    el.innerHTML = hints.map(h => `
      <div class="hint-card">
        <div class="hint-badge">규칙 ${h.ruleId}</div>
        <div class="hint-do">
          <strong>✅ Do:</strong>
          <span>${(h.do && h.do.ko) || ''}</span>
        </div>
        <div class="hint-dont">
          <strong>❌ Don't:</strong>
          <span>${(h.dont && h.dont.ko) || ''}</span>
        </div>
        <div class="hint-citation">📚 ${h.citation || ''}</div>
      </div>
    `).join('');
  }

  function renderFlags(flags) {
    if (!flags || !flags.length) { hide('flags-card'); return; }
    show('flags-card');
    const el = document.getElementById('flags-list');
    if (!el) return;
    el.innerHTML = flags.map(f => `
      <div class="flag-item flag-${f.severity}">
        <span class="flag-severity">${f.severity.toUpperCase()}</span>
        <span class="flag-msg">${f.message}</span>
      </div>
    `).join('');
  }

  // ─── Orchestration ──────────────────────────────────────────
  function buildContext(doc) {
    const fourSkillQs = window.QUESTIONS_4SKILL.questions;
    const gartnerQs = window.QUESTIONS_GARTNER.questions;

    const only4 = (doc.answers || []).filter(a =>
      (a.questionId || '').startsWith('4skill-')
    );
    const onlyG = (doc.answers || []).filter(a =>
      (a.questionId || '').startsWith('gartner-')
    );

    const summary = doc.scoreSummary
      || window.FlowScoring.buildScoreSummary(only4, fourSkillQs);
    const gartner = doc.gartnerScore
      || window.FlowScoring.computeGartnerLevel(onlyG);

    const hints = doc.hints || window.FlowHintEngine.evaluateAndRender({
      scope: 'assessment_complete',
      assessmentType: '4skill',
      answers: doc.answers || [],
      questions: [...fourSkillQs, ...gartnerQs],
      scoreSummary: summary,
      gartnerAvgLevel: gartner.avgLevel,
      durationSec: doc.durationSec
    }, window.HINT_RULES, { maxDisplay: 5 });

    const flags = doc.anomalyFlags || window.FlowAnomalyDetector.detectAllAnomalies(
      doc, [...fourSkillQs, ...gartnerQs]
    );

    return { summary, gartner, hints, flags };
  }

  async function render(doc, preDoc) {
    currentDoc = doc;
    hide('report-loading');
    hide('report-error');
    show('report-content');

    const { summary, gartner, hints, flags } = buildContext(doc);
    const preCtx = preDoc ? buildContext(preDoc) : null;

    renderMeta(doc);
    renderScore(summary, gartner);
    renderRadar(summary, preCtx && preCtx.summary);
    renderAxisBreakdown(summary, preCtx && preCtx.summary);
    renderPGI(preDoc, doc);
    renderHints(hints);
    renderFlags(flags);
  }

  function showError(msg) {
    hide('report-loading');
    hide('report-content');
    show('report-error');
    setText('error-msg', msg);
  }

  // ─── Public API ─────────────────────────────────────────────
  const FlowReport = {
    async init() {
      if (typeof initFirebase === 'function') initFirebase();

      const id = qs('id');
      if (!id) {
        showError('URL에 응답 ID가 없습니다. (?id=RES-...)');
        return;
      }

      // Try local first (fast), fall back to remote
      let doc = loadLocal(id);
      if (!doc) doc = await loadRemote(id);

      if (!doc) {
        showError('응답 ID "' + id + '"에 해당하는 결과를 찾을 수 없습니다.');
        return;
      }

      const preDoc = await loadPrePostPair(doc);
      await render(doc, preDoc);
    },

    exportPDF() {
      if (!currentDoc) return;
      const el = document.getElementById('report-content');
      if (!el || !window.html2pdf) {
        window.print();
        return;
      }
      const filename = `FLOW-AX-Report-${currentDoc.participant.name || 'P'}-${(currentDoc.submittedAt || '').slice(0, 10)}.pdf`;
      window.html2pdf()
        .from(el)
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, backgroundColor: '#000000' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save();
    }
  };

  window.FlowReport = FlowReport;
})();
