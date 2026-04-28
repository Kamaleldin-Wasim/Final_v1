/**
 * manage-hospitals.js — Hospitals & Labs Management Logic
 * Handles: fetch, add, edit, delete hospitals and labs with pagination
 */

/* ════════════════════════════════════════════════════
   CONFIG (أضيفي هذا السطر في HTML مش هنا)
   <script src="../config.js"></script>
   ════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════
   STATE MANAGEMENT
   ════════════════════════════════════════════════════ */

let currentPage = 1;
let totalPages = 1;
let currentFilters = {
  search: '',
  type: '',
  location: ''
};

let editingHospitalId = null; // For edit mode

/* ════════════════════════════════════════════════════
   FETCH AND DISPLAY HOSPITALS (مع pagination) - معدل
   ════════════════════════════════════════════════════ */

async function fetchHospitals(page = 1) {
  const container = document.getElementById('hospitalsList');
  
  // Build query params
  const params = new URLSearchParams({
    page: page,
    limit: 10,
    ...(currentFilters.search && { search: currentFilters.search }),
    ...(currentFilters.type && { type: currentFilters.type }),
    ...(currentFilters.location && { location: currentFilters.location })
  });
  
  try {
    // Show loading
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    // ✅ استخدام apiRequest بدل fetch
    const result = await apiRequest(`/api/MedicalCenters?${params}`);
    
    // The API returns { success, data: { items, totalPages, pageNumber, ... } }
    const responseData = result.data || result;
    const hospitals = responseData?.items || (Array.isArray(responseData) ? responseData : []);
    const pagination = responseData; 
    
    // Update pagination info
    if (pagination) {
      currentPage = pagination.pageNumber;
      totalPages = pagination.totalPages;
      updatePaginationUI(pagination);
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (hospitals.length === 0) {
      container.innerHTML = '<div class="empty-message">No hospitals or labs registered yet</div>';
      return;
    }
    
    // Create card for each hospital/lab
    hospitals.forEach(hospital => {
      const card = createHospitalCard(hospital);
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    container.innerHTML = '<div class="empty-message">Failed to load hospitals. Please try again.</div>';
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
  
  // Previous button
  html += `<button class="page-btn" ${pagination.pageNumber === 1 ? 'disabled' : ''} 
           onclick="changePage(${pagination.pageNumber - 1})">←</button>`;
  
  // Page numbers
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === 1 || i === pagination.totalPages || 
        (i >= pagination.pageNumber - 2 && i <= pagination.pageNumber + 2)) {
      html += `<button class="page-btn ${i === pagination.pageNumber ? 'active' : ''}" 
               onclick="changePage(${i})">${i}</button>`;
    } else if (i === pagination.pageNumber - 3 || i === pagination.pageNumber + 3) {
      html += `<span class="page-dots">...</span>`;
    }
  }
  
  // Next button
  html += `<button class="page-btn" ${pagination.pageNumber === pagination.totalPages ? 'disabled' : ''} 
           onclick="changePage(${pagination.pageNumber + 1})">→</button>`;
  
  html += '</div>';
  
  container.innerHTML = html;
}

/* ════════════════════════════════════════════════════
   CHANGE PAGE
   ════════════════════════════════════════════════════ */

window.changePage = function(page) {
  if (page < 1 || page > totalPages) return;
  fetchHospitals(page);
};

/* ════════════════════════════════════════════════════
   FILTER HOSPITALS
   ════════════════════════════════════════════════════ */

document.getElementById('searchInput')?.addEventListener('input', (e) => {
  currentFilters.search = e.target.value;
  fetchHospitals(1);
});

document.getElementById('typeFilter')?.addEventListener('change', (e) => {
  currentFilters.type = e.target.value;
  fetchHospitals(1);
});

document.getElementById('locationFilter')?.addEventListener('input', (e) => {
  currentFilters.location = e.target.value;
  fetchHospitals(1);
});

/* ════════════════════════════════════════════════════
   CREATE HOSPITAL CARD
   ════════════════════════════════════════════════════ */

function createHospitalCard(hospital) {
  const card = document.createElement('div');
  card.className = 'hospital-card';
  card.dataset.hospitalId = hospital.id;
  
  // Format type badge
  const typeLabels = {
    hospital: '🏥 Hospital',
    lab: '🔬 Lab',
    clinic: '💉 Clinic',
    center: '🏛️ Center'
  };
  
  card.innerHTML = `
    <div class="hospital-header">
      <h3 class="hospital-name">${hospital.name || 'Unnamed Facility'}</h3>
      <span class="hospital-type-badge type-${hospital.specialization || 'other'}">
        ${typeLabels[hospital.specialization] || hospital.specialization || 'N/A'}
      </span>
    </div>
    <div class="hospital-details">
      <p class="hospital-detail">
        <span class="detail-icon">📍</span>
        <strong>Location:</strong> ${hospital.location || 'Not specified'}
      </p>
      ${hospital.description ? `
        <p class="hospital-detail">
          <span class="detail-icon">📝</span>
          <strong>Info:</strong> ${hospital.description.substring(0, 100)}${hospital.description.length > 100 ? '...' : ''}
        </p>
      ` : ''}
      ${hospital.mapLink ? `
        <p class="hospital-detail">
          <span class="detail-icon">🗺️</span>
          <strong>Map:</strong> <a href="${hospital.mapLink}" target="_blank" class="map-link">View on Google Maps</a>
        </p>
      ` : ''}
    </div>
    <div class="hospital-actions">
      <button class="btn btn-primary btn-sm" onclick="editHospital('${hospital.id}')">Edit</button>
      <button class="btn btn-red btn-sm" onclick="deleteHospital('${hospital.id}')">Delete</button>
    </div>
  `;
  
  return card;
}

/* ════════════════════════════════════════════════════
   ADD/EDIT HOSPITAL/LAB (معدل)
   ════════════════════════════════════════════════════ */

// Toggle between add and edit mode
function setEditMode(hospitalId = null) {
  editingHospitalId = hospitalId;
  const submitBtn = document.getElementById('submitHospitalBtn');
  const formTitle = document.getElementById('formTitle');
  
  if (hospitalId) {
    formTitle.textContent = 'Edit Hospital/Lab';
    submitBtn.textContent = 'Update';
  } else {
    formTitle.textContent = 'Add New Hospital/Lab';
    submitBtn.textContent = 'Add';
  }
}

// Load hospital data for editing (معدل)
async function editHospital(hospitalId) {
  try {
    // ✅ استخدام apiRequest
    const result = await apiRequest(`/api/MedicalCenters/${hospitalId}`);
    
    // ✅ البيانات في result
    const hospital = result || {};
    
    // Pre-fill form
    document.getElementById('hospitalName').value = hospital.name || '';
    document.getElementById('hospitalType').value = hospital.specialization || '';
    document.getElementById('hospitalLocation').value = hospital.location || '';
    document.getElementById('hospitalArticle').value = hospital.description || '';
    document.getElementById('hospitalMapLink').value = hospital.imageUrl || '';
    
    // Set edit mode
    setEditMode(hospitalId);
    
    // Scroll to form
    document.querySelector('.add-hospital-section').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error loading hospital:', error);
    showAlert(error.message || 'Failed to load hospital data', 'error');
  }
}

// Make globally accessible
window.editHospital = editHospital;

// Submit form (Add or Update) - معدل
document.getElementById('submitHospitalBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('hospitalName').value.trim();
  const type = document.getElementById('hospitalType').value.trim();
  const location = document.getElementById('hospitalLocation').value.trim();
  const article = document.getElementById('hospitalArticle').value.trim();
  const mapLink = document.getElementById('hospitalMapLink').value.trim();
  
  if (!name || !type || !location) {
    showAlert('Please fill in all required fields (Name, Type, Location)', 'error');
    return;
  }
  
  const btn = document.getElementById('submitHospitalBtn');
  btn.classList.add('loading');
  
  try {
    const hospitalData = { 
        name, 
        specialization: type, 
        location, 
        description: article, 
        imageUrl: mapLink,
        contactInfo: 'Not provided' // Backend requires contact info
    };
    
    let result;
    if (editingHospitalId) {
      // Update existing
      result = await apiRequest(`/api/MedicalCenters/${editingHospitalId}`, {
        method: 'PUT',
        body: JSON.stringify(hospitalData)
      });
    } else {
      // Create new
      result = await apiRequest('/api/MedicalCenters', {
        method: 'POST',
        body: JSON.stringify(hospitalData)
      });
    }
    
    // Clear form
    document.getElementById('hospitalName').value = '';
    document.getElementById('hospitalType').value = '';
    document.getElementById('hospitalLocation').value = '';
    document.getElementById('hospitalArticle').value = '';
    document.getElementById('hospitalMapLink').value = '';
    
    // Reset edit mode
    setEditMode(null);
    
    // Refresh list
    fetchHospitals(currentPage);
    
    // ✅ عرض رسالة النجاح من الـ API
    showAlert(result?.message || 
              (editingHospitalId ? 'Hospital updated successfully' : 'Hospital added successfully'), 
              'success');
    
  } catch (error) {
    console.error('Error saving hospital:', error);
    showAlert(error.message || 'Failed to save hospital/lab', 'error');
  } finally {
    btn.classList.remove('loading');
  }
});

// Cancel edit
document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
  // Clear form
  document.getElementById('hospitalName').value = '';
  document.getElementById('hospitalType').value = '';
  document.getElementById('hospitalLocation').value = '';
  document.getElementById('hospitalArticle').value = '';
  document.getElementById('hospitalMapLink').value = '';
  
  // Reset edit mode
  setEditMode(null);
});

