import React from 'react';
import { Film, Heart, Shield, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#07070b] border-t border-white/10 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-xl font-black uppercase tracking-wider text-white">
                IMovies
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Experience the magic of cinema with instant online seat reservations, real-time availability, and premier cinema screening schedules.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-[#13141f] border border-white/5 text-[11px] text-neutral-300">
                MongoDB Atlas
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#13141f] border border-white/5 text-[11px] text-neutral-300">
                Express.js
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#13141f] border border-white/5 text-[11px] text-neutral-300">
                React + Vite
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#13141f] border border-white/5 text-[11px] text-neutral-300">
                Node.js
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#13141f] border border-white/5 text-[11px] text-neutral-300">
                Tailwind CSS
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#movies-grid" className="hover:text-red-400 transition-colors">
                  Now Showing
                </a>
              </li>
              <li>
                <a href="#movies-grid" className="hover:text-red-400 transition-colors">
                  Top Rated Blockbusters
                </a>
              </li>
              <li>
                <a href="#movies-grid" className="hover:text-red-400 transition-colors">
                  Featured Cinema
                </a>
              </li>
              <li>
                <span className="text-neutral-500">Dolby Atmos & IMAX</span>
              </li>
            </ul>
          </div>

          {/* Capstone Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Project Info
            </h4>
            <p className="text-xs text-neutral-400 mb-2">
              Full-Stack MERN Movie Ticket Booking System developed for college capstone project evaluation.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-[11px] text-red-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Functional MERN Capstone</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>&copy; {new Date().getFullYear()} IMovies Cinema. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern MERN Architecture
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
