import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Calendar } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

const MovieCard = ({ movie }) => {
  const [imgSrc, setImgSrc] = useState(movie.poster || FALLBACK_POSTER);

  const handleImageError = () => {
    setImgSrc(FALLBACK_POSTER);
  };

  return (
    <div className="group relative bg-[#13141f] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/40 shadow-lg hover:shadow-2xl hover:shadow-red-600/10 transition-all duration-300 flex flex-col">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
        <img
          src={imgSrc}
          alt={movie.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13141f] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating ? Number(movie.rating).toFixed(1) : '8.0'}</span>
        </div>

        {/* Duration Badge */}
        {movie.duration && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-semibold text-neutral-300 border border-white/10">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>{movie.duration}m</span>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <Link
            to={`/movie/${movie._id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <Ticket className="w-4 h-4" />
            <span>Book Tickets</span>
          </Link>
        </div>
      </div>

      {/* Movie Details Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {movie.genre &&
              movie.genre.slice(0, 2).map((g, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-neutral-400 border border-white/5"
                >
                  {g}
                </span>
              ))}
          </div>

          {/* Title */}
          <Link to={`/movie/${movie._id}`}>
            <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          {/* Description preview */}
          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {movie.description}
          </p>
        </div>

        {/* Bottom Bar: Price & Action */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider">
              From
            </span>
            <span className="text-sm font-extrabold text-white">
              ₹{movie.ticketPrice || 250}
            </span>
          </div>

          <Link
            to={`/movie/${movie._id}`}
            className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            Showtimes &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
