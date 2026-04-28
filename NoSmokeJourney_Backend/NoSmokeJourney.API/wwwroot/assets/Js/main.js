'use strict';

// ============================================================
// CHECK AUTH STATUS ON PAGE LOAD
// ============================================================
console.log('🔍 Page loaded - Auth Status:', {
    jwt_token: localStorage.getItem('jwt_token') ? '✅ Present' : '❌ Missing',
    isAuthenticated: !!localStorage.getItem('jwt_token')
});

// ============================================================
// ❶ CHECK IF CONFIG.JS IS LOADED
// ============================================================
if (typeof apiRequest === 'undefined') {
    console.error('❌ config.js not loaded! Please include it before main.js');
}

// ============================================================
// ❷ FALLBACK DATA
// ============================================================
const FALLBACK_DATA = {
    successStories: [
        { id: 'story_1', author: 'Ahmed Mohamed', text: 'Thanks to LungCare!', duration: '2 Years Smoke-Free', status: 'approved' },
        { id: 'story_2', author: 'Nour Alaa', text: 'Life has changed!', duration: '6 Months Smoke-Free', status: 'approved' },
        { id: 'story_3', author: 'Mohamed Ahmed', text: 'Started exercising!', duration: '3 Months Smoke-Free', status: 'approved' }
    ],
    seminars: [
        { id: 'sem_1', title: 'Smoking Awareness', date: '2024-03-15', time: '18:00 - 20:00', location: 'Cairo Marriott', speaker: 'Dr. Ahmed Hassan' },
        { id: 'sem_2', title: 'How to Quit Smoking', date: '2024-03-20', time: '17:00 - 19:00', location: 'Online - Zoom', speaker: 'Dr. Sara Mahmoud' }
    ]
};

// ============================================================
// ❸ AUTH HELPERS
// ============================================================
function checkAuth() { 
    return localStorage.getItem('jwt_token') || null; 
}

function isAuthenticated() { 
    return !!checkAuth(); 
}

function getAuthToken() { 
    return checkAuth(); 
}

function getCurrentUserId() { 
    return localStorage.getItem('user_id') || null; 
}

function getUserName() { 
    return localStorage.getItem('user_name') || 'User'; 
}

function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    updateNavbarUI(); // ✅ حدّث الـ navbar فوراً
    showNotification('Logged out successfully', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// ============================================================
// ❹ NOTIFICATION
// ============================================================
function showNotification(message, type = 'success') {
    document.querySelector('.notification')?.remove();
    const el = document.createElement('div');
    el.className = 'notification';
    el.style.cssText = `
        position:fixed;bottom:20px;right:20px;
        background:${type === 'success' ? '#16a34a' : '#dc2626'};
        color:#fff;padding:14px 22px;border-radius:10px;
        z-index:10000;font-size:.95rem;font-weight:600;
        box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:360px;
    `;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// ============================================================
// ❺ NAVBAR UI
// ============================================================
function updateNavbarUI() {
    const guestEl = document.getElementById('nav-auth-guest');
    const userEl  = document.getElementById('nav-auth-user');
    if (!guestEl || !userEl) return;

    if (isAuthenticated()) {
        guestEl.style.display = 'none';
        userEl.style.display  = 'flex';
        
        const userName = getUserName();
        const iconEl = document.getElementById('user-profile-icon');
        if (iconEl) iconEl.title = `Hello, ${userName} 👋`;
    } else {
        guestEl.style.display = '';
        userEl.style.display  = 'none';
    }
}

// ============================================================
// ❻ PROTECTED LINKS — FIXED VERSION
// ============================================================
function showAuthToast(e) {
    if (e) e.preventDefault();
    const toast = document.getElementById('auth-toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }
    localStorage.setItem('redirect_after_login', window.location.href);
    setTimeout(() => { window.location.href = 'page/auth/login.html'; }, 1800);
}

/**
 * ✅ FIXED: الدالة الصحيحة للـ protected links
 * - لو User مش مسجل → يوديه login
 * - لو User مسجل → يخليه يروح للصفحة عادي
 */
function attachAccessControl() {
    document.querySelectorAll('[data-protected="true"]').forEach(el => {
        el.addEventListener('click', function(e) {
            if (!isAuthenticated()) {
                // ❌ User مش مسجل
                e.preventDefault();  // منع الانتقال
                showAuthToast(e);    // عرض Toast والتوجيه للـ login
            }
            // ✅ User مسجل → لا تفعل شيء، اترك الـ link ينفذ عادي
            // الـ browser هيروح للصفحة المكتوبة في href
        });
    });
}

function attachLogoutListener() {
    const logoutLink = document.getElementById('logout-link');
    if (!logoutLink) return;
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) logout();
    });
}

