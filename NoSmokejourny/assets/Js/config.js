// ============================================
// assets/Js/config.js - نسخة واحدة نظيفة
// ============================================

const CONFIG = {
  // غيري هذه القيمة إلى 'REAL' عندما يصبح الباك-end جاهزاً
  MODE: 'REAL', // 'MOCK' or 'REAL'

  // URLs
  DEV: {
    API_BASE_URL: 'http://localhost:5000'
  },
  PROD: {
    API_BASE_URL: 'https://api.quitsmoking.com/v1'
  }
};

// Patch: Always use localhost backend when running from file:// (manual local testing)
const API_BASE_URL = (window.location.protocol === 'file:' || window.location.hostname === 'localhost')
  ? CONFIG.DEV.API_BASE_URL
  : CONFIG.PROD.API_BASE_URL;

// ============================================
// MOCK DATA (لجميع الأقسام) - مع localStorage
// ============================================

// دالة لتهيئة البيانات الافتراضية
function getInitialMockData() {
  return {
    doctors: [
      // 🫁 Chest Doctors (Pulmonology)
      {
        id: 'doc_1',
        fullName: 'Dr. Ahmed Hassan',
        email: 'ahmed@hospital.com',
        phone: '+20 123 456 7890',
        specialty: 'Pulmonology',
        schedule: 'Sun-Thu 9AM-3PM'
      },

      // 🎗️ Cancer Specialists (Oncology)
      {
        id: 'doc_2',
        fullName: 'Dr. Sara Mahmoud',
        email: 'sara@hospital.com',
        phone: '+20 123 456 7891',
        specialty: 'Oncology',
        schedule: 'Mon-Wed 10AM-4PM'
      },

      // 🚭 Cessation Clinics (Smoking Cessation)
      {
        id: 'doc_3',
        fullName: 'Dr. Mohamed Ali',
        email: 'mohamed@hospital.com',
        phone: '+20 123 456 7892',
        specialty: 'Smoking Cessation',
        schedule: 'Sun-Thu 11AM-5PM'
      }
    ],

    hospitals: [
      // 🏨 Private Hospital
      {
        id: 'hosp_1',
        name: 'Cairo Medical Center',
        type: 'private_hospital',
        location: 'Nasr City, Cairo',
        article: 'Leading medical center with 24/7 emergency services',
        mapLink: 'https://maps.google.com/?q=30.123,31.456'
      },

      // 🏨 Private Hospital (Lab but classified as private)
      {
        id: 'hosp_2',
        name: 'Alexandria Lab',
        type: 'private_hospital',
        location: 'Smouha, Alexandria',
        article: 'Modern laboratory services with fast results',
        mapLink: 'https://maps.google.com/?q=31.123,29.456'
      }
    ],

    seminars: [
      { id: 'sem_1', title: 'How to Quit Smoking', date: '2024-03-15', time: '18:00 - 20:00', location: 'Cairo Marriott Hotel', speaker: 'Dr. Ahmed Hassan', description: 'Join us for an informative session about smoking cessation techniques', maxSeats: 50 },
      { id: 'sem_2', title: 'Lung Health Awareness', date: '2024-03-20', time: '17:00 - 19:00', location: 'Alexandria Library', speaker: 'Dr. Sara Mahmoud', description: 'Learn about lung health and respiratory diseases', maxSeats: 2 }
    ],

    // seminar_registrations: جدول منفصل يحاكي الـ DB
    // كل row = تسجيل واحد { id, seminarId, name, phone, email, registeredAt, status }
    // الـ backend هيجيب userId من الـ JWT token — مش بنبعته من الـ frontend
    seminar_registrations: [],

    stories: [
      { id: 'story_1', author: 'Sarah Ahmed', text: 'I quit smoking 6 months ago! I feel much healthier now and can breathe better.', status: 'pending', createdAt: new Date().toISOString() },
      { id: 'story_2', author: 'Mohamed Hassan', text: 'My journey to quit smoking was tough but worth it. 2 years smoke-free!', status: 'approved', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'story_3', author: 'Noha Ali', text: 'Smoking is harmful to your health and wallet. I saved so much money after quitting.', status: 'rejected', createdAt: new Date(Date.now() - 172800000).toISOString(), rejectionReason: 'Contains inappropriate content' },
      { id: 'story_4', author: 'Ahmed Mahmoud', text: 'Used nicotine patches and support groups. It works!', status: 'approved', createdAt: new Date(Date.now() - 259200000).toISOString() },
      { id: 'story_5', author: 'Fatma Said', text: 'Cold turkey method worked for me after 10 years of smoking.', status: 'approved', createdAt: new Date(Date.now() - 345600000).toISOString() }
    ]
  };
}

