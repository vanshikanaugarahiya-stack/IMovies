import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const HeroBanner = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 7 seconds
  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) {
    return (
      <div className="w-full h-[400px] sm:h-[480px] bg-neutral-900 rounded-3xl animate-pulse flex items-center justify-center text-neutral-600">
        Loading featured cinema...
      </div>
    );
  }

  const currentMovie = movies[currentIndex] || movies[0];
  const bannerImg = currentMovie.banner || currentMovie.poster;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-12">
      {/* Background Banner Image */}
      <div className="absolute inset-0 bg-neutral-950">
        <img
          key={currentMovie._id}
          src={bannerImg}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
      </div>

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent max-w-3xl"></div>

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-3xl z-10">
        {/* Spotlight Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold tracking-wider uppercase mb-3 backdrop-blur-md w-fit">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Now Showing in Cinema
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-4 drop-shadow-md">
          {currentMovie.title}
        </h1>

        {/* Meta Info: Rating, Runtime, Genres */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-4 text-neutral-300">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{currentMovie.rating ? Number(currentMovie.rating).toFixed(1) : '8.8'} / 10</span>
          </div>

          {currentMovie.duration && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{currentMovie.duration} mins</span>
            </div>
          )}

          {currentMovie.genre &&
            currentMovie.genre.map((g, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-neutral-300"
              >
                {g}
              </span>
            ))}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-300 line-clamp-3 max-w-2xl mb-6 leading-relaxed drop-shadow">
          {currentMovie.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/movie/${currentMovie._id}`}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/40 flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <Ticket className="w-4 h-4" />
            <span>Book Tickets</span>
          </Link>

          <Link
            to={`/movie/${currentMovie._id}`}
            className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm border border-white/10 flex items-center gap-2 transition-colors"
          >
            <Info className="w-4 h-4 text-neutral-300" />
            <span>Movie Details</span>
          </Link>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 border border-white/10 flex items-center justify-center text-white transition-colors backdrop-blur-md"
            aria-label="Previous movie"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 border border-white/10 flex items-center justify-center text-white transition-colors backdrop-blur-md"
            aria-label="Next movie"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Dots Indicator */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-1.5">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-red-500' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
