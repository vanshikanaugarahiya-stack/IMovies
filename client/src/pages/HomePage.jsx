import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Clapperboard, Sparkles, Filter, Search, RotateCcw, Volume2, Armchair, ShieldCheck } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import { fetchMovies, fetchFeaturedMovies } from '../api/apiClient';

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Drama',
  'Adventure',
  'Thriller',
  'Crime',
  'Fantasy',
  'Cyberpunk',
];

const HomePage = ({ globalSearch = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState(globalSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync with globalSearch prop or query param from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchTerm(urlSearch);
    } else if (globalSearch) {
      setSearchTerm(globalSearch);
    }
  }, [searchParams, globalSearch]);

  // Load featured movies for hero banner
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await fetchFeaturedMovies();
        if (data.success && data.movies) {
          setFeaturedMovies(data.movies);
        }
      } catch (err) {
        console.warn('Could not load featured movies:', err.message);
      }
    };
    loadFeatured();
  }, []);

  // Fetch movies based on genre and search filter
  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = {};
        if (selectedGenre && selectedGenre !== 'All') {
          params.genre = selectedGenre;
        }
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        const data = await fetchMovies(params);
        if (data.success) {
          setMovies(data.movies);
        } else {
          setError(data.message || 'Failed to load movie catalogue');
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Unable to connect to the backend server. Please verify the server is running on port 5000.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [selectedGenre, searchTerm]);

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Featured Movie Hero Banner */}
      <HeroBanner movies={featuredMovies.length > 0 ? featuredMovies : movies} />

      {/* Movies Catalog Section */}
      <section id="movies-grid" className="scroll-mt-24 mb-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Clapperboard className="w-4 h-4" />
              <span>Cinema Schedule & Bookings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Now Showing in Theatres
            </h2>
          </div>

          {/* Active Filter Summary or Reset Button */}
          {(selectedGenre !== 'All' || searchTerm) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white border border-white/10 transition-colors w-fit"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold uppercase tracking-wider pr-2 border-r border-white/10 shrink-0">
            <Filter className="w-3.5 h-3.5 text-red-500" />
            <span>Genre</span>
          </div>

          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedGenre === genre
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#141520] text-neutral-400 hover:text-white hover:bg-[#1c1d2e] border border-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/40 text-center mb-10">
            <p className="text-sm font-semibold text-red-300 mb-2">{error}</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
            >
              Retry Loading Movies
            </button>
          </div>
        )}

        {/* Loading Skeleton Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-[#13141f] rounded-2xl overflow-hidden border border-white/5 p-4 animate-pulse flex flex-col"
              >
                <div className="aspect-[2/3] bg-neutral-800 rounded-xl mb-4"></div>
                <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-800 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-neutral-800 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && movies.length === 0 && (
          <div className="p-12 text-center bg-[#13141f] rounded-3xl border border-white/10 my-8">
            <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
              <Film className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Movies Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
              We couldn't find any movies matching "{searchTerm}" in the "{selectedGenre}" genre.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
            >
              Clear Filters & Show All
            </button>
          </div>
        )}

        {/* Loaded Movies Grid */}
        {!isLoading && !error && movies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Cinema Experience Highlights Banner */}
      <section className="bg-gradient-to-r from-[#141522] via-[#181928] to-[#141522] border border-white/10 rounded-3xl p-8 sm:p-12 my-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Premier Cinema Experience</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Why Book with <span className="text-red-500">IMovies</span>?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
            State-of-the-art cinema screening technology built for true movie aficionados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#0f1019]/80 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mb-3">
              <Volume2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Dolby Atmos 7.1</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Immersive, three-dimensional spatial audio for a truly gripping auditory experience.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f1019]/80 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mb-3">
              <Armchair className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Luxury Recliner Seating</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ergonomic plush VIP recliners with personal armrests and ample legroom.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f1019]/80 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Instant Demo Confirmation</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Reserve tickets seamlessly with instant unique Booking IDs and digital cinema passes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
