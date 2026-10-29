import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0a0f] text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
          {/* Main Top Navigation Bar */}
          <Navbar
            searchTerm={globalSearch}
            onSearchChange={(term) => setGlobalSearch(term)}
          />

          {/* Authentication Modal (Accessible anywhere) */}
          <AuthModal />

          {/* Page Views Router */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage globalSearch={globalSearch} />} />
              <Route path="/movies" element={<HomePage globalSearch={globalSearch} />} />
              <Route path="/movie/:id" element={<MovieDetailsPage />} />
              <Route path="/book/:id" element={<SeatSelectionPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              {/* Fallback 404 */}
              <Route path="*" element={<HomePage globalSearch={globalSearch} />} />
            </Routes>
          </main>

          {/* Cinema Theme Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
