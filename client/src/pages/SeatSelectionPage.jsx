import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Clock,
  Calendar,
  Ticket,
  Armchair,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { fetchMovieById, fetchOccupiedSeats, createBookingApi } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

// Seat Layout Definition (56 seats total across 7 rows A-G, 8 seats per row)
// Aisle gap between seat 4 and 5
const SEAT_ROWS = [
  { row: 'A', tier: 'VIP Recliner', multiplier: 1.6 },
  { row: 'B', tier: 'VIP Recliner', multiplier: 1.6 },
  { row: 'C', tier: 'Gold', multiplier: 1.2 },
  { row: 'D', tier: 'Gold', multiplier: 1.2 },
  { row: 'E', tier: 'Gold', multiplier: 1.2 },
  { row: 'F', tier: 'Silver', multiplier: 1.0 },
  { row: 'G', tier: 'Silver', multiplier: 1.0 },
];
const SEATS_PER_ROW = 8;
const CONVENIENCE_FEE = 30; // ₹30 demo fee

const SeatSelectionPage = () => {
  const { id: movieId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useAuth();

  // Query parameters from MovieDetails page
  const showDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const showtime = searchParams.get('time') || '06:00 PM';

  const [movie, setMovie] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load movie details and real-time occupied seats
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setBookingError('');
      try {
        const [movieRes, occupiedRes] = await Promise.all([
          fetchMovieById(movieId),
          fetchOccupiedSeats(movieId, showDate, showtime),
        ]);

        if (movieRes.success && movieRes.movie) {
          setMovie(movieRes.movie);
        }
        if (occupiedRes.success && occupiedRes.occupiedSeats) {
          setOccupiedSeats(occupiedRes.occupiedSeats);
        }
      } catch (err) {
        console.error('Error loading seating data:', err);
        setBookingError('Unable to load seat availability from the server.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [movieId, showDate, showtime]);

  // Pricing helper
  const getSeatPrice = (rowLetter) => {
    const rowConfig = SEAT_ROWS.find((r) => r.row === rowLetter);
    const base = movie?.ticketPrice || 250;
    const mult = rowConfig ? rowConfig.multiplier : 1.0;
    return Math.round(base * mult);
  };

  const getSeatTier = (rowLetter) => {
    const rowConfig = SEAT_ROWS.find((r) => r.row === rowLetter);
    return rowConfig ? rowConfig.tier : 'Silver';
  };

  // Toggle seat selection
  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= 8) {
          alert('You can select a maximum of 8 seats per booking.');
          return prev;
        }
        return [...prev, seatId];
      }
    });
    if (bookingError) setBookingError('');
  };

  // Calculate Subtotal & Total
  const subtotal = selectedSeats.reduce((sum, seatId) => {
    const row = seatId.charAt(0);
    return sum + getSeatPrice(row);
  }, 0);

  const totalAmount = selectedSeats.length > 0 ? subtotal + CONVENIENCE_FEE : 0;

  // Handle Booking Submission
  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (selectedSeats.length === 0) {
      setBookingError('Please select at least one cinema seat.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const payload = {
        movieId,
        showDate,
        showtime,
        seats: selectedSeats,
      };

      const res = await createBookingApi(payload);
      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        // Refresh occupied seats list
        setOccupiedSeats((prev) => [...prev, ...selectedSeats]);
      } else {
        setBookingError(res.message || 'Failed to complete reservation.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Booking failed. One or more selected seats may have just been reserved.';
      setBookingError(msg);

      // If conflict, refresh occupied seats
      if (err.response?.status === 409) {
        try {
          const fresh = await fetchOccupiedSeats(movieId, showDate, showtime);
          if (fresh.success) setOccupiedSeats(fresh.occupiedSeats);
        } catch (_) {}
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-white animate-pulse">
        <Armchair className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">Loading Cinema Hall...</h2>
        <p className="text-xs text-neutral-400">Fetching live seat map and showtime data</p>
      </div>
    );
  }

  // --- VIEW 1: BOOKING CONFIRMATION & DIGITAL TICKET ---
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-white animate-fadeIn">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Booking Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">Your Tickets Are Ready!</h1>
          <p className="text-xs text-neutral-400 mt-2">
            A confirmation has been saved to your account. Demo ticket pass details below:
          </p>
        </div>

        {/* Cinema Ticket Stub Card */}
        <div
          id="printable-ticket"
          className="relative bg-gradient-to-b from-[#161726] to-[#0f1019] border-2 border-red-600/40 rounded-3xl overflow-hidden shadow-2xl mb-8 print:border-black print:text-black"
        >
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 sm:px-8 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <Film className="w-5 h-5" />
              <span className="font-black text-lg tracking-wider uppercase">IMovies Cinema</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-red-100 block">Booking ID</span>
              <span className="font-mono font-bold text-sm sm:text-base tracking-widest">
                {confirmedBooking.bookingId}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Movie Poster */}
              <img
                src={confirmedBooking.movie?.poster || movie?.poster}
                alt="Movie"
                className="w-24 h-36 object-cover rounded-xl shadow-lg border border-white/10 shrink-0"
              />

              {/* Movie & Show Info */}
              <div className="space-y-2 flex-1">
                <h2 className="text-2xl font-black text-white">
                  {confirmedBooking.movie?.title || movie?.title}
                </h2>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-300">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    Screen 1 &bull; Audi 1 (Dolby Atmos)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    {confirmedBooking.movie?.duration || movie?.duration} Mins
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      Date
                    </span>
                    <span className="font-semibold text-white">{confirmedBooking.showDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      Showtime
                    </span>
                    <span className="font-semibold text-white">{confirmedBooking.showtime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      Booked By
                    </span>
                    <span className="font-semibold text-white">{user?.name || 'Customer'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative border-t-2 border-dashed border-white/15 my-6 flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#0a0a0f] -ml-9 sm:-ml-11 border border-white/10"></div>
              <div className="w-6 h-6 rounded-full bg-[#0a0a0f] -mr-9 sm:-mr-11 border border-white/10"></div>
            </div>

            {/* Seats & Price Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase font-bold mb-1.5">
                  Reserved Seats ({confirmedBooking.seats?.length} Tickets)
                </span>
                <div className="flex flex-wrap gap-2">
                  {confirmedBooking.seats?.map((seat) => (
                    <span
                      key={seat}
                      className="px-3 py-1 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-black"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-neutral-400">
                  Payment Status:{' '}
                  <span className="text-emerald-400 font-bold">
                    Completed (Demo Checkout)
                  </span>
                </div>
              </div>

              {/* Decorative Demo QR & Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 bg-[#1a1b2b] p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-white">
                    ₹{confirmedBooking.totalAmount}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">incl. ₹30 demo fee</span>
                </div>

                {/* Decorative Simulated QR Code */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect width="100" height="100" fill="white" />
                      {/* Simulated QR Pattern */}
                      <rect x="10" y="10" width="25" height="25" fill="black" />
                      <rect x="15" y="15" width="15" height="15" fill="white" />
                      <rect x="18" y="18" width="9" height="9" fill="black" />
                      <rect x="65" y="10" width="25" height="25" fill="black" />
                      <rect x="70" y="15" width="15" height="15" fill="white" />
                      <rect x="73" y="18" width="9" height="9" fill="black" />
                      <rect x="10" y="65" width="25" height="25" fill="black" />
                      <rect x="15" y="70" width="15" height="15" fill="white" />
                      <rect x="18" y="73" width="9" height="9" fill="black" />
                      <rect x="42" y="15" width="12" height="12" fill="black" />
                      <rect x="42" y="35" width="16" height="8" fill="black" />
                      <rect x="42" y="55" width="10" height="20" fill="black" />
                      <rect x="65" y="45" width="20" height="15" fill="black" />
                      <rect x="65" y="70" width="15" height="15" fill="black" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-mono mt-1 block">
                    DEMO PASS
                  </span>
                </div>
              </div>
            </div>

            {/* College Disclaimer Notice */}
            <div className="pt-2 text-[10px] text-neutral-500 border-t border-white/5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                Demonstration Ticket for Capstone Evaluation. No financial transaction occurred.
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handlePrint}
            className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4 text-neutral-300" />
            <span>Print / Save Ticket</span>
          </button>

          <Link
            to="/my-bookings"
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            <Ticket className="w-4 h-4" />
            <span>View in My Bookings</span>
          </Link>

          <Link
            to="/"
            className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CINEMA SEAT SELECTION & CHECKOUT ---
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white animate-fadeIn">
      {/* Top Breadcrumb & Movie Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/movie/${movieId}`)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{movie?.title}</h1>
            <p className="text-xs text-neutral-400">
              {showDate} &bull; <span className="text-red-400 font-bold">{showtime}</span> &bull; Screen 1
            </p>
          </div>
        </div>

        {/* Category Pricing Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
            VIP: ₹{getSeatPrice('A')}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-semibold">
            Gold: ₹{getSeatPrice('C')}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-neutral-400/10 border border-neutral-400/30 text-neutral-300 font-semibold">
            Silver: ₹{getSeatPrice('F')}
          </span>
        </div>
      </div>

      {/* Main Seating & Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cinema Hall & Seat Grid Container */}
        <div className="lg:col-span-8 bg-[#12131e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Cinema Screen Indicator */}
          <div className="mb-10 text-center relative">
            {/* Ambient Screen Light Projection */}
            <div className="w-3/4 mx-auto h-12 bg-gradient-to-b from-red-600/20 via-red-600/5 to-transparent rounded-t-[100%] blur-sm pointer-events-none"></div>

            {/* Curved Screen Arc */}
            <div className="w-4/5 mx-auto h-3 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20 rounded-[50%] shadow-[0_0_20px_rgba(229,9,20,0.6)]"></div>
            <span className="inline-block text-[10px] font-black tracking-[0.25em] text-neutral-400 uppercase mt-3">
              SCREEN THIS WAY
            </span>
          </div>

          {/* Seat Layout by Tiers */}
          <div className="space-y-6 max-w-lg mx-auto">
            {SEAT_ROWS.map(({ row, tier }) => {
              const price = getSeatPrice(row);
              const isVIP = row === 'A' || row === 'B';
              const isGold = row === 'C' || row === 'D' || row === 'E';

              return (
                <div key={row} className="flex items-center justify-center gap-2 sm:gap-3">
                  {/* Row Letter Identifier */}
                  <span className="w-6 text-xs font-black text-neutral-400 text-center">
                    {row}
                  </span>

                  {/* Left Block of 4 Seats */}
                  <div className="flex gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4].map((col) => {
                      const seatId = `${row}${col}`;
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seatId)}
                          title={`${seatId} - ${tier} (₹${price})`}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                            isOccupied
                              ? 'bg-neutral-800/60 border border-neutral-700/40 text-neutral-600 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/50 scale-110 z-10'
                              : isVIP
                              ? 'bg-[#232130] border border-amber-500/30 text-amber-200 hover:border-amber-400 hover:scale-105'
                              : isGold
                              ? 'bg-[#1e1f2f] border border-yellow-500/20 text-yellow-100 hover:border-yellow-400 hover:scale-105'
                              : 'bg-[#181926] border border-white/10 text-neutral-300 hover:border-red-500/60 hover:scale-105'
                          }`}
                        >
                          <Armchair className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Center Aisle Gap */}
                  <div className="w-3 sm:w-6 text-[10px] text-neutral-600 text-center select-none">
                    &bull;
                  </div>

                  {/* Right Block of 4 Seats */}
                  <div className="flex gap-1.5 sm:gap-2">
                    {[5, 6, 7, 8].map((col) => {
                      const seatId = `${row}${col}`;
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seatId)}
                          title={`${seatId} - ${tier} (₹${price})`}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                            isOccupied
                              ? 'bg-neutral-800/60 border border-neutral-700/40 text-neutral-600 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/50 scale-110 z-10'
                              : isVIP
                              ? 'bg-[#232130] border border-amber-500/30 text-amber-200 hover:border-amber-400 hover:scale-105'
                              : isGold
                              ? 'bg-[#1e1f2f] border border-yellow-500/20 text-yellow-100 hover:border-yellow-400 hover:scale-105'
                              : 'bg-[#181926] border border-white/10 text-neutral-300 hover:border-red-500/60 hover:scale-105'
                          }`}
                        >
                          <Armchair className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Seat Status Legend */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-[#181926] border border-white/10"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-red-600 border border-red-500 shadow-sm shadow-red-600/50"></div>
              <span className="font-semibold text-white">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-neutral-800 border border-neutral-700 opacity-60"></div>
              <span className="text-neutral-500">Booked</span>
            </div>
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>VIP Recliner</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span>Gold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400"></span>
              <span>Silver</span>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Reservation Card */}
        <div className="lg:col-span-4 bg-[#13141f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
              Booking Summary
            </span>
            <h2 className="text-xl font-black text-white">Order Details</h2>
          </div>

          {/* Error Message */}
          {bookingError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Selected Movie Snapshot */}
          <div className="flex gap-3 items-center p-3 rounded-2xl bg-[#181926] border border-white/5">
            <img
              src={movie?.poster}
              alt="Poster"
              className="w-14 h-20 object-cover rounded-xl shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{movie?.title}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{movie?.language || 'English'}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-300">
                <Calendar className="w-3 h-3 text-red-500" />
                <span>{showDate}</span>
                <Clock className="w-3 h-3 text-red-500 ml-1" />
                <span>{showtime}</span>
              </div>
            </div>
          </div>

          {/* Selected Seats Chips */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-300">Selected Seats:</span>
              <span className="text-neutral-400 font-bold">
                {selectedSeats.length} / 8 max
              </span>
            </div>

            {selectedSeats.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {selectedSeats.map((seat) => {
                  const row = seat.charAt(0);
                  const price = getSeatPrice(row);
                  const tier = getSeatTier(row);

                  return (
                    <span
                      key={seat}
                      className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-600/40 text-xs font-bold flex items-center gap-1"
                    >
                      <span>{seat}</span>
                      <span className="text-[10px] text-neutral-300 font-normal">
                        ({tier} - ₹{price})
                      </span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic p-3 rounded-xl bg-white/5 text-center">
                Click on any available seat in the layout to select
              </p>
            )}
          </div>

          {/* Transparent Price Calculation */}
          <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Tickets Subtotal</span>
              <span className="text-white font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span className="flex items-center gap-1">
                <span>Demo Convenience Fee</span>
                <Info className="w-3 h-3 text-neutral-500" />
              </span>
              <span className="text-white font-semibold">
                {selectedSeats.length > 0 ? `₹${CONVENIENCE_FEE}` : '₹0'}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
              <span>Total Payable</span>
              <span className="text-lg text-red-500">₹{totalAmount}</span>
            </div>
          </div>

          {/* Demo Simulated Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Simulated Demo Booking:</strong> No real payment or card details required.
              Your reservation is instantly confirmed upon clicking below.
            </span>
          </div>

          {/* Action Button */}
          {isAuthenticated ? (
            <button
              type="button"
              disabled={selectedSeats.length === 0 || isSubmitting}
              onClick={handleConfirmBooking}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Confirming Reservation...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>Confirm Demo Booking (₹{totalAmount})</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={openLoginModal}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <span>Sign In to Complete Booking</span>
              </button>
              <p className="text-[10px] text-neutral-400 text-center">
                Use 1-Click Demo Login in the popup to proceed immediately
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SeatSelectionPage;