// ============================================================
// ❼ FETCH SUCCESS STORIES
// ============================================================
async function loadSuccessStories() {
    console.log('📖 Loading success stories...');
    
    const container = document.getElementById('success-stories-container');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;color:#64748b;">Loading stories...</p>';
    
    try {
        const response = await apiRequest('/api/RecoveryStories/approved');
        console.log('✅ Stories response:', response);
        
        const stories = response.data || [];
        
        if (stories.length === 0) {
            console.log('📖 No stories found, using fallback');
            renderStories(FALLBACK_DATA.successStories, container);
            return;
        }
        
        renderStories(stories, container);
        
    } catch (error) {
        console.error('❌ Error loading stories:', error);
        console.log('📖 Using fallback stories');
        renderStories(FALLBACK_DATA.successStories, container);
    }
}

function renderStories(stories, container) {
    container.innerHTML = '';

    stories.forEach(story => {
        const author   = story.author   || story.name        || 'Anonymous';
        const text     = story.text     || story.testimonial || '';
        const duration = story.duration || '';

        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';

        col.innerHTML = `
            <div class="story-card" style="height:100%;">
                <div class="story-badge">${escapeHtml(duration)}</div>
                <h3 class="story-name">${escapeHtml(author)}</h3>
                <p class="story-text">"${escapeHtml(text)}"</p>
            </div>
        `;

        container.appendChild(col);
    });
}

// ============================================================
// ❽ FETCH SEMINARS
// ============================================================
async function loadSeminars() {
    console.log('🎓 Loading seminars...');
    
    const container = document.getElementById('seminars-container');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;color:#64748b;">Loading seminars...</p>';
    
    try {
        const response = await apiRequest('/api/Seminars/upcoming');
        console.log('✅ Seminars response:', response);
        
        const seminars = response.data || [];
        
        if (seminars.length === 0) {
            console.log('🎓 No seminars found, using fallback');
            renderSeminars(FALLBACK_DATA.seminars, container);
            return;
        }
        
        renderSeminars(seminars, container);
        
    } catch (error) {
        console.error('❌ Error loading seminars:', error);
        console.log('🎓 Using fallback seminars');
        renderSeminars(FALLBACK_DATA.seminars, container);
    }
}

function renderSeminars(seminars, container) {
    container.innerHTML = '';

    seminars.forEach(seminar => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';

        col.innerHTML = `
            <div class="seminar-card">
                <div class="seminar-badge" style="
                    background:linear-gradient(135deg,#2563eb,#1d4ed8);
                    color:#fff;padding:0.4rem 1rem;border-radius:20px;
                    font-size:0.8rem;font-weight:600;display:inline-block;margin-bottom:1rem;
                ">Upcoming</div>
                <h3 class="seminar-title">${escapeHtml(seminar.title)}</h3>
                <div class="seminar-info">
                    📅 <strong>${escapeHtml(seminar.date || '')} — ${escapeHtml(seminar.time || '')}</strong><br>
                    📍 ${escapeHtml(seminar.location || '')}<br>
                    🎙️ ${escapeHtml(seminar.speaker || '')}
                    ${seminar.description ? `<p style="margin-top:0.75rem;margin-bottom:0;">${escapeHtml(seminar.description)}</p>` : ''}
                </div>
                <button class="btn btn-register register-btn" data-seminar-id="${seminar.id}">
                    Register
                </button>
            </div>
        `;

        col.querySelector('.register-btn').addEventListener('click', () => {
            if (!isAuthenticated()) {
                showAuthToast();
                return;
            }
            openRegistrationModal(seminar);
        });

        container.appendChild(col);
    });
}

