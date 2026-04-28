/* ════════════════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════════════════ */

/**
 * Show / hide the top alert banner.
 * @param {string} message
 * @param {'error'|'success'} type
 */
function showAlert(message, type = 'error') {
  const box  = document.getElementById('alertBox');
  const text = document.getElementById('alertText');
  if (!box || !text) return;

  text.textContent = message;

  // Swap between error and success styles
  box.classList.remove('profile-alert--error', 'profile-alert--success');
  box.classList.add(`profile-alert--${type}`, 'show');

  // Auto-dismiss success after 4 seconds
  if (type === 'success') {
    setTimeout(() => box.classList.remove('show'), 4000);
  }
}

function hideAlert() {
  document.getElementById('alertBox')?.classList.remove('show');
}

/** Toggle loading state on the Save button */
function setLoading(isLoading) {
  const btn = document.getElementById('saveBtn');
  if (!btn) return;
  btn.classList.toggle('loading', isLoading);
  btn.disabled = isLoading;
}

/** Mark / clear a field as errored */
function setFieldError(id, hasError) {
  document.getElementById(id)?.classList.toggle('error-input', hasError);
}

/** Debounce helper to prevent multiple submissions */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* ════════════════════════════════════════════════════
   FORM VALIDATION
   ════════════════════════════════════════════════════ */

function validateProfileForm(data) {
  // Full name required
  if (!data.fullName || data.fullName.trim().length < 2) {
    showAlert('Please enter your full name (at least 2 characters).');
    setFieldError('fullName', true);
    document.getElementById('fullName')?.focus();
    return false;
  }

  // Email format
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRe.test(data.email)) {
    showAlert('Please enter a valid email address.');
    setFieldError('email', true);
    document.getElementById('email')?.focus();
    return false;
  }

  // Age validation - must be digits only
  if (data.age !== '') {
    if (!/^\d+$/.test(data.age)) {
      showAlert('Age must contain only numbers.');
      setFieldError('age', true);
      document.getElementById('age')?.focus();
      return false;
    }
    const ageNum = Number(data.age);
    if (ageNum < 1 || ageNum > 120) {
      showAlert('Please enter a valid age (1–120).');
      setFieldError('age', true);
      document.getElementById('age')?.focus();
      return false;
    }
  }

  // Cigarettes per day validation - digits only
  if (data.cigarettesPerDay !== '' && !/^\d+$/.test(data.cigarettesPerDay)) {
    showAlert('Cigarettes per day must contain only numbers.');
    setFieldError('cigarettesPerDay', true);
    document.getElementById('cigarettesPerDay')?.focus();
    return false;
  }

  // Years of smoking validation - digits only
  if (data.yearsOfSmoking !== '' && !/^\d+$/.test(data.yearsOfSmoking)) {
    showAlert('Years of smoking must contain only numbers.');
    setFieldError('yearsOfSmoking', true);
    document.getElementById('yearsOfSmoking')?.focus();
    return false;
  }

  // Quit attempts validation - digits only
  if (data.quitAttempts !== '' && !/^\d+$/.test(data.quitAttempts)) {
    showAlert('Quit attempts must contain only numbers.');
    setFieldError('quitAttempts', true);
    document.getElementById('quitAttempts')?.focus();
    return false;
  }

  return true;
}

/* ════════════════════════════════════════════════════
   PROFILE COMPLETION CALCULATOR
   ════════════════════════════════════════════════════ */

function calculateProfileCompletion(data) {
  const fields = ['fullName', 'email', 'age', 'gender', 'cigarettesPerDay'];
  const filled = fields.filter(f => data[f] && data[f].toString().trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
}

function updateProfileProgress(completion) {
  const progressBar = document.getElementById('profileProgress');
  const progressText = document.getElementById('progressText');
  
  if (progressBar) {
    progressBar.style.width = `${completion}%`;
    progressBar.setAttribute('aria-valuenow', completion);
  }
  
  if (progressText) {
    progressText.textContent = `${completion}% Complete`;
  }
}

/* ════════════════════════════════════════════════════
   دالة خاصة لـ FormData (لأن apiRequest العادية بتستخدم JSON)
   ════════════════════════════════════════════════════ */

async function apiFormData(endpoint, formData) {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
      // ❌ مفيش Content-Type هنا (FormData بتضيفه)
    },
    body: formData
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }
  
  return data.success;
}

/* ════════════════════════════════════════════════════
   SAVE PROFILE (معدل لاستخدام apiFormData)
   ════════════════════════════════════════════════════ */

