/**
 * moderate-stories.js — Stories Moderation Logic
 * Handles: fetch stories, approve, reject, delete with pagination and filters
 */

let currentPage = 1;
let totalPages = 1;
let currentStatus = 'pending';
let storyToDelete = null;

/* ════════════════════════════════════════════════════
   FETCH AND DISPLAY STORIES
   ════════════════════════════════════════════════════ */

async function fetchStories(page = 1, status = currentStatus) {
  const container = document.getElementById('storiesList');
  
  currentPage = page;
  currentStatus = status;
  
  const params = new URLSearchParams({
    page: page,
    limit: 10,
    status: status
  });
  
  try {
    container.innerHTML = '<div class="loading-message">Loading stories...</div>';
    
    const result = await apiRequest(`/api/RecoveryStories?${params}`);
    
    // The API returns { success, data: { items, pageNumber, totalPages, ... } }
    const responseData = result.data || result;
    const stories = responseData?.items || [];
    const pagination = responseData; 
    
    // Note: Backend doesn't return filters count in this endpoint yet
    // I will mock them or we can add an endpoint for stats later
    
    if (pagination) {
      currentPage = pagination.pageNumber;
      totalPages = pagination.totalPages;
      updatePaginationUI(pagination);
    }
    
    updateActiveTab(status);
    container.innerHTML = '';
    
    if (stories.length === 0) {
      container.innerHTML = '<div class="empty-message">No stories found</div>';
      return;
    }
    
    stories.forEach(story => {
      const card = createStoryCard(story);
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error fetching stories:', error);
    container.innerHTML = '<div class="empty-message">Failed to load stories. Please try again.</div>';
  }
}

/* ════════════════════════════════════════════════════
   UPDATE ACTIVE TAB
   ════════════════════════════════════════════════════ */

function updateActiveTab(status) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.dataset.status === status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/* ════════════════════════════════════════════════════
   TAB CLICK HANDLERS
   ════════════════════════════════════════════════════ */

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const status = btn.dataset.status;
    fetchStories(1, status);
  });
});

/* ════════════════════════════════════════════════════
   PAGINATION
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
  fetchStories(page, currentStatus);
};

/* ════════════════════════════════════════════════════
   CREATE STORY CARD
   ════════════════════════════════════════════════════ */

function createStoryCard(story) {
  const card = document.createElement('div');
  card.className = `story-card status-${story.status}`;
  card.dataset.storyId = story.id;
  
  const dateStr = story.createdAt 
    ? new Date(story.createdAt).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '';
  
  const statusLabels = {
    pending: '⏳ Pending',
    approved: '✅ Approved',
    rejected: '❌ Rejected'
  };
  
  let actionsHtml = '';
  
  if (story.status === 'pending') {
    actionsHtml = `
      <button class="btn btn-primary btn-sm" onclick="approveStory('${story.id}')">✅ Accept</button>
      <button class="btn btn-warning btn-sm" onclick="rejectStory('${story.id}')">❌ Reject</button>
    `;
  }
  
  card.innerHTML = `
    <div class="story-header">
      <div class="story-author-info">
        <h3 class="story-author">${story.author || 'Anonymous'}</h3>
        <span class="story-status-badge status-${story.status}">${statusLabels[story.status]}</span>
      </div>
      ${dateStr ? `<span class="story-date">${dateStr}</span>` : ''}
    </div>
    <p class="story-text">${story.text || story.content || 'No content'}</p>
    <div class="story-actions">
      ${actionsHtml}
      <button class="btn btn-red btn-sm" onclick="deleteStory('${story.id}')">🗑️ Delete</button>
    </div>
  `;
  
  return card;
}

/* ════════════════════════════════════════════════════
   APPROVE STORY
   ════════════════════════════════════════════════════ */

async function approveStory(storyId) {
  try {
    const result = await apiRequest(`/api/RecoveryStories/${storyId}/approve`, {
      method: 'POST'
    });
    
    fetchStories(currentPage, currentStatus);
    showAlert('Story approved successfully', 'success');
    
  } catch (error) {
    console.error('Error approving story:', error);
    showAlert(error.message || 'Failed to approve story', 'error');
  }
}

window.approveStory = approveStory;

/* ════════════════════════════════════════════════════
   REJECT STORY (مباشر بدون مودال)
   ════════════════════════════════════════════════════ */

async function rejectStory(storyId) {
  if (!confirm('Are you sure you want to reject this story?')) return;
  
  try {
    const result = await apiRequest(`/api/RecoveryStories/${storyId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Rejected by admin' })
    });
    
    fetchStories(currentPage, currentStatus);
    showAlert('Story rejected', 'success');
    
  } catch (error) {
    console.error('Error rejecting story:', error);
    showAlert(error.message || 'Failed to reject story', 'error');
  }
}

window.rejectStory = rejectStory;

/* ════════════════════════════════════════════════════
   DELETE STORY WITH CONFIRMATION MODAL
   ════════════════════════════════════════════════════ */

function openDeleteModal(storyId) {
  storyToDelete = storyId;
  document.getElementById('deleteModal').classList.add('show');
  document.getElementById('deleteModalOverlay').classList.add('show');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('show');
  document.getElementById('deleteModalOverlay').classList.remove('show');
  storyToDelete = null;
}

async function confirmDelete() {
  if (!storyToDelete) {
    closeDeleteModal();
    return;
  }
  
  const btn = document.getElementById('confirmDeleteBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Deleting...';
  btn.disabled = true;
  
  try {
    const result = await apiRequest(`/api/RecoveryStories/${storyToDelete}`, {
      method: 'DELETE'
    });
    
    fetchStories(currentPage, currentStatus);
    
    closeDeleteModal();
    showAlert(result?.message || 'Story deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting story:', error);
    showAlert(error.message || 'Failed to delete story', 'error');
    closeDeleteModal();
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

async function deleteStory(storyId) {
  openDeleteModal(storyId);
}

document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
document.getElementById('deleteModalOverlay')?.addEventListener('click', closeDeleteModal);

window.deleteStory = deleteStory;

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
  fetchStories(1, 'pending');
});