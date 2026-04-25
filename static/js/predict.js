/* predict.js — AJAX prediction + Chart.js results rendering */

(function () {
  const COLORS = { CN:'#00c896', MCI:'#f59e0b', 'Mild-AD':'#ef4444', 'Moderate-AD':'#dc2626' };
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font  = { family: "'IBM Plex Mono', monospace", size: 10 };

  // Nav user
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navUser = document.getElementById('nav-user');
  if (navUser && user.name) navUser.textContent = user.name.toUpperCase();

  let probChart = null;

  // ── Wire up all sliders ──────────────────────────────────────────────────────
  const sliders = ['age','mmse_score','cdr_score','adas_cog13','memory_score',
    'orientation_score','faq_score','judgment_score','ravlt_immediate',
    'education_years','prev_mmse_score','visits_count','sex_encoded'];

  sliders.forEach(id => {
    const el = document.getElementById(id);
    const val = document.getElementById(id + '-val');
    if (!el || !val) return;
    el.addEventListener('input', () => {
      if (id === 'sex_encoded') { val.textContent = el.value === '1' ? 'Female' : 'Male'; }
      else { val.textContent = el.value; }
    });
  });

  // ── Collect form data ────────────────────────────────────────────────────────
  function collectData() {
    const d = { patient_id: document.getElementById('patient_id').value.trim() || 'PT-ANON' };
    sliders.forEach(id => {
      const el = document.getElementById(id);
      if (el) d[id] = parseFloat(el.value);
    });
    d.clinical_notes = document.getElementById('clinical_notes').value;
    return d;
  }

  // ── Submit prediction ────────────────────────────────────────────────────────
  const btn = document.getElementById('predict-btn');
  btn && btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = '⟳ ANALYZING...';

    try {
      const payload = collectData();
      const res  = await fetch('/api/predict/cognitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction failed');
      renderResults(data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = '◈ RUN ANALYSIS';
    }
  });

  // ── Render results ───────────────────────────────────────────────────────────
  function renderResults(data) {
    const panel = document.getElementById('results-panel');
    panel.style.display = 'flex';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const final = data.final;
    const rf    = data.random_forest;
    const lr    = data.logistic_regression;
    const color = COLORS[final.predicted_class] || '#00c8ff';

    // Diagnosis
    const clsEl = document.getElementById('res-class');
    clsEl.textContent = final.predicted_class;
    clsEl.style.color = color;
    clsEl.style.textShadow = `0 0 20px ${color}66`;
    document.getElementById('res-conf').textContent = (final.confidence * 100).toFixed(1) + '% confidence';
    const riskEl = document.getElementById('res-risk');
    riskEl.textContent = final.risk_level + ' RISK';
    riskEl.style.background = color + '18';
    riskEl.style.border = `1px solid ${color}44`;
    riskEl.style.color = color;
    document.getElementById('res-action').textContent = final.recommended_action;

    // Class probabilities chart
    renderProbChart(final.probabilities);

    // Model comparison
    document.getElementById('rf-class').textContent = rf.predicted_class;
    document.getElementById('rf-class').style.color = COLORS[rf.predicted_class] || '#00c8ff';
    document.getElementById('rf-conf').textContent = (rf.confidence * 100).toFixed(1) + '%';
    document.getElementById('lr-class').textContent = lr.predicted_class;
    document.getElementById('lr-class').style.color = COLORS[lr.predicted_class] || '#a5b4fc';
    document.getElementById('lr-conf').textContent = (lr.confidence * 100).toFixed(1) + '%';

    const agreeBadge = document.getElementById('agree-badge');
    agreeBadge.className = final.models_agree ? 'agree-yes chart-sub' : 'agree-no chart-sub';
    agreeBadge.textContent = final.models_agree ? '✓ Models agree' : '⚠ Disagreement';

    document.getElementById('model-weights').textContent =
      `RF weight: ${(final.rf_weight * 100).toFixed(0)}%  ·  LR weight: ${(final.lr_weight * 100).toFixed(0)}%`;

    // Feature importances (RF)
    renderFeatureBars(rf.feature_importances || []);

    // Sentiment
    if (data.sentiment) renderSentiment(data.sentiment);
  }

  function renderProbChart(probs) {
    const labels = Object.keys(probs);
    const values = Object.values(probs).map(v => (v * 100).toFixed(1));
    if (probChart) probChart.destroy();
    probChart = new Chart(document.getElementById('chart-probs'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map(l => (COLORS[l] || '#00c8ff') + '55'),
          borderColor: labels.map(l => COLORS[l] || '#00c8ff'),
          borderWidth: 1.5,
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        scales: {
          x: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + '%' } },
          y: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderFeatureBars(feats) {
    const container = document.getElementById('feat-bars');
    if (!feats.length) { container.innerHTML = '<p style="color:#334155;font-size:10px">No feature data</p>'; return; }
    const max = Math.max(...feats.map(f => f.importance));
    container.innerHTML = feats.map(f => {
      const pct = max > 0 ? (f.importance / max * 100).toFixed(1) : 0;
      return `<div class="feat-bar-row">
        <div class="feat-bar-label">
          <span>${f.feature.replace(/_/g,' ')}</span>
          <span style="color:#00c8ff">${(f.importance * 100).toFixed(1)}%</span>
        </div>
        <div class="feat-bar-track">
          <div class="feat-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
    }).join('');
  }

  function renderSentiment(s) {
    const card = document.getElementById('sentiment-card');
    const cont = document.getElementById('sentiment-content');
    card.style.display = 'block';
    const polColor = s.polarity > 0.1 ? '#00c896' : s.polarity < -0.1 ? '#ef4444' : '#94a3b8';
    cont.innerHTML = `
      <div class="sentiment-header">
        <span class="sentiment-badge" style="background:${s.color}18;border:1px solid ${s.color}44;color:${s.color}">${s.label}</span>
        <span class="sentiment-polarity">Polarity: ${s.polarity} · Subjectivity: ${s.subjectivity}</span>
      </div>
      ${s.matched_keywords.length ? `
        <div style="font-size:9px;color:#334155;letter-spacing:1px;margin-bottom:6px">CLINICAL KEYWORDS DETECTED</div>
        <div class="keyword-tags">${s.matched_keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}</div>
      ` : ''}
      <p class="sentiment-note">${s.interpretation}</p>
      ${s.clinical_concern ? `<div class="clinical-alert">⚠ High clinical concern: ${s.keyword_count} risk keywords detected in notes.</div>` : ''}
    `;
  }
})();
