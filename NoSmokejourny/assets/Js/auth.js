/**
 * auth.js — LungCare Authentication Logic
 * Covers: login, forgot-password, enter-code, register pages
 */

/* ════════════════════════════════════════════════════
   CONFIG (أضيفي هذا السطر في HTML مش هنا)
   <script src="../config.js"></script>
   ════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════
   SHARED UTILITIES
   ════════════════════════════════════════════════════ */

/* ── Generic alert display ────────────────────────── */
function showAlert(message, type = 'error') {
  const box = document.getElementById('alertBox');
  const text = document.getElementById('alertText');
  if (!box || !text) return;
  text.textContent = message;
  box.className = `alert alert-${type} show`;
}

function hideAlert() {
  const box = document.getElementById('alertBox');
  box?.classList.remove('show');
}

/* ── Button loading state ──────────────────────────── */
function setLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle('loading', isLoading);
  btn.disabled = isLoading;
}

/* ── Email validation ──────────────────────────────── */
function isValidEmail(email) {
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── Get URL query param ───────────────────────────── */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}


/* ════════════════════════════════════════════════════
   LOGIN PAGE  (login.html)
   ════════════════════════════════════════════════════ */

/* ── Password Toggle ──────────────────────────────── */
const togglePwBtn = document.getElementById('togglePw');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');

const EYE_OPEN = `
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>
`;
const EYE_CLOSED = `
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
`;

if (togglePwBtn && passwordInput && eyeIcon) {
  togglePwBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeIcon.innerHTML = isPassword ? EYE_CLOSED : EYE_OPEN;
  });
}

/* ── Login error helpers ──────────────────────────── */
function showError(message) {
  const errorMsg = document.getElementById('errorMsg');
  const errorText = document.getElementById('errorText');
  if (!errorMsg || !errorText) return;
  errorText.textContent = message || 'Invalid email or password.';
  errorMsg.classList.add('show');
  document.getElementById('email')?.classList.add('error-input');
  document.getElementById('password')?.classList.add('error-input');
}

function clearError() {
  document.getElementById('errorMsg')?.classList.remove('show');
  document.getElementById('email')?.classList.remove('error-input');
  document.getElementById('password')?.classList.remove('error-input');
}

document.getElementById('email')?.addEventListener('input', clearError);
document.getElementById('password')?.addEventListener('input', clearError);

/* ── Login Handler (معدل لاستخدام apiRequest) ─────── */
async function handleLogin() {
  clearError();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!isValidEmail(email)) { showError('Please enter a valid email address.'); return; }
  if (!password) { showError('Please enter your password.'); return; }

  setLoading('loginBtn', true);

  try {
    const result = await apiRequest('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    console.log('✅ Login result:', result);

    // The API returns { success, data: { user, token, ... } }
    const authData = result.data || result; // Handle both wrapped and unwrapped for safety

    if (authData?.token) {
      // ✅ FIX: Use consistent token key 'authToken' (realRequest expects this)
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('jwt_token', authData.token); // Keep for backward compatibility

      const user = authData.user;
      if (user) {
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_name', user.name);
        localStorage.setItem('user_role', user.role);
      }

      console.log('✅ Auth data stored:', { token: !!authData.token, role: user?.role });
    }

    const role = (authData?.user?.role || authData?.role)?.toString().toLowerCase();

    if (role === 'admin' || role === '1') {
      window.location.href = '../../page/admin/Admin dashboard .html';
    } else if (role === 'user' || role === '0' || role === 'doctor' || role === '2') {
      window.location.href = '../../index.html';
    } else {
      throw new Error('Login successful but account role is unrecognized.');
    }

  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading('loginBtn', false);
  }
}
/* ════════════════════════════════════════════════════
   FORGOT PASSWORD PAGE  (forgot-password.html)
   ════════════════════════════════════════════════════ */

async function handleRequestCode() {
  hideAlert();
  const emailInput = document.getElementById('email');
  const email = emailInput?.value.trim();

  if (!isValidEmail(email)) {
    showAlert('Please enter a valid email address.');
    emailInput?.classList.add('error-input');
    return;
  }
  emailInput?.classList.remove('error-input');

  setLoading('sendBtn', true);

  try {
    // ✅ استخدام apiRequest
    await apiRequest('/api/password/request-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    /* Redirect and pass email as query param */
    window.location.href = `enter-code.html?email=${encodeURIComponent(email)}`;

  } catch (err) {
    showAlert(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading('sendBtn', false);
  }
}

const sendBtn = document.getElementById('sendBtn');
if (sendBtn) {
  sendBtn.addEventListener('click', handleRequestCode);
  document.getElementById('email')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRequestCode();
  });
}


