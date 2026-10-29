# IMovies – Cinema Ticket Booking System (MERN Stack)
## College Capstone Project

**IMovies** is a full-stack Cinema Ticket Booking System developed using the **MERN Stack** (MongoDB Atlas, Express.js, React.js, Node.js) with Tailwind CSS. The application delivers a modern cinematic user experience with a deep carbon dark theme (`#0a0a0f`), vibrant crimson accents (`#e50914`), and gold rating highlights.

---

## 🌟 Key Features

1. **Attractive Homepage**:
   - Dynamic Hero Banner with featured movies and slide transitions.
   - Real-time genre filtering (*Action*, *Sci-Fi*, *Drama*, *Adventure*, *Thriller*, *Crime*, *Fantasy*, *Cyberpunk*).
   - Live search by title, director, and genre.
   - High-resolution poster grid with rating tags and quick booking actions.

2. **Movie Details & Showtime Selector**:
   - High-resolution backdrop hero with cinematic vignette gradients.
   - Synopsis, duration, director, starring cast, and language.
   - Interactive 5-day calendar selector (*Today*, *Tomorrow*, and upcoming days).
   - Dynamic showtime chips (*10:30 AM*, *02:00 PM*, *06:00 PM*, *09:30 PM*).

3. **Interactive Cinema Seat Selection**:
   - Curved screen indicator with ambient beam projection (*"SCREEN THIS WAY"*).
   - 56-seat multiplex layout (7 rows A-G $\times$ 8 columns) with central walkway aisle.
   - Categorized tiers with dynamic pricing:
     - **VIP Recliner** (Rows A, B)
     - **Gold Tier** (Rows C, D, E)
     - **Silver Tier** (Rows F, G)
   - Dynamic seat states: *Available*, *Selected* (crimson glow), and *Already Booked* (disabled/strike-through).
   - Real-time seat tally and transparent price calculator.

4. **Robust Backend Double-Booking Prevention**:
   - Authoritative server-side price calculation (never trusts client price).
   - Atomic database-level conflict checking preventing race conditions (HTTP 409 Conflict).
   - Real-time occupied seats API (`GET /api/bookings/occupied-seats`).

5. **Simulated Demo Checkout & Printable Cinema Pass**:
   - Transparent simulated checkout (no real payment cards or financial transactions).
   - Instant digital ticket generation with unique Booking ID (`IMV-XXXXXX`).
   - Decorative simulated QR Code labeled *DEMO PASS*.
   - Printer-friendly layout (`window.print()`).

6. **User Account & "My Bookings"**:
   - JWT-based authentication with `bcryptjs` password hashing.
   - "My Bookings" page displaying all active and historical reservations.
   - One-click booking cancellation with instant seat release back to the cinema pool.

7. **Admin Dashboard (`/admin`)**:
   - Role-guarded route (`verifyToken` + `verifyAdmin` enforcing HTTP 403 for non-admins).
   - Real-time KPI statistics: Total Movies, Total Bookings, Active vs. Cancelled count, and Simulated Demo Revenue.
   - Movie Management: Add New Movie modal, Edit Movie modal, and Delete Movie with safety checks for active bookings.
   - Real-time audit table of all customer bookings.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, React Router DOM, Tailwind CSS, Lucide React Icons, Axios
* **Backend**: Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv
* **Database**: MongoDB Atlas (Cloud Cluster)

---

## 🔑 Demo Test Credentials

The system includes pre-seeded demo accounts for testing and capstone defense:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@imovies.com` | `AdminPassword123!` | Full Admin Dashboard, Add/Edit/Delete Movies, View All Revenue & Bookings |
| **Demo User** | `user@imovies.com` | `UserPassword123!` | Browse, Book Seats, View My Bookings, Cancel Reservations |

*(The login modal also includes a 1-click test login button to auto-fill these credentials).*

---

## ⚙️ Environment Variables Setup

Before running the project, configure your environment variables:

1. Navigate to the `server/` directory.
2. Create a `.env` file from the example template:
   ```bash
   cp .env.example .env
   ```
3. Update the values in `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<YOUR_DB_USERNAME>:<YOUR_DB_PASSWORD>@<YOUR_CLUSTER_HOST>/imovies?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   ```

*(Note: `.env` is excluded in `.gitignore` and must never be committed to Git).*

---

## 🚀 Step-by-Step Installation & Run Guide

### 1. Install Backend Dependencies & Seed Database
```bash
cd server
npm install
npm run seed     # Populates Atlas database with movies and demo accounts
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Install Frontend Dependencies & Start React Client
Open a second terminal:
```bash
cd client
npm install
npm run dev      # Starts Vite development server on http://localhost:5173
```

### 3. Open in Browser
Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Test Verification

The project includes automated security and booking tests:

```bash
cd server

# Run Phase 4 Seat Selection & Double-Booking Tests
node tests/testBookingFlow.js

# Run Phase 5 Admin Security & Authorization Tests
node tests/testAdminSecurity.js
```