// تحميل البيانات من localStorage أو استخدام البيانات الافتراضية
function loadMockData() {
  const savedData = localStorage.getItem('mockData');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);

      // تنضيف seminars ناقصة أو تالفة من localStorage قديم
      if (data.seminars) {
        data.seminars = data.seminars.filter(s =>
          s.id && s.title && s.title.trim() !== '' &&
          s.title !== 'TBD' && s.date && s.date !== 'TBD'
        );
        data.seminars.forEach(s => {
          delete s.registrations;       // شيل الـ array القديمة لو موجودة
          if (!s.maxSeats) s.maxSeats = 50;
        });
      }

      // backward-compat: لو localStorage قديم من قبل الـ table دي
      if (!data.seminar_registrations) data.seminar_registrations = [];

      return data;
    } catch (e) {
      console.error('Error parsing saved mock data:', e);
      return getInitialMockData();
    }
  }
  return getInitialMockData();
}

// حفظ البيانات في localStorage
function saveMockData(data) {
  localStorage.setItem('mockData', JSON.stringify(data));
}

// تهيئة MOCK_DATA
let MOCK_DATA = loadMockData();

// دالة مساعدة لتحديث البيانات وحفظها
function updateMockData(newData) {
  MOCK_DATA = newData;
  saveMockData(MOCK_DATA);
}

