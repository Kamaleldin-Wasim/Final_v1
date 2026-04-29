/**
 * nicotine-analysis.js  |  LungCare — Nicotine Dependence Test
 * ─────────────────────────────────────────────────────────────
 * UPDATED: Full navbar auth logic (mirrors main.js)
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   AUTH SERVICE - UPDATED WITH MISSING METHODS
══════════════════════════════════════════════════════════════ */
const AuthService = (() => {
    // ✅ FIX: Use consistent token key 'authToken' instead of 'jwt_token'
    const getToken = () => localStorage.getItem('authToken') || localStorage.getItem('jwt_token');
    const getUserName = () => localStorage.getItem('user_name') || '';
    const isAuthenticated = () => !!getToken();

    function requireAuth() {
        if (isAuthenticated()) return true;
        window.location.href = '../auth/login.html';
        return false;
    }

    function updateNavbarUI() {
        const guestEl = document.getElementById('nav-auth-guest');
        const userEl = document.getElementById('nav-auth-user');
        if (!guestEl || !userEl) return;

        if (isAuthenticated()) {
            guestEl.style.display = 'none';
            userEl.style.display = 'block';
            const iconEl = document.getElementById('user-profile-icon');
            if (iconEl) iconEl.title = `Logged in as ${getUserName()}`;
            const nameEl = document.getElementById('nav-user-name');
            if (nameEl) nameEl.textContent = getUserName();
        } else {
            guestEl.style.display = 'block';
            userEl.style.display = 'none';
        }
    }

    // ✅ FIX: Add missing initLogout method
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

    // ✅ FIX: Add missing initDropdownChevron method
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

    function logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_role');
        const isInSubfolder = window.location.pathname.includes('/page/');
        const redirectPath = isInSubfolder ? '../../../index.html' : '../index.html';
        setTimeout(() => { window.location.href = redirectPath; }, 1200);
    }

    return {
        getToken, getUserName, isAuthenticated, requireAuth,
        updateNavbarUI, initLogout, initDropdownChevron, logout
    };
})();


