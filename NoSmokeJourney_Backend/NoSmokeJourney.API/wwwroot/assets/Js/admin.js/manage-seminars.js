/**
 * manage-seminars.js — Seminars Management Logic
 * Handles: fetch, add, edit, delete seminars with pagination and filters
 */

/*════════════════════════════════════════════════════
  CONFIG
  ════════════════════════════════════════════════════ */

let currentSeminarId = null; // Tracks if we're editing
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
  search: '',
  speaker: '',
  fromDate: '',
  toDate: '',
  upcoming: false
};
// وقفت اللودنج
document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('addSeminarBtn');
  if (saveBtn) {
    saveBtn.classList.remove('loading');
    const spinner = saveBtn.querySelector('.btn-spinner');
    if (spinner) spinner.style.display = 'none';
  }
});

/* ════════════════════════════════════════════════════
   FETCH AND DISPLAY SEMINARS
   ════════════════════════════════════════════════════ */

async function fetchSeminars(page = 1) {
  const container = document.getElementById('seminarsList');
  
  const params = new URLSearchParams({
    page: page,
    limit: 10,
    ...(currentFilters.search && { search: currentFilters.search }),
    ...(currentFilters.speaker && { speaker: currentFilters.speaker }),
    ...(currentFilters.fromDate && { fromDate: currentFilters.fromDate }),
    ...(currentFilters.toDate && { toDate: currentFilters.toDate }),
    ...(currentFilters.upcoming && { upcoming: 'true' })
  });
  
  try {
    container.innerHTML = '<div class="loading-spinner">Loading seminars...</div>';
    
    const result = await apiRequest(`/api/Seminars?${params}`);
    
    // The API returns { success, data: { items, totalPages, pageNumber, ... } }
    const responseData = result.data || result;
    const seminars = responseData?.items || (Array.isArray(responseData) ? responseData : []);
    const pagination = responseData; 
    
    if (pagination) {
      currentPage = pagination.pageNumber;
      totalPages = pagination.totalPages;
      updatePaginationUI(pagination);
    }
    
    container.innerHTML = '';
    
    if (seminars.length === 0) {
      container.innerHTML = '<div class="empty-message">No seminars scheduled yet</div>';
      return;
    }
    
    seminars.forEach(seminar => {
      const card = createSeminarCard(seminar);
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error fetching seminars:', error);
    container.innerHTML = '<div class="empty-message">Failed to load seminars. Please try again.</div>';
  }
}

/* ════════════════════════════════════════════════════
   UPDATE PAGINATION UI
   ════════════════════════════════════════════════════ */

function updatePaginationUI(pagination) {
  const container = document.getElementById('pagination');
  if (!container) return;
  
  if (pagination.totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '<div class="pagination-controls">';
  
  html += `<button class="page-btn" ${pagination.pageNumber === 1 ? 'disabled' : ''} 
           onclick="changePage(${pagination.pageNumber - 1})">←</button>`;
  
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === 1 || i === pagination.totalPages || 
        (i >= pagination.pageNumber - 2 && i <= pagination.pageNumber + 2)) {
      html += `<button class="page-btn ${i === pagination.pageNumber ? 'active' : ''}" 
               onclick="changePage(${i})">${i}</button>`;
    } else if (i === pagination.pageNumber - 3 || i === pagination.pageNumber + 3) {
      html += `<span class="page-dots">...</span>`;
    }
  }
  
  html += `<button class="page-btn" ${pagination.pageNumber === pagination.totalPages ? 'disabled' : ''} 
           onclick="changePage(${pagination.pageNumber + 1})">→</button>`;
  
  html += '</div>';
  container.innerHTML = html;
}

window.changePage = function(page) {
  if (page < 1 || page > totalPages) return;
  fetchSeminars(page);
};

/* ════════════════════════════════════════════════════
   CREATE SEMINAR CARD
   ════════════════════════════════════════════════════ */

function createSeminarCard(seminar) {
  const card = document.createElement('div');
  card.className = 'seminar-card';
  card.dataset.seminarId = seminar.id;
  
  const formattedDate = seminar.date ? new Date(seminar.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'TBD';
  
  const isUpcoming = seminar.date ? new Date(seminar.date) > new Date() : false;
  
  card.innerHTML = `
    <div class="seminar-header">
      <h3 class="seminar-title">${seminar.title || 'Untitled Seminar'}</h3>
      ${isUpcoming ? '<span class="badge upcoming">Upcoming</span>' : '<span class="badge past">Past</span>'}
    </div>
    <div class="seminar-details">
      <p class="seminar-detail">
        <span class="detail-icon">📅</span>
        <strong>Date:</strong> ${formattedDate}
      </p>
      <p class="seminar-detail">
        <span class="detail-icon">⏰</span>
        <strong>Time:</strong> ${seminar.time || 'TBD'}
      </p>
      <p class="seminar-detail">
        <span class="detail-icon">📍</span>
        <strong>Location:</strong> ${seminar.location || 'TBD'}
      </p>
      <p class="seminar-detail">
        <span class="detail-icon">👤</span>
        <strong>Speaker:</strong> ${seminar.speaker || 'TBD'}
      </p>
      ${seminar.capacity ? `
        <p class="seminar-detail">
          <span class="detail-icon">👥</span>
          <strong>Capacity:</strong> ${seminar.registeredCount || 0}/${seminar.capacity}
        </p>
      ` : ''}
      ${seminar.description ? `
        <p class="seminar-detail description">${seminar.description}</p>
      ` : ''}
    </div>
    <div class="seminar-actions">
      <button class="btn btn-primary btn-sm" onclick="editSeminar('${seminar.id}')">Edit</button>
      <button class="btn btn-red btn-sm" onclick="deleteSeminar('${seminar.id}')">Delete</button>
    </div>
  `;
  
  return card;
}

/* ════════════════════════════════════════════════════
   FUNCTIONS FOR ADDING SEMINAR (USING TOP FORM)
   ════════════════════════════════════════════════════ */

// ✅ دالة لجلب البيانات من الفورم العلوي
function getTopFormData() {
  return {
    title: document.getElementById('seminarTitle').value.trim(),
    date: document.getElementById('seminarDate').value,
    time: document.getElementById('seminarTime').value.trim(),
    location: document.getElementById('seminarLocation').value.trim(),
    speaker: document.getElementById('seminarSpeaker').value.trim(),
    description: document.getElementById('seminarDescription').value.trim(),
    capacity: document.getElementById('seminarCapacity').value ? parseInt(document.getElementById('seminarCapacity').value) : undefined
  };
}

// ✅ دالة لتفريغ الفورم العلوي بعد الإضافة
function clearTopForm() {
  document.getElementById('seminarTitle').value = '';
  document.getElementById('seminarDate').value = '';
  document.getElementById('seminarTime').value = '';
  document.getElementById('seminarLocation').value = '';
  document.getElementById('seminarSpeaker').value = '';
  document.getElementById('seminarDescription').value = '';
  document.getElementById('seminarCapacity').value = '';
}

// ✅ دالة للتحقق من صحة البيانات
function validateSeminarData(data) {
  if (!data.title || data.title.length < 5) {
    showAlert('Title must be at least 5 characters', 'error');
    return false;
  }
  if (!data.date) {
    showAlert('Please select a date', 'error');
    return false;
  }
  if (!data.location || data.location.length < 3) {
    showAlert('Location must be at least 3 characters', 'error');
    return false;
  }
  if (!data.speaker || data.speaker.length < 3) {
    showAlert('Speaker name must be at least 3 characters', 'error');
    return false;
  }
  return true;
}

// ✅ زر الإضافة (يستخدم الفورم العلوي مباشرة)
document.getElementById('addSeminarBtn')?.addEventListener('click', async () => {
  const seminarData = getTopFormData();
  
  if (!validateSeminarData(seminarData)) return;
  
  const btn = document.getElementById('addSeminarBtn');
  
  
  try {
    const result = await apiRequest('/api/Seminars', {
      method: 'POST',
      body: JSON.stringify(seminarData)
    });
    
    clearTopForm(); // تفريغ الفورم
    fetchSeminars(currentPage); // تحديث القائمة
    
    showAlert(result?.message || 'Seminar added successfully', 'success');
    
  } catch (error) {
    console.error('Error adding seminar:', error);
    showAlert(error.message || 'Failed to add seminar', 'error');
  } finally {
    btn.classList.remove('loading');
  }
});

/* ════════════════════════════════════════════════════
   MODAL FUNCTIONS (للتعديل فقط)
   ════════════════════════════════════════════════════ */

// فتح المودال للتعديل
function openEditModal(seminarId) {
  currentSeminarId = seminarId;
  document.getElementById('modalTitle').textContent = 'Edit Seminar';
  document.getElementById('seminarModal').classList.add('show');
  document.getElementById('modalOverlay').classList.add('show');
}

// إغلاق المودال
function closeEditModal() {
  document.getElementById('seminarModal').classList.remove('show');
  document.getElementById('modalOverlay').classList.remove('show');
  currentSeminarId = null;
}

// أزرار إغلاق المودال
document.getElementById('closeModalBtn')?.addEventListener('click', closeEditModal);
document.getElementById('cancelModalBtn')?.addEventListener('click', closeEditModal);
document.getElementById('modalOverlay')?.addEventListener('click', closeEditModal);

/* ════════════════════════════════════════════════════
   EDIT SEMINAR (فتح المودال وجلب البيانات)
   ════════════════════════════════════════════════════ */

async function editSeminar(seminarId) {
  try {
    const result = await apiRequest(`/api/Seminars/${seminarId}`);
    const seminar = result?.data || {};
    
    // ملء حقول المودال
    document.getElementById('modalSeminarTitle').value = seminar.title || '';
    document.getElementById('modalSeminarDate').value = seminar.date || '';
    document.getElementById('modalSeminarTime').value = seminar.time || '';
    document.getElementById('modalSeminarLocation').value = seminar.location || '';
    document.getElementById('modalSeminarSpeaker').value = seminar.speaker || '';
    document.getElementById('modalSeminarDescription').value = seminar.description || '';
    document.getElementById('modalSeminarCapacity').value = seminar.capacity || '';
    
    openEditModal(seminarId);
    
  } catch (error) {
    console.error('Error fetching seminar:', error);
    showAlert(error.message || 'Failed to load seminar details', 'error');
  }
}

window.editSeminar = editSeminar;

/* ════════════════════════════════════════════════════
   SAVE CHANGES (في المودال - للتعديل فقط)
   ════════════════════════════════════════════════════ */

document.getElementById('saveSeminarBtn')?.addEventListener('click', async () => {
  if (!currentSeminarId) {
    closeEditModal();
    return;
  }
  
  const seminarData = {
    title: document.getElementById('modalSeminarTitle').value.trim(),
    date: document.getElementById('modalSeminarDate').value,
    time: document.getElementById('modalSeminarTime').value.trim(),
    location: document.getElementById('modalSeminarLocation').value.trim(),
    speaker: document.getElementById('modalSeminarSpeaker').value.trim(),
    description: document.getElementById('modalSeminarDescription').value.trim(),
    capacity: document.getElementById('modalSeminarCapacity').value ? parseInt(document.getElementById('modalSeminarCapacity').value) : undefined
  };
  
  if (!validateSeminarData(seminarData)) return;
  
  const btn = document.getElementById('saveSeminarBtn');
  btn.classList.add('loading');
  
  try {
    const result = await apiRequest(`/api/Seminars/${currentSeminarId}`, {
      method: 'PUT',
      body: JSON.stringify(seminarData)
    });
    
    closeEditModal();
    fetchSeminars(currentPage);
    
    showAlert(result?.message || 'Seminar updated successfully', 'success');
    
  } catch (error) {
    console.error('Error updating seminar:', error);
    showAlert(error.message || 'Failed to update seminar', 'error');
  } finally {
    btn.classList.remove('loading');
  }
});


/* ════════════════════════════════════════════════════
   DELETE SEMINAR WITH CONFIRMATION MODAL
   ════════════════════════════════════════════════════ */

let seminarToDelete = null;

function openDeleteModal(seminarId) {
  seminarToDelete = seminarId;
  document.getElementById('deleteModal').classList.add('show');
  document.getElementById('modalOverlay').classList.add('show');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('show');
  document.getElementById('modalOverlay').classList.remove('show');
  seminarToDelete = null;
}

async function confirmDelete() {
  if (!seminarToDelete) {
    closeDeleteModal();
    return;
  }
  
  const btn = document.getElementById('confirmDeleteBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Deleting...';
  btn.disabled = true;
  
  try {
    const result = await apiRequest(`/api/Seminars/${seminarToDelete}`, {
      method: 'DELETE'
    });
    
    const card = document.querySelector(`[data-seminar-id="${seminarToDelete}"]`);
    if (card) {
      card.classList.add('removing');
      setTimeout(() => {
        card.remove();
        const container = document.getElementById('seminarsList');
        if (container.children.length === 0) {
          container.innerHTML = '<div class="empty-message">No seminars scheduled yet</div>';
        }
      }, 300);
    }
    
    closeDeleteModal();
    showAlert(result?.message || 'Seminar deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting seminar:', error);
    showAlert(error.message || 'Failed to delete seminar', 'error');
    closeDeleteModal();
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

async function deleteSeminar(seminarId) {
  openDeleteModal(seminarId);
}

// Event Listeners
document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
document.getElementById('modalOverlay')?.addEventListener('click', closeDeleteModal);

window.deleteSeminar = deleteSeminar;

/* ════════════════════════════════════════════════════
   ALERT HELPERS
   ════════════════════════════════════════════════════ */

function showAlert(message, type = 'error') {
  const box = document.getElementById('alertBox');
  const text = document.getElementById('alertText');
  if (!box || !text) return;
  
  text.textContent = message;
  box.className = `admin-alert admin-alert--${type} show`;
  
  if (type === 'success') {
    setTimeout(() => box.classList.remove('show'), 4000);
  }
}

/* ════════════════════════════════════════════════════
   LOGOUT
   ════════════════════════════════════════════════════ */

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    await apiRequest('/api/Auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }
  window.location.href = '../auth/login.html';
});

/* ════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  fetchSeminars(1);
});