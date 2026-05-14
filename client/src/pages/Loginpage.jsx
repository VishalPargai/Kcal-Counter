import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import { Sun, Moon, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Loginpage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/');
  }, [navigate]);

  const toggleMode = () => { setIsLogin(!isLogin); setError(''); };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { fullName: formData.fullName, email: formData.email, password: formData.password };
      const res = await api.post(path, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      toast.success(isLogin ? 'Successfully logged in!' : 'Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen mesh-bg transition-colors duration-500 relative overflow-hidden flex items-center justify-center">
      {/* Animated blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 dark:bg-indigo-600/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-pink-500/15 dark:bg-pink-600/10 blur-[100px] pointer-events-none" />

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-2xl glass glow-indigo hover:scale-110 transition-all duration-300 text-indigo-600 dark:text-yellow-400">
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Brand top-left */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg glow-indigo">
          <span className="text-white font-black text-sm">K</span>
        </div>
        <span className="font-extrabold text-lg text-gray-900 dark:text-white">Kcal<span className="text-indigo-500">Counter</span></span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 glass rounded-3xl p-8 sm:p-10 glow-indigo z-10 transition-all duration-500">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 pulse-dot"></span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {isLogin ? 'Welcome back' : 'Join us today'}
            </span>
          </div>
          <h1 className="text-3xl font-black gradient-text mb-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? 'Track your calories, reach your goals.' : 'Start your health journey with KcalCounter.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                placeholder="John Doe" required={!isLogin}
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
          {isLogin && (
            <div className="flex justify-end">
              <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</a>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/40 hover:shadow-xl transform hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </span>
            ) : (isLogin ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={toggleMode} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Loginpage;
