'use strict';

/* ================================================================
   awareness3.js — LungCare Myths vs Facts Page (UPDATED)
   ----------------------------------------------------------------
   UPDATED WITH FULL NAVBAR LOGIC (mirrors main.js)
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

function updateNavbarUI() {
    const guestEl = document.getElementById('nav-auth-guest');
    const userEl  = document.getElementById('nav-auth-user');
    if (!guestEl || !userEl) return;

    if (isAuthenticated()) {
        guestEl.style.display = 'none';
        userEl.style.display  = 'block';

        const userName = getUserName();
        const iconEl = document.getElementById('user-profile-icon');
        if (iconEl && userName) {
            iconEl.setAttribute('title', `Hello, ${userName} 👋`);
        }
    } else {
        guestEl.style.display = 'block';
        userEl.style.display  = 'none';
    }
    
    highlightActiveLink();
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'awareness3.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPage = href.split('/').pop();
        if (linkPage && linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.dropdown-item').forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;
        const itemPage = href.split('/').pop();
        if (itemPage && itemPage === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function initDropdownChevron() {
    // Services dropdown
    const servicesDropdown = document.getElementById('services-dropdown-item');
    const servicesLink = document.getElementById('nav-services');
    
    if (servicesDropdown && servicesLink) {
        servicesDropdown.addEventListener('show.bs.dropdown', () => {
            servicesLink.setAttribute('aria-expanded', 'true');
        });
        
        servicesDropdown.addEventListener('hide.bs.dropdown', () => {
            servicesLink.setAttribute('aria-expanded', 'false');
        });
    }
    
    // Awareness dropdown (NEW)
    const awarenessDropdown = document.getElementById('awareness-dropdown-item');
    const awarenessLink = document.getElementById('nav-awareness');
    
    if (awarenessDropdown && awarenessLink) {
        awarenessDropdown.addEventListener('show.bs.dropdown', () => {
            awarenessLink.setAttribute('aria-expanded', 'true');
        });
        
        awarenessDropdown.addEventListener('hide.bs.dropdown', () => {
            awarenessLink.setAttribute('aria-expanded', 'false');
        });
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    window.location.href = '../index.html';
}

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
// ❷  AUTH TOAST
// ================================================================

function showAuthToast(e) {
    if (e) e.preventDefault();

    const toast = document.getElementById('auth-toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }

    localStorage.setItem('redirect_after_login', window.location.href);
    setTimeout(() => { window.location.href = '../login.html'; }, 1800);
}

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
// ❸  SCROLL ANIMATIONS
// ================================================================

function initScrollAnimations() {
    const targets = document.querySelectorAll('.anim-fade-up');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const siblings = Array.from(
                entry.target.parentElement.querySelectorAll('.anim-fade-up')
            );
            const siblingsInViewport = siblings.filter(s => {
                const rect = s.getBoundingClientRect();
                return rect.top < window.innerHeight;
            });

            const order = siblingsInViewport.indexOf(entry.target);
            const delay = order >= 0 ? order * 120 : 0;

            setTimeout(() => {
                entry.target.classList.add('anim-visible');
            }, delay);

            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach(el => observer.observe(el));
}

// ================================================================
// ❹  NAVBAR SCROLL EFFECT
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
// ❺  INTERACTIVE QUIZ
// ================================================================

let currentQuestion = 1;
let score = 0;
const totalQuestions = 5;

function initQuiz() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            handleQuizAnswer(this);
        });
    });

    const restartBtn = document.getElementById('restart-quiz');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartQuiz);
    }
}

function handleQuizAnswer(option) {
    const isCorrect = option.dataset.correct === 'true';
    const questionDiv = option.closest('.quiz-question');
    const allOptions = questionDiv.querySelectorAll('.quiz-option');

    // Disable all options
    allOptions.forEach(opt => {
        opt.disabled = true;
        if (opt.dataset.correct === 'true') {
            opt.classList.add('correct');
        } else if (opt === option && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });

    // Update score
    if (isCorrect) {
        score++;
    }

    // Move to next question after delay
    setTimeout(() => {
        if (currentQuestion < totalQuestions) {
            // Hide current question
            questionDiv.style.display = 'none';
            
            // Show next question
            currentQuestion++;
            const nextQuestion = document.getElementById(`question-${currentQuestion}`);
            if (nextQuestion) {
                nextQuestion.style.display = 'block';
            }
        } else {
            // Show results
            showQuizResults();
        }
    }, 1500);
}

function showQuizResults() {
    // Hide last question
    document.getElementById(`question-${totalQuestions}`).style.display = 'none';
    
    // Show result
    const resultDiv = document.getElementById('quiz-result');
    const scoreSpan = document.getElementById('quiz-score');
    const messageEl = document.getElementById('result-message');
    
    scoreSpan.textContent = score;
    
    let message = '';
    if (score === totalQuestions) {
        message = '🎉 Perfect score! You\'re a lung health expert!';
    } else if (score >= 3) {
        message = '👍 Great job! You know your facts well.';
    } else {
        message = '📚 Keep learning! Review the myths above to improve your knowledge.';
    }
    
    messageEl.textContent = message;
    resultDiv.style.display = 'block';
}

function restartQuiz() {
    // Reset variables
    currentQuestion = 1;
    score = 0;
    
    // Hide result
    document.getElementById('quiz-result').style.display = 'none';
    
    // Reset all questions
    for (let i = 1; i <= totalQuestions; i++) {
        const questionDiv = document.getElementById(`question-${i}`);
        if (questionDiv) {
            questionDiv.style.display = i === 1 ? 'block' : 'none';
            
            // Reset options
            const options = questionDiv.querySelectorAll('.quiz-option');
            options.forEach(opt => {
                opt.disabled = false;
                opt.classList.remove('correct', 'incorrect');
            });
        }
    }
}

// ================================================================
// ❻  SMOOTH SCROLL TO SECTIONS
// ================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ================================================================
// ❼  PAGE LOAD FADE-IN
// ================================================================

function initPageLoadFade() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
}

// ================================================================
// ❽  INIT
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    updateNavbarUI();
    initLogout();
    initDropdownChevron();
    initProtectedLinks();
    initScrollAnimations();
    initNavbarScroll();
    initQuiz();
    initSmoothScroll();
    initPageLoadFade();
    
    console.log('Myths vs Facts page loaded with updated navbar! 🔍');
});