// ============================================
// MOCK API FUNCTION
// ============================================
async function mockRequest(endpoint, options = {}) {
  console.log('🎭 Mock Request:', endpoint, options?.method || 'GET');

  await new Promise(resolve => setTimeout(resolve, 600));

  // ===== DOCTORS =====
  if (endpoint.includes('/api/Doctors')) {
    if (!options.method || options.method === 'GET') {
      if (endpoint.includes('?')) {
        const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
        const page = parseInt(urlParams.get('page')) || 1;
        const limit = parseInt(urlParams.get('limit')) || 10;

        const start = (page - 1) * limit;
        const paginated = MOCK_DATA.doctors.slice(start, start + limit);

        return {
          data: paginated,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(MOCK_DATA.doctors.length / limit),
            totalItems: MOCK_DATA.doctors.length,
            itemsPerPage: limit
          }
        };
      }

      if (endpoint === '/api/Doctors' || endpoint === '/api/Doctors/') {
        return {
          data: MOCK_DATA.doctors,
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil(MOCK_DATA.doctors.length / 10),
            totalItems: MOCK_DATA.doctors.length,
            itemsPerPage: 10
          }
        };
      }

      if (endpoint.split('/').length === 4) {
        const id = endpoint.split('/').pop();
        const doctor = MOCK_DATA.doctors.find(d => d.id === id);
        if (!doctor) throw new Error('Doctor not found');
        return { data: doctor };
      }
    }

    if (options.method === 'POST') {
      const newDoctor = JSON.parse(options.body);
      newDoctor.id = 'doc_' + Date.now();
      MOCK_DATA.doctors.push(newDoctor);
      saveMockData(MOCK_DATA);
      return { message: 'Doctor added successfully' };
    }

    if (options.method === 'PUT') {
      const id = endpoint.split('/').pop();
      const updated = JSON.parse(options.body);
      const index = MOCK_DATA.doctors.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Doctor not found');
      MOCK_DATA.doctors[index] = { ...MOCK_DATA.doctors[index], ...updated };
      saveMockData(MOCK_DATA);
      return { message: 'Doctor updated successfully' };
    }

    if (options.method === 'DELETE') {
      const id = endpoint.split('/').pop();
      const index = MOCK_DATA.doctors.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Doctor not found');
      MOCK_DATA.doctors.splice(index, 1);
      saveMockData(MOCK_DATA);
      return { message: 'Doctor deleted successfully' };
    }
  }

  // ===== HOSPITALS =====
  if (endpoint.includes('/api/MedicalCenters')) {
    if (!options.method || options.method === 'GET') {
      if (endpoint.includes('?')) {
        const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
        const page = parseInt(urlParams.get('page')) || 1;
        const limit = parseInt(urlParams.get('limit')) || 10;

        const start = (page - 1) * limit;
        const paginated = MOCK_DATA.hospitals.slice(start, start + limit);

        return {
          data: paginated,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(MOCK_DATA.hospitals.length / limit),
            totalItems: MOCK_DATA.hospitals.length,
            itemsPerPage: limit
          }
        };
      }

      if (endpoint === '/api/MedicalCenters' || endpoint === '/api/MedicalCenters/') {
        return {
          data: MOCK_DATA.hospitals,
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil(MOCK_DATA.hospitals.length / 10),
            totalItems: MOCK_DATA.hospitals.length,
            itemsPerPage: 10
          }
        };
      }

      if (endpoint.split('/').length === 4) {
        const id = endpoint.split('/').pop();
        const hospital = MOCK_DATA.hospitals.find(h => h.id === id);
        return { data: hospital };
      }
    }

    if (options.method === 'POST') {
      const newHospital = JSON.parse(options.body);
      newHospital.id = 'hosp_' + Date.now();
      MOCK_DATA.hospitals.push(newHospital);
      saveMockData(MOCK_DATA);
      return { message: 'Hospital added successfully' };
    }

    if (options.method === 'PUT') {
      const id = endpoint.split('/').pop();
      const updated = JSON.parse(options.body);
      const index = MOCK_DATA.hospitals.findIndex(h => h.id === id);
      if (index === -1) throw new Error('Hospital not found');
      MOCK_DATA.hospitals[index] = { ...MOCK_DATA.hospitals[index], ...updated };
      saveMockData(MOCK_DATA);
      return { message: 'Hospital updated successfully' };
    }

    if (options.method === 'DELETE') {
      const id = endpoint.split('/').pop();
      const index = MOCK_DATA.hospitals.findIndex(h => h.id === id);
      if (index === -1) throw new Error('Hospital not found');
      MOCK_DATA.hospitals.splice(index, 1);
      saveMockData(MOCK_DATA);
      return { message: 'Hospital deleted successfully' };
    }
  }

  // ===== SEMINAR REGISTRATION =====

  // POST /api/seminars/:id/register
  // Body: { name, phone, email }
  // الـ seminarId جاي في الـ URL
  // الـ userId الـ backend هياخده من الـ JWT token — مش محتاج يتبعت
  if (endpoint.includes('/api/Seminars/') && endpoint.includes('/register') && options.method === 'POST') {
    const seminarId = endpoint.split('/')[3];
    const seminar = MOCK_DATA.seminars.find(s => s.id === seminarId);
    if (!seminar) throw new Error('Seminar not found');

    const { name, phone, email } = JSON.parse(options.body || '{}');

    // تشيك duplicate بالـ email
    const alreadyRegistered = MOCK_DATA.seminar_registrations.some(
      r => r.seminarId === seminarId && r.email === email
    );
    if (alreadyRegistered) throw new Error('ALREADY_REGISTERED');

    // تشيك capacity
    const registeredCount = MOCK_DATA.seminar_registrations.filter(
      r => r.seminarId === seminarId
    ).length;
    if (registeredCount >= seminar.maxSeats) {
      console.log('⚠️ [MOCK] Seminar full - would notify:', email);
      throw new Error('SEMINAR_FULL');
    }

    // حفظ التسجيل — نفس شكل الـ DB row
    const registration = {
      id: 'reg_' + Date.now(),
      seminarId,
      name,
      phone,
      email,
      registeredAt: new Date().toISOString(),
      status: 'confirmed'
    };
    MOCK_DATA.seminar_registrations.push(registration);
    saveMockData(MOCK_DATA);

    console.log('📧 [MOCK EMAIL] Confirmation sent to:', email);
    console.log('   Seminar:', seminar.title, '|', seminar.date, seminar.time, '|', seminar.location);

    return {
      success: true,
      message: 'Registration successful! Confirmation email sent.',
      registrationId: registration.id
    };
  }

  // GET /api/seminars/:id/check-registration?email=xxx
  // Returns: { registered, registeredCount, maxSeats }
  if (endpoint.includes('/api/Seminars/') && endpoint.includes('/check-registration')) {
    const seminarId = endpoint.split('/')[3];
    const email = new URLSearchParams(endpoint.split('?')[1] || '').get('email');
    const seminar = MOCK_DATA.seminars.find(s => s.id === seminarId);
    if (!seminar) throw new Error('Seminar not found');

    const registeredCount = MOCK_DATA.seminar_registrations.filter(
      r => r.seminarId === seminarId
    ).length;
    const registered = email
      ? MOCK_DATA.seminar_registrations.some(r => r.seminarId === seminarId && r.email === email)
      : false;

    return { registered, registeredCount, maxSeats: seminar.maxSeats };
  }

  // ===== SEMINARS =====
  if (endpoint.includes('/api/Seminars')) {
    if (!options.method || options.method === 'GET') {
      if (endpoint.includes('?')) {
        const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
        const page = parseInt(urlParams.get('page')) || 1;
        const limit = parseInt(urlParams.get('limit')) || 10;

        const start = (page - 1) * limit;
        const paginated = MOCK_DATA.seminars.slice(start, start + limit);

        return {
          data: paginated,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(MOCK_DATA.seminars.length / limit),
            totalItems: MOCK_DATA.seminars.length,
            itemsPerPage: limit
          }
        };
      }

      if (endpoint === '/api/Seminars' || endpoint === '/api/Seminars/') {
        return {
          data: MOCK_DATA.seminars,
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil(MOCK_DATA.seminars.length / 10),
            totalItems: MOCK_DATA.seminars.length,
            itemsPerPage: 10
          }
        };
      }

      if (endpoint.split('/').length === 4) {
        const id = endpoint.split('/').pop();
        const seminar = MOCK_DATA.seminars.find(s => s.id === id);
        if (!seminar) throw new Error('Seminar not found');
        return { data: seminar };
      }
    }

    if (options.method === 'POST') {
      const newSeminar = JSON.parse(options.body);
      newSeminar.id = 'sem_' + Date.now();
      MOCK_DATA.seminars.push(newSeminar);
      saveMockData(MOCK_DATA);
      return { message: 'Seminar added successfully' };
    }

    if (options.method === 'PUT') {
      const id = endpoint.split('/').pop();
      const updated = JSON.parse(options.body);
      const index = MOCK_DATA.seminars.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Seminar not found');
      MOCK_DATA.seminars[index] = { ...MOCK_DATA.seminars[index], ...updated };
      saveMockData(MOCK_DATA);
      return { message: 'Seminar updated successfully' };
    }

    if (options.method === 'DELETE') {
      const id = endpoint.split('/').pop();
      const index = MOCK_DATA.seminars.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Seminar not found');
      MOCK_DATA.seminars.splice(index, 1);
      saveMockData(MOCK_DATA);
      return { message: 'Seminar deleted successfully' };
    }
  }

  // ===== STORIES =====
  if (endpoint.includes('/api/RecoveryStories')) {
    console.log('📖 Stories endpoint matched:', endpoint);

    if (options.method === 'GET' || !options.method) {
      console.log('📖 GET request for stories');

      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const status = urlParams.get('status') || 'pending';
      const page = parseInt(urlParams.get('page')) || 1;
      const limit = parseInt(urlParams.get('limit')) || 10;

      console.log('📖 Params:', { status, page, limit });

      let filtered = MOCK_DATA.stories;
      if (status !== 'all') {
        filtered = MOCK_DATA.stories.filter(s => s.status === status);
      }

      const pendingCount = MOCK_DATA.stories.filter(s => s.status === 'pending').length;
      const approvedCount = MOCK_DATA.stories.filter(s => s.status === 'approved').length;
      const rejectedCount = MOCK_DATA.stories.filter(s => s.status === 'rejected').length;

      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      console.log('📖 Returning paginated:', paginated.length);

      return {
        data: paginated,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filtered.length / limit),
          totalItems: filtered.length,
          itemsPerPage: limit
        },
        filters: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      };
    }

    if (options.method === 'POST') {
      console.log('📝 New story submission from user');
      const newStory = JSON.parse(options.body);

      newStory.id = 'story_' + Date.now();
      newStory.status = 'pending';
      newStory.createdAt = new Date().toISOString();

      if (!newStory.author) {
        newStory.author = 'Anonymous User';
      }

      MOCK_DATA.stories.push(newStory);
      saveMockData(MOCK_DATA);

      console.log('✅ Story added as pending:', newStory.id);
      return { message: 'Story submitted successfully and is pending review' };
    }

    if (endpoint.includes('/status')) {
      console.log('📖 Status update request:', endpoint);

      const parts = endpoint.split('/');
      const id = parts[3];

      const { status, rejectionReason } = JSON.parse(options.body);

      console.log('📖 Updating story:', id, 'to status:', status);

      const storyIndex = MOCK_DATA.stories.findIndex(s => s.id === id);
      if (storyIndex !== -1) {
        MOCK_DATA.stories[storyIndex].status = status;
        if (rejectionReason) {
          MOCK_DATA.stories[storyIndex].rejectionReason = rejectionReason;
        }
        saveMockData(MOCK_DATA);
      }

      return { message: `Story ${status === 'approved' ? 'approved' : 'rejected'} successfully` };
    }

    if (options.method === 'DELETE') {
      console.log('📖 Delete request:', endpoint);

      const id = endpoint.split('/').pop();
      const index = MOCK_DATA.stories.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Story not found');

      MOCK_DATA.stories.splice(index, 1);
      saveMockData(MOCK_DATA);

      return { message: 'Story deleted successfully' };
    }
  }

  // ===== DASHBOARD STATS =====
  if (endpoint.includes('/api/dashboard/stats')) {
    const storiesSubmitted = MOCK_DATA.stories.length;
    const totalUsers = 1250;
    const activeDoctors = MOCK_DATA.doctors.length;
    const hospitalsLabs = MOCK_DATA.hospitals.length;

    return {
      data: {
        storiesSubmitted: storiesSubmitted,
        totalUsers: totalUsers,
        activeDoctors: activeDoctors,
        hospitalsLabs: hospitalsLabs
      }
    };
  }

  // ===== LOGIN =====
  if (endpoint.includes('/api/login')) {
    console.log('🔐 LOGIN ENDPOINT HIT');

    try {
      const body = JSON.parse(options.body);
      const email = body.email;
      const password = body.password;

      if (email === 'admin@test.com' && password === 'admin123') {
        return {
          role: 'admin',
          token: 'mock_token_admin_' + Date.now()
        };
      }

      if (email === 'user@test.com' && password === 'user123') {
        return {
          role: 'user',
          token: 'mock_token_user_' + Date.now()
        };
      }

      throw new Error('Invalid email or password');

    } catch (error) {
      throw error;
    }
  }

  // ===== REGISTER =====
  if (endpoint.includes('/api/register')) {
    console.log('📝 REGISTER endpoint hit');
    return { success: {} };
  }

  // ===== PASSWORD REQUEST CODE =====
  if (endpoint.includes('/api/password/request-code')) {
    console.log('🔑 PASSWORD REQUEST CODE endpoint hit');

    const { email } = JSON.parse(options.body);
    const resetCode = Math.floor(1000 + Math.random() * 9000);

    localStorage.setItem('resetCode_' + email, resetCode);
    localStorage.setItem('resetEmail', email);

    return { success: {} };
  }

  // ===== PASSWORD VERIFY CODE =====
  if (endpoint.includes('/api/password/verify-code')) {
    console.log('✅ PASSWORD VERIFY CODE endpoint hit');

    const { email, code } = JSON.parse(options.body);
    const savedCode = localStorage.getItem('resetCode_' + email);

    if (savedCode && savedCode.toString() === code.toString()) {
      localStorage.removeItem('resetCode_' + email);
      return { success: {} };
    } else {
      throw new Error('Invalid or expired code');
    }
  }

  // ===== PROFILE =====
  if (endpoint.includes('/api/Users/complete-profile')) {
    console.log('👤 PROFILE endpoint matched');
    return {
      success: {
        message: 'Profile saved successfully'
      }
    };
  }

  // ===== LOGOUT =====
  if (endpoint.includes('/api/Auth/logout')) {
    return {};
  }

  throw new Error('Mock endpoint not found: ' + endpoint);
}

