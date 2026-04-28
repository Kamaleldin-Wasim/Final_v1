/**
 * dashboard.js — Admin Dashboard Logic
 * Handles: stats fetching/polling, seminar management, logout
 * Updated with modern notification system
 */

/* ════════════════════════════════════════════════════
   CONFIG (أضيفي هذا السطر في HTML مش هنا)
   <script src="../config.js"></script>
   ════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════
   NOTIFICATION SYSTEM
   ════════════════════════════════════════════════════ */

// Toast Notifications
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icons based on type
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <p class="toast-message">${message}</p>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Modal Dialog for confirmations
function showConfirm(message, onConfirm, onCancel = null) {
  const overlay = document.getElementById('modalOverlay');
  const modalMessage = document.getElementById('modalMessage');
  const modalTitle = document.getElementById('modalTitle');
  const confirmBtn = document.getElementById('modalConfirmBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');
  
  if (!overlay || !modalMessage) return;
  
  modalTitle.textContent = 'Confirm Action';
  modalMessage.textContent = message;
  
  overlay.style.display = 'flex';
  
  function closeModal() {
    overlay.style.display = 'none';
  }
  
  confirmBtn.onclick = () => {
    closeModal();
    if (onConfirm) onConfirm();
  };
  
  cancelBtn.onclick = () => {
    closeModal();
    if (onCancel) onCancel();
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
      if (onCancel) onCancel();
    }
  };
}

/* ════════════════════════════════════════════════════
   DASHBOARD STATS WITH SMART POLLING (معدل لاستخدام apiRequest)
   ════════════════════════════════════════════════════ */

class DashboardStats {
  constructor() {
    this.interval = null;
    this.isVisible = true;
    this.setupVisibilityListener();
  }
  
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopPolling();
        this.isVisible = false;
      } else {
        this.isVisible = true;
        this.fetchStats();
        this.startPolling();
      }
    });
  }
  
  async fetchStats() {
    try {
      // ✅ استخدام apiRequest
      const result = await apiRequest('/api/Dashboard/stats');
      
      // ✅ Pass the actual stats from result.data
      this.updateUI(result.data || result);
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if (this.isVisible) {
        showToast('Failed to refresh dashboard stats', 'error');
      }
    }
  }
  
  updateUI(data) {
    // data هو success object من الـ API
    document.getElementById('storiesSubmittedCount').textContent = 
      data?.storiesSubmitted || '0';
    document.getElementById('totalUsersCount').textContent = 
      data?.totalUsers || '0';
    document.getElementById('activeDoctorsCount').textContent = 
      data?.activeDoctors || '0';
    document.getElementById('hospitalsLabsCount').textContent = 
      data?.hospitalsLabs || '0';
  }
  
  startPolling(interval = 60000) {
    this.stopPolling();
    this.interval = setInterval(() => this.fetchStats(), interval);
  }
  
  stopPolling() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

/* ════════════════════════════════════════════════════
   SEMINAR MANAGEMENT (معدل لاستخدام apiRequest)
   ════════════════════════════════════════════════════ */

let currentSeminarId = null;

// جلب كل الندوات
async function loadAllSeminars() {
  try {
    // ✅ استخدام apiRequest
    const result = await apiRequest('/api/Seminars');
    
    // ✅ seminars في result.data
    const seminars = result?.data || [];
    
    // عرض الندوات في الجدول أو القائمة
    renderSeminarsList(seminars);
    
  } catch (error) {
    console.error('Error loading seminars:', error);
    showToast('Failed to load seminars', 'error');
  }
}

