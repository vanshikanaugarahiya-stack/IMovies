import React, { useState, useEffect } from 'react';
import {
  Shield,
  Film,
  Ticket,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchMovies,
  createMovieApi,
  updateMovieApi,
  deleteMovieApi,
  fetchAllBookingsApi,
} from '../api/apiClient';

const INITIAL_FORM = {
  title: '',
  description: '',
  poster: '',
  banner: '',
  genre: 'Action, Sci-Fi',
  duration: 120,
  rating: 8.5,
  ticketPrice: 250,
  showtimes: '10:30 AM, 02:00 PM, 06:00 PM, 09:30 PM',
  director: '',
  cast: '',
  featured: false,
};

const AdminDashboardPage = () => {
  const { user, isAuthenticated, isAdmin, openLoginModal } = useAuth();

  const [activeTab, setActiveTab] = useState('movies'); // 'movies' or 'bookings'
  const [movies, setMovies] = useState([]);
  const [bookingsData, setBookingsData] = useState({
    count: 0,
    activeCount: 0,
    cancelledCount: 0,
    totalRevenue: 0,
    bookings: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search filter inside admin dashboard
  const [movieSearch, setMovieSearch] = useState('');

  // Load movies and analytics data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [moviesRes, bookingsRes] = await Promise.all([
        fetchMovies(),
        fetchAllBookingsApi(),
      ]);

      if (moviesRes.success) {
        setMovies(moviesRes.movies || []);
      }
      if (bookingsRes.success) {
        setBookingsData({
          count: bookingsRes.count || 0,
          activeCount: bookingsRes.activeCount || 0,
          cancelledCount: bookingsRes.cancelledCount || 0,
          totalRevenue: bookingsRes.totalRevenue || 0,
          bookings: bookingsRes.bookings || [],
        });
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load dashboard data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingMovieId(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (movie) => {
    setEditingMovieId(movie._id);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      poster: movie.poster || '',
      banner: movie.banner || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
      duration: movie.duration || 120,
      rating: movie.rating || 8.0,
      ticketPrice: movie.ticketPrice || 250,
      showtimes: Array.isArray(movie.showtimes) ? movie.showtimes.join(', ') : movie.showtimes || '',
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      featured: Boolean(movie.featured),
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit Add or Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification({ type: '', message: '' });

    try {
      if (editingMovieId) {
        const res = await updateMovieApi(editingMovieId, formData);
        if (res.success) {
          setNotification({ type: 'success', message: `Movie "${formData.title}" updated successfully!` });
          setIsModalOpen(false);
          loadDashboardData();
        }
      } else {
        const res = await createMovieApi(formData);
        if (res.success) {
          setNotification({ type: 'success', message: `Movie "${formData.title}" created successfully!` });
          setIsModalOpen(false);
          loadDashboardData();
        }
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save movie.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Movie with safety check
  const handleDeleteMovie = async (movie) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${movie.title}" from the cinema catalogue?\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteMovieApi(movie._id);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        loadDashboardData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete movie.',
      });
    }
  };

  // Filtered movies by search query
  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
    (m.genre && m.genre.some((g) => g.toLowerCase().includes(movieSearch.toLowerCase())))
  );

  // --- ACCESS CONTROL: If not logged in as Admin ---
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-white animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-4 shadow-xl">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mb-2">Administrator Access Required</h2>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          The cinema management dashboard is restricted to authorized administrative personnel. Backend APIs strictly reject non-admin requests with HTTP 403 Forbidden.
        </p>
        <button
          onClick={openLoginModal}
          className="py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-bold text-xs text-black shadow-lg shadow-amber-600/30 transition-all"
        >
          Sign In as Admin (admin@imovies.com)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white animate-fadeIn">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4" />
            <span>Cinema Operations Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Logged in as <span className="text-white font-semibold">{user?.name}</span> ({user?.email}) &bull; Role: <span className="text-amber-400 font-bold uppercase">Administrator</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </button>
        </div>
      </div>

      {/* Notifications Toast */}
      {notification.message && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs animate-fadeIn ${
            notification.type === 'error'
              ? 'bg-red-950/60 border-red-800/50 text-red-300'
              : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification({ type: '', message: '' })}
            className="text-neutral-400 hover:text-white text-base"
          >
            &times;
          </button>
        </div>
      )}

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Movies */}
        <div className="p-5 rounded-3xl bg-[#13141f] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider block">
              Active Catalogue
            </span>
            <span className="text-2xl font-black text-white">{movies.length} Movies</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="p-5 rounded-3xl bg-[#13141f] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider block">
              Total Reservations
            </span>
            <span className="text-2xl font-black text-white">{bookingsData.count}</span>
          </div>
        </div>

        {/* Active vs Cancelled */}
        <div className="p-5 rounded-3xl bg-[#13141f] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider block">
              Active vs Cancelled
            </span>
            <span className="text-2xl font-black text-white">
              {bookingsData.activeCount} <span className="text-xs text-neutral-500">/ {bookingsData.cancelledCount} off</span>
            </span>
          </div>
        </div>

        {/* Simulated Revenue */}
        <div className="p-5 rounded-3xl bg-[#13141f] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-amber-400/90 uppercase font-bold tracking-wider block">
              Simulated Demo Revenue
            </span>
            <span className="text-2xl font-black text-white">₹{bookingsData.totalRevenue}</span>
            <span className="text-[10px] text-neutral-500 block">Confirmed tickets only</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('movies')}
          className={`py-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'movies'
              ? 'border-red-500 text-red-500'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Manage Movies ({movies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-red-500 text-red-500'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Recent Bookings ({bookingsData.count})</span>
        </button>
      </div>

      {/* --- TAB 1: MOVIES MANAGEMENT TABLE --- */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          {/* Search bar inside movies table */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter catalog by title or genre..."
                value={movieSearch}
                onChange={(e) => setMovieSearch(e.target.value)}
                className="w-full bg-[#13141f] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <span className="text-xs text-neutral-400">
              Showing {filteredMovies.length} of {movies.length} movies
            </span>
          </div>

          <div className="bg-[#13141f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181926] text-neutral-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-4 px-6">Movie</th>
                    <th className="py-4 px-4">Genres</th>
                    <th className="py-4 px-4">Duration</th>
                    <th className="py-4 px-4">Base Price</th>
                    <th className="py-4 px-4">Showtimes</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMovies.map((movie) => (
                    <tr key={movie._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white text-sm block">{movie.title}</span>
                            <span className="text-[11px] text-neutral-400">
                              ⭐ {movie.rating || 8.0} &bull; {movie.language || 'English'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {movie.genre?.map((g, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-neutral-300"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-neutral-300 font-medium">
                        {movie.duration} mins
                      </td>

                      <td className="py-4 px-4 font-black text-white">
                        ₹{movie.ticketPrice || 250}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {movie.showtimes?.map((st, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-[#181926] border border-white/5 text-[10px] text-neutral-300"
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(movie)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                            title="Edit Movie"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(movie)}
                            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Movie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: RECENT BOOKINGS AUDIT TABLE --- */}
      {activeTab === 'bookings' && (
        <div className="bg-[#13141f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181926] text-neutral-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Booking ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Movie</th>
                  <th className="py-4 px-4">Schedule</th>
                  <th className="py-4 px-4">Seats</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookingsData.bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-red-400">
                      {b.bookingId}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white block">{b.user?.name || 'Customer'}</span>
                      <span className="text-[11px] text-neutral-400">{b.user?.email}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {b.movie?.title || 'Unknown Movie'}
                    </td>
                    <td className="py-4 px-4 text-neutral-300">
                      <div>{b.showDate}</div>
                      <div className="text-[11px] text-neutral-400">{b.showtime}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {b.seats?.map((seat) => (
                          <span
                            key={seat}
                            className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] font-bold"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-black text-white">
                      ₹{b.totalAmount}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.paymentStatus === 'Completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT MOVIE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-2xl bg-[#12131e] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingMovieId ? 'Edit Movie Details' : 'Add New Cinema Movie'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Fill in the details to update the cinema screening catalog.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Movie Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Avatar: The Way of Water"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    required
                    min="1"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Synopsis / Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  rows="3"
                  placeholder="Compelling movie summary..."
                  className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              {/* Poster URL & Backdrop URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Poster Image URL *</label>
                  <input
                    type="url"
                    name="poster"
                    value={formData.poster}
                    onChange={handleFormChange}
                    required
                    placeholder="https://..."
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Backdrop Banner URL</label>
                  <input
                    type="url"
                    name="banner"
                    value={formData.banner}
                    onChange={handleFormChange}
                    placeholder="https://... (defaults to poster if empty)"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Genre, Price, Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleFormChange}
                    placeholder="Action, Sci-Fi"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleFormChange}
                    required
                    min="50"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    value={formData.rating}
                    onChange={handleFormChange}
                    min="0"
                    max="10"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Showtimes */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Showtimes (comma-separated)
                </label>
                <input
                  type="text"
                  name="showtimes"
                  value={formData.showtimes}
                  onChange={handleFormChange}
                  placeholder="10:30 AM, 02:00 PM, 06:00 PM, 09:30 PM"
                  className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Director</label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleFormChange}
                    placeholder="e.g. Christopher Nolan"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Cast (comma-separated)</label>
                  <input
                    type="text"
                    name="cast"
                    value={formData.cast}
                    onChange={handleFormChange}
                    placeholder="Leonardo DiCaprio, Tom Hardy"
                    className="w-full bg-[#181926] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-[#181926] border-white/20"
                />
                <label htmlFor="featured" className="text-neutral-300 font-semibold cursor-pointer">
                  Feature on Homepage Hero Banner
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingMovieId ? 'Update Movie' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