// ============================================
// REAL API FUNCTION
// ============================================
async function realRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });

    const data = await response.json();

    // .NET ApiResponse structure: { success, message, data, errors }
    if (!response.ok || (data.success === false)) {
      const errorMsg = data.message || (data.errors && data.errors.join(', ')) || 'Request failed';
      throw new Error(errorMsg);
    }

    return data; // Return the full response object { success, message, data, errors }
  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ============================================
// MAIN API FUNCTION
// ============================================
async function apiRequest(endpoint, options = {}) {
  if (CONFIG.MODE === 'MOCK') {
    return mockRequest(endpoint, options);
  }
  return realRequest(endpoint, options);
}

// ============================================
// AUTH FUNCTIONS
// ============================================
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

function clearAuthToken() {
  localStorage.removeItem('authToken');
}

// دالة مساعدة لإعادة تعيين البيانات (اختياري)
function resetMockData() {
  localStorage.removeItem('mockData');
  MOCK_DATA = getInitialMockData();
  saveMockData(MOCK_DATA);
  console.log('🔄 Mock data reset to default');
}

// ============================================
// TIME AGO FUNCTION
// ============================================
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

// ============================================
// TEST FUNCTIONS (للتجربة من الكونسل) - بأسماء مختلفة عن الأدمن
// ============================================