/* ══════════════════════════════════════════════════════════════
   API SERVICE (unchanged)
══════════════════════════════════════════════════════════════ */
const ApiService = (() => {
    const SESSION_KEY = 'lc_nicotine_result';

    async function saveResult(resultObj) {
        try {
            const payload = {
                question1Score: resultObj.answers[0].score,
                question2Score: resultObj.answers[1].score,
                question3Score: resultObj.answers[2].score,
                question4Score: resultObj.answers[3].score,
                question5Score: resultObj.answers[4].score,
                question6Score: resultObj.answers[5].score
            };

            const response = await apiRequest('/api/AddictionTests/take-test', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(response));
            return response;
        } catch (error) {
            console.error('Error saving result to backend:', error);
            throw error;
        }
    }

    async function getUserResult() {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function clearSavedResult() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    const FALLBACK_QUESTIONS = {
        "questions": [
            { "id": "q1", "text": "How soon after you wake up do you smoke your first cigarette?", "options": [{ "label": "Within 5 minutes", "score": 3 }, { "label": "6-30 minutes", "score": 2 }, { "label": "31-60 minutes", "score": 1 }, { "label": "After 60 minutes", "score": 0 }] },
            { "id": "q2", "text": "Do you find it difficult to refrain from smoking in places where it is forbidden?", "options": [{ "label": "Yes", "score": 1 }, { "label": "No", "score": 0 }] },
            { "id": "q3", "text": "Which cigarette would you hate most to give up?", "options": [{ "label": "The first one in the morning", "score": 1 }, { "label": "Any other", "score": 0 }] },
            { "id": "q4", "text": "How many cigarettes per day do you smoke?", "options": [{ "label": "10 or fewer", "score": 0 }, { "label": "11-20", "score": 1 }, { "label": "21-30", "score": 2 }, { "label": "31 or more", "score": 3 }] },
            { "id": "q5", "text": "Do you smoke more frequently during the first hours after waking than during the rest of the day?", "options": [{ "label": "Yes", "score": 1 }, { "label": "No", "score": 0 }] },
            { "id": "q6", "text": "Do you smoke even if you are so ill that you are in bed most of the day?", "options": [{ "label": "Yes", "score": 1 }, { "label": "No", "score": 0 }] }
        ]
    };

    return {
        getQuestions: async () => FALLBACK_QUESTIONS,
        getUserResult,
        saveResult,
        clearSavedResult
    };
})();


/* ══════════════════════════════════════════════════════════════
   SCORING SERVICE (unchanged)
══════════════════════════════════════════════════════════════ */
const ScoringService = (() => {
    function calculate(answers) {
        return answers.reduce((sum, a) => sum + (a ? (a.score || 0) : 0), 0);
    }

    function classify(score) {
        if (score <= 3) return 'low';
        if (score <= 6) return 'moderate';
        return 'high';
    }

    const INTERPRETATIONS = {
        low: {
            label: 'Low Dependence',
            emoji: '🟢',
            color: '#10B981',
            bg: '#ECFDF5',
            border: '#A7F3D0',
            explanation: 'Your score suggests a low level of nicotine dependence. Physiological withdrawal will likely be mild, and behavioural strategies alone may be sufficient to help you quit successfully.',
            recommendations: [
                { icon: '📅', bg: '#DBEAFE', text: 'Set a specific quit date within the next two weeks and write it down.' },
                { icon: '🧘', bg: '#D1FAE5', text: 'Identify your main smoking triggers and prepare a mindfulness or distraction strategy for each.' },
                { icon: '👥', bg: '#EDE9FE', text: 'Share your quit plan with a trusted friend, family member, or support group.' },
                { icon: '💪', bg: '#FEF3C7', text: 'Replace smoking breaks with a short walk, a glass of water, or deep breathing.' }
            ]
        },
        moderate: {
            label: 'Moderate Dependence',
            emoji: '🟡',
            color: '#F59E0B',
            bg: '#FFFBEB',
            border: '#FDE68A',
            explanation: 'Your score indicates a moderate level of nicotine dependence. Quitting without support may be challenging. A combination of Nicotine Replacement Therapy (NRT) and behavioural counselling is strongly recommended.',
            recommendations: [
                { icon: '💊', bg: '#FEF3C7', text: 'Consider Nicotine Replacement Therapy — patches, gum, or lozenges to ease cravings.' },
                { icon: '🩺', bg: '#DBEAFE', text: 'Consult your GP about prescription medications such as varenicline or bupropion.' },
                { icon: '📱', bg: '#D1FAE5', text: 'Use a quit-smoking app to track daily progress, log cravings, and celebrate milestones.' },
                { icon: '📞', bg: '#EDE9FE', text: 'Call a national Quitline — trained counsellors provide free, confidential support.' }
            ]
        },
        high: {
            label: 'High Dependence',
            emoji: '🔴',
            color: '#EF4444',
            bg: '#FEF2F2',
            border: '#FECACA',
            explanation: 'Your score indicates a high level of nicotine dependence. Withdrawal symptoms are likely to be intense. Medical supervision combined with structured quit programs — using both NRT and behavioural therapy — significantly improves your success rate.',
            recommendations: [
                { icon: '🏥', bg: '#FEE2E2', text: 'Seek immediate support from a smoking-cessation specialist or your primary care physician.' },
                { icon: '💊', bg: '#FEF3C7', text: 'High-dose or combination NRT (e.g. patch + fast-acting gum) is strongly advised.' },
                { icon: '🧠', bg: '#DBEAFE', text: 'Cognitive Behavioural Therapy (CBT) tailored to nicotine addiction shows excellent outcomes.' },
                { icon: '🔄', bg: '#D1FAE5', text: 'Do not try to quit alone — structured medical programs have far higher long-term success rates.' }
            ]
        }
    };

    const getInterpretation = (level) => INTERPRETATIONS[level] || INTERPRETATIONS.low;

    return { calculate, classify, getInterpretation };
})();


/* ══════════════════════════════════════════════════════════════
   UI SERVICE (unchanged)
══════════════════════════════════════════════════════════════ */
const UIService = (() => {
    const el = (id) => document.getElementById(id);
    const show = (id) => { const e = el(id); if (e) e.style.display = 'block'; };
    const hide = (id) => { const e = el(id); if (e) e.style.display = 'none'; };
    const setText = (id, txt) => { const e = el(id); if (e) e.textContent = txt; };
    const setHTML = (id, html) => { const e = el(id); if (e) e.innerHTML = html; };
    const setDisabled = (id, flag) => { const e = el(id); if (e) e.disabled = flag; };

    function buildProgressDots(total) {
        const container = el('prog-step-dots');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const d = document.createElement('div');
            d.className = 'prog-dot' + (i === 0 ? ' active' : '');
            d.id = `pdot-${i}`;
            container.appendChild(d);
        }
    }

    function updateProgressDots(currentIdx, answers, total) {
        for (let i = 0; i < total; i++) {
            const d = el(`pdot-${i}`);
            if (!d) continue;
            d.className = 'prog-dot';
            if (answers[i]) d.classList.add('done');
            if (i === currentIdx) d.classList.add('active');
        }
    }

    function updateProgressBar(currentIdx, total) {
        const pct = Math.round((currentIdx / total) * 100);
        const bar = el('prog-bar-fill');
        if (bar) bar.style.width = pct + '%';
        setText('prog-current', currentIdx + 1);
        setText('prog-total', total);
    }

    function buildAnswerDots(currentIdx, answers, total) {
        const container = el('footer-answer-dots');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const d = document.createElement('div');
            d.className = 'ans-dot';
            if (answers[i]) d.classList.add('done');
            if (i === currentIdx) d.classList.add('active');
            container.appendChild(d);
        }
    }

    function animateCardIn() {
        const card = el('q-card');
        if (!card) return;
        card.style.animation = 'none';
        void card.offsetHeight;
        card.style.animation = 'cardIn 0.35s cubic-bezier(0.4,0,0.2,1)';
    }

    function renderSavedResult(saved, interp) {
        const date = new Date(saved.testDate).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        setText('saved-date', 'Taken on ' + date);
        setText('saved-score-num', saved.score);
        setText('saved-level-text', interp.label);
        setText('saved-level-sub', `Score: ${saved.score} / 10`);

        const circle = el('saved-circle');
        if (circle) {
            circle.style.borderColor = interp.color;
            circle.style.color = interp.color;
            circle.style.background = interp.bg;
        }
        const levelTxt = el('saved-level-text');
        if (levelTxt) levelTxt.style.color = interp.color;

        show('saved-panel');
    }

    function renderQuestion(q, currentIdx, total, answers, onSelect) {
        setText('q-counter-badge', `Question ${currentIdx + 1} of ${total}`);

        const runScore = answers.reduce((s, a) => s + (a ? a.score : 0), 0);
        setText('q-score-preview', currentIdx > 0 ? `Score so far: ${runScore}` : '');

        setText('q-text', q.text);
        setText('q-hint', q.hint || '');

        const grid = el('options-grid');
        if (!grid) return;
        grid.innerHTML = '';

        q.options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'option-btn';
            btn.setAttribute('role', 'radio');

            const selected = answers[currentIdx] && answers[currentIdx].label === opt.label;
            btn.classList.toggle('selected', selected);
            btn.setAttribute('aria-checked', String(selected));

            btn.innerHTML = `
                <span class="opt-radio" aria-hidden="true"></span>
                <span class="opt-label">${opt.label}</span>
            `;

            btn.addEventListener('click', () => {
                grid.querySelectorAll('.option-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.setAttribute('aria-checked', 'false');
                });
                btn.classList.add('selected');
                btn.setAttribute('aria-checked', 'true');
                onSelect(opt);
            });

            grid.appendChild(btn);
        });

        updateProgressBar(currentIdx, total);
        updateProgressDots(currentIdx, answers, total);
        buildAnswerDots(currentIdx, answers, total);

        setDisabled('btn-back', currentIdx === 0);
        const isLast = currentIdx === total - 1;
        const hasAnswer = !!answers[currentIdx];

        if (isLast) {
            el('btn-next').style.display = 'none';
            el('btn-submit').style.display = 'inline-flex';
            setDisabled('btn-submit', !hasAnswer);
        } else {
            el('btn-next').style.display = 'inline-flex';
            el('btn-submit').style.display = 'none';
            setDisabled('btn-next', !hasAnswer);
        }

        animateCardIn();
    }

    function renderResult(score, interp) {
        setText('result-score-big', score);

        const ring = el('result-score-ring');
        if (ring) ring.style.borderColor = interp.color;

        const pill = el('result-level-pill');
        if (pill) {
            pill.textContent = `${interp.emoji}  ${interp.label}`;
            pill.style.background = interp.bg;
            pill.style.color = interp.color;
            pill.style.border = `1.5px solid ${interp.border}`;
        }

        setText('result-explanation', interp.explanation);

        setHTML('result-recs', interp.recommendations.map(r => `
            <div class="rec-row">
                <div class="rec-icon-box" style="background:${r.bg}">${r.icon}</div>
                <span>${r.text}</span>
            </div>
        `).join(''));

        show('result-section');
        el('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setSaveStatus(state, msg) {
        const statusEl = el('save-status');
        if (!statusEl) return;
        const icons = { saving: '<span class="spinner-sm"></span>', success: '✅', error: '⚠️' };
        const colors = { saving: 'var(--text-secondary)', success: 'var(--success-green)', error: 'var(--warning-amber)' };
        statusEl.innerHTML = `${icons[state] || ''} ${msg}`;
        statusEl.style.color = colors[state] || '';
    }

    return {
        show, hide, setHTML, setText, setDisabled,
        buildProgressDots, updateProgressDots, updateProgressBar, buildAnswerDots,
        animateCardIn, renderSavedResult, renderQuestion, renderResult, setSaveStatus
    };
})();