/* ════════════════════════════════════════════════════
   ENTER CODE PAGE  (enter-code.html)
   ════════════════════════════════════════════════════ */

(function initEnterCodePage() {
  const otpGroup = document.getElementById('otpGroup');
  if (!otpGroup) return; // not on this page

  /* 1. Read email from URL and display it */
  const userEmail = getParam('email');
  const emailDisplay = document.getElementById('emailDisplay');
  if (emailDisplay) emailDisplay.textContent = userEmail || 'your email';

  /* 2. OTP input behaviour */
  const inputs = Array.from(otpGroup.querySelectorAll('.otp-input'));

  inputs[0]?.focus();

  inputs.forEach((input, idx) => {

    input.addEventListener('input', () => {
      const val = input.value.replace(/\D/g, '').slice(-1);
      input.value = val;
      input.classList.toggle('filled', val !== '');
      clearOtpErrors();
      if (val && idx < inputs.length - 1) inputs[idx + 1].focus();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
        inputs[idx - 1].value = '';
        inputs[idx - 1].classList.remove('filled');
      }
      if (e.key === 'Enter') handleVerifyCode();
    });

    /* Handle paste of full code */
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData)
        .getData('text').replace(/\D/g, '').slice(0, inputs.length);
      pasted.split('').forEach((char, i) => {
        if (inputs[i]) { inputs[i].value = char; inputs[i].classList.add('filled'); }
      });
      const nextEmpty = inputs.findIndex(inp => !inp.value);
      (nextEmpty !== -1 ? inputs[nextEmpty] : inputs[inputs.length - 1]).focus();
    });
  });

  function clearOtpErrors() {
    inputs.forEach(inp => inp.classList.remove('error-input'));
    hideAlert();
  }

  function getOtpCode() {
    return inputs.map(inp => inp.value).join('');
  }

  /* 3. Verify code (معدل لاستخدام apiRequest) */
  async function handleVerifyCode() {
    hideAlert();
    const code = getOtpCode();

    if (code.length < inputs.length) {
      inputs.forEach(inp => { if (!inp.value) inp.classList.add('error-input'); });
      showAlert('Please enter all 4 digits of your code.');
      return;
    }

    setLoading('confirmBtn', true);

    try {
      // ✅ استخدام apiRequest
      await apiRequest('/api/password/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email: userEmail, code })
      });

      window.location.href = '../../index.html';

    } catch (err) {
      inputs.forEach(inp => inp.classList.add('error-input'));
      showAlert(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading('confirmBtn', false);
    }
  }

  document.getElementById('confirmBtn')?.addEventListener('click', handleVerifyCode);

  /* 4. Resend code (معدل لاستخدام apiRequest) */
  document.getElementById('resendLink')?.addEventListener('click', async () => {
    hideAlert();

    if (!userEmail) {
      showAlert('Email not found. Please go back and try again.');
      return;
    }

    const link = document.getElementById('resendLink');
    link.style.pointerEvents = 'none';
    link.textContent = 'Sending…';

    try {
      // ✅ استخدام apiRequest
      await apiRequest('/api/password/request-code', {
        method: 'POST',
        body: JSON.stringify({ email: userEmail })
      });

      showAlert('A new code has been sent to your email.', 'success');

      /* Clear inputs for fresh entry */
      inputs.forEach(inp => { inp.value = ''; inp.classList.remove('filled', 'error-input'); });
      inputs[0].focus();

    } catch (err) {
      showAlert(err.message || 'Failed to resend code. Please try again.');
    } finally {
      link.style.pointerEvents = '';
      link.textContent = 'Resend Code';
    }
  });

})();


/* ════════════════════════════════════════════════════
   REGISTER PAGE  (register.html)
   ════════════════════════════════════════════════════ */

