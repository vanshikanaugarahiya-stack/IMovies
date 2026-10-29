import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  Search,
  User,
  Shield,
  Ticket,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ searchTerm = '', onSearchChange }) => {
  const { user, isAuthenticated, isAdmin, openLoginModal, openRegisterModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync internal search with external prop
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    }
    if (location.pathname !== '/' && location.pathname !== '/movies') {
      navigate(`/?search=${encodeURIComponent(localSearch)}`);
    }
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-neutral-100 to-red-400 bg-clip-text text-transparent">
                  IMovies
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-500 border border-red-500/30 uppercase tracking-widest">
                  CINEMA
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium tracking-wide">
                Ticket Booking System
              </p>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search movies by title, genre, director..."
              value={localSearch}
              onChange={handleSearchInputChange}
              className="w-full bg-[#141520] border border-white/10 rounded-full pl-10 pr-10 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/80 focus:bg-[#181926] transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Desktop Navigation Links & User Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/' ? 'text-red-500' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <a
              href="#movies-grid"
              onClick={(e) => {
                if (location.pathname !== '/') {
                  navigate('/#movies-grid');
                }
              }}
              className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Explore Movies
            </a>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-[#141520] border border-white/10 hover:border-white/20 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600/30 to-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-white leading-tight">{user?.name}</p>
                    <span className="text-[10px] text-neutral-400 capitalize">
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#13141f] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="font-bold text-white truncate">{user?.name}</p>
                      <p className="text-neutral-400 truncate text-[11px]">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          <Shield className="w-2.5 h-2.5" /> Admin Privileges
                        </span>
                      )}
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-red-500" />
                      <span>My Bookings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-amber-300 hover:text-amber-200 hover:bg-white/5 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-left border-t border-white/5 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/30 transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-3 animate-fadeIn">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies..."
                value={localSearch}
                onChange={handleSearchInputChange}
                className="w-full bg-[#141520] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </form>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/5"
            >
              Home
            </Link>
            <a
              href="#movies-grid"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/5"
            >
              Explore Movies
            </a>

            {isAuthenticated ? (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="px-3 py-1 text-xs text-neutral-400">
                  Signed in as <span className="text-white font-bold">{user?.name}</span>
                </div>
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5"
                >
                  <Ticket className="w-4 h-4 text-red-500" />
                  <span>My Bookings</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:bg-white/5"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border border-white/10 text-white hover:bg-white/5 text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegisterModal();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md text-center"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
