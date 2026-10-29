const BASE_URL = 'http://127.0.0.1:5000/api';

async function runAdminTests() {
  console.log('========================================================');
  console.log('🛡️ RUNNING PHASE 5 ADMIN SECURITY & MANAGEMENT TESTS');
  console.log('========================================================\n');

  try {
    // 1. Log in as Regular User
    console.log('1️⃣ Logging in as Regular User (user@imovies.com)...');
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@imovies.com',
        password: 'UserPassword123!',
      }),
    });
    const userLoginData = await userLoginRes.json();
    const userToken = userLoginData.token;
    console.log('   ✅ Regular user token obtained. Role:', userLoginData.user.role);

    // 2. Regular User tries to access Admin endpoints (MUST return 403 Forbidden)
    console.log('\n2️⃣ Testing Non-Admin Authorization Rejection (HTTP 403)...');
    
    // 2a. POST /api/movies
    const unauthPostMovie = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Hacker Film',
        description: 'Should be rejected',
        poster: 'https://example.com/poster.jpg',
        duration: 100,
      }),
    });
    if (unauthPostMovie.status === 403) {
      console.log('   ✅ PASS: POST /api/movies rejected with HTTP 403 Forbidden for regular user.');
    } else {
      console.error(`   ❌ FAILED: Expected 403 Forbidden, got ${unauthPostMovie.status}`);
      process.exit(1);
    }

    // 2b. GET /api/bookings/all
    const unauthGetBookings = await fetch(`${BASE_URL}/bookings/all`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (unauthGetBookings.status === 403) {
      console.log('   ✅ PASS: GET /api/bookings/all rejected with HTTP 403 Forbidden for regular user.');
    } else {
      console.error(`   ❌ FAILED: Expected 403 Forbidden, got ${unauthGetBookings.status}`);
      process.exit(1);
    }

    // 3. Log in as Administrator
    console.log('\n3️⃣ Logging in as Administrator (admin@imovies.com)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@imovies.com',
        password: 'AdminPassword123!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log('   ✅ Admin token obtained. Role:', adminLoginData.user.role);

    // 4. Admin Creates a New Movie
    console.log('\n4️⃣ Admin Creating a New Movie...');
    const createMovieRes = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Oppenheimer: The Manhattan Project',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
        poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        genre: ['Biography', 'Drama', 'History'],
        duration: 180,
        rating: 8.9,
        ticketPrice: 320,
        showtimes: ['11:00 AM', '03:30 PM', '07:30 PM'],
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        featured: true,
      }),
    });
    const createMovieData = await createMovieRes.json();
    if (!createMovieRes.ok || !createMovieData.movie) {
      throw new Error(`Failed to create movie: ${createMovieData.message}`);
    }
    const createdMovie = createMovieData.movie;
    console.log(`   ✅ PASS: Movie created successfully! ID: ${createdMovie._id}, Title: "${createdMovie.title}"`);

    // 5. Admin Updates the Movie
    console.log('\n5️⃣ Admin Updating Movie Details...');
    const updateMovieRes = await fetch(`${BASE_URL}/movies/${createdMovie._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ticketPrice: 350,
        rating: 9.1,
      }),
    });
    const updateMovieData = await updateMovieRes.json();
    if (updateMovieRes.ok && updateMovieData.movie.ticketPrice === 350) {
      console.log('   ✅ PASS: Movie price updated to ₹350 and rating to 9.1.');
    } else {
      console.error('   ❌ FAILED to update movie:', updateMovieData);
      process.exit(1);
    }

    // 6. Admin Analytics Query
    console.log('\n6️⃣ Admin Fetching Cinema Analytics (GET /api/bookings/all)...');
    const analyticsRes = await fetch(`${BASE_URL}/bookings/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const analyticsData = await analyticsRes.json();
    if (analyticsRes.ok) {
      console.log('   ✅ PASS: Analytics retrieved:');
      console.log(`      Total Bookings:    ${analyticsData.count}`);
      console.log(`      Active Bookings:   ${analyticsData.activeCount}`);
      console.log(`      Cancelled:         ${analyticsData.cancelledCount}`);
      console.log(`      Simulated Revenue: ₹${analyticsData.totalRevenue}`);
    } else {
      console.error('   ❌ FAILED to fetch analytics:', analyticsData);
      process.exit(1);
    }

    // 7. Admin Deletes the Movie
    console.log('\n7️⃣ Admin Deleting the Movie...');
    const deleteRes = await fetch(`${BASE_URL}/movies/${createdMovie._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteData = await deleteRes.json();
    if (deleteRes.ok) {
      console.log(`   ✅ PASS: ${deleteData.message}`);
    } else {
      console.error('   ❌ FAILED to delete movie:', deleteData);
      process.exit(1);
    }

    console.log('\n========================================================');
    console.log('🎉 ALL PHASE 5 ADMIN SECURITY & MANAGEMENT TESTS PASSED!');
    console.log('========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
  }
}

runAdminTests();