(function initRegisterPage() {
  const registerBtn = document.getElementById('registerBtn');
  if (!registerBtn) return; // not on this page

  /* ── Eye toggles for both password fields ─────────── */
  const EYE_OPEN_SVG = `
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  `;
  const EYE_CLOSED_SVG = `
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  `;

  function makeToggle(btnId, inputId, iconId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!btn || !input || !icon) return;
    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      icon.innerHTML = isPassword ? EYE_CLOSED_SVG : EYE_OPEN_SVG;
    });
  }

  makeToggle('toggleRegPw', 'regPassword', 'eyeIconReg');
  makeToggle('toggleConfirmPw', 'confirmPassword', 'eyeIconConfirm');

  /* ── Live password-match indicator ───────────────── */
  const regPasswordInput = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const matchHint = document.getElementById('matchHint');

  function updateMatchHint() {
    const pw = regPasswordInput?.value;
    const cpw = confirmPasswordInput?.value;
    if (!cpw) {
      matchHint.textContent = '';
      matchHint.className = 'match-hint';
      return;
    }
    if (pw === cpw) {
      matchHint.textContent = '✓ Passwords match';
      matchHint.className = 'match-hint ok';
    } else {
      matchHint.textContent = '✗ Passwords do not match';
      matchHint.className = 'match-hint no';
    }
  }

  regPasswordInput?.addEventListener('input', updateMatchHint);
  confirmPasswordInput?.addEventListener('input', updateMatchHint);

  /* Clear field errors on typing */
  function clearFieldError(id) {
    document.getElementById(id)?.classList.remove('error-input');
  }

  document.getElementById('username')?.addEventListener('input', () => { hideAlert(); clearFieldError('username'); });
  document.getElementById('email')?.addEventListener('input', () => { hideAlert(); clearFieldError('email'); });
  document.getElementById('regPassword')?.addEventListener('input', () => { hideAlert(); clearFieldError('regPassword'); });
  document.getElementById('confirmPassword')?.addEventListener('input', () => { hideAlert(); clearFieldError('confirmPassword'); });

  /* ── Client-side validation ──────────────────────── */
  function validateRegisterForm(username, email, password, confirmPassword) {
    if (!username || username.trim().length < 3) {
      showRegisterError('Username must be at least 3 characters.', 'username');
      return false;
    }
    if (username.length > 50) {
      showRegisterError('Username cannot exceed 50 characters.', 'username');
      return false;
    }
    if (!isValidEmail(email)) {
      showRegisterError('Please enter a valid email address.', 'email');
      return false;
    }
    if (!password || password.length < 6) {
      showRegisterError('Password must be at least 6 characters.', 'regPassword');
      return false;
    }
    if (password !== confirmPassword) {
      showRegisterError('Passwords do not match. Please check and try again.', 'confirmPassword');
      confirmPasswordInput?.classList.add('error-input');
      return false;
    }
    return true;
  }

  function showRegisterError(message, fieldId) {
    showAlert(message, 'error');
    if (fieldId) document.getElementById(fieldId)?.classList.add('error-input');
  }

  /* ── Register Handler (معدل لاستخدام apiRequest) ─── */
  async function handleRegister() {
    hideAlert();

    const username = document.getElementById('username')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!validateRegisterForm(username, email, password, confirmPassword)) return;

    setLoading('registerBtn', true);

    try {
      // ✅ استخدام apiRequest
      await apiRequest('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: username, email, password })
      });

      // ✅ نجاح - نروح لصفحة إكمال البروفايل
      window.location.href = '../profile.html';

    } catch (err) {
      showAlert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading('registerBtn', false);
    }
  }

  registerBtn.addEventListener('click', handleRegister);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRegister();
  });

})();
// ============================================
// FIX: ربط زر تسجيل الدخول (أضيفي ده في آخر الملف)
// ============================================

// دالة لربط الزرار
function bindLoginButton() {
  const loginBtn = document.getElementById('loginBtn');
  if (!loginBtn) {
    console.log('⏳ لسه ملقيناش الزرار، هنستنى شوية');
    setTimeout(bindLoginButton, 100); // نجرب تاني بعد 100 ملي ثانية
    return;
  }

  console.log('✅ لقينا الزرار، بنربطه...');

  // نشيل أي حاجة مربوطة قديمة
  loginBtn.onclick = null;

  // نربط الحدث الجديد
  loginBtn.addEventListener('click', function (e) {
    console.log('👆 تم الضغط على زر تسجيل الدخول');
    e.preventDefault(); // منع أي سلوك افتراضي
    handleLogin(); // تشغيل دالة تسجيل الدخول
  });

  console.log('✅ تم ربط الزرار بنجاح');
}

// نشغل الدالة بعد تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindLoginButton);
} else {
  // الصفحة خلصت تحميل، نشغل علطول
  bindLoginButton();
}