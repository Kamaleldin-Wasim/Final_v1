'use strict';

/* ================================================================
   doctor.js — UPDATED TO WORK WITH config.js (ADMIN COMPATIBLE)
   ================================================================ */

// ============================================================
// ❶ CHECK IF CONFIG.JS IS LOADED
// ============================================================
if (typeof apiRequest === 'undefined') {
    console.error('❌ config.js not loaded! Please include it before doctor.js');
    alert('Error: config.js must be loaded first');
}

// ============================================================
// ❷ FALLBACK DATA (للعرض لو فيه مشكلة)
// ============================================================
const FALLBACK_DOCTORS = [
  { id:'doc_1', fullName:"Dr. Ahmed Hassan", specialty:"Pulmonology", phone:"+20 123 456 7890", email:"ahmed@hospital.com", schedule:"Sun-Thu 9AM-3PM" },
  { id:'doc_2', fullName:"Dr. Sara Mahmoud", specialty:"Oncology", phone:"+20 123 456 7891", email:"sara@hospital.com", schedule:"Mon-Wed 10AM-4PM" },
  { id:'doc_3', fullName:"Dr. Mohamed Ali", specialty:"Smoking Cessation", phone:"+20 123 456 7892", email:"mohamed@hospital.com", schedule:"Sun-Thu 11AM-5PM" }
];

const FALLBACK_HOSPITALS = [
  { id:'hosp_1', name:"Cairo Medical Center", type:"private_hospital", location:"Nasr City, Cairo", article:"Leading medical center with 24/7 emergency services", mapLink:"https://maps.google.com" },
  { id:'hosp_2', name:"Alexandria Lab", type:"private_hospital", location:"Smouha, Alexandria", article:"Modern laboratory services with fast results", mapLink:"https://maps.google.com" }
];

// ============================================================
// ❸ AUTH HELPERS
// ============================================================
function checkAuth()       { return localStorage.getItem('jwt_token') || null; }
function isAuthenticated() { return !!checkAuth(); }
function getAuthToken()    { return checkAuth(); }
function getUserId()       { return localStorage.getItem('user_id') || 'guest'; }
function getUserName()     { return localStorage.getItem('user_name') || 'User'; }

