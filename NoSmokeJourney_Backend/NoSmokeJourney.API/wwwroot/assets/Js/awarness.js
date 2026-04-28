'use strict';

/* ================================================================
   awareness.js — LungCare Smoking Awareness Page (UPDATED)
   ----------------------------------------------------------------
   UPDATED TO WORK WITH NEW NAVBAR (Awareness Dropdown)
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

function getUserName() {
    return localStorage.getItem('user_name') || 'User';
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
    
    // Check if we're in a subfolder (like /page/)
    const isInSubfolder = window.location.pathname.includes('/page/');
    const redirectPath = isInSubfolder ? '../index.html' : 'index.html';
    
    setTimeout(() => { window.location.href = redirectPath; }, 1200);
}

/**
 * Logout handler
 */
function initLogout() {
    const logoutLink = document.getElementById('logout-link');
    if (!logoutLink) return;

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });
}


// ================================================================
// ❸  NAVBAR AUTH UI
// ================================================================

/**
 * updateNavbarUI()
 * Shows the correct auth state in the navbar:
 *   Guest    → #nav-auth-guest visible, #nav-auth-user hidden
 *   LoggedIn → #nav-auth-guest hidden,  #nav-auth-user visible
 */
function updateNavbarUI() {
    const guestEl = document.getElementById('nav-auth-guest');
    const userEl  = document.getElementById('nav-auth-user');
    if (!guestEl || !userEl) return;

    if (isAuthenticated()) {
        guestEl.style.display = 'none';
        userEl.style.display  = 'block'; // or 'flex' depending on CSS

        // Display user name in tooltip / title
        const iconEl = document.getElementById('user-profile-icon');
        if (iconEl) iconEl.title = `Logged in as ${getUserName()}`;
        
        // Optional: update any user name span if exists
        const nameEl = document.getElementById('nav-user-name');
        if (nameEl) nameEl.textContent = getUserName();
    } else {
        guestEl.style.display = 'block';
        userEl.style.display  = 'none';
    }

    // Highlight active page link
    highlightActiveLink();
}

/**
 * Highlight the current page in the navigation
 */
function highlightActiveLink() {
    // Get current filename (e.g., 'awarensess.html')
    const pathParts = window.location.pathname.split('/');
    const currentPage = pathParts[pathParts.length - 1] || 'awarensess.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Extract filename from href
        const hrefParts = href.split('/');
        const linkPage = hrefParts[hrefParts.length - 1];
        
        // Check if this link points to the current page
        if (linkPage && linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Also handle dropdown items if they should be highlighted
    document.querySelectorAll('.dropdown-item').forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;
        
        const hrefParts = href.split('/');
        const itemPage = hrefParts[hrefParts.length - 1];
        
        if (itemPage && itemPage === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}


// ================================================================
// ❹  AUTH TOAST  (for data-protected links)
// ================================================================

function showAuthToast(e) {
    if (e) e.preventDefault();

    const toast = document.getElementById('auth-toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }

    // Save current page to redirect back after login
    localStorage.setItem('redirect_after_login', window.location.href);
    
    // Redirect to login page
    const isInSubfolder = window.location.pathname.includes('/page/');
    const loginPath = isInSubfolder ? '../login.html' : 'login.html';
    
    setTimeout(() => { window.location.href = loginPath; }, 1800);
}

/**
 * Intercepts clicks on links marked data-protected="true".
 * If the user is not authenticated, shows the toast instead of navigating.
 */
function initProtectedLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-protected="true"]');
        if (!link) return;
        
        if (!isAuthenticated()) {
            e.preventDefault();
            showAuthToast(e);
        }
    });
}


// ================================================================
// ❺  SCROLL ANIMATIONS  (IntersectionObserver)
// ================================================================

/**
 * Watches all .anim-fade-up and .anim-fade-right elements.
 * Adds .anim-visible once they enter the viewport.
 */
function initScrollAnimations() {
    const targets = document.querySelectorAll('.anim-fade-up, .anim-fade-right, .timeline-item, .video-card, .tip-card');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            // Add a small delay for staggered effect
            setTimeout(() => {
                entry.target.classList.add('anim-visible');
            }, 100);

            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    targets.forEach(el => observer.observe(el));
}


// ================================================================
// ❻  NAVBAR SCROLL EFFECT
// ================================================================

function initNavbarScroll() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 86, 179, 0.18)';
            navbar.style.transition = 'box-shadow 0.3s ease';
        } else {
            navbar.style.boxShadow = '0 2px 12px rgba(0, 86, 179, 0.10)';
        }
    }, { passive: true });
}


// ================================================================
// ❼  NEWSLETTER FORM
// ================================================================

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type = 'success') {
    // Remove any existing notification
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
    const form  = document.getElementById('newsletter-form');
    const input = document.getElementById('newsletter-email');
    const btn   = document.getElementById('newsletter-submit-btn');
    if (!form || !input || !btn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = input.value.trim();
        
        if (!email) {
            showNotification('Please enter your email address.', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate success (replace with actual API call)
        btn.textContent = 'Subscribing...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = '✓ Subscribed!';
            btn.style.background = '#10B981';
            input.value = '';
            showNotification('Successfully subscribed to newsletter! ✅', 'success');

            setTimeout(() => {
                btn.textContent = 'Send';
                btn.disabled = false;
                btn.style.background = '';
            }, 3000);
        }, 1000);
    });
}


// ================================================================
// ❽  SMOOTH SCROLL — anchor links
// ================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}


// ================================================================
// ❾  ACTIVE NAV LINK ON SCROLL (for section highlighting)
// ================================================================

function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 200; // Offset for navbar

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                // Remove active class from all nav links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to the nav link that points to this section
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, { passive: true });
}


// ================================================================
// ❿  PAGE LOAD FADE-IN
// ================================================================

function initPageLoadFade() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
}


// ================================================================
// ⓫  DROPDOWN CHEVRON ANIMATION
// ================================================================

function initDropdownChevron() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('show.bs.dropdown', () => {
            const chevron = dropdown.querySelector('.chevron-icon');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        });
        
        dropdown.addEventListener('hide.bs.dropdown', () => {
            const chevron = dropdown.querySelector('.chevron-icon');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        });
    });
}


// ================================================================
// ⓬  INIT
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Awareness Page Initialized with Updated Navbar Logic 🎉');

    updateNavbarUI();
    initLogout();
    initProtectedLinks();
    initScrollAnimations();
    initNavbarScroll();
    initNewsletter();
    initSmoothScroll();
    initScrollSpy();
    initDropdownChevron();
    initPageLoadFade();

    console.log(isAuthenticated() ? '✅ User is authenticated' : '🔒 Guest session');
});