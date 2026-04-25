/* signin.js — Auth form logic with AJAX */

(function () {
  let currentTab = 'signin';

  const tabBtns      = document.querySelectorAll('.tab-btn');
  const signupOnly   = document.querySelectorAll('.signup-only');
  const signinOnly   = document.querySelectorAll('.signin-only');
  const formTitle    = document.getElementById('form-title');
  const formDesc     = document.getElementById('form-desc');
  const form         = document.getElementById('auth-form');
  const successDiv   = document.getElementById('auth-success');
  const successName  = document.getElementById('success-name');
  const submitBtn    = document.getElementById('submit-btn');
  const btnText      = document.getElementById('btn-text');
  const progressWrap = document.getElementById('progress-wrap');
  const progressBar  = document.getElementById('progress-bar');
  const progressPct  = document.getElementById('progress-pct');
  const progressLbl  = document.getElementById('progress-label');
  const togglePass   = document.getElementById('toggle-pass');
  const passInput    = document.getElementById('password');

  // ── Tab switching ───────────────────────────────────────────────────────────
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      signupOnly.forEach(el => el.style.display = currentTab === 'signup' ? 'block' : 'none');
      signinOnly.forEach(el => el.style.display = currentTab === 'signin' ? 'block' : 'none');
      formTitle.textContent = currentTab === 'signin' ? 'SYSTEM ACCESS' : 'CREATE ACCOUNT';
      formDesc.textContent  = currentTab === 'signin' ? 'AUTHORIZED MEDICAL PERSONNEL ONLY' : 'REGISTER AS CLINICIAN OR RESEARCHER';
      btnText.textContent   = currentTab === 'signin' ? '▶ INITIATE SESSION' : '◈ CREATE ACCOUNT';
      clearErrors();
    });
  });

  // ── Show/hide password ──────────────────────────────────────────────────────
  togglePass && togglePass.addEventListener('click', () => {
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    togglePass.textContent = show ? 'HIDE' : 'SHOW';
  });

  // ── Validation ──────────────────────────────────────────────────────────────
  function clearErrors() {
    ['email','password','name','institution'].forEach(f => {
      const el = document.getElementById('err-' + f);
      if (el) el.textContent = '';
    });
  }

  function validate() {
    clearErrors();
    let ok = true;
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value;
    if (!email.includes('@')) { setErr('email', 'Valid email required'); ok = false; }
    if (pass.length < 6)     { setErr('password', 'Minimum 6 characters'); ok = false; }
    if (currentTab === 'signup') {
      const name = document.getElementById('name') && document.getElementById('name').value.trim();
      const inst = document.getElementById('institution') && document.getElementById('institution').value.trim();
      if (!name) { setErr('name', 'Name is required'); ok = false; }
      if (!inst) { setErr('institution', 'Institution is required'); ok = false; }
    }
    return ok;
  }

  function setErr(field, msg) {
    const el = document.getElementById('err-' + field);
    if (el) el.textContent = '⚠ ' + msg;
  }

  // ── Progress animation ──────────────────────────────────────────────────────
  function animateProgress(onComplete) {
    progressWrap.style.display = 'block';
    let p = 0;
    const steps = ['VERIFYING CREDENTIALS', 'CHECKING DATABASE', 'GRANTING ACCESS'];
    const interval = setInterval(() => {
      p += Math.random() * 16 + 5;
      if (p > 100) p = 100;
      progressBar.style.width = p + '%';
      progressPct.textContent = Math.round(p) + '%';
      if (p < 40) progressLbl.textContent = steps[0];
      else if (p < 75) progressLbl.textContent = steps[1];
      else progressLbl.textContent = steps[2];
      if (p >= 100) { clearInterval(interval); setTimeout(onComplete, 300); }
    }, 110);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled = true;
    btnText.innerHTML = '<div class="btn-spinner"></div> VERIFYING...';

    const payload = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    };
    if (currentTab === 'signup') {
      payload.name        = document.getElementById('name').value.trim();
      payload.institution = document.getElementById('institution').value.trim();
    }

    try {
      const endpoint = currentTab === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErr('email', data.error || 'Authentication failed');
        submitBtn.disabled = false;
        btnText.textContent = currentTab === 'signin' ? '▶ INITIATE SESSION' : '◈ CREATE ACCOUNT';
        progressWrap.style.display = 'none';
        return;
      }

      // Store user session
      sessionStorage.setItem('user', JSON.stringify(data.user));

      animateProgress(() => {
        form.style.display = 'none';
        successDiv.style.display = 'block';
        successName.textContent = 'WELCOME, ' + (data.user.name || data.user.email).toUpperCase();
        setTimeout(() => { window.location.href = '/dashboard'; }, 1400);
      });

    } catch (err) {
      setErr('email', 'Network error — is the server running?');
      submitBtn.disabled = false;
      btnText.textContent = '▶ INITIATE SESSION';
    }
  });

  // ── Input focus effects ─────────────────────────────────────────────────────
  document.querySelectorAll('.neo-input').forEach(inp => {
    inp.addEventListener('focus', () => {
      const lbl = inp.closest('.field-group') && inp.closest('.field-group').querySelector('.field-label');
      if (lbl) lbl.style.color = '#00c8ff';
    });
    inp.addEventListener('blur', () => {
      const lbl = inp.closest('.field-group') && inp.closest('.field-group').querySelector('.field-label');
      if (lbl) lbl.style.color = '';
    });
  });
})();
