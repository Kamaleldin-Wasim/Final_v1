'use strict';

/* ================================================================
   awareness2.js — Lung Cancer Awareness Page (UPDATED)
   ----------------------------------------------------------------
   NOW WITH FULL NAVBAR LOGIC (mirrors main.js)
   ================================================================ */


// ================================================================
// ❶  AUTH HELPERS
// ================================================================

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


// ================================================================
// ❷  LOGOUT
// ================================================================

function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');

    showNotification('You have been logged out. Redirecting…', 'success');
    setTimeout(() => { window.location.href = '../index.html'; }, 1200);
}


// ================================================================
// ❸  NAVBAR AUTH UI
// ================================================================

function updateNavbarUI() {
    const guestEl = document.getElementById('nav-auth-guest');
    const userEl  = document.getElementById('nav-auth-user');
    if (!guestEl || !userEl) return;

    if (isAuthenticated()) {
        guestEl.style.display = 'none';
        userEl.style.display  = 'block';

        const userName = localStorage.getItem('user_name');
        const iconEl   = document.getElementById('user-profile-icon');
        const nameEl   = document.getElementById('nav-user-name');

        if (iconEl && userName) {
            iconEl.setAttribute('title', `Hello, ${userName} 👋`);
        }
        if (nameEl && userName) {
            nameEl.textContent = userName;
        }

    } else {
        guestEl.style.display = 'block';
        userEl.style.display  = 'none';
    }

    // Highlight active page link (for current page awareness2)
    const currentPage = window.location.pathname.split('/').pop() || 'awareness2.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = (link.getAttribute('href') || '').split('/').pop();
        if (linkPage && linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}


// ================================================================
// ❹  ACCESS CONTROL — Guest Gate
// ================================================================

function showAuthToast(e) {
    if (e) e.preventDefault();

    const toast = document.getElementById('auth-toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }

    localStorage.setItem('redirect_after_login', window.location.href);
    setTimeout(() => { window.location.href = '../login.html'; }, 1800);
}

function attachAccessControl() {
    document.querySelectorAll('[data-protected="true"]').forEach(el => {
        el.addEventListener('click', function (e) {
            if (!isAuthenticated()) {
                showAuthToast(e);
            }
        });
    });
}


// ================================================================
// ❺  LOGOUT BUTTON LISTENER
// ================================================================

function attachLogoutListener() {
    const logoutLink = document.getElementById('logout-link');
    if (!logoutLink) return;

    logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) logout();
    });
}


// ================================================================
// ❻  NEWSLETTER FORM HANDLER
// ================================================================

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type = 'success') {
    document.querySelector('.notification')?.remove();

    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    el.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: #fff;
        padding: 14px 22px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 0.95rem;
        font-weight: 500;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        max-width: 360px;
        animation: slideInRight 0.3s ease;
    `;
    el.textContent = message;
    document.body.appendChild(el);

    setTimeout(() => {
        el.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

function initNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailInput = document.getElementById('newsletter-email');
            const email      = emailInput ? emailInput.value : '';

            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate success
            await new Promise(resolve => setTimeout(resolve, 600));
            showNotification('Successfully subscribed to newsletter! ✅', 'success');
            if (emailInput) emailInput.value = '';
        });
    }
}


// ================================================================
// ❼  SCROLL REVEAL (existing animation)
// ================================================================

function initScrollReveal() {
    const items = document.querySelectorAll('.reveal-up, .reveal-right');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(
                getComputedStyle(entry.target).getPropertyValue('--delay') || '0', 10
            );
            setTimeout(() => entry.target.classList.add('revealed'), delay);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => observer.observe(el));
}


// ================================================================
// ❽  RISK RING ANIMATIONS (existing)
// ================================================================

function initRiskRings() {
    const CIRCUMFERENCE = 2 * Math.PI * 27;

    const rings = document.querySelectorAll('.risk-ring__fill');
    if (!rings.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const ring = entry.target;
            const pct  = parseFloat(ring.getAttribute('data-pct') || 0);
            const offset = CIRCUMFERENCE - (CIRCUMFERENCE * pct / 100);

            setTimeout(() => {
                ring.style.strokeDashoffset = offset;
            }, 200);

            observer.unobserve(ring);
        });
    }, { threshold: 0.3 });

    rings.forEach(ring => {
        ring.style.strokeDasharray  = CIRCUMFERENCE;
        ring.style.strokeDashoffset = CIRCUMFERENCE;
        observer.observe(ring);
    });
}


// ================================================================
// ❾  COMPARE BAR ANIMATIONS (existing)
// ================================================================

function initCompareBars() {
    const bars = document.querySelectorAll('.compare-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const bar = entry.target;
            const pct = parseFloat(bar.getAttribute('data-pct') || 0);

            setTimeout(() => {
                bar.style.width = pct + '%';
            }, 350);

            observer.unobserve(bar);
        });
    }, { threshold: 0.4 });

    bars.forEach(bar => observer.observe(bar));
}


// ================================================================
// ❿  GAUGE NEEDLE (existing)
// ================================================================

function initGaugeNeedle() {
    const needle = document.getElementById('gaugeNeedle');
    if (!needle) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            setTimeout(() => {
                needle.style.transform = 'translateX(18px)';
            }, 900);
            observer.unobserve(needle);
        });
    }, { threshold: 0.5 });

    observer.observe(needle);
}


// ================================================================
// ⓫  NAVBAR SCROLL SHADOW (existing)
// ================================================================

function initNavbarScroll() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.style.boxShadow = window.scrollY > 60
            ? '0 4px 20px rgba(0, 86, 179, 0.18)'
            : '0 2px 12px rgba(0, 86, 179, 0.10)';
    }, { passive: true });
}


// ================================================================
// ⓬  SMOOTH SCROLL (existing)
// ================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}


// ================================================================
// ⓭  PAGE LOAD FADE-IN
// ================================================================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity    = '1';
    }, 100);
});


// ================================================================
// ⓮  INITIALISATION
// ================================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('Lung Cancer Awareness Page Initialized with Full Navbar Logic 🎉');

    updateNavbarUI();
    attachAccessControl();
    attachLogoutListener();
    initNewsletter();
    initScrollReveal();
    initRiskRings();
    initCompareBars();
    initGaugeNeedle();
    initNavbarScroll();
    initSmoothScroll();

    console.log(isAuthenticated() ? '✅ User is authenticated' : '🔒 Guest session');
});