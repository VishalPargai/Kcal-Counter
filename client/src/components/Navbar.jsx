import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, History, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const safeParseUser = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem('user'));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };
  const user = safeParseUser();
  const initial = user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = user.role === 'admin' ? [
    { label: 'Admin', path: '/admin', icon: <Shield size={18} /> },
    { label: 'Profile', path: '/profile', icon: <User size={18} /> },
  ] : [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Log Food', path: '/log', icon: <Plus size={18} /> },
    { label: 'History', path: '/history', icon: <History size={18} /> },
    { label: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  return (
    <nav className="relative w-full border-b border-gray-200/40 dark:border-white/5 bg-white/80 dark:bg-black/60 backdrop-blur-2xl z-[999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── DESKTOP VIEW ── */}
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-shadow">
              <span className="text-white font-black text-sm">K</span>
            </div>
            <span className="font-extrabold text-lg text-gray-900 dark:text-white">Kcal<span className="gradient-text">Counter</span></span>
          </div>

          {/* Center links (Dashboard, Log Food, History, Profile) */}
          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-white/5 rounded-2xl p-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <button key={link.path} onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                  }`}>
                  {link.icon} {link.label}
                </button>
              );
            })}
          </div>

          {/* Right: toggle + Logout Button */}
          <div className="flex items-center gap-4">
            <div className="toggleWrapper">
              <input className="input" id="dn" type="checkbox" checked={isDark} onChange={toggleTheme} />
              <label className="toggle" htmlFor="dn">
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
            
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-bold transition-all">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* ── MOBILE VIEW ── */}
        <div className="md:hidden flex items-center justify-between h-14 w-full px-1">
          {navLinks.map(link => {
            if (link.label === 'Profile') {
              return (
                <div key="mobile-profile" className="flex-shrink-0 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(prev => !prev)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg focus:outline-none"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                        {initial}
                      </div>
                    )}
                    <span className={`text-[10px] font-bold ${dropdownOpen || location.pathname === '/profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Profile</span>
                  </button>
                  
                  {/* Mobile Profile Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden z-[999]">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.fullName || 'User'}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User size={15} /> View Profile
                      </button>
                      <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === link.path;
            const displayLabel = link.label === 'Log Food' ? 'Food Log' : link.label;
            return (
              <button key={link.path} onClick={() => navigate(link.path)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                <span className="scale-75">{link.icon}</span>
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
