import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, History, User, Sun, Moon, LogOut } from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
  { label: 'Log Food', path: '/log', icon: <Plus size={18} /> },
  { label: 'History', path: '/history', icon: <History size={18} /> },
  { label: 'Profile', path: '/profile', icon: <User size={18} /> },
];

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/40 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-shadow">
              <span className="text-white font-black text-sm">K</span>
            </div>
            <span className="font-extrabold text-lg text-gray-900 dark:text-white">Kcal<span className="gradient-text">Counter</span></span>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-white/5 rounded-2xl p-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <button key={link.path} onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                  }`}>
                  <span className="text-xs">{link.icon}</span>
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-yellow-400 transition-all">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {initial}
                </div>
              )}
              <button onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold transition-all">
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/5 z-50 px-4 pb-safe">
        <div className="flex justify-around py-2">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <button key={link.path} onClick={() => navigate(link.path)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                <span className="text-lg">{link.icon}</span>
                <span className="text-[10px] font-semibold">{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