async function handleSaveProfile() {
  hideAlert();

  // Clear previous errors
  ['fullName', 'email', 'age', 'gender',
   'cigarettesPerDay', 'yearsOfSmoking', 'quitAttempts'].forEach(id => {
    setFieldError(id, false);
  });

  // Collect form values
  const data = {
    fullName:         document.getElementById('fullName')?.value.trim()        ?? '',
    email:            document.getElementById('email')?.value.trim()           ?? '',
    age:              document.getElementById('age')?.value                    ?? '',
    gender:           document.getElementById('gender')?.value                 ?? '',
    cigarettesPerDay: document.getElementById('cigarettesPerDay')?.value       ?? '',
    yearsOfSmoking:   document.getElementById('yearsOfSmoking')?.value         ?? '',
    medicalHistory:   document.getElementById('medicalHistory')?.value.trim()  ?? '',
    familyDiseases:   document.getElementById('familyDiseases')?.value.trim()  ?? '',
    quitAttempts:     document.getElementById('quitAttempts')?.value           ?? '',
  };

  // Show profile completion
  const completion = calculateProfileCompletion(data);
  updateProfileProgress(completion);

  // Client-side validation
  if (!validateProfileForm(data)) return;

  setLoading(true);

  try {

    const result = await apiRequest('/api/Users/complete-profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Build FormData
   /* const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // ✅ استخدام apiFormData بدل fetch
    const result = await apiFormData('/api/Users/complete-profile', formData);*/

    // ✅ عرض رسالة النجاح لو موجودة
    if (result?.message) {
      showAlert(result.message, 'success');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1500);
    } else {
      window.location.href = '../index.html';
    }

  } catch (err) {
    showAlert(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

/* ════════════════════════════════════════════════════
   LOGOUT with Loading State (معدل لاستخدام apiRequest)
   ════════════════════════════════════════════════════ */

async function handleLogout() {
  const btn = document.getElementById('logoutBtn');
  const originalText = btn ? btn.textContent : 'Logout';
  
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Logging out...';
  }

  try {
    // ✅ استخدام apiRequest
    await apiRequest('/api/Auth/logout', { method: 'POST' });
  } catch {
    // Ignore network errors
  } finally {
    window.location.href = 'auth/login.html';
  }
}

/* ════════════════════════════════════════════════════
   FOOTER STORY SUBMISSION (معدل لاستخدام apiRequest)
   ════════════════════════════════════════════════════ */

let isSendingStory = false;

async function handleStorySend() {
  // Prevent multiple submissions
  if (isSendingStory) return;
  
  const input = document.getElementById('storyInput');
  const story = input?.value.trim();

  if (!story) {
    input?.focus();
    return;
  }

  isSendingStory = true;
  
  const btn = document.getElementById('storyBtn');
  const originalText = btn ? btn.textContent : 'Send';
  
  if (btn) { 
    btn.disabled = true; 
    btn.textContent = 'Sending…'; 
  }

  try {
    // ✅ استخدام apiRequest
    await apiRequest('/api/RecoveryStories', {
      method: 'POST',
      body: JSON.stringify({ 
        title: 'Story from Footer',
        content: story 
      })
    });
    
    if (input) input.value = '';
    if (btn) btn.textContent = 'Sent ✓';
    
    setTimeout(() => { 
      if (btn) { 
        btn.disabled = false; 
        btn.textContent = originalText; 
      }
      isSendingStory = false;
    }, 2500);
    
  } catch (err) {
    if (btn) { 
      btn.disabled = false; 
      btn.textContent = originalText; 
    }
    isSendingStory = false;
    showAlert(err.message || 'Failed to send story. Please try again.');
  }
}

// Create debounced version for input events
const debouncedStorySend = debounce(handleStorySend, 500);

/* ════════════════════════════════════════════════════
   CLEAR FIELD ERRORS ON INPUT & Update Progress
   ════════════════════════════════════════════════════ */

function updateProgressOnInput() {
  const data = {
    fullName:         document.getElementById('fullName')?.value.trim()        ?? '',
    email:            document.getElementById('email')?.value.trim()           ?? '',
    age:              document.getElementById('age')?.value                    ?? '',
    gender:           document.getElementById('gender')?.value                 ?? '',
    cigarettesPerDay: document.getElementById('cigarettesPerDay')?.value       ?? '',
  };
  
  const completion = calculateProfileCompletion(data);
  updateProfileProgress(completion);
}

['fullName', 'email', 'age', 'gender',
 'cigarettesPerDay', 'yearsOfSmoking', 'quitAttempts'].forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('input', () => {
      setFieldError(id, false);
      hideAlert();
      if (['fullName', 'email', 'age', 'gender', 'cigarettesPerDay'].includes(id)) {
        updateProgressOnInput();
      }
    });
  }
});

/* ════════════════════════════════════════════════════
   EVENT BINDINGS
   ════════════════════════════════════════════════════ */

document.getElementById('saveBtn')?.addEventListener('click', handleSaveProfile);
document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
document.getElementById('storyBtn')?.addEventListener('click', handleStorySend);

document.getElementById('storyInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleStorySend();
  }
});

// Initial progress calculation on page load
window.addEventListener('load', () => {
  const data = {
    fullName:         document.getElementById('fullName')?.value.trim()        ?? '',
    email:            document.getElementById('email')?.value.trim()           ?? '',
    age:              document.getElementById('age')?.value                    ?? '',
    gender:           document.getElementById('gender')?.value                 ?? '',
    cigarettesPerDay: document.getElementById('cigarettesPerDay')?.value       ?? '',
  };
  const completion = calculateProfileCompletion(data);
  updateProfileProgress(completion);
});