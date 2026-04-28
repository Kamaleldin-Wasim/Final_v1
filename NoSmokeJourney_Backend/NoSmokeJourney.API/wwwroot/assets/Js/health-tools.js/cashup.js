/**
 * SAVINGS TRACKER DASHBOARD
 * Fixed version - Independent of main.js conflicts
 */

// ============================================
// WAIT FOR DOM TO BE FULLY LOADED
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // DOM ELEMENTS - WITH SAFETY CHECKS
    // ============================================
    const startTrackingBtn = document.getElementById('startTrackingBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsSection = document.getElementById('resultsSection');
    
    // Input elements
    const quitDateInput = document.getElementById('quitDate');
    const pricePerPackInput = document.getElementById('pricePerPack');
    const cigarettesPerDayInput = document.getElementById('cigarettesPerDay');
    
    // Display elements
    const daysValue = document.getElementById('daysValue');
    const hoursValue = document.getElementById('hoursValue');
    const minsValue = document.getElementById('minsValue');
    const secsValue = document.getElementById('secsValue');
    const savingsPerDayEl = document.getElementById('savingsPerDay');
    const savingsPerMonthEl = document.getElementById('savingsPerMonth');
    const savingsPerYearEl = document.getElementById('savingsPerYear');
    const cigarettesAvoidedEl = document.getElementById('cigarettesAvoided');
    
    // Rewards list elements
    const monthlyRewardsList = document.getElementById('monthlyRewardsList');
    const yearlyRewardsList = document.getElementById('yearlyRewardsList');
    
    // Check if critical elements exist
    if (!startTrackingBtn) {
        console.error('Critical elements not found! Check if HTML IDs match.');
        return;
    }
    
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let timerInterval = null;
    let quitDate = null;
    let userData = {
        quitDate: null,
        pricePerPack: 10.00,
        cigarettesPerDay: 20,
        userName: 'Guest'
    };
    
    // ============================================
    // REWARDS CONFIGURATION
    // ============================================
    const REWARDS = [
        { name: "Gym Membership (1 Month)", price: 500 },
        { name: "Nice Restaurant Dinner", price: 250 },
        { name: "Bluetooth Headphones", price: 800 },
        { name: "Day Trip", price: 1500 },
        { name: "New Smartphone", price: 6000 },
        { name: "Laptop", price: 15000 }
    ];
    
    // ============================================
    // CONFIGURATION
    // ============================================
    const cigarettesPerPack = 20;
    
    function getPricePerCigarette() {
        return userData.pricePerPack / cigarettesPerPack;
    }
    
    function getSavingsPerDay() {
        return userData.cigarettesPerDay * getPricePerCigarette();
    }
    
    function getSavingsPerMonth() {
        return getSavingsPerDay() * 30;
    }
    
    function getSavingsPerYear() {
        return getSavingsPerDay() * 365;
    }
    
    // ============================================
    // TIMER FUNCTIONS
    // ============================================
    function calculateTimeElapsed(startDate) {
        const now = new Date();
        const diff = now - startDate;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Handle negative values (future date)
        return { 
            days: Math.max(0, days), 
            hours: Math.max(0, hours), 
            mins: Math.max(0, mins), 
            secs: Math.max(0, secs) 
        };
    }
    
    function animateNumber(element, value) {
        if (!element) return;
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== value) {
            element.style.transform = 'scale(1.05)';
            element.textContent = value;
            
            setTimeout(() => {
                if (element) element.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    function updateTimerDisplay() {
        if (!quitDate) return;
        
        const elapsed = calculateTimeElapsed(quitDate);
        animateNumber(daysValue, elapsed.days);
        animateNumber(hoursValue, elapsed.hours);
        animateNumber(minsValue, elapsed.mins);
        animateNumber(secsValue, elapsed.secs);
    }
    
    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        updateTimerDisplay();
        timerInterval = setInterval(updateTimerDisplay, 1000);
    }
    
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    // ============================================
    // METRICS CALCULATION
    // ============================================
    function calculateCigarettesAvoided(startDate) {
        const elapsed = calculateTimeElapsed(startDate);
        const totalDays = elapsed.days + (elapsed.hours / 24);
        return Math.floor(totalDays * userData.cigarettesPerDay);
    }
    
    function formatCurrency(num) {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // ============================================
    // REWARDS FUNCTIONS
    // ============================================
    function getRewardMessage(savedAmount, reward, dailySaving) {
        const itemPrice = reward.price;
        
        if (savedAmount >= itemPrice) {
            const times = Math.floor(savedAmount / itemPrice);
            return `
                <div class="reward-item">
                    <div class="reward-name">${reward.name}</div>
                    <div class="reward-message success">
                        <i class="fas fa-check-circle"></i>
                        You can afford this <span class="reward-highlight">${times} time${times > 1 ? 's' : ''}</span>!
                    </div>
                </div>
            `;
        } else {
            const neededAmount = itemPrice - savedAmount;
            const daysNeeded = Math.ceil(neededAmount / dailySaving);
            const progressPercent = (savedAmount / itemPrice) * 100;
            
            return `
                <div class="reward-item">
                    <div class="reward-name">${reward.name}</div>
                    <div class="reward-message progress">
                        <i class="fas fa-hourglass-half"></i>
                        Need <span class="reward-highlight">EGP ${neededAmount.toFixed(2)}</span> more
                    </div>
                    <div class="reward-progress-bar">
                        <div class="reward-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="reward-message" style="font-size: 0.8rem; margin-top: 0.25rem;">
                        <i class="far fa-clock"></i>
                        ${daysNeeded} more day${daysNeeded > 1 ? 's' : ''} at your current rate
                    </div>
                </div>
            `;
        }
    }
    
    function updateRewards() {
        const dailySaving = getSavingsPerDay();
        const monthlySaving = getSavingsPerMonth();
        const yearlySaving = getSavingsPerYear();
        
        const sortedRewards = [...REWARDS].sort((a, b) => a.price - b.price);
        
        if (monthlyRewardsList) {
            if (monthlySaving < sortedRewards[0].price) {
                monthlyRewardsList.innerHTML = `
                    <div class="rewards-empty">
                        <i class="fas fa-seedling"></i>
                        <div>Keep going! You're just getting started.</div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">
                            EGP ${(sortedRewards[0].price - monthlySaving).toFixed(2)} more to reach your first reward!
                        </div>
                    </div>
                `;
            } else {
                let monthlyHTML = '';
                sortedRewards.forEach(reward => {
                    monthlyHTML += getRewardMessage(monthlySaving, reward, dailySaving);
                });
                monthlyRewardsList.innerHTML = monthlyHTML;
            }
        }
        
        if (yearlyRewardsList) {
            if (yearlySaving < sortedRewards[0].price) {
                yearlyRewardsList.innerHTML = `
                    <div class="rewards-empty">
                        <i class="fas fa-seedling"></i>
                        <div>Keep going! You're just getting started.</div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">
                            EGP ${(sortedRewards[0].price - yearlySaving).toFixed(2)} more to reach your first reward!
                        </div>
                    </div>
                `;
            } else {
                let yearlyHTML = '';
                sortedRewards.forEach(reward => {
                    yearlyHTML += getRewardMessage(yearlySaving, reward, dailySaving);
                });
                yearlyRewardsList.innerHTML = yearlyHTML;
            }
        }
    }
    
    function updateMetrics() {
        if (quitDate && cigarettesAvoidedEl) {
            cigarettesAvoidedEl.textContent = calculateCigarettesAvoided(quitDate);
        }
        
        if (savingsPerDayEl) savingsPerDayEl.textContent = formatCurrency(getSavingsPerDay());
        if (savingsPerMonthEl) savingsPerMonthEl.textContent = formatCurrency(getSavingsPerMonth());
        if (savingsPerYearEl) savingsPerYearEl.textContent = formatCurrency(getSavingsPerYear());
        
        updateRewards();
    }
    
    // ============================================
    // VALIDATION
    // ============================================
    function validateInputs() {
        const quitDateVal = new Date(quitDateInput.value);
        const pricePerPack = parseFloat(pricePerPackInput.value);
        const cigarettesPerDay = parseInt(cigarettesPerDayInput.value);
        const now = new Date();
        
        if (isNaN(quitDateVal.getTime())) {
            alert('Please enter a valid quit date');
            return false;
        }
        
        if (quitDateVal > now) {
            alert('Quit date cannot be in the future');
            return false;
        }
        
        if (isNaN(pricePerPack) || pricePerPack <= 0) {
            alert('Please enter a valid price per pack (greater than 0)');
            return false;
        }
        
        if (isNaN(cigarettesPerDay) || cigarettesPerDay <= 0) {
            alert('Please enter a valid number of cigarettes per day (greater than 0)');
            return false;
        }
        
        return true;
    }
    
    // ============================================
    // EVENT HANDLERS
    // ============================================
    function handleStartTracking() {
        if (!validateInputs()) return;
        
        userData.quitDate = new Date(quitDateInput.value);
        userData.pricePerPack = parseFloat(pricePerPackInput.value);
        userData.cigarettesPerDay = parseInt(cigarettesPerDayInput.value);
        quitDate = userData.quitDate;
        
        if (resultsSection) resultsSection.classList.add('show');
        startTimer();
        updateMetrics();
        
        setTimeout(() => {
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
        
        startTrackingBtn.disabled = true;
        startTrackingBtn.style.opacity = '0.7';
        saveToLocalStorage();
    }
    
    function handleReset() {
        stopTimer();
        quitDate = null;
        
        if (resultsSection) resultsSection.classList.remove('show');
        
        startTrackingBtn.disabled = false;
        startTrackingBtn.style.opacity = '1';
        
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 200);
        quitDateInput.value = defaultDate.toISOString().split('T')[0];
        pricePerPackInput.value = '10.00';
        cigarettesPerDayInput.value = '20';
        
        localStorage.removeItem('lungcare_user_data');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ============================================
    // LOCAL STORAGE & BACKEND SYNC
    // ============================================
    async function saveToLocalStorage() {
        const dataToSave = {
            quitDate: userData.quitDate?.toISOString(),
            pricePerPack: userData.pricePerPack,
            cigarettesPerDay: userData.cigarettesPerDay
        };
        localStorage.setItem('lungcare_user_data', JSON.stringify(dataToSave));
        
        // Sync to backend if authenticated
        if (localStorage.getItem('jwt_token')) {
            try {
                const smokerRes = await apiRequest('/api/Smokers/current');
                if (smokerRes) {
                    // Update smoker details
                    await apiRequest(`/api/Smokers/${smokerRes.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            specialization: smokerRes.specialization || "",
                            location: smokerRes.location || "",
                            contactInfo: smokerRes.contactInfo || "",
                            about: smokerRes.about || "",
                            medicalCenterId: smokerRes.medicalCenterId,
                            age: smokerRes.age || 0,
                            yearsSmoking: smokerRes.yearsSmoking || 0,
                            cigarettesPerDay: userData.cigarettesPerDay
                        })
                    });

                    // Update quit date
                    await apiRequest(`/api/Smokers/${smokerRes.id}/quit-date`, {
                        method: 'POST',
                        body: JSON.stringify({ quitDate: userData.quitDate.toISOString() })
                    });
                    
                    console.log("✅ Cashup data synced to backend");
                }
            } catch (err) {
                console.error("❌ Failed to sync cashup to backend:", err);
            }
        }
    }
    
    async function loadData() {
        // Try backend first
        if (localStorage.getItem('jwt_token')) {
            try {
                const smoker = await apiRequest('/api/Smokers/current');
                if (smoker && smoker.quitDate) {
                    userData.quitDate = new Date(smoker.quitDate);
                    userData.pricePerPack = 10.00; // Default if not in smoker entity
                    userData.cigarettesPerDay = smoker.cigarettesPerDay || 20;
                    
                    applyLoadedData();
                    return;
                }
            } catch (err) {
                console.warn("Could not load from backend, using local storage");
            }
        }

        const savedData = localStorage.getItem('lungcare_user_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.quitDate) {
                    userData.quitDate = new Date(parsed.quitDate);
                    userData.pricePerPack = parsed.pricePerPack || 10.00;
                    userData.cigarettesPerDay = parsed.cigarettesPerDay || 20;
                    
                    applyLoadedData();
                }
            } catch (e) {
                console.error('Error loading from localStorage:', e);
            }
        }
    }

    function applyLoadedData() {
        quitDateInput.value = userData.quitDate.toISOString().split('T')[0];
        pricePerPackInput.value = userData.pricePerPack;
        cigarettesPerDayInput.value = userData.cigarettesPerDay;
        
        quitDate = userData.quitDate;
        if (resultsSection) resultsSection.classList.add('show');
        startTimer();
        updateMetrics();
        startTrackingBtn.disabled = true;
    }
    
    // ============================================
    // SET USER NAME FROM MAIN.JS AUTH
    // ============================================
    function updateUserName() {
        const userNameDisplay = document.getElementById('userNameDisplay');
        const savedUserName = localStorage.getItem('user_name');
        
        if (userNameDisplay) {
            if (savedUserName && savedUserName !== 'undefined') {
                userNameDisplay.textContent = savedUserName;
                userData.userName = savedUserName;
            } else {
                userNameDisplay.textContent = 'Guest';
            }
        }
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    async function init() {
        // Set default date
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 200);
        quitDateInput.value = defaultDate.toISOString().split('T')[0];
        
        // Load saved data
        await loadData();
        
        // Update user name
        updateUserName();
        
        // Add event listeners
        startTrackingBtn.addEventListener('click', handleStartTracking);
        resetBtn.addEventListener('click', handleReset);
        
        // Add input listeners for real-time updates
        pricePerPackInput.addEventListener('input', () => {
            if (resultsSection && resultsSection.classList.contains('show')) {
                userData.pricePerPack = parseFloat(pricePerPackInput.value) || 0;
                updateMetrics();
            }
        });
        
        cigarettesPerDayInput.addEventListener('input', () => {
            if (resultsSection && resultsSection.classList.contains('show')) {
                userData.cigarettesPerDay = parseInt(cigarettesPerDayInput.value) || 0;
                updateMetrics();
            }
        });
        
        // Add transition to timer values
        [daysValue, hoursValue, minsValue, secsValue].forEach(el => {
            if (el) el.style.transition = 'transform 0.2s ease';
        });
        
        console.log('✅ Savings Tracker Dashboard Initialized Successfully!');
    }
    
    // Start everything
    init();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        stopTimer();
        if (userData.quitDate) saveToLocalStorage();
    });
    
});