function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('authToken');
    showNotification('Logged out successfully.', 'success');
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
        animation:slideInRight .3s ease;
    `;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

// ============================================================
// ❺ LOADING STATES
// ============================================================
function showSkeletons(show) {
    const skeletons = document.getElementById('loading-skeletons');
    if (skeletons) skeletons.style.display = show ? 'flex' : 'none';
}

function updateResultsCount(n) {
    const countEl = document.getElementById('results-count');
    if (countEl) countEl.textContent = n;
    
    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = n;
}

// ============================================================
// ❻ FETCH DATA (using apiRequest from config.js)
// ============================================================

async function fetchDoctors() {
    console.log('📋 Fetching doctors...');
    
    try {
        const response = await apiRequest('/api/Doctors');
        console.log('✅ Doctors response:', response);
        return response.data || response || [];
    } catch (error) {
        console.error('❌ Error fetching doctors:', error);
        return FALLBACK_DOCTORS;
    }
}

async function fetchHospitals() {
    console.log('🏥 Fetching hospitals...');
    
    try {
        const response = await apiRequest('/api/MedicalCenters');
        console.log('✅ Medical Centers response:', response);
        return response.data || response || [];
    } catch (error) {
        console.error('❌ Error fetching medical centers:', error);
        return FALLBACK_HOSPITALS;
    }
}

// ============================================================
// ❼ MAIN LOAD FUNCTION (MODIFIED - Added filter variables)
// ============================================================

// متغيرات عامة للفلتر
let allDoctors = [];
let allHospitals = [];

async function loadAllData() {
    console.log('🔄 Loading all data...');
    showSkeletons(true);
    
    try {
        const [doctors, hospitals] = await Promise.all([
            fetchDoctors(),
            fetchHospitals()
        ]);
        
        // تخزين البيانات للفلتر
        allDoctors = doctors;
        allHospitals = hospitals;
        
        console.log('📊 Doctors from API:', doctors);
        console.log('📊 Hospitals from API:', hospitals);
        
        // ✅ تصنيف الدكاترة حسب التخصص بالضبط
        const pulmonologists = doctors.filter(d => 
            (d.specialization || d.specialty) === 'Pulmonology'
        );
        
        const oncologists = doctors.filter(d => 
            (d.specialization || d.specialty) === 'Oncology'
        );
        
        const cessation = doctors.filter(d => 
            (d.specialization || d.specialty) === 'Smoking Cessation'
        );
        
        // ✅ تصنيف المستشفيات حسب النوع بالضبط
        const freeHospitals = hospitals.filter(h => 
            (h.specialization || h.type) === 'government_hospital' || 
            (h.specialization || h.type) === 'government' ||
            (h.specialization || h.type) === 'free'
        );
        
        const paidHospitals = hospitals.filter(h => 
            (h.specialization || h.type) === 'private_hospital' || 
            (h.specialization || h.type) === 'private' ||
            (h.specialization || h.type) === 'hospital' || 
            (h.specialization || h.type) === 'clinic' || 
            (h.specialization || h.type) === 'lab' || 
            (h.specialization || h.type) === 'center'
        );
        
        console.log('📊 Pulmonologists:', pulmonologists.length);
        console.log('📊 Oncologists:', oncologists.length);
        console.log('📊 Cessation:', cessation.length);
        console.log('📊 Free Hospitals:', freeHospitals.length);
        console.log('📊 Paid Hospitals:', paidHospitals.length);
        
        // ✅ عرض كل قسم في grid المخصص له
        renderGrid('grid-pulmonologist', pulmonologists, 'doctor');
        renderGrid('grid-oncologist', oncologists, 'doctor');
        renderGrid('grid-cessation', cessation, 'doctor');
        renderGrid('grid-hospital_free', freeHospitals, 'hospital');
        renderGrid('grid-hospital_paid', paidHospitals, 'hospital');
        
        // ✅ إجمالي النتائج
        const total = pulmonologists.length + oncologists.length + cessation.length + 
                     freeHospitals.length + paidHospitals.length;
        updateResultsCount(total);
        
        // ✅ إظهار/إخفاء الأقسام حسب وجود بيانات
        toggleSection('section-pulmonologist', pulmonologists.length > 0);
        toggleSection('section-oncologist', oncologists.length > 0);
        toggleSection('section-cessation', cessation.length > 0);
        toggleSection('section-hospital_free', freeHospitals.length > 0);
        toggleSection('section-hospital_paid', paidHospitals.length > 0);
        
        // إضافة مستمعين الفلتر
        attachFilterListeners();
        
        console.log(`✅ Loaded ${doctors.length} doctors, ${hospitals.length} hospitals`);
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showNotification('Failed to load data', 'error');
    } finally {
        showSkeletons(false);
    }
}

// دالة مساعدة لإظهار/إخفاء الأقسام
function toggleSection(sectionId, hasData) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = hasData ? 'block' : 'none';
    }
}

// ============================================================
// ❽ RENDER GRID
// ============================================================

function renderGrid(gridId, items, category) {
    const container = document.getElementById(gridId);
    if (!container) {
        console.warn(`Grid container not found: ${gridId}`);
        return;
    }
    
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div style="text-align:center; padding:2rem; background:#f8fafc; border-radius:12px;">
                    <p style="color:#94a3b8; margin-bottom:0.5rem;">No specialists available in this category yet</p>
                    <p style="color:#94a3b8; font-size:0.9rem;">Check back soon or browse other sections</p>
                </div>
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        
        const card = createCard(item, category);
        col.appendChild(card);
        container.appendChild(col);
    });
}

function createCard(item, category) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.dataset.id = item.id;
    card.dataset.category = category;

    const isDoctor  = category === 'doctor';
    const name      = item.name || item.fullName || 'Unknown';
    const subtitle  = isDoctor ? (item.specialization || item.specialty || 'General') : getHospitalTypeDisplay(item.specialization || item.type);
    const location  = item.location || '';
    const contact   = item.contactInfo || item.phone || '';
    const article   = item.description || item.about || item.article || '';
    const accentClr = isDoctor ? '#0056b3' : '#059669';

    // initials avatar
    const initials  = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    // price badge for hospitals
    let priceBadge = '';
    if (!isDoctor) {
        if (item.type === 'government_hospital' || item.type === 'government' || item.type === 'free') {
            priceBadge = `<span style="background:#dcfce7;color:#166534;padding:0.2rem 0.65rem;border-radius:20px;font-size:0.72rem;font-weight:700;">Free</span>`;
        } else {
            priceBadge = `<span style="background:#fef3c7;color:#92400e;padding:0.2rem 0.65rem;border-radius:20px;font-size:0.72rem;font-weight:700;">Paid</span>`;
        }
    }

    // rating
    const ratingValue = isDoctor ? (item.rating || 0) : 0;
    const stars   = '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue));

    card.style.cssText = `
        background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;
        overflow:hidden;display:flex;flex-direction:column;height:100%;
        transition:box-shadow .3s ease,transform .3s ease;
    `;

    card.innerHTML = `
        <!-- accent top bar -->
        <div style="height:4px;background:linear-gradient(90deg,${accentClr},${accentClr}80);"></div>

        <div style="padding:1.4rem;display:flex;flex-direction:column;flex:1;gap:0.9rem;">

            <!-- HEADER ROW -->
            <div style="display:flex;align-items:center;gap:0.9rem;">
                <!-- avatar -->
                <div style="
                    width:52px;height:52px;border-radius:50%;flex-shrink:0;
                    background:${accentClr};color:#fff;
                    font-size:1.1rem;font-weight:800;
                    display:flex;align-items:center;justify-content:center;
                    box-shadow:0 4px 12px ${accentClr}35;
                ">${initials}</div>

                <!-- name + subtitle -->
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:0.45rem;flex-wrap:wrap;">
                        <h3 style="margin:0;font-size:1rem;font-weight:800;color:#0f172a;
                                   white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">
                            ${escapeHtml(name)}
                        </h3>
                        ${priceBadge}
                    </div>
                    <p style="margin:0.15rem 0 0;color:${accentClr};font-size:0.78rem;font-weight:600;">
                        ${escapeHtml(subtitle)}
                    </p>
                </div>
            </div>

            <!-- RATING ROW -->
            <div style="display:flex;align-items:center;gap:0.4rem;">
                <span style="color:#f59e0b;font-size:0.95rem;letter-spacing:1px;">${ stars }</span>
                <span style="color:#94a3b8;font-size:0.78rem;">${ (isDoctor ? item.reviewCount : 0) } reviews</span>
            </div>

            <!-- DIVIDER -->
            <hr style="margin:0;border:none;border-top:1px solid #f1f5f9;">

            <!-- INFO ROWS -->
            <div style="display:flex;flex-direction:column;gap:0.45rem;flex:1;">
                ${location ? `
                <div style="display:flex;align-items:flex-start;gap:0.5rem;">
                    <span style="font-size:0.8rem;flex-shrink:0;margin-top:1px;">📍</span>
                    <span style="font-size:0.82rem;color:#475569;line-height:1.4;">${escapeHtml(location)}</span>
                </div>` : ''}
                ${contact ? `
                <div style="display:flex;align-items:flex-start;gap:0.5rem;">
                    <span style="font-size:0.8rem;flex-shrink:0;margin-top:1px;">📞</span>
                    <span style="font-size:0.82rem;color:#475569;">${escapeHtml(contact)}</span>
                </div>` : ''}
                ${item.schedule ? `
                <div style="display:flex;align-items:flex-start;gap:0.5rem;">
                    <span style="font-size:0.8rem;flex-shrink:0;margin-top:1px;">🗓️</span>
                    <span style="font-size:0.82rem;color:#475569;">${escapeHtml(item.schedule)}</span>
                </div>` : ''}
                ${article ? `
                <div style="display:flex;align-items:flex-start;gap:0.5rem;">
                    <span style="font-size:0.8rem;flex-shrink:0;margin-top:1px;">📋</span>
                    <span style="font-size:0.82rem;color:#475569;line-height:1.4;">${escapeHtml(article.substring(0,90))}…</span>
                </div>` : ''}
            </div>

            <!-- ACTION BUTTONS -->
            <div style="display:flex;gap:0.5rem;margin-top:auto;padding-top:0.5rem;">
                <button class="view-details-btn" style="
                    flex:1;background:${accentClr};color:#fff;border:none;
                    padding:0.55rem 0.75rem;border-radius:10px;
                    font-size:0.82rem;font-weight:700;cursor:pointer;
                    transition:opacity .2s;
                ">View Details</button>
                <button class="rate-btn" style="
                    flex:0 0 auto;background:#fff;color:#f59e0b;
                    border:2px solid #f59e0b;
                    padding:0.55rem 0.9rem;border-radius:10px;
                    font-size:0.82rem;font-weight:700;cursor:pointer;
                    transition:all .2s;
                ">⭐ Rate</button>
            </div>
        </div>
    `;

    // hover card
    card.addEventListener('mouseover', () => {
        card.style.boxShadow = `0 10px 28px ${accentClr}20`;
        card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseout', () => {
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
    });

    // View Details
    const detailsBtn = card.querySelector('.view-details-btn');
    detailsBtn.addEventListener('mouseover', () => detailsBtn.style.opacity = '0.85');
    detailsBtn.addEventListener('mouseout',  () => detailsBtn.style.opacity = '1');
    detailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailsModal(item, category);
    });

    // Rate
    const rateBtn = card.querySelector('.rate-btn');
    rateBtn.addEventListener('mouseover', () => { rateBtn.style.background = '#f59e0b'; rateBtn.style.color = '#fff'; });
    rateBtn.addEventListener('mouseout',  () => { rateBtn.style.background = '#fff'; rateBtn.style.color = '#f59e0b'; });
    rateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isAuthenticated()) { showAuthToast(); return; }
        openRatingModal(item, category);
    });

    return card;
}

// دالة لعرض نوع المستشفى بشكل readable
function getHospitalTypeDisplay(type) {
    const types = {
        'government_hospital': '🏥 Government Hospital',
        'government': '🏥 Government Hospital',
        'free': '🏥 Government Hospital',
        'private_hospital': '🏨 Private Hospital',
        'private': '🏨 Private Hospital',
        'hospital': '🏨 Hospital',
        'clinic': '💉 Clinic',
        'lab': '🔬 Lab',
        'center': '🏛️ Center'
    };
    return types[type] || type || 'Hospital';
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ============================================================
// ❾ LOCAL STORAGE HELPERS
// ============================================================

async function getDoctorRating(doctorId) {
    try {
        const doctor = await apiRequest(`/api/Doctors/${doctorId}`);
        return {
            average: doctor.rating || 0,
            count: doctor.reviewCount || 0
        };
    } catch (error) {
        console.error('Error fetching doctor rating:', error);
        return { average: 0, count: 0 };
    }
}

async function addRating(doctorId, ratingValue) {
    try {
        const payload = {
            doctorId: parseInt(doctorId),
            rating: ratingValue,
            comment: "" // Default empty comment for quick rating
        };
        
        await apiRequest('/api/DoctorReviews', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        showNotification('Rating added successfully!', 'success');
        
        // Reload specific part or page
        setTimeout(() => location.reload(), 1500);
    } catch (error) {
        console.error('Error adding rating:', error);
        showNotification(error.message || 'Failed to add rating', 'error');
    }
}

function isBookmarked(itemId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    return bookmarks.includes(itemId);
}

function toggleBookmark(itemId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const index = bookmarks.indexOf(itemId);
    
    if (index === -1) {
        bookmarks.push(itemId);
        showNotification('Added to bookmarks!', 'success');
    } else {
        bookmarks.splice(index, 1);
        showNotification('Removed from bookmarks!', 'success');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    location.reload();
}

// ============================================================
// ❿ DETAILS MODAL
// ============================================================

function openDetailsModal(item, category) {
    const modal = document.getElementById('detailModal');
    if (!modal) return;

    const isDoctor  = category === 'doctor';
    const name      = item.fullName || item.name || 'Unknown';
    const accentClr = isDoctor ? '#0056b3' : '#059669';
    const initials  = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    const ratingValue = isDoctor ? (item.rating || 0) : 0;
    const reviewCount = isDoctor ? (item.reviewCount || 0) : 0;
    const stars  = '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue));

    // helper to build an info row
    const row = (icon, label, value) => value ? `
        <div style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid #f1f5f9;">
            <span style="font-size:1.1rem;flex-shrink:0;">${icon}</span>
            <div>
                <div style="font-size:0.72rem;text-transform:uppercase;font-weight:700;color:#94a3b8;letter-spacing:.5px;margin-bottom:2px;">${label}</div>
                <div style="font-size:0.92rem;color:#1e293b;font-weight:500;">${escapeHtml(value)}</div>
            </div>
        </div>` : '';

    const content = document.getElementById('modal-body-content');
    if (!content) return;

    if (isDoctor) {
        content.innerHTML = `
            <!-- HEADER -->
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                <div style="
                    width:64px;height:64px;border-radius:50%;flex-shrink:0;
                    background:${accentClr};color:#fff;font-size:1.4rem;font-weight:800;
                    display:flex;align-items:center;justify-content:center;
                    box-shadow:0 4px 14px ${accentClr}40;
                ">${initials}</div>
                <div>
                    <h4 style="margin:0;font-size:1.2rem;font-weight:800;color:#0f172a;">${escapeHtml(name)}</h4>
                    <span style="display:inline-block;background:${accentClr}15;color:${accentClr};
                                 font-size:0.78rem;font-weight:700;padding:0.2rem 0.7rem;
                                 border-radius:20px;margin-top:0.3rem;">
                        ${escapeHtml(item.specialty || 'General')}
                    </span>
                </div>
            </div>

            <!-- RATING -->
            <div style="display:flex;align-items:center;gap:0.5rem;
                        background:#fffbeb;border:1px solid #fde68a;border-radius:10px;
                        padding:0.6rem 1rem;margin-bottom:1.25rem;">
                <span style="color:#f59e0b;font-size:1.2rem;letter-spacing:2px;">${stars}</span>
                <span style="color:#92400e;font-size:0.85rem;font-weight:600;">${reviewCount} reviews</span>
            </div>

            <!-- INFO ROWS -->
            <div>
                ${row('📞', 'Phone', item.phone)}
                ${row('✉️', 'Email', item.email)}
                ${row('🗓️', 'Schedule', item.schedule)}
                ${row('📍', 'Location', item.location)}
            </div>
        `;
    } else {
        const typeLabel = getHospitalTypeDisplay(item.type);
        const isFree    = item.type === 'government_hospital' || item.type === 'government' || item.type === 'free';
        content.innerHTML = `
            <!-- HEADER -->
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                <div style="
                    width:64px;height:64px;border-radius:50%;flex-shrink:0;
                    background:${accentClr};color:#fff;font-size:1.4rem;font-weight:800;
                    display:flex;align-items:center;justify-content:center;
                    box-shadow:0 4px 14px ${accentClr}40;
                ">${initials}</div>
                <div>
                    <h4 style="margin:0;font-size:1.2rem;font-weight:800;color:#0f172a;">${escapeHtml(name)}</h4>
                    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.3rem;">
                        <span style="background:${accentClr}15;color:${accentClr};
                                     font-size:0.78rem;font-weight:700;padding:0.2rem 0.7rem;border-radius:20px;">
                            ${typeLabel}
                        </span>
                        <span style="background:${isFree ? '#dcfce7' : '#fef3c7'};
                                     color:${isFree ? '#166534' : '#92400e'};
                                     font-size:0.78rem;font-weight:700;padding:0.2rem 0.7rem;border-radius:20px;">
                            ${isFree ? 'Free' : 'Paid'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- RATING -->
            <div style="display:flex;align-items:center;gap:0.5rem;
                        background:#fffbeb;border:1px solid #fde68a;border-radius:10px;
                        padding:0.6rem 1rem;margin-bottom:1.25rem;">
                <span style="color:#f59e0b;font-size:1.2rem;letter-spacing:2px;">${stars}</span>
                <span style="color:#92400e;font-size:0.85rem;font-weight:600;">${reviewCount} reviews</span>
            </div>

            <!-- INFO ROWS -->
            <div>
                ${row('📍', 'Location', item.location)}
                ${item.article ? `
                <div style="padding:0.75rem 0;border-bottom:1px solid #f1f5f9;">
                    <div style="font-size:0.72rem;text-transform:uppercase;font-weight:700;color:#94a3b8;letter-spacing:.5px;margin-bottom:6px;">📋 Description</div>
                    <p style="margin:0;font-size:0.9rem;color:#475569;line-height:1.65;">${escapeHtml(item.article)}</p>
                </div>` : ''}
                ${item.mapLink ? `
                <div style="padding:0.75rem 0;">
                    <a href="${item.mapLink}" target="_blank" style="
                        display:inline-flex;align-items:center;gap:0.4rem;
                        background:#0056b3;color:#fff;text-decoration:none;
                        padding:0.5rem 1.1rem;border-radius:8px;font-size:0.85rem;font-weight:700;
                    ">🗺️ View on Map</a>
                </div>` : ''}
            </div>
        `;
    }

    new bootstrap.Modal(modal).show();
}

// ============================================================
// ⓫ RATING MODAL
// ============================================================

function openRatingModal(item, category) {
    const modalHtml = `
        <div class="modal fade" id="ratingModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rate ${escapeHtml(item.fullName || item.name)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div style="display:flex;gap:0.5rem;justify-content:center;margin:1rem 0;">
                            ${[1,2,3,4,5].map(num => `
                                <button class="star-btn" data-rating="${num}" style="
                                    font-size:2rem;background:none;border:none;
                                    cursor:pointer;color:#cbd5e1;
                                ">★</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-warning" id="submit-rating" disabled>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('ratingModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
    
    const stars = document.querySelectorAll('.star-btn');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                s.style.color = i < rating ? '#fbbf24' : '#cbd5e1';
            });
        });
        
        star.addEventListener('mouseout', () => {
            stars.forEach(s => {
                s.style.color = '#cbd5e1';
            });
        });
        
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                s.style.color = i < selectedRating ? '#fbbf24' : '#cbd5e1';
            });
            document.getElementById('submit-rating').disabled = false;
        });
    });
    
    document.getElementById('submit-rating').addEventListener('click', () => {
        addRating(item.id, selectedRating);
        modal.hide();
    });
    
    modal.show();
}

// ============================================================
// ⓬ FILTER FUNCTIONS (NEW)
// ============================================================

function applyFilters() {
    console.log('🔍 Applying filters...');
    
    // جمع الدكاترة من كل الأقسام
    const pulmonologists = allDoctors.filter(d => d.specialty === 'Pulmonology');
    const oncologists = allDoctors.filter(d => d.specialty === 'Oncology');
    const cessation = allDoctors.filter(d => d.specialty === 'Smoking Cessation');
    
    // جمع المستشفيات
    const freeHospitals = allHospitals.filter(h => 
        h.type === 'government_hospital' || h.type === 'government' || h.type === 'free'
    );
    const paidHospitals = allHospitals.filter(h => 
        h.type === 'private_hospital' || h.type === 'private' || h.type === 'hospital'
    );
    
    // جلب قيم الفلتر
    const category = document.getElementById('filter-category')?.value || '';
    const location = document.getElementById('filter-location')?.value || '';
    const searchQuery = document.getElementById('filter-search')?.value?.toLowerCase() || '';
    
    const sections = [
        { id: 'section-pulmonologist', items: pulmonologists, category: 'pulmonologist', type: 'doctor', gridId: 'grid-pulmonologist' },
        { id: 'section-oncologist', items: oncologists, category: 'oncologist', type: 'doctor', gridId: 'grid-oncologist' },
        { id: 'section-cessation', items: cessation, category: 'cessation', type: 'doctor', gridId: 'grid-cessation' },
        { id: 'section-hospital_free', items: freeHospitals, category: 'hospital_free', type: 'hospital', gridId: 'grid-hospital_free' },
        { id: 'section-hospital_paid', items: paidHospitals, category: 'hospital_paid', type: 'hospital', gridId: 'grid-hospital_paid' }
    ];
    
    let totalVisible = 0;
    
    sections.forEach(section => {
        let showSection = true;
        if (category && section.category !== category) {
            showSection = false;
        }
        
        if (!showSection) {
            const sectionEl = document.getElementById(section.id);
            if (sectionEl) sectionEl.style.display = 'none';
            return;
        }
        
        const filteredItems = section.items.filter(item => {
            let matches = true;
            
            // فلتر الموقع
            if (location && matches) {
                const itemLocation = (item.location || '').toLowerCase();
                const locationMap = {
                    'cairo': ['cairo', 'nasr city', 'maadi', 'helwan', 'new cairo'],
                    'giza': ['giza', '6th october', 'sheikh zayed', 'dokki', 'mohandiseen'],
                    'alexandria': ['alexandria', 'smouha', 'sidi gaber', 'ibrahimia'],
                    'october': ['6th october', 'october', 'sheikh zayed']
                };
                
                const locationKeywords = locationMap[location] || [location];
                const matchesLocation = locationKeywords.some(keyword => 
                    itemLocation.includes(keyword.toLowerCase())
                );
                
                if (!matchesLocation) matches = false;
            }
            
            // فلتر البحث بالاسم
            if (searchQuery && matches) {
                const itemName = (item.fullName || item.name || '').toLowerCase();
                if (!itemName.includes(searchQuery)) matches = false;
            }
            
            return matches;
        });
        
        const gridContainer = document.getElementById(section.gridId);
        if (gridContainer) {
            renderGrid(section.gridId, filteredItems, section.type);
        }
        
        const sectionElement = document.getElementById(section.id);
        if (sectionElement) {
            if (filteredItems.length > 0 && showSection) {
                sectionElement.style.display = 'block';
                totalVisible += filteredItems.length;
            } else {
                sectionElement.style.display = 'none';
            }
        }
    });
    
    updateResultsCount(totalVisible);
    
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = totalVisible === 0 ? 'flex' : 'none';
    }
}

function clearFilters() {
    const filterInputs = ['filter-category', 'filter-location', 'filter-search'];
    filterInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    location.reload();
}

function attachFilterListeners() {
    const filterElements = ['filter-category', 'filter-location', 'filter-search'];
    filterElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.removeEventListener('change', applyFilters);
            el.removeEventListener('input', applyFilters);
            
            if (id === 'filter-search') {
                el.addEventListener('input', applyFilters);
            } else {
                el.addEventListener('change', applyFilters);
            }
        }
    });
}

// ============================================================
// ⓭ AUTH TOAST
// ============================================================
function showAuthToast(e) {
    if (e) e.preventDefault();
    const toast = document.getElementById('auth-toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }
    localStorage.setItem('redirect_after_login', window.location.href);
    setTimeout(() => { window.location.href = 'login.html'; }, 1800);
}

// ============================================================
// ⓮ UPDATE NAVBAR FUNCTION
// ============================================================
function updateNavbarUI() {
    console.log('🔄 Updating navbar UI...');
    
    const guestEl = document.getElementById('nav-auth-guest');
    const userEl = document.getElementById('nav-auth-user');
    
    if (!guestEl || !userEl) {
        console.warn('⚠️ Navbar elements not found');
        return;
    }
    
    const isAuth = isAuthenticated();
    console.log('🔐 Auth status:', isAuth ? 'Logged in' : 'Guest');
    
    if (isAuth) {
        guestEl.style.display = 'none';
        userEl.style.display = 'block';
        
        const userName = getUserName();
        const iconEl = document.getElementById('user-profile-icon');
        if (iconEl) {
            iconEl.title = `Hello, ${userName} 👋`;
        }
        
        attachLogoutListener();
    } else {
        guestEl.style.display = 'block';
        userEl.style.display = 'none';
    }
}

// ============================================================
// ⓯ ATTACH LOGOUT LISTENER
// ============================================================
function attachLogoutListener() {
    const logoutLink = document.getElementById('logout-link');
    if (!logoutLink) {
        console.warn('⚠️ Logout link not found');
        return;
    }
    
    const newLogoutLink = logoutLink.cloneNode(true);
    logoutLink.parentNode.replaceChild(newLogoutLink, logoutLink);
    
    newLogoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });
}

// ============================================================
// ⓰ ATTACH ACCESS CONTROL
// ============================================================
function attachAccessControl() {
    console.log('🛡️ Attaching access control...');
    
    document.querySelectorAll('[data-protected="true"]').forEach(el => {
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        
        newEl.addEventListener('click', function(e) {
            if (!isAuthenticated()) {
                e.preventDefault();
                showAuthToast(e);
            }
        });
    });
}

// ============================================================
// ⓱ INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Doctor page initialized');
    console.log('📦 Config MODE:', CONFIG?.MODE || 'unknown');
    
    updateNavbarUI();
    attachAccessControl();
    await loadAllData();
    
    console.log('✅ Page ready');
});

// ============================================================
// ⓲ EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================================
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.updateNavbarUI = updateNavbarUI;
window.isAuthenticated = isAuthenticated;
window.logout = logout;