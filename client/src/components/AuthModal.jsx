import React, { useState } from 'react';
import { X, Film, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (authModalMode === 'login') {
      const res = await login(formData.email, formData.password);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        setIsSubmitting(false);
        return;
      }
      const res = await register(formData.name, formData.email, formData.password);
      if (!res.success) {
        setError(res.message);
      }
    }

    setIsSubmitting(false);
  };

  // Quick 1-click fill demo test accounts
  const fillDemoAccount = (role) => {
    setAuthModalMode('login');
    setError('');
    if (role === 'admin') {
      setFormData({
        name: '',
        email: 'admin@imovies.com',
        password: 'AdminPassword123!',
      });
    } else {
      setFormData({
        name: '',
        email: 'user@imovies.com',
        password: 'UserPassword123!',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#12131c] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cinema glow accent */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wide">
              {authModalMode === 'login' ? 'Sign in to IMovies' : 'Create an Account'}
            </h3>
            <p className="text-xs text-neutral-400">
              {authModalMode === 'login'
                ? 'Access your tickets, reservations, and profile'
                : 'Join IMovies to book cinema tickets online'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex rounded-xl bg-[#1b1c29] p-1 mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === 'login'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === 'register'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#181926] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-[#181926] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full bg-[#181926] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.99] text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : authModalMode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* 1-Click Demo Fill for Quick Viva/Testing */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Test Login:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('user')}
              className="py-1.5 px-3 rounded-lg bg-[#1a1b29] hover:bg-[#232437] border border-white/5 text-[11px] font-semibold text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3 h-3 text-red-400" />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1.5 px-3 rounded-lg bg-[#1a1b29] hover:bg-[#232437] border border-white/5 text-[11px] font-semibold text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
