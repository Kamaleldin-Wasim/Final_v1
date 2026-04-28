/**
 * Smoking Progress Tracker Logic
 * 
 * FIXED VERSION - Compatible with main.js navbar
 * No conflicts with authentication system
 */

document.addEventListener("DOMContentLoaded", () => {
  const progressForm = document.getElementById("progressForm");
  const resultsSection = document.getElementById("resultsSection");
  
  // ✅ Check if elements exist before using them
  if (!progressForm) {
    console.error("Progress form not found!");
    return;
  }

  // Load user data from localStorage if available
  loadUserData();

  progressForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. Get all required values from the form
    const cigarettesPerDay = parseInt(document.getElementById("cigarettesPerDay")?.value, 10);
    const daysQuit = parseInt(document.getElementById("daysQuit")?.value, 10);
    const userAge = parseInt(document.getElementById("userAge")?.value, 10);
    const smokingYears = parseInt(document.getElementById("smokingYears")?.value, 10);
    
    if (isNaN(cigarettesPerDay) || isNaN(daysQuit) || isNaN(userAge) || isNaN(smokingYears)) {
      showNotification("Please fill out all required fields with valid numbers.", "error");
      return;
    }

    // 2. Calculate the progress factors
    const intensityFactor = Math.min(1, 20 / cigarettesPerDay);
    const durationFactor = Math.max(0.5, 1 - (smokingYears / 40));
    const ageFactor = userAge < 40 ? 1 : Math.max(0, 1 - ((userAge - 40) * 0.005));

    // 3. Define the body systems
    const systems = [
        { name: "Lungs",      targetDays: 365, elementId: "lungs" },
        { name: "Heart",      targetDays: 365, elementId: "heart" },
        { name: "Brain",      targetDays: 180, elementId: "brain" },
        { name: "Liver",      targetDays: 90,  elementId: "liver" },
        { name: "Intestines", targetDays: 60,  elementId: "intestines" },
        { name: "Teeth",      targetDays: 120, elementId: "teeth" },
        { name: "Mouth",      targetDays: 30,  elementId: "mouth" },
    ];

    // 4. Calculate and display progress for each system
    systems.forEach(system => {
        let progress = (daysQuit / system.targetDays) * 100 * intensityFactor * durationFactor * ageFactor;
        progress = Math.min(100, Math.max(0, progress));
        updateSystemUI(system.elementId, system.name, progress, daysQuit);
    });

    // 5. Show results section
    if (resultsSection) {
      resultsSection.classList.add("show");
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Save to backend if authenticated
    if (localStorage.getItem('jwt_token')) {
        saveProgressToBackend({ cigarettesPerDay, daysQuit, userAge, smokingYears });
    }

    // Save to localStorage
    saveProgressToLocalStorage({ cigarettesPerDay, daysQuit, userAge, smokingYears });
  });
});

/**
 * Sync with backend
 */
async function saveProgressToBackend(data) {
    try {
        // First ensure smoker profile exists
        const smokerRes = await apiRequest('/api/Smokers/current');
        if (smokerRes) {
            // Update smoker info
            await apiRequest(`/api/Smokers/${smokerRes.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    specialization: smokerRes.specialization || "",
                    location: smokerRes.location || "",
                    contactInfo: smokerRes.contactInfo || "",
                    about: smokerRes.about || "",
                    medicalCenterId: smokerRes.medicalCenterId
                })
            });

            // Update progress tracker
            // Note: backend expects ProgressUpdateDto
            const updatePayload = {
                cigarettesAvoided: data.daysQuit * data.cigarettesPerDay,
                moneySaved: data.daysQuit * data.cigarettesPerDay * 10, // Default price if not set
                healthTimeRegained: data.daysQuit * data.cigarettesPerDay * 11
            };
            await apiRequest(`/api/ProgressTracker/smoker/${smokerRes.id}/update`, {
                method: 'PUT',
                body: JSON.stringify(updatePayload)
            });
            console.log("✅ Progress synced to backend");
        }
    } catch (error) {
        console.error("❌ Failed to sync progress to backend:", error);
    }
}

/**
 * Updates the UI for a specific body system.
 * ✅ Added null checks for safety
 */
function updateSystemUI(id, name, progress, daysQuit) {
    const percentageEl = document.getElementById(`${id}Percentage`);
    const barEl = document.getElementById(`${id}Bar`);
    const messageEl = document.getElementById(`${id}Message`);

    // ✅ Only update if elements exist
    if (percentageEl && barEl && messageEl) {
        const roundedProgress = Math.floor(progress);
        
        percentageEl.textContent = `${roundedProgress}%`;
        barEl.style.width = `${progress}%`;
        messageEl.textContent = `After ${daysQuit} days, your ${name} has improved by ${roundedProgress}%.`;
    }
}

/**
 * ✅ Load user data from localStorage (set by main.js)
 */
async function loadUserData() {
  try {
    // Try to load from backend first if authenticated
    if (localStorage.getItem('jwt_token')) {
        try {
            const tracker = await apiRequest('/api/ProgressTracker/current');
            if (tracker) {
                const smoker = await apiRequest('/api/Smokers/current');
                if (smoker) {
                    fillForm({
                        cigarettesPerDay: smoker.cigarettesPerDay,
                        daysQuit: tracker.smokeFreeDays,
                        userAge: smoker.age,
                        smokingYears: smoker.yearsSmoking
                    });
                    return;
                }
            }
        } catch (err) {
            console.warn("Could not load from backend, using local storage");
        }
    }

    // Fallback to localStorage
    const savedData = localStorage.getItem('lungcare_progress_data');
    if (savedData) {
      fillForm(JSON.parse(savedData));
    }
  } catch (e) {
    console.error("Error loading user data:", e);
  }
}

function fillForm(data) {
    const cigarettesInput = document.getElementById("cigarettesPerDay");
    const daysInput = document.getElementById("daysQuit");
    const ageInput = document.getElementById("userAge");
    const yearsInput = document.getElementById("smokingYears");
    
    if (cigarettesInput && data.cigarettesPerDay) cigarettesInput.value = data.cigarettesPerDay;
    if (daysInput && data.daysQuit !== undefined) daysInput.value = data.daysQuit;
    if (ageInput && data.userAge) ageInput.value = data.userAge;
    if (yearsInput && data.smokingYears) yearsInput.value = data.smokingYears;
}

/**
 * ✅ Save progress to localStorage
 */
function saveProgressToLocalStorage(data) {
  try {
    localStorage.setItem('lungcare_progress_data', JSON.stringify(data));
  } catch (e) {
    console.error("Error saving progress:", e);
  }
}

/**
 * ✅ Simple notification function (fallback if main.js showNotification not available)
 */
function showNotification(message, type = 'success') {
  // Try to use main.js notification first
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // Fallback notification using auth-toast element
  const toast = document.getElementById('auth-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  } else {
    alert(message);
  }
}

async function fetchUserData() { 
  await loadUserData();
}

async function saveProgress(progressData) { 
  saveProgressToLocalStorage(progressData);
  if (localStorage.getItem('jwt_token')) {
      await saveProgressToBackend(progressData);
  }
}