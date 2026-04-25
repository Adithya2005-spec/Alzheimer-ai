/* neural-bg.js — Shared neural particle canvas + brain hex + mini wave */

(function () {
  // ── Neural particle canvas ──────────────────────────────────────────────────
  const canvas = document.getElementById('neural-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animId;
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const nodes = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.8 + 0.7,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      nodes.forEach((a, i) => {
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 125) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,200,255,${(1 - d / 125) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const g = 0.3 + 0.22 * Math.sin(a.pulse);
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,255,${g})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
  }

  // ── Brain hex canvas (auth page) ────────────────────────────────────────────
  const hexCanvas = document.getElementById('brain-hex');
  if (hexCanvas) {
    const ctx = hexCanvas.getContext('2d');
    const S = 160, cx = S / 2, cy = S / 2;
    let frame = 0;
    function drawHex() {
      ctx.clearRect(0, 0, S, S);
      const t = frame * 0.02;
      // Outer hex
      const hexR = 66;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t * 0.3;
        i === 0 ? ctx.moveTo(cx + hexR * Math.cos(a), cy + hexR * Math.sin(a))
                : ctx.lineTo(cx + hexR * Math.cos(a), cy + hexR * Math.sin(a));
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,200,255,0.45)'; ctx.lineWidth = 1; ctx.stroke();
      // Inner hex
      const inR = 48;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - t * 0.5;
        i === 0 ? ctx.moveTo(cx + inR * Math.cos(a), cy + inR * Math.sin(a))
                : ctx.lineTo(cx + inR * Math.cos(a), cy + inR * Math.sin(a));
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,200,255,0.18)'; ctx.lineWidth = 0.8; ctx.stroke();
      // Orbit dots
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t;
        ctx.beginPath();
        ctx.arc(cx + hexR * Math.cos(a), cy + hexR * Math.sin(a), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00c8ff'; ctx.fill();
      }
      // Neural arcs
      for (let i = 0; i < 5; i++) {
        const a1 = (i / 5) * Math.PI * 2 + t * 0.4;
        const a2 = ((i + 2) / 5) * Math.PI * 2 + t * 0.4;
        const r = 28;
        ctx.beginPath();
        ctx.moveTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1));
        ctx.quadraticCurveTo(cx, cy, cx + r * Math.cos(a2), cy + r * Math.sin(a2));
        ctx.strokeStyle = `rgba(0,200,255,${0.07 + 0.04 * Math.sin(t + i)})`;
        ctx.lineWidth = 0.8; ctx.stroke();
      }
      // Glow + brain
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      grd.addColorStop(0, 'rgba(0,200,255,0.2)'); grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill();
      ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🧠', cx, cy);
      frame++;
      requestAnimationFrame(drawHex);
    }
    drawHex();
  }

  // ── Mini wave (auth + header) ────────────────────────────────────────────────
  ['mini-wave', 'header-wave'].forEach(id => {
    const wc = document.getElementById(id);
    if (!wc) return;
    const ctx = wc.getContext('2d');
    let t = 0;
    function drawWave() {
      const W = wc.width, H = wc.height;
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,200,255,0.65)'; ctx.lineWidth = 1.3;
      for (let x = 0; x < W; x++) {
        const y = H / 2 + Math.sin(x * 0.09 + t) * (H * 0.28)
                       + Math.sin(x * 0.22 + t * 1.4) * (H * 0.15);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.065;
      requestAnimationFrame(drawWave);
    }
    drawWave();
  });
})();