// عرض الندوات
/*function renderSeminarsList(seminars) {
  const container = document.getElementById('seminarsList');
  if (!container) return;
  
  if (!seminars.length) {
    container.innerHTML = '<p class="empty-state">No seminars found</p>';
    return;
  }
  
  container.innerHTML = seminars.map(seminar => `
    <div class="seminar-card" onclick="selectSeminar('${seminar.id}')">
      <h3>${seminar.title}</h3>
      <p><strong>Date:</strong> ${seminar.date} at ${seminar.time}</p>
      <p><strong>Location:</strong> ${seminar.location}</p>
      <p><strong>Speaker:</strong> ${seminar.speaker}</p>
    </div>
  `).join('');
}*/
function renderSeminarsList(seminars) {
  const container = document.getElementById('seminarsList');
  if (!container) return;
  
  if (!seminars.length) {
    container.innerHTML = '<p class="empty-state">No seminars found</p>';
    return;
  }
  
  container.innerHTML = seminars.map(seminar => `
    <div class="seminar-card" onclick="selectSeminar('${seminar.id}')">
      <h3>${seminar.title}</h3>
      <p><strong>Date:</strong> ${new Date(seminar.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> ${seminar.location}</p>
      <p><strong>Speaker:</strong> ${seminar.speaker}</p>
    </div>
  `).join('');
}

// اختيار ندوة معينة
window.selectSeminar = async function(seminarId) {
  currentSeminarId = seminarId;
  await loadSeminarData(seminarId);
  
  // عرض التفاصيل في الواجهة
  document.getElementById('currentSeminarDisplay').style.display = 'flex';
  document.getElementById('seminarForm').style.display = 'none';
};

// Load seminar data from API (معدل لاستخدام apiRequest)
async function loadSeminarData(seminarId) {
  try {
    // ✅ استخدام apiRequest
    const result = await apiRequest(`/api/Seminars/${seminarId}`);
    
    // ✅ seminar في result.data
    const seminar = result?.data || {};
    
    document.getElementById('seminarTitle').value = seminar.title || '';
    document.getElementById('seminarDate').value = seminar.date || '';
    document.getElementById('seminarTime').value = seminar.time || '';
    document.getElementById('seminarLocation').value = seminar.location || '';
    document.getElementById('seminarSpeaker').value = seminar.speaker || '';
    document.getElementById('seminarDescription').value = seminar.description || '';
    
    // تحديث العرض
    document.getElementById('seminarInfo').innerHTML = `
      <p class="seminar-line"><strong>${seminar.title}</strong> on ${seminar.date} at ${seminar.time}</p>
      <p class="seminar-line"><strong>Location:</strong> ${seminar.location}</p>
      <p class="seminar-line"><strong>Speaker:</strong> ${seminar.speaker}</p>
      ${seminar.description ? `<p class="seminar-line"><strong>Description:</strong> ${seminar.description}</p>` : ''}
    `;
    
  } catch (error) {
    console.error('Error loading seminar:', error);
    showToast('Failed to load seminar data', 'error');
  }
}

// Show edit form
document.getElementById('editSeminarBtn')?.addEventListener('click', () => {
  const seminarDisplay = document.getElementById('currentSeminarDisplay');
  const seminarForm = document.getElementById('seminarForm');
  
  seminarDisplay.style.display = 'none';
  seminarForm.style.display = 'flex';
});

// Delete seminar with confirmation (معدل لاستخدام apiRequest)
document.getElementById('deleteSeminarBtn')?.addEventListener('click', () => {
  if (!currentSeminarId) {
    showToast('No seminar selected', 'warning');
    return;
  }
  
  showConfirm(
    'Are you sure you want to delete this seminar? This action cannot be undone.',
    async () => {
      try {
        // ✅ استخدام apiRequest
        const result = await apiRequest(`/api/Seminars/${currentSeminarId}`, {
          method: 'DELETE'
        });
        
        showToast(result?.message || 'Seminar deleted successfully', 'success');
        setTimeout(() => location.reload(), 1500);
        
      } catch (error) {
        console.error('Error deleting seminar:', error);
        showToast(error.message || 'Failed to delete seminar', 'error');
      }
    }
  );
});

