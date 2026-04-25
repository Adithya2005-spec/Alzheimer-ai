/* dashboard.js — Stats + Chart.js via AJAX */

(function () {
  const COLORS = { CN:'#00c896', MCI:'#f59e0b', 'Mild-AD':'#ef4444', 'Moderate-AD':'#dc2626' };
  const CHART_DEFAULTS = {
    color: '#94a3b8',
    font: { family: "'IBM Plex Mono', monospace", size: 10 },
  };
  Chart.defaults.color = CHART_DEFAULTS.color;
  Chart.defaults.font  = CHART_DEFAULTS.font;

  // Set nav user
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navUser = document.getElementById('nav-user');
  if (navUser && user.name) navUser.textContent = user.name.toUpperCase();

  let doughnutChart, lineChart, barChart;

  function classBadge(cls) {
    const map = { CN:'badge-cn', MCI:'badge-mci', 'Mild-AD':'badge-mild', 'Moderate-AD':'badge-mod' };
    return `<span class="badge ${map[cls] || ''}">${cls}</span>`;
  }

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  async function loadStats() {
    try {
      const res  = await fetch('/api/stats');
      const data = await res.json();

      // Stat cards
      animateCount('stat-total', 0, data.total_predictions, 600);
      animateCount('stat-conf',  0, Math.round(data.avg_confidence * 100), 600, '%');
      animateCount('stat-mci',   0, (data.by_class['MCI'] || 0), 500);
      const ad = (data.by_class['Mild-AD'] || 0) + (data.by_class['Moderate-AD'] || 0);
      animateCount('stat-ad', 0, ad, 500);

      buildDoughnut(data.by_class);
      buildBar(data.by_class);
    } catch (e) { console.error('Stats error:', e); }
  }

  // ── Fetch recent predictions ─────────────────────────────────────────────────
  async function loadRecent() {
    try {
      const res  = await fetch('/api/history');
      const data = await res.json();
      const preds = data.predictions || [];

      // Table
      const tbody = document.getElementById('recent-tbody');
      if (!preds.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading-row">No predictions yet</td></tr>'; return; }
      tbody.innerHTML = preds.slice(0, 8).map(p => `
        <tr>
          <td>${p.patient_id}</td>
          <td>${classBadge(p.predicted_class)}</td>
          <td>${(p.confidence * 100).toFixed(1)}%</td>
          <td>${classBadge(p.rf_class || '—')}</td>
          <td>${classBadge(p.lr_class || '—')}</td>
          <td>${p.created_at ? p.created_at.slice(0, 16) : '—'}</td>
        </tr>`).join('');

      buildLine(preds.slice(0, 10).reverse());
    } catch (e) { console.error('History error:', e); }
  }

  // ── Charts ──────────────────────────────────────────────────────────────────
  function buildDoughnut(byClass) {
    const labels = Object.keys(byClass);
    const data   = Object.values(byClass);
    if (doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(document.getElementById('chart-doughnut'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: labels.map(l => COLORS[l] + '99'), borderColor: labels.map(l => COLORS[l]), borderWidth: 1.5 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14, font: { size: 9 } } } }
      }
    });
  }

  function buildLine(preds) {
    const labels = preds.map((_, i) => `#${i + 1}`);
    const confs  = preds.map(p => (p.confidence * 100).toFixed(1));
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById('chart-line'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Confidence %', data: confs,
          borderColor: '#00c8ff', backgroundColor: 'rgba(0,200,255,0.08)',
          borderWidth: 1.5, pointRadius: 3, pointBackgroundColor: '#00c8ff', fill: true, tension: 0.4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { color: 'rgba(255,255,255,0.03)' } } },
        plugins: { legend: { display: false } }
      }
    });
  }

  function buildBar(byClass) {
    const labels = ['CN', 'MCI', 'Mild-AD', 'Moderate-AD'];
    if (barChart) barChart.destroy();
    barChart = new Chart(document.getElementById('chart-bar'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Count', data: labels.map(l => byClass[l] || 0),
            backgroundColor: labels.map(l => COLORS[l] + '55'), borderColor: labels.map(l => COLORS[l]), borderWidth: 1 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { color: 'rgba(255,255,255,0.03)' } } },
        plugins: { legend: { display: false } }
      }
    });
  }

  // ── Animate count ────────────────────────────────────────────────────────────
  function animateCount(id, from, to, duration, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    const start = performance.now();
    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(from + (to - from) * t) + suffix;
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  loadStats();
  loadRecent();
  // Auto-refresh every 30s
  setInterval(() => { loadStats(); loadRecent(); }, 30000);
})();
