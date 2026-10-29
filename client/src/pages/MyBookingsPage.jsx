import React, { useState, useEffect } from 'react';
import { Ticket, ArrowLeft, Calendar, Clock, Film, AlertCircle, Trash2, Printer, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../api/apiClient';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const MyBookingsPage = () => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadBookings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchMyBookings();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your reservations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released.')) {
      return;
    }

    try {
      const res = await apiClient.put(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setActionMessage('Booking cancelled successfully. Seats have been released.');
        loadBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-white">
        <div className="w-16 h-16 rounded-3xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign in to view your bookings</h2>
        <p className="text-xs text-neutral-400 mb-6">
          Access your digital cinema passes, reservation history, and seat details.
        </p>
        <button
          onClick={openLoginModal}
          className="py-3 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-xs text-white shadow-lg shadow-red-600/30 transition-all"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-1">
            Account Tickets
          </span>
          <h1 className="text-3xl font-black">My Cinema Bookings</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Reservations for <span className="text-white font-semibold">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse More Movies</span>
        </Link>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage('')}
            className="text-neutral-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-[#13141f] rounded-3xl animate-pulse border border-white/5"></div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/40 text-center">
          <p className="text-sm text-red-300 mb-2">{error}</p>
          <button
            onClick={loadBookings}
            className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && bookings.length === 0 && (
        <div className="p-16 text-center bg-[#13141f] rounded-3xl border border-white/5">
          <Ticket className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Bookings</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
            You haven't reserved any cinema tickets yet. Explore current movies and choose your seats!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-xs text-white shadow-lg shadow-red-600/30 transition-all"
          >
            <Film className="w-4 h-4" />
            <span>Explore Now Showing</span>
          </Link>
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isCancelled = booking.paymentStatus === 'Cancelled';

            return (
              <div
                key={booking._id}
                className={`relative bg-[#13141f] border rounded-3xl p-6 sm:p-8 shadow-xl transition-all overflow-hidden ${
                  isCancelled ? 'border-neutral-800 opacity-60' : 'border-white/10 hover:border-red-600/30'
                }`}
              >
                {/* Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black tracking-widest text-red-400">
                      {booking.bookingId}
                    </span>
                    <span className="text-[10px] text-neutral-500">&bull;</span>
                    <span className="text-[11px] text-neutral-400">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isCancelled
                        ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    }`}
                  >
                    {isCancelled ? 'Cancelled' : 'Confirmed (Demo)'}
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <img
                    src={booking.movie?.poster}
                    alt={booking.movie?.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-md border border-white/5 shrink-0"
                  />

                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-bold text-white">{booking.movie?.title}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        <span>{booking.showDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        <span>{booking.showtime}</span>
                      </div>
                      <div>
                        Screen: <span className="text-white font-semibold">Audi 1 (Dolby Atmos)</span>
                      </div>
                    </div>

                    <div className="pt-3">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                        Reserved Seats:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {booking.seats?.map((seat) => (
                          <span
                            key={seat}
                            className="px-2.5 py-0.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-black"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="sm:text-right sm:border-l sm:border-white/10 sm:pl-6 w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                        Total Paid
                      </span>
                      <span className="text-2xl font-black text-white">
                        ₹{booking.totalAmount}
                      </span>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="py-1.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-[11px] font-semibold text-red-400 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