// ✅ اسم مختلف: testUserStories (مش هيبقى adminTestStories)
async function testUserStories() {
  console.log('🧪 ========== TESTING USER STORIES ==========');

  try {
    console.log('\n🧪 TEST 1: Fetching approved stories only...');
    const approvedStories = await apiRequest('/api/RecoveryStories?status=approved');
    console.log('✅ Approved stories received:', approvedStories.data?.length || 0);

    console.log('\n🧪 TEST 2: Submitting a new story...');
    const newStory = {
      author: 'Test User',
      text: 'This is a test story from the user testing function.',
      duration: 'Just testing'
    };

    const submitResult = await apiRequest('/api/RecoveryStories', {
      method: 'POST',
      body: JSON.stringify(newStory)
    });
    console.log('✅ Story submitted successfully:', submitResult);

    console.log('\n🧪 TEST 3: Verifying story was added as pending...');
    const pendingStories = await apiRequest('/api/RecoveryStories?status=pending');
    console.log('✅ Pending stories count:', pendingStories.data?.length || 0);

    console.log('\n🧪 ========== TEST COMPLETE ==========');
    console.log('📊 Total stories:', MOCK_DATA.stories.length);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// ✅ اسم مختلف: testUserSeminars (مش هيبقى adminTestSeminars)
async function testUserSeminars() {
  console.log('🎓 ========== TESTING USER SEMINARS ==========');

  try {
    console.log('\n🎓 TEST 1: Fetching all seminars...');
    const allSeminars = await apiRequest('/api/Seminars?limit=10');
    console.log('✅ Seminars received:', allSeminars.data?.length || 0);
    console.log('📊 Seminar details:', allSeminars.data);

    console.log('\n🎓 TEST 2: Fetching first page with pagination...');
    const paginated = await apiRequest('/api/Seminars?page=1&limit=2');
    console.log('✅ Paginated seminars:', paginated.data?.length || 0);
    console.log('📊 Pagination info:', paginated.pagination);

    console.log('\n🎓 TEST 3: Fetching specific seminar by ID...');
    if (MOCK_DATA.seminars.length > 0) {
      const seminarId = MOCK_DATA.seminars[0].id;
      const seminar = await apiRequest(`/api/Seminars/${seminarId}`);
      console.log('✅ Seminar details:', seminar.data);
    }

    console.log('\n🎓 ========== TEST COMPLETE ==========');
    console.log('📊 Total seminars:', MOCK_DATA.seminars.length);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// ✅ اسم مختلف: testUserHomePage (مش هيبقى adminTestHomePage)
async function testUserHomePage() {
  console.log('🏠 ========== TESTING USER HOME PAGE ==========');

  try {
    console.log('\n🏠 TEST 1: Fetching latest approved stories (limit 3)...');
    const stories = await apiRequest('/api/RecoveryStories?status=approved&limit=3');
    console.log('✅ Stories for home page:', stories.data?.length || 0);
    console.log('📖 Latest stories:', stories.data);

    console.log('\n🏠 TEST 2: Fetching latest seminars (limit 3)...');
    const seminars = await apiRequest('/api/Seminars?limit=3');
    console.log('✅ Seminars for home page:', seminars.data?.length || 0);
    console.log('🎓 Latest seminars:', seminars.data);

    console.log('\n🏠 TEST 3: Fetching dashboard stats...');
    try {
      const stats = await apiRequest('/api/dashboard/stats');
      console.log('📊 Dashboard stats:', stats.data);
    } catch (e) {
      console.log('ℹ️ Dashboard stats endpoint not available');
    }

    console.log('\n🏠 ========== TEST COMPLETE ==========');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}
// ============================================
// TEST FUNCTIONS FOR DOCTORS & HOSPITALS
// ============================================

// تيست الدكاترة والمستشفيات للمستخدم العادي
async function testUserDoctors() {
  console.log('👨‍⚕️ ========== TESTING USER DOCTORS & HOSPITALS ==========');

  try {
    console.log('\n👨‍⚕️ TEST 1: Fetching all doctors...');
    const doctors = await apiRequest('/api/Doctors');
    console.log('✅ Doctors received:', doctors.data?.length || 0);
    console.log('📊 Doctors details:', doctors.data);

    console.log('\n🏥 TEST 2: Fetching all hospitals...');
    const hospitals = await apiRequest('/api/MedicalCenters');
    console.log('✅ Hospitals received:', hospitals.data?.length || 0);
    console.log('📊 Hospitals details:', hospitals.data);

    console.log('\n👨‍⚕️🏥 TEST 3: Testing pagination for doctors...');
    const paginatedDoctors = await apiRequest('/api/Doctors?page=1&limit=2');
    console.log('✅ Paginated doctors:', paginatedDoctors.data?.length || 0);
    console.log('📊 Pagination info:', paginatedDoctors.pagination);

    console.log('\n👨‍⚕️🏥 TEST 4: Fetching specific doctor by ID...');
    if (MOCK_DATA.doctors.length > 0) {
      const doctorId = MOCK_DATA.doctors[0].id;
      const doctor = await apiRequest(`/api/Doctors/${doctorId}`);
      console.log('✅ Doctor details:', doctor.data);
    }

    console.log('\n🏥 TEST 5: Fetching specific hospital by ID...');
    if (MOCK_DATA.hospitals.length > 0) {
      const hospitalId = MOCK_DATA.hospitals[0].id;
      const hospital = await apiRequest(`/api/MedicalCenters/${hospitalId}`);
      console.log('✅ Hospital details:', hospital.data);
    }

    console.log('\n👨‍⚕️🏥 ========== TEST COMPLETE ==========');
    console.log('📊 Total doctors:', MOCK_DATA.doctors.length);
    console.log('📊 Total hospitals:', MOCK_DATA.hospitals.length);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// تيست إضافة دكتور جديد (محاكاة لإضافة المستخدم)
async function testUserAddDoctor() {
  console.log('➕ ========== TESTING ADD DOCTOR ==========');

  try {
    const newDoctor = {
      fullName: 'Dr. Test User',
      email: 'test@hospital.com',
      phone: '+20 123 456 7899',
      specialty: 'Test Specialty',
      schedule: 'Sun-Thu 10AM-2PM'
    };

    const result = await apiRequest('/api/Doctors', {
      method: 'POST',
      body: JSON.stringify(newDoctor)
    });

    console.log('✅ Doctor added successfully:', result);

    // تأكيد الإضافة
    const doctors = await apiRequest('/api/Doctors');
    console.log('📊 Total doctors now:', doctors.data?.length || 0);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// تيست إضافة مستشفى جديد
async function testUserAddHospital() {
  console.log('➕ ========== TESTING ADD HOSPITAL ==========');

  try {
    const newHospital = {
      name: 'Test Medical Center',
      type: 'hospital',
      location: 'Test City, Egypt',
      article: 'Test description',
      mapLink: 'https://maps.google.com'
    };

    const result = await apiRequest('/api/MedicalCenters', {
      method: 'POST',
      body: JSON.stringify(newHospital)
    });

    console.log('✅ Hospital added successfully:', result);

    // تأكيد الإضافة
    const hospitals = await apiRequest('/api/MedicalCenters');
    console.log('📊 Total hospitals now:', hospitals.data?.length || 0);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// ✅ اسم مختلف: testUserEverything (مش هيبقى adminTestEverything)
async function testUserEverything() {
  console.log('🔬 ========== RUNNING ALL USER TESTS ==========');
  console.log('📅 Time:', new Date().toLocaleString());
  console.log('🎭 Mode:', CONFIG.MODE);

  await testUserStories();
  console.log('\n' + '='.repeat(50) + '\n');

  await testUserSeminars();
  console.log('\n' + '='.repeat(50) + '\n');

  await testUserHomePage();

  console.log('\n🔬 ========== ALL USER TESTS COMPLETE ==========');
  console.log('✅ Stories count:', MOCK_DATA.stories.length);
  console.log('✅ Seminars count:', MOCK_DATA.seminars.length);
}