/* ════════════════════════════════════════════════════
   DELETE HOSPITAL/LAB (معدل)
   ════════════════════════════════════════════════════ */

/*async function deleteHospital(hospitalId) {
  if (!confirm('Are you sure you want to delete this hospital/lab?')) return;
  
  try {
    // ✅ استخدام apiRequest
    const result = await apiRequest(`/api/MedicalCenters/${hospitalId}`, {
      method: 'DELETE'
    });
    
    // Remove card with animation
    const card = document.querySelector(`[data-hospital-id="${hospitalId}"]`);
    if (card) {
      card.classList.add('removing');
      setTimeout(() => {
        card.remove();
        
        // Check if list is empty
        const container = document.getElementById('hospitalsList');
        if (container.children.length === 0) {
          container.innerHTML = '<div class="empty-message">No hospitals or labs registered yet</div>';
        }
      }, 300);
    }
    
    // ✅ عرض رسالة النجاح
    showAlert(result?.message || 'Hospital/Lab deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting hospital:', error);
    showAlert(error.message || 'Failed to delete hospital/lab', 'error');
  }
}*/
// Make globally accessible
//window.deleteHospital = deleteHospital;



/* ════════════════════════════════════════════════════
   DELETE HOSPITAL/LAB WITH CONFIRMATION MODAL
   ════════════════════════════════════════════════════ */

