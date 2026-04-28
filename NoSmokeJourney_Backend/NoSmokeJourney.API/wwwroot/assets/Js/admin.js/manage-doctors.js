/**
 * manage-doctors.js — Doctors Management Logic
 */

let currentDoctorId = null;
let currentPage = 1;
let totalPages = 1;

// وقفت اللودنج
document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('saveDoctorBtn');
  if (saveBtn) {
    saveBtn.classList.remove('loading');
    const spinner = saveBtn.querySelector('.btn-spinner');
    if (spinner) spinner.style.display = 'none';
  }
});

/* ════════════════════════════════════════════════════
   FETCH AND DISPLAY DOCTORS (من غير search)
   ════════════════════════════════════════════════════ */

async function fetchAndDisplayDoctors(page = 1) {
  console.log('🔍 Fetching doctors for page:', page);
  
  const tbody = document.getElementById('doctorsTableBody');
  
  // فقط pagination - من غير search ولا filters
  const params = new URLSearchParams({
    page: page,
    limit: 10
  });
  
  try {
    // Show loading
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Loading doctors...</td></tr>'; // ← غيري الـ colspan
    
    // ✅ استخدام apiRequest
    const result = await apiRequest(`/api/Doctors?${params}`);
    
    console.log('📊 API Result:', result);
    
    // The API returns { success, data: { items, totalPages, pageNumber, ... } }
    const responseData = result.data || result;
    const doctors = responseData?.items || (Array.isArray(responseData) ? responseData : []);
    const pagination = responseData; 
    
    console.log('👥 Doctors received:', doctors.length);
    console.log('📄 Pagination:', pagination);
    
    // Update pagination info
    if (pagination) {
      currentPage = pagination.pageNumber;
      totalPages = pagination.totalPages;
      updatePaginationUI(pagination);
    }
    
    // Clear table
    tbody.innerHTML = '';
    
    if (doctors.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-row">No doctors found</td></tr>'; // ← غيري الـ colspan
      return;
    }
    
    // Populate table
    doctors.forEach(doctor => {
      console.log('➕ Adding row for:', doctor.fullName, doctor.id, doctor.specialty);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${doctor.id || '#N/A'}</td>
        <td>${doctor.name || 'N/A'}</td>
        <td>${doctor.email || 'N/A'}</td>
        <td>${doctor.contactInfo || 'N/A'}</td>
        <td>${doctor.specialization || 'N/A'}</td> 
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-sm" onclick="editDoctor('${doctor.id}')">Edit</button>
            <button class="btn btn-red btn-sm" onclick="deleteDoctor('${doctor.id}')">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Failed to load doctors: ' + error.message + '</td></tr>'; // ← غيري الـ colspan
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
    } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
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
  fetchAndDisplayDoctors(page);
};

/* ════════════════════════════════════════════════════
   ADD NEW DOCTOR
   ════════════════════════════════════════════════════ */

document.getElementById('addDoctorBtn')?.addEventListener('click', () => {
  currentDoctorId = null;
  document.getElementById('modalTitle').textContent = 'Add New Doctor';
  
  // Clear form
  document.getElementById('doctorFullName').value = '';
  document.getElementById('doctorEmail').value = '';
  document.getElementById('doctorPhone').value = '';
  document.getElementById('doctorSpecialty').value = '';
  document.getElementById('doctorSchedule').value = '';
  
  document.getElementById('doctorModal').classList.add('show');
});

/* ════════════════════════════════════════════════════
   EDIT DOCTOR
   ════════════════════════════════════════════════════ */

async function editDoctor(doctorId) {
  currentDoctorId = doctorId;
  document.getElementById('modalTitle').textContent = 'Edit Doctor';
  
  try {
    const result = await apiRequest(`/api/Doctors/${doctorId}`);
    const doctor = result || {};
    
    // Populate form
    document.getElementById('doctorFullName').value = doctor.name || '';
    document.getElementById('doctorEmail').value = doctor.email || '';
    document.getElementById('doctorPhone').value = doctor.contactInfo || '';
   const specialtySelect = document.getElementById('doctorSpecialty');
if (specialtySelect && doctor.specialization) {
  specialtySelect.value = doctor.specialization;
}
    document.getElementById('doctorSchedule').value = doctor.about || '';
    document.getElementById('doctorModal').classList.add('show');
    
  } catch (error) {
    console.error('Error fetching doctor:', error);
    showAlert(error.message || 'Failed to load doctor details', 'error');
  }
}

window.editDoctor = editDoctor;

/* ════════════════════════════════════════════════════
   SAVE DOCTOR (Add or Update)
   ════════════════════════════════════════════════════ */

document.getElementById('saveDoctorBtn')?.addEventListener('click', async () => {
  const fullName = document.getElementById('doctorFullName').value.trim();
  const email = document.getElementById('doctorEmail').value.trim();
  const phone = document.getElementById('doctorPhone').value.trim();
  const specialty = document.getElementById('doctorSpecialty').value.trim();
  const schedule = document.getElementById('doctorSchedule').value.trim();
  
  // Validation
  if (!fullName || fullName.length < 3) {
    showAlert('Full name must be at least 3 characters', 'error');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showAlert('Please enter a valid email address', 'error');
    return;
  }
  
  const phoneRegex = /^\+?[0-9\s-]{10,}$/;
  if (!phone || !phoneRegex.test(phone)) {
    showAlert('Please enter a valid phone number', 'error');
    return;
  }
  
  const btn = document.getElementById('saveDoctorBtn');

  
  try {
    const doctorData = { 
        name: fullName, 
        email: email, 
        password: "DefaultPassword123!", // Required by backend User creation
        contactInfo: phone, 
        specialization: specialty, 
        about: schedule,
        location: 'Default Location' // Backend requires location
    };
    
    let result;
    if (currentDoctorId) {
      result = await apiRequest(`/api/Doctors/${currentDoctorId}`, {
        method: 'PUT',
        body: JSON.stringify(doctorData)
      });
    } else {
      result = await apiRequest('/api/Doctors', {
        method: 'POST',
        body: JSON.stringify({ ...doctorData, userId: 1 }) // Should ideally select a user or backend handles it
      });
    }
    
    // Close modal and refresh table
    document.getElementById('doctorModal').classList.remove('show');
    fetchAndDisplayDoctors(currentPage);
    
    showAlert(result?.message || 
              (currentDoctorId ? 'Doctor updated successfully' : 'Doctor added successfully'), 
              'success');
    
  } catch (error) {
    console.error('Error saving doctor:', error);
    showAlert(error.message || 'Failed to save doctor', 'error');
  } finally {
    btn.classList.remove('loading');
  }
});

/* ════════════════════════════════════════════════════
   DELETE DOCTOR
   ════════════════════════════════════════════════════ */

// متغير لتخزين ID الطبيب المراد حذفه
let doctorToDelete = null;

// فتح Modal التأكيد
function confirmDelete(doctorId) {
  doctorToDelete = doctorId;
  const deleteModal = document.getElementById('deleteConfirmModal');
  if (deleteModal) {
    deleteModal.classList.add('show');
  }
}

// تنفيذ عملية الحذف
async function executeDelete() {
  if (!doctorToDelete) return;
  
  const deleteBtn = document.getElementById('confirmDeleteBtn');
  deleteBtn.classList.add('loading');
  
  try {
    const result = await apiRequest(`/api/Doctors/${doctorToDelete}`, {
      method: 'DELETE'
    });
    
    // إغلاق Modal التأكيد
    closeDeleteModal();
    
    // تحديث الجدول
    fetchAndDisplayDoctors(currentPage);
    
    // عرض رسالة نجاح
    showAlert(result?.message || 'Doctor deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting doctor:', error);
    showAlert(error.message || 'Failed to delete doctor', 'error');
    closeDeleteModal();
  } finally {
    deleteBtn.classList.remove('loading');
  }
}

// إغلاق Modal التأكيد
function closeDeleteModal() {
  const deleteModal = document.getElementById('deleteConfirmModal');
  if (deleteModal) {
    deleteModal.classList.remove('show');
  }
  doctorToDelete = null;
}

// تعديل دالة deleteDoctor الموجودة
window.deleteDoctor = function(doctorId) {
  confirmDelete(doctorId);
};

/* ════════════════════════════════════════════════════
   MODAL CONTROLS
   ════════════════════════════════════════════════════ */

document.getElementById('closeModalBtn')?.addEventListener('click', () => {
  document.getElementById('doctorModal').classList.remove('show');
});

document.getElementById('doctorModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'doctorModal') {
    document.getElementById('doctorModal').classList.remove('show');
  }
});

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
  fetchAndDisplayDoctors(1);
});