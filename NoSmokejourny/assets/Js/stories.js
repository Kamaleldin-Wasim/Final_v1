'use strict';


// ============================================================
// ❶ التأكد من تحميل config.js
// ============================================================
if (typeof apiRequest === 'undefined') {
    console.error('❌ config.js not loaded! Please include it before stories.js');
    alert('Error: config.js must be loaded first');
}

// ============================================================
// ❷ دوال المساعدة للمصادقة
// ============================================================
function isAuthenticated() { return !!localStorage.getItem('jwt_token'); }
function getToken() { return localStorage.getItem('jwt_token') || ''; }
function getUserName() { return localStorage.getItem('user_name') || 'User'; }
function getUserId() { return localStorage.getItem('user_id') || ''; }

function getInitials(name) {
    return name.trim().split(' ')
        .map(w => w[0]?.toUpperCase() || '')
        .slice(0, 2)
        .join('');
}

function updateNavbarUI() {
    const guestEl = document.getElementById('nav-auth-guest');
    const userEl = document.getElementById('nav-auth-user');
    if (!guestEl || !userEl) return;

    if (isAuthenticated()) {
        guestEl.style.display = 'none';
        userEl.style.display = 'flex';
        const iconEl = document.getElementById('user-profile-icon');
        if (iconEl) iconEl.title = `Logged in as ${getUserName()}`;
    } else {
        guestEl.style.display = '';
        userEl.style.display = 'none';
    }
}

function initLogout() {
    const logoutLink = document.getElementById('logout-link');
    if (!logoutLink) return;
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        window.location.href = 'index.html';
    });
}

// ============================================================
// ❸ Toast للمستخدمين غير المسجلين
// ============================================================
function showAuthToast() {
    const toast = document.getElementById('auth-toast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
}

function initProtectedLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-protected="true"]');
        if (!link) return;
        if (!isAuthenticated()) {
            e.preventDefault();
            showAuthToast();
        }
    });
}

// ============================================================
// ❹ إظهار/إخفاء واجهة المستخدم
// ============================================================
function renderAuthUI() {
    const guestLock = document.getElementById('guestLock');
    const shareCard = document.getElementById('shareCard');
    const reviewNote = document.getElementById('reviewNotice');

    if (isAuthenticated()) {
        if (guestLock) guestLock.style.display = 'none';

        // إخفاء إشعار المراجعة إذا كان ظاهراً من المرة السابقة
        const reviewShown = reviewNote && reviewNote.style.display !== 'none';
        if (!reviewShown && shareCard) shareCard.style.display = 'block';

        const name = getUserName();
        const el = document.getElementById('shareUsername');
        if (el) el.textContent = name;

        const av = document.getElementById('shareAvatar');
        if (av) av.textContent = getInitials(name);
    } else {
        if (guestLock) guestLock.style.display = 'block';
        if (shareCard) shareCard.style.display = 'none';
    }
}

// ============================================================
// ❺ جلب القصص (المقبولة فقط) من config.js
// ============================================================
async function fetchStories() {
    console.log('📖 Fetching stories for user...');

    try {
        // ✅ FIX: جلب القصص المقبولة فقط - use query parameter format
        const response = await apiRequest('/api/RecoveryStories?status=approved');
        console.log('✅ Stories response:', response);

        // Return the actual array from response.data
        return response.data || response || [];

    } catch (error) {
        console.error('❌ Error fetching stories:', error);
        return []; // في حالة الخطأ، أرجع مصفوفة فارغة
    }
}

