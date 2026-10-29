const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING CINEMA SEAT SELECTION & BOOKING FLOW TESTS');
  console.log('========================================================\n');

  try {
    // 1. Test Login & Get Token
    console.log('1️⃣ Testing Authentication & Token Issuance...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@imovies.com',
        password: 'UserPassword123!',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    const token = loginData.token;
    console.log('   ✅ Logged in successfully. Token length:', token.length);

    // 2. Test Unauthenticated Booking Attempt (Must fail with 401)
    console.log('\n2️⃣ Testing Unauthenticated Booking Attempt...');
    const unauthRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movieId: '123456789012345678901234',
        showDate: '2026-10-30',
        showtime: '10:30 AM',
        seats: ['A1'],
      }),
    });
    if (unauthRes.status === 401) {
      console.log('   ✅ PASS: Unauthenticated request rejected with HTTP 401 Unauthorized');
    } else {
      console.error(`   ❌ FAILED: Expected 401, got ${unauthRes.status}`);
      process.exit(1);
    }

    // 3. Fetch a movie from catalog
    console.log('\n3️⃣ Fetching a Movie from Catalog...');
    const moviesRes = await fetch(`${BASE_URL}/movies`);
    const moviesData = await moviesRes.json();
    const testMovie = moviesData.movies[0];
    console.log(`   ✅ Target Movie: "${testMovie.title}" (Base Price: ₹${testMovie.ticketPrice})`);
    console.log(`   Available Showtimes: ${testMovie.showtimes.join(', ')}`);

    const targetDate = '2026-10-30';
    const targetShowtime = testMovie.showtimes[0];

    // 4. Test Booking with Server-Side Price Calculation (Tampered price sent by client)
    console.log('\n4️⃣ Testing Server-Side Authoritative Price Recalculation...');
    const testSeats = ['A1', 'C3']; // A1 is VIP Recliner (base * 1.6), C3 is Gold (base * 1.2)
    const tamperedClientAmount = 1; // Client tries to pay ₹1

    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movieId: testMovie._id,
        showDate: targetDate,
        showtime: targetShowtime,
        seats: testSeats,
        totalAmount: tamperedClientAmount,
      }),
    });

    const bookingData = await bookingRes.json();
    if (!bookingRes.ok) {
      throw new Error(`Booking failed: ${bookingData.message}`);
    }

    const booking = bookingData.booking;
    console.log('   ✅ Booking created successfully!');
    console.log(`   Booking ID:       ${booking.bookingId}`);
    console.log(`   Client Sent:      ₹${tamperedClientAmount}`);
    console.log(`   Server Enforced:  ₹${booking.totalAmount}`);

    const expectedA1 = Math.round(testMovie.ticketPrice * 1.6);
    const expectedC3 = Math.round(testMovie.ticketPrice * 1.2);
    const expectedTotal = expectedA1 + expectedC3 + 30; // + ₹30 demo fee

    if (booking.totalAmount === expectedTotal) {
      console.log(`   ✅ PASS: Server ignored client price and computed exact total: ₹${expectedTotal} (VIP: ₹${expectedA1} + Gold: ₹${expectedC3} + Fee: ₹30)`);
    } else {
      console.error(`   ❌ Price calculation mismatch. Expected ₹${expectedTotal}, got ₹${booking.totalAmount}`);
      process.exit(1);
    }

    // 5. Test Occupied Seats Update
    console.log('\n5️⃣ Testing Occupied Seats Retrieval...');
    const occupiedRes = await fetch(
      `${BASE_URL}/bookings/occupied-seats?movieId=${testMovie._id}&showDate=${targetDate}&showtime=${encodeURIComponent(
        targetShowtime
      )}`
    );
    const occupiedData = await occupiedRes.json();
    const occupied = occupiedData.occupiedSeats;
    console.log('   Live Occupied Seats:', occupied);
    if (occupied.includes('A1') && occupied.includes('C3')) {
      console.log('   ✅ PASS: Both newly booked seats (A1, C3) are marked as occupied.');
    } else {
      console.error('   ❌ Booked seats missing from occupied seats list');
      process.exit(1);
    }

    // 6. Test Double Booking Prevention (Race Condition Safeguard)
    console.log('\n6️⃣ Testing Double-Booking Prevention (Overlapping seat A1)...');
    const doubleRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movieId: testMovie._id,
        showDate: targetDate,
        showtime: targetShowtime,
        seats: ['A1', 'A2'], // A1 is already booked!
      }),
    });
    const doubleData = await doubleRes.json();
    if (doubleRes.status === 409) {
      console.log('   ✅ PASS: Double-booking rejected with HTTP 409 Conflict!');
      console.log('   Server Response Message:', doubleData.message);
    } else {
      console.error(`   ❌ Expected 409 Conflict, got ${doubleRes.status}:`, doubleData);
      process.exit(1);
    }

    // 7. Test Cancellation & Seat Release
    console.log('\n7️⃣ Testing Booking Cancellation & Seat Release...');
    const cancelRes = await fetch(`${BASE_URL}/bookings/${booking._id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const cancelData = await cancelRes.json();
    console.log('   Cancel Response Message:', cancelData.message);

    // Verify seats are released
    const freshOccupiedRes = await fetch(
      `${BASE_URL}/bookings/occupied-seats?movieId=${testMovie._id}&showDate=${targetDate}&showtime=${encodeURIComponent(
        targetShowtime
      )}`
    );
    const freshOccupiedData = await freshOccupiedRes.json();
    if (!freshOccupiedData.occupiedSeats.includes('A1')) {
      console.log('   ✅ PASS: Seats successfully released after cancellation.');
    } else {
      console.error('   ❌ Seats still marked as occupied after cancellation');
      process.exit(1);
    }

    console.log('\n========================================================');
    console.log('🎉 ALL PHASE 4 SEAT SELECTION & BOOKING TESTS PASSED!');
    console.log('========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