// ============================================================
// REGISTRATION MODAL
// ============================================================
function openRegistrationModal(seminar) {
    document.getElementById('reg-modal-overlay')?.remove();

    // Pre-fill from localStorage

    const overlay = document.createElement('div');
    overlay.id = 'reg-modal-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;
        background:rgba(15,23,42,0.60);
        backdrop-filter:blur(5px);
        z-index:9999;
        display:flex;align-items:center;justify-content:center;
        padding:1rem;
        animation:regFadeIn .18s ease;
    `;

    overlay.innerHTML = `
        <style>
            @keyframes regFadeIn  { from{opacity:0} to{opacity:1} }
            @keyframes regSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
            #reg-modal {
                background:#fff;border-radius:20px;padding:2rem;
                width:100%;max-width:430px;
                box-shadow:0 28px 64px rgba(0,0,0,.20);
                animation:regSlideUp .22s ease;font-family:inherit;
            }
            #reg-modal-header {
                display:flex;align-items:flex-start;justify-content:space-between;
                margin-bottom:1.25rem;
            }
            #reg-modal-header h2 {
                margin:0;font-size:1.2rem;font-weight:700;color:#0f172a;line-height:1.3;
            }
            #reg-modal-header .reg-seminar-badge {
                display:inline-block;margin-top:.35rem;font-size:.78rem;
                font-weight:600;color:#2563eb;background:#eff6ff;
                border-radius:6px;padding:.25rem .65rem;
            }
            #reg-close-btn {
                background:none;border:none;cursor:pointer;font-size:1.4rem;
                color:#94a3b8;line-height:1;padding:0 0 0 .5rem;flex-shrink:0;
            }
            #reg-close-btn:hover { color:#0f172a; }
            .reg-field { margin-top:1rem; }
            .reg-field label {
                display:block;font-size:.78rem;font-weight:600;color:#475569;
                margin-bottom:.38rem;letter-spacing:.02em;text-transform:uppercase;
            }
            .reg-field input {
                width:100%;box-sizing:border-box;border:1.5px solid #e2e8f0;
                border-radius:10px;padding:.65rem .9rem;font-size:.95rem;color:#0f172a;
                outline:none;transition:border-color .15s,box-shadow .15s;background:#fff;
            }
            .reg-field input:focus { border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12); }
            .reg-field input.reg-error { border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.10); }
            .reg-error-msg { font-size:.75rem;color:#ef4444;margin-top:.3rem;display:none; }
            .reg-field input.reg-error + .reg-error-msg { display:block; }
            .reg-divider { border:none;border-top:1px solid #f1f5f9;margin:1.4rem 0 1.1rem; }
            .reg-actions { display:flex;gap:.75rem; }
            #reg-cancel-btn {
                flex:1;padding:.65rem;border-radius:10px;border:1.5px solid #e2e8f0;
                background:#fff;color:#64748b;font-weight:600;cursor:pointer;font-size:.9rem;
                transition:background .12s;
            }
            #reg-cancel-btn:hover { background:#f8fafc; }
            #reg-submit-btn {
                flex:2;padding:.65rem;border-radius:10px;border:none;
                background:linear-gradient(135deg,#2563eb,#1d4ed8);
                color:#fff;font-weight:700;cursor:pointer;font-size:.9rem;transition:opacity .12s;
            }
            #reg-submit-btn:disabled { opacity:.55;cursor:not-allowed; }
            #reg-submit-btn:hover:not(:disabled) { opacity:.88; }
        </style>
        <div id="reg-modal" role="dialog" aria-modal="true" aria-labelledby="reg-modal-title">
            <div id="reg-modal-header">
                <div>
                    <h2 id="reg-modal-title">Register for Seminar</h2>
                    <span class="reg-seminar-badge">&#x1F4C5; REG_SEMINAR_TITLE</span>
                </div>
                <button id="reg-close-btn" aria-label="Close">&times;</button>
            </div>
            <div class="reg-field">
                <label for="reg-name">Full Name</label>
                <input type="text" id="reg-name" autocomplete="name" value="REG_PREFILL_NAME" />
                <div class="reg-error-msg">Please enter your full name.</div>
            </div>
            <div class="reg-field">
                <label for="reg-phone">Phone Number</label>
                <input type="tel" id="reg-phone" autocomplete="tel" />
                <div class="reg-error-msg">Please enter your phone number.</div>
            </div>
            <div class="reg-field">
                <label for="reg-email">Email Address</label>
                <input type="email" id="reg-email" autocomplete="email" value="REG_PREFILL_EMAIL" />
                <div class="reg-error-msg">Please enter a valid email address.</div>
            </div>
            <hr class="reg-divider" />
            <div class="reg-actions">
                <button id="reg-cancel-btn">Cancel</button>
                <button id="reg-submit-btn">Confirm Registration</button>
            </div>
        </div>
    `
    .replace('REG_SEMINAR_TITLE',  seminar.title.replace(/[<>]/g, ''))
    .replace('REG_PREFILL_NAME',   '')
    .replace('REG_PREFILL_EMAIL',  '');

    document.body.appendChild(overlay);

    // Close handlers
    const closeModal = () => overlay.remove();
    document.getElementById('reg-close-btn').addEventListener('click', closeModal);
    document.getElementById('reg-cancel-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
    });

    // Submit handler
    document.getElementById('reg-submit-btn').addEventListener('click', async () => {
        const nameEl  = document.getElementById('reg-name');
        const phoneEl = document.getElementById('reg-phone');
        const emailEl = document.getElementById('reg-email');

        // Validation
        let valid = true;
        [nameEl, phoneEl, emailEl].forEach(el => el.classList.remove('reg-error'));
        if (!nameEl.value.trim())                                  { nameEl.classList.add('reg-error');  valid = false; }
        if (!phoneEl.value.trim())                                 { phoneEl.classList.add('reg-error'); valid = false; }
        if (!emailEl.value.trim() || !emailEl.value.includes('@')) { emailEl.classList.add('reg-error'); valid = false; }
        if (!valid) return;

        const submitBtn = document.getElementById('reg-submit-btn');
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // ── الـ backend يجيب userId من الـ JWT token ──
            // ── الـ seminarId جاي في الـ URL ──
            // ── بنبعت بس الـ 3 fields اللي المستخدم كتبها ──
            await apiRequest('/api/Seminars/register', {
                method: 'POST',
                body: JSON.stringify({
                    seminarId: parseInt(seminar.id),
                    notes: `Registered via website by ${nameEl.value.trim()}`
                })
            });

            closeModal();
            showNotification(
                '✅ Registration request received! A confirmation email will be sent to your inbox.',
                'success'
            );

        } catch (error) {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Confirm Registration';

            if (error.message === 'ALREADY_REGISTERED') {
                showNotification('You have already registered for this seminar.', 'error');
            } else if (error.message === 'SEMINAR_FULL') {
                closeModal();
                showNotification('Seminar is full. You will be notified by email if a seat becomes available.', 'error');
            } else {
                showNotification('Registration failed. Please try again.', 'error');
            }
        }
    });

    // Focus first empty field
    const firstEmpty = [
        document.getElementById('reg-name'),
        document.getElementById('reg-phone'),
        document.getElementById('reg-email')
    ].find(el => !el.value.trim());
    setTimeout(() => (firstEmpty || document.getElementById('reg-name')).focus(), 80);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ============================================================
// ❾ HERO ANIMATIONS
// ============================================================
function runTypewriter() {
    const element = document.querySelector('.typewriter-text');
    if (!element) return;
    
    const text = 'You Matter.';
    let i = 0;
    
    element.textContent = '';
    element.classList.remove('typewriter-done');
    
    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
            element.classList.add('typewriter-done');
        }
    }, 100);
}

function runHeroFadeIns() {
    const fadeUpEls = document.querySelectorAll('.anim-fade-up');
    const fadeRightEls = document.querySelectorAll('.anim-fade-right');
    
    fadeUpEls.forEach(el => {
        el.classList.add('anim-visible');
    });
    
    fadeRightEls.forEach(el => {
        el.classList.add('anim-visible');
    });
}

// ============================================================
// ❿ INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 LungCare Home Page Initialized');
    console.log('📦 Config MODE:', typeof CONFIG !== 'undefined' ? CONFIG.MODE : 'Config not loaded');
    
    // 1. Navbar & Auth
    updateNavbarUI();
    attachAccessControl();  // ✅ هذه الدالة اتصلحت
    attachLogoutListener();
    
    // 2. Animations
    runTypewriter();
    runHeroFadeIns();
    
    // 3. Load Data
    if (typeof apiRequest !== 'undefined') {
        await loadSuccessStories();
        await loadSeminars();
    } else {
        console.warn('⚠️ config.js not loaded, using fallback data only');
        renderStories(FALLBACK_DATA.successStories, document.getElementById('success-stories-container'));
        renderSeminars(FALLBACK_DATA.seminars, document.getElementById('seminars-container'));
    }
    
    console.log('✅ Page ready');
    console.log(isAuthenticated() ? '✅ User authenticated' : '🔒 Guest session');
});

// ============================================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================================
window.updateNavbarUI = updateNavbarUI;
window.isAuthenticated = isAuthenticated;
window.checkAuth = checkAuth;
window.logout = logout;