/* ══════════════════════════════════════════════════════════════
   TEST CONTROLLER (updated init)
══════════════════════════════════════════════════════════════ */
const TestController = (() => {
    let questions = [];
    let answers = [];
    let currentIndex = 0;
    let totalQ = 0;

    async function init() {
        // Update navbar UI
        AuthService.updateNavbarUI();
        AuthService.initLogout();
        AuthService.initDropdownChevron();

        if (!AuthService.requireAuth()) return;

        try {
            const saved = await ApiService.getUserResult();
            if (saved) {
                const interp = ScoringService.getInterpretation(saved.dependenceLevel);
                UIService.renderSavedResult(saved, interp);
                return;
            }
        } catch (err) {
            console.warn('[TestController] Could not load saved result:', err.message);
        }

        await _startTest();
    }

    async function _startTest() {
        answers = [];
        currentIndex = 0;

        UIService.hide('saved-panel');
        UIService.hide('result-section');

        try {
            const data = await ApiService.getQuestions();
            questions = data.questions;
            totalQ = data.questions.length;
        } catch (err) {
            console.error('[TestController] Failed to load questions:', err);
            alert('Could not load test questions. Please refresh the page.');
            return;
        }

        UIService.buildProgressDots(totalQ);

        document.getElementById('progress-strip').style.display = 'block';
        UIService.show('test-container');

        _renderCurrentQuestion();
    }

    function retake() {
        ApiService.clearSavedResult();
        UIService.hide('saved-panel');
        _startTest();
    }

    function _renderCurrentQuestion() {
        const q = questions[currentIndex];
        if (!q) return;

        UIService.renderQuestion(q, currentIndex, totalQ, answers, (selectedOption) => {
            onOptionSelected(selectedOption, currentIndex);
        });
    }

    function onOptionSelected(opt, qIndex) {
        answers[qIndex] = {
            questionId: questions[qIndex].id,
            label: opt.label,
            score: opt.score
        };

        const isLast = qIndex === totalQ - 1;
        if (isLast) {
            document.getElementById('btn-submit').disabled = false;
        } else {
            document.getElementById('btn-next').disabled = false;
        }

        UIService.buildAnswerDots(currentIndex, answers, totalQ);
        UIService.updateProgressDots(currentIndex, answers, totalQ);
    }

    function goNext() {
        if (currentIndex < totalQ - 1) {
            currentIndex++;
            _renderCurrentQuestion();
        }
    }

    function goBack() {
        if (currentIndex > 0) {
            currentIndex--;
            _renderCurrentQuestion();
        }
    }

    async function submitTest() {
        const score = ScoringService.calculate(answers);
        const level = ScoringService.classify(score);

        UIService.setSaveStatus('saving', 'Sending results...');

        try {
            const resultObj = {
                answers: answers
            };

            const backendResult = await ApiService.saveResult(resultObj);

            document.getElementById('progress-strip').style.display = 'none';
            UIService.hide('test-container');

            // Use backend advice and level
            const interp = ScoringService.getInterpretation(backendResult.addictionLevel.toLowerCase());
            interp.explanation = backendResult.advice; // Override with backend advice

            UIService.renderResult(backendResult.totalScore, interp);
            UIService.setSaveStatus('success', 'Results saved to profile');

        } catch (error) {
            UIService.setSaveStatus('error', 'Could not save results');
            alert('Failed to save test results: ' + error.message);
        }
    }

    function restart() {
        ApiService.clearSavedResult();
        UIService.hide('result-section');
        _startTest();
    }

    return { init, retake, goBack, goNext, submitTest, restart };
})();


/* ══════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => TestController.init());