// ============================================================
// ❻ دوال مساعدة لرسم البطاقة
// ============================================================
function timeAgo(isoDate) {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function buildAvatarColor(name) {
    const colors = [
        '#2563EB', '#0891B2', '#059669', '#7C3AED',
        '#DB2777', '#D97706', '#16A34A', '#DC2626'
    ];
    let hash = 0;
    for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
    return colors[hash];
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function renderStoryCard(story) {
    const card = document.createElement('article');
    card.className = 'story-card';
    card.dataset.id = story.id;

    const initials = getInitials(story.authorName || 'User');
    const bgColor = buildAvatarColor(story.authorName || '');
    // ✅ استخدام دالة timeAgo لعرض تاريخ النشر بشكل مفهوم
    const timeText = story.publishedAt ? timeAgo(story.publishedAt) : (story.createdAt ? timeAgo(story.createdAt) : '');

    card.innerHTML = `
        <div class="story-card__top">
            <div class="story-avatar" style="background:${bgColor};">${escapeHtml(initials)}</div>
            <div class="story-meta">
                <span class="story-name">${escapeHtml(story.authorName || 'Anonymous')}</span>
                <div class="story-info">
                    <span class="story-duration">${escapeHtml(story.title || 'Recovery Story')}</span>
                    ${timeText ? `<span class="story-time">• ${escapeHtml(timeText)}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="story-card__body">${escapeHtml(story.content || '')}</div>
    `;

    return card;
}

// ============================================================
// ❼ تحميل وعرض القصص في الصفحة الرئيسية (للمستخدم)
// ============================================================
async function loadFeed() {
    const loadingEl = document.getElementById('feedLoading');
    const emptyEl = document.getElementById('feedEmpty');
    const errorEl = document.getElementById('feedError');
    const listEl = document.getElementById('storiesList');

    if (loadingEl) loadingEl.style.display = 'flex';
    if (emptyEl) emptyEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (listEl) listEl.innerHTML = '';

    try {
        const stories = await fetchStories();

        if (loadingEl) loadingEl.style.display = 'none';

        if (!stories || stories.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        stories.forEach(story => {
            if (listEl) listEl.appendChild(renderStoryCard(story));
        });

    } catch (err) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'block';
        console.error('Feed load error:', err);
    }
}

// ============================================================
// ❽ إرسال قصة جديدة (POST) إلى config.js بحالة "pending"
// ============================================================
async function submitStory(content) {
    console.log('📝 Submitting story for review...');

    // ✅ إنشاء كائن القصة 
    const storyPayload = {
        title: "My Success Story", // العنوان
        content: content,           // المحتوى
        photoUrl: ""               // الصورة (اختياري)
    };

    console.log('Story Payload:', storyPayload);

    try {
        // ✅ إرسال القصة إلى الـ endpoint المخصص
        const response = await apiRequest('/api/RecoveryStories', {
            method: 'POST',
            body: JSON.stringify(storyPayload)
        });

        console.log('✅ Story submitted and pending approval:', response);
        return response;

    } catch (error) {
        console.error('❌ Submit error:', error);
        throw error;
    }
}

// ============================================================
// ❾ تفعيل نموذج المشاركة
// ============================================================
function initShareForm() {
    const textarea = document.getElementById('storyTextarea');
    const charCount = document.getElementById('charCount');
    const postBtn = document.getElementById('postBtn');
    const shareCard = document.getElementById('shareCard');
    const reviewNote = document.getElementById('reviewNotice');
    const shareAgain = document.getElementById('shareAnotherBtn');

    if (!textarea || !postBtn) return;

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        if (charCount) charCount.textContent = len;
        postBtn.disabled = len < 10; // تفعيل الزر فقط إذا كان النص 10 حروف أو أكثر
    });
    postBtn.disabled = true;

    postBtn.addEventListener('click', async () => {
        const content = textarea.value.trim();
        if (content.length < 10) return;

        postBtn.disabled = true;
        postBtn.textContent = 'Posting…';

        try {
            await submitStory(content);
            console.log('Story submitted successfully');

            // إخفاء صندوق المشاركة وإظهار إشعار "قيد المراجعة"
            if (shareCard) shareCard.style.display = 'none';
            if (reviewNote) reviewNote.style.display = 'block';

            // تفريغ الحقول
            textarea.value = '';
            if (charCount) charCount.textContent = '0';

        } catch (err) {
            console.error('Submit error:', err);
            // إعادة تفعيل الزر في حالة الفشل
            postBtn.disabled = false;
            postBtn.textContent = 'Post Now';
            alert('Couldn\'t submit your story. Please try again.');
        }
    });

    // زر "Share Another Story" يعيد إظهار صندوق المشاركة
    if (shareAgain) {
        shareAgain.addEventListener('click', () => {
            if (reviewNote) reviewNote.style.display = 'none';
            if (shareCard) shareCard.style.display = 'block';
            textarea.focus();
        });
    }
}

function initFeedEvents() {
    document.getElementById('retryBtn')?.addEventListener('click', () => {
        document.getElementById('feedError').style.display = 'none';
        loadFeed();
    });
}

// ============================================================
// ❿ التهيئة الرئيسية
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Stories page initialized for user view');
    console.log('📦 Config MODE:', CONFIG?.MODE || 'unknown');

    updateNavbarUI();
    initLogout();
    initProtectedLinks();
    renderAuthUI();
    initShareForm(); // ✅ تفعيل نموذج المشاركة
    initFeedEvents();
    loadFeed();      // ✅ تحميل وعرض القصص

    console.log('✅ Stories page ready');
});