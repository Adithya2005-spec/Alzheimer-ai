/* history.js — Prediction history with filtering + Chart.js */

(function () {
  const COLORS = { CN:'#00c896', MCI:'#f59e0b', 'Mild-AD':'#ef4444', 'Moderate-AD':'#dc2626' };
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font  = { family: "'IBM Plex Mono', monospace", size: 10 };

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navUser = document.getElementById('nav-user');
  if (navUser && user.name) navUser.textContent = user.name.toUpperCase();

  let allPredictions = [];
  let histChart = null;

  function classBadge(cls) {
    const map = { CN:'badge-cn', MCI:'badge-mci', 'Mild-AD':'badge-mild', 'Moderate-AD':'badge-mod' };
    return cls ? `<span class="badge ${map[cls] || ''}">${cls}</span>` : '—';
  }

  function sentBadge(s) {
    if (!s) return '—';
    try {
      const obj = typeof s === 'string' ? JSON.parse(s) : s;
      return `<span style="font-size:9px;color:${obj.color || '#94a3b8'}">${obj.label || '—'}</span>`;
    } catch { return '—'; }
  }

  async function loadHistory(filter = '') {
    try {
      const res  = await fetch('/api/history');
      const data = await res.json();
      allPredictions = data.predictions || [];

      const filtered = filter
        ? allPredictions.filter(p => p.patient_id.toLowerCase().includes(filter.toLowerCase()))
        : allPredictions;

      document.getElementById('record-count').textContent = `${filtered.length} records`;

      const tbody = document.getElementById('history-tbody');
      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-row">No records found</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(p => `
        <tr>
          <td style="color:#00c8ff">${p.patient_id}</td>
          <td>${classBadge(p.predicted_class)}</td>
          <td>${(p.confidence * 100).toFixed(1)}%<span class="conf-bar" style="width:${(p.confidence * 60).toFixed(0)}px"></span></td>
          <td>${classBadge(p.rf_class)}</td>
          <td>${classBadge(p.lr_class)}</td>
          <td style="color:${p.rf_class === p.lr_class ? '#00c896' : '#f59e0b'};font-size:9px">${p.rf_class === p.lr_class ? '✓ YES' : '⚠ NO'}</td>
          <td>${sentBadge(p.sentiment)}</td>
          <td style="color:#334155">${p.created_at ? p.created_at.slice(0,16) : '—'}</td>
        </tr>`).join('');

      buildHistoryChart(filtered.slice(0, 20).reverse());
    } catch (e) { console.error(e); }
  }

  function buildHistoryChart(preds) {
    const labels = preds.map((_, i) => `#${i + 1}`);
    const classToNum = { CN: 0, MCI: 1, 'Mild-AD': 2, 'Moderate-AD': 3 };
    const nums = preds.map(p => classToNum[p.predicted_class] ?? 0);
    if (histChart) histChart.destroy();
    histChart = new Chart(document.getElementById('chart-history'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Stage (0=CN, 1=MCI, 2=Mild-AD, 3=Mod-AD)',
          data: nums,
          borderColor: '#00c8ff', backgroundColor: 'rgba(0,200,255,0.07)',
          borderWidth: 1.5, pointRadius: 4, fill: true, stepped: true,
          pointBackgroundColor: preds.map(p => COLORS[p.predicted_class] || '#00c8ff'),
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { min: -0.5, max: 3.5, ticks: { stepSize: 1, callback: v => ['CN','MCI','Mild','Mod'][v] ?? v }, grid: { color: 'rgba(255,255,255,0.04)' } },
          x: { grid: { color: 'rgba(255,255,255,0.03)' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  // Filter input
  const filterInput = document.getElementById('patient-filter');
  let debounce;
  filterInput && filterInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => loadHistory(filterInput.value), 300);
  });

  loadHistory();
})();
