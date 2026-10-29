import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Ticket,
  Play,
  Share2,
  Users,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { fetchMovieById } from '../api/apiClient';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

// Generate next 4 calendar days for cinema show schedule
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}`;

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    dates.push({
      iso: isoString,
      dayName,
      formatted,
    });
  }
  return dates;
};

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Showtime selection state
  const availableDates = generateAvailableDates();
  const [selectedDate, setSelectedDate] = useState(availableDates[0].iso);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const loadMovie = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchMovieById(id);
        if (data.success && data.movie) {
          setMovie(data.movie);
          // Set initial showtime
          if (data.movie.showtimes && data.movie.showtimes.length > 0) {
            setSelectedTime(data.movie.showtimes[0]);
          }
        } else {
          setError(data.message || 'Movie not found');
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load movie details. Please check the backend connection.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const handleProceedToSeats = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and showtime');
      return;
    }
    navigate(`/book/${id}?date=${selectedDate}&time=${encodeURIComponent(selectedTime)}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse text-white">
        <div className="h-8 bg-neutral-800 rounded w-48 mb-8"></div>
        <div className="h-[450px] bg-neutral-900 rounded-3xl mb-8"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Movie Unavailable</h2>
        <p className="text-xs text-neutral-400 mb-6">{error || 'The requested movie could not be found.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Movie Guide</span>
        </Link>
      </div>
    );
  }

  const backdropImg = movie.banner || movie.poster || FALLBACK_POSTER;

  return (
    <div className="min-h-screen text-white animate-fadeIn pb-16">
      {/* Cinematic Hero Backdrop Banner */}
      <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[500px] overflow-hidden bg-black">
        <img
          src={backdropImg}
          alt={movie.title}
          className="w-full h-full object-cover object-center opacity-40 blur-[1px] transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-transparent to-[#0b0c10]"></div>

        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span>Back to Movies</span>
          </Link>
        </div>
      </div>

      {/* Main Movie Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Poster Card */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-[#13141f] rounded-2xl p-3 border border-white/10 shadow-2xl overflow-hidden">
              <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 relative shadow-inner">
                <img
                  src={movie.poster || FALLBACK_POSTER}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{movie.rating ? Number(movie.rating).toFixed(1) : '8.8'}</span>
                </div>
              </div>

              {/* Price Tag Info */}
              <div className="mt-4 p-3 rounded-xl bg-[#181926] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Base Ticket Price
                  </span>
                  <span className="text-lg font-extrabold text-white">
                    ₹{movie.ticketPrice || 250}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 font-semibold uppercase">
                  Available Today
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Movie Details, Synopsis & Showtimes */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Header info */}
            <div>
              {/* Genre Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {movie.genre &&
                  movie.genre.map((g, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600/10 text-red-400 border border-red-600/30"
                    >
                      {g}
                    </span>
                  ))}
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-neutral-300 border border-white/5">
                  {movie.language || 'English'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
                {movie.title}
              </h1>

              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>{movie.duration} Minutes</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-600"></div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>
                    Released: {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2026'}
                  </span>
                </div>
                {movie.director && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-neutral-600"></div>
                    <div>
                      Director: <span className="text-white font-semibold">{movie.director}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Synopsis Card */}
            <div className="p-6 rounded-2xl bg-[#13141f] border border-white/10 space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                Synopsis
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Cast list */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#13141f] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-neutral-400">
                  <Users className="w-4 h-4 text-red-500" />
                  <span>Starring Cast</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#181926] border border-white/5 text-xs text-neutral-200 font-medium"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Showtime Selection Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#151624] to-[#12131d] border border-red-600/30 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-red-500 block mb-1">
                  Step 1 of 2
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Select Screening Date & Showtime
                </h3>
              </div>

              {/* 1. Date Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                  Choose Date:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.iso;
                    return (
                      <button
                        key={item.iso}
                        type="button"
                        onClick={() => setSelectedDate(item.iso)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
                            : 'bg-[#181926] border-white/5 text-neutral-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="block text-[11px] font-bold uppercase tracking-wider">
                          {item.dayName}
                        </span>
                        <span className="block text-xs font-extrabold mt-0.5">
                          {item.formatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Showtime Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                  Choose Showtime:
                </label>
                <div className="flex flex-wrap gap-3">
                  {movie.showtimes && movie.showtimes.length > 0 ? (
                    movie.showtimes.map((time, idx) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-5 rounded-2xl border font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
                              : 'bg-[#181926] border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-red-500'}`} />
                          <span>{time}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-neutral-400">No showtimes currently scheduled.</p>
                  )}
                </div>
              </div>

              {/* Action Button: Proceed to Seats */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-neutral-400">
                  Screening in <span className="text-white font-bold">Screen 1 &bull; Dolby Atmos</span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToSeats}
                  disabled={!selectedTime}
                  className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Select Seats & Continue &rarr;</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