// Validate seminar form
function validateSeminar(title, date, time, location, speaker) {
  if (!title || title.trim().length < 3) {
    showToast('Seminar title must be at least 3 characters', 'warning');
    return false;
  }
  if (!date) {
    showToast('Please select a date', 'warning');
    return false;
  }
  if (!time || time.trim().length < 5) {
    showToast('Please enter a valid time', 'warning');
    return false;
  }
  if (!location || location.trim().length < 5) {
    showToast('Please enter a valid location', 'warning');
    return false;
  }
  if (!speaker || speaker.trim().length < 3) {
    showToast('Please enter speaker name', 'warning');
    return false;
  }
  return true;
}

// Save seminar (create or update) - معدل لاستخدام apiRequest
document.getElementById('doneSeminarBtn')?.addEventListener('click', async () => {
  const title = document.getElementById('seminarTitle').value.trim();
  const date = document.getElementById('seminarDate').value;
  const time = document.getElementById('seminarTime').value.trim();
  const location = document.getElementById('seminarLocation').value.trim();
  const speaker = document.getElementById('seminarSpeaker').value.trim();
  const description = document.getElementById('seminarDescription').value.trim();
  
  if (!validateSeminar(title, date, time, location, speaker)) return;
  
  const btn = document.getElementById('doneSeminarBtn');
  btn.classList.add('loading');
  
  try {
    const seminarData = { 
      title, date, time, location, speaker, description
    };
    
    let result;
    if (currentSeminarId) {
      // Update existing
      result = await apiRequest(`/api/Seminars/${currentSeminarId}`, {
        method: 'PUT',
        body: JSON.stringify(seminarData)
      });
    } else {
      // Create new
      result = await apiRequest('/api/Seminars', {
        method: 'POST',
        body: JSON.stringify(seminarData)
      });
    }
    
    // ✅ عرض رسالة النجاح من الـ API
    showToast(result?.message || 'Seminar saved successfully', 'success');
    
    // Update display
    document.getElementById('seminarInfo').innerHTML = `
      <p class="seminar-line"><strong>${title}</strong> on ${date} at ${time}</p>
      <p class="seminar-line"><strong>Location:</strong> ${location}</p>
      <p class="seminar-line"><strong>Speaker:</strong> ${speaker}</p>
      ${description ? `<p class="seminar-line"><strong>Description:</strong> ${description}</p>` : ''}
    `;
    
    document.getElementById('currentSeminarDisplay').style.display = 'flex';
    document.getElementById('seminarForm').style.display = 'none';
    
    // إعادة تحميل القائمة
    loadAllSeminars();
    
  } catch (error) {
    console.error('Error saving seminar:', error);
    showToast(error.message || 'Failed to save seminar', 'error');
  } finally {
    btn.classList.remove('loading');
  }
});

// Cancel edit
document.getElementById('cancelSeminarBtn')?.addEventListener('click', () => {
  document.getElementById('currentSeminarDisplay').style.display = 'flex';
  document.getElementById('seminarForm').style.display = 'none';
});

/* ════════════════════════════════════════════════════
   LOGOUT WITH LOADING STATE (معدل لاستخدام apiRequest)
   ════════════════════════════════════════════════════ */

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('logoutBtn');
  const originalText = btn.textContent;
  
  btn.disabled = true;
  btn.textContent = 'Logging out...';
  
  try {
    // ✅ استخدام apiRequest
    await apiRequest('/api/Auth/logout', { method: 'POST' });
    
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '../auth/login.html';
    }, 1000);
  } catch (error) {
    console.error('Logout error:', error);
    showToast(error.message || 'Error logging out', 'error');
    btn.disabled = false;
    btn.textContent = originalText;
  }
});

/* ════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════ */

const dashboard = new DashboardStats();

document.addEventListener('DOMContentLoaded', () => {
  dashboard.fetchStats();
  dashboard.startPolling();
 // loadAllSeminars();
});