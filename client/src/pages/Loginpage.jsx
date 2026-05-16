import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import { Sun, Moon, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Loginpage = () => {
  const [view, setView] = useState('login'); // login, register, forgot-email, forgot-otp, forgot-reset
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/');
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = view === 'login' ? '/auth/login' : '/auth/register';
      const payload = view === 'login'
        ? { email: formData.email, password: formData.password }
        : { fullName: formData.fullName, email: formData.email, password: formData.password };
      const res = await api.post(path, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      toast.success(view === 'login' ? 'Successfully logged in!' : 'Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: formData.email });
      toast.success('OTP sent to your email!');
      setView('forgot-otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp: formData.otp });
      toast.success('OTP verified!');
      setView('forgot-reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: formData.email, otp: formData.otp, newPassword: formData.newPassword });
      toast.success('Password reset successfully! Please login.');
      setView('login');
      setFormData({ ...formData, password: '', otp: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    if (view === 'login') return { sub: 'Welcome back', title: 'Sign In', desc: 'Track your calories, reach your goals.' };
    if (view === 'register') return { sub: 'Join us today', title: 'Create Account', desc: 'Start your health journey with KcalCounter.' };
    if (view === 'forgot-email') return { sub: 'Recovery', title: 'Forgot Password', desc: 'Enter your email to receive a reset OTP.' };
    if (view === 'forgot-otp') return { sub: 'Verification', title: 'Enter OTP', desc: 'Check your email for the 6-digit code.' };
    if (view === 'forgot-reset') return { sub: 'New Password', title: 'Reset Password', desc: 'Enter your new secure password.' };
  };

  const header = renderHeader();

  return (
    <div className="w-full min-h-screen mesh-bg transition-colors duration-500 relative overflow-hidden flex items-center justify-center">
      {/* Animated blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 dark:bg-indigo-600/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-pink-500/15 dark:bg-pink-600/10 blur-[100px] pointer-events-none" />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-50">
        <div className="toggleWrapper">
          <input 
            className="input" 
            id="dn-login" 
            type="checkbox" 
            checked={isDark}
            onChange={toggleTheme}
          />
          <label className="toggle" htmlFor="dn-login">
            <span className="toggle__handler">
              <span className="crater crater--1"></span>
              <span className="crater crater--2"></span>
              <span className="crater crater--3"></span>
            </span>
            <span className="star star--1"></span>
            <span className="star star--2"></span>
            <span className="star star--3"></span>
            <span className="star star--4"></span>
            <span className="star star--5"></span>
            <span className="star star--6"></span>
          </label>
        </div>
      </div>

      {/* Brand top-left */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg glow-indigo">
          <span className="text-white font-black text-sm">K</span>
        </div>
        <span className="font-extrabold text-lg text-gray-900 dark:text-white">Kcal<span className="text-indigo-500">Counter</span></span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 glass rounded-3xl p-8 sm:p-10 glow-indigo z-10 transition-all duration-500">
        {view.startsWith('forgot') && (
          <button onClick={() => setView('login')} className="absolute top-6 left-6 text-gray-400 hover:text-indigo-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 pulse-dot"></span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {header.sub}
            </span>
          </div>
          <h1 className="text-3xl font-black gradient-text mb-2">
            {header.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {header.desc}
          </p>
        </div>

        {(view === 'login' || view === 'register') && (
          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            {view === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  placeholder="John Doe" required
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" required
                className="w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="••••••••" required
                className="w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm" />
            </div>
            {view === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setView('forgot-email')} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</button>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/40 hover:shadow-xl transform hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Processing...
                </span>
              ) : (view === 'login' ? 'Sign In →' : 'Create Account →')}
            </button>
          </form>
        )}

        {view === 'forgot-email' && (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" required
                className="w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        )}

        {view === 'forgot-otp' && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">6-Digit OTP</label>
              <input type="text" name="otp" value={formData.otp} onChange={handleChange}
                placeholder="123456" required maxLength="6"
                className="w-full px-4 py-3.5 rounded-2xl text-center tracking-[0.5em] text-2xl font-bold bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-gray-800 dark:text-white text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify Code'}
            </button>
            <div className="text-center mt-2">
              <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {view === 'forgot-reset' && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">New Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange}
                placeholder="••••••••" required minLength="6"
                className="w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Set New Password'}
            </button>
          </form>
        )}

        {(view === 'login' || view === 'register') && (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setView(view === 'login' ? 'register' : 'login')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              {view === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Loginpage;