let hospitalToDelete = null;

// فتح مودال التأكيد
function openDeleteModal(hospitalId) {
  hospitalToDelete = hospitalId;
  document.getElementById('deleteModal').classList.add('show');
  document.getElementById('modalOverlay').classList.add('show');
}

// إغلاق مودال التأكيد
function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('show');
  document.getElementById('modalOverlay').classList.remove('show');
  hospitalToDelete = null;
}

// تنفيذ الحذف
async function confirmDelete() {
  if (!hospitalToDelete) {
    closeDeleteModal();
    return;
  }
  
  const btn = document.getElementById('confirmDeleteBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Deleting...';
  btn.disabled = true;
  
  try {
    const result = await apiRequest(`/api/MedicalCenters/${hospitalToDelete}`, {
      method: 'DELETE'
    });
    
    // Remove card with animation
    const card = document.querySelector(`[data-hospital-id="${hospitalToDelete}"]`);
    if (card) {
      card.classList.add('removing');
      setTimeout(() => {
        card.remove();
        
        // Check if list is empty
        const container = document.getElementById('hospitalsList');
        if (container.children.length === 0) {
          container.innerHTML = '<div class="empty-message">No hospitals or labs registered yet</div>';
        }
      }, 300);
    }
    
    closeDeleteModal();
    showAlert(result?.message || 'Hospital/Lab deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting hospital:', error);
    showAlert(error.message || 'Failed to delete hospital/lab', 'error');
    closeDeleteModal();
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// تحديث دالة deleteHospital الأصلية
async function deleteHospital(hospitalId) {
  openDeleteModal(hospitalId); // فتح المودال بدلاً من confirm
}

// Event Listeners
document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);

// إغلاق المودال عند الضغط على الـ overlay
document.getElementById('modalOverlay')?.addEventListener('click', closeDeleteModal);

// Make globally accessible
window.deleteHospital = deleteHospital;




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
   LOGOUT (معدل)
   ════════════════════════════════════════════════════ */

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    // ✅ استخدام apiRequest
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
  fetchHospitals(1);
  setEditMode(null);
});