const testAdminCrud = async () => {
    const API_BASE = 'http://localhost:5000';
    let token = '';

    const req = async (path, method = 'GET', body = null) => {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${API_BASE}${path}`, options);
        const data = await res.json();
        if (!res.ok || (data.success === false)) {
            throw new Error(`API Error [${path}]: ${data.message || 'Failed'}`);
        }
        return data;
    };

    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await req('/api/Auth/login', 'POST', {
            email: 'admin@nosmokejourney.com',
            password: 'Admin@123'
        });
        token = loginRes.data.token;
        console.log("   ✅ Admin logged in successfully");

        console.log("2. Testing Doctor Creation...");
        const doctorRes = await req('/api/Doctors', 'POST', {
            name: 'Dr. Test Audit',
            email: `drtest${Date.now()}@example.com`,
            password: 'Password123!',
            specialization: 'Pulmonology',
            contactInfo: '1234567890',
            location: 'Test Hospital',
            about: 'Test About'
        });
        const doctorId = doctorRes.data.id;
        console.log(`   ✅ Doctor created with ID: ${doctorId}`);

        console.log("3. Testing Doctor Update...");
        await req(`/api/Doctors/${doctorId}`, 'PUT', {
            specialization: 'Cardiology',
            location: 'Updated Hospital',
            contactInfo: '0987654321',
            about: 'Updated About'
        });
        console.log("   ✅ Doctor updated successfully");

        console.log("4. Testing Pagination/Fetching Doctors...");
        const paginatedRes = await req('/api/Doctors?page=1&limit=10', 'GET');
        const doctorsList = paginatedRes.data.items;
        if (!doctorsList || doctorsList.length === 0) throw new Error("Doctors pagination failed");
        console.log(`   ✅ Fetched ${doctorsList.length} doctors`);

        console.log("5. Testing Seminar Creation...");
        const seminarRes = await req('/api/Seminars', 'POST', {
            title: 'Audit Seminar',
            description: 'Testing seminar creation',
            speaker: 'Dr. Audit',
            date: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 60,
            location: 'Online',
            maxParticipants: 100,
            link: 'http://test.com'
        });
        console.log(`   ✅ Seminar created with ID: ${seminarRes.data.id}`);

        console.log("6. Testing Stories Module...");
        // Since RecoveryStories are created by User, we login as User.
        const userLogin = await req('/api/Auth/login', 'POST', {
            email: 'user@nosmokejourney.com', // Let's hope this exists, else we create one
            password: 'User@123'
        }).catch(async () => {
             return await req('/api/Auth/register', 'POST', {
                name: 'Test User', email: `user${Date.now()}@example.com`, password: 'User@123', phoneNumber: '111222'
            });
        });
        const userToken = userLogin.data.token;
        
        const storyRes = await fetch(`${API_BASE}/api/RecoveryStories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify({ title: 'My Journey', content: 'Quit smoking today!' })
        }).then(r => r.json());
        console.log(`   ✅ Story submitted successfully with ID: ${storyRes.data.id}`);

        console.log("7. Testing Story Approval (Admin)...");
        await req(`/api/RecoveryStories/${storyRes.data.id}/approve`, 'PUT');
        console.log("   ✅ Story approved successfully");

        console.log("\n====================================");
        console.log("🎉 ALL REAL BACKEND CRUD TESTS PASSED");
        console.log("====================================");
    } catch (e) {
        console.error("❌ TEST FAILED:", e.message);
        process.exit(1);
    }
};

testAdminCrud();
