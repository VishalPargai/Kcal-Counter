import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Flame, Target, Sparkles, Utensils, Plus, X, Dumbbell, Wheat, Droplet, Lightbulb, BarChart3, Settings, LogOut, UtensilsCrossed, Trophy, Zap } from 'lucide-react';

const StatCard = ({ icon, label, value, unit, gradient, sub }) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 ${gradient} shadow-xl group hover:scale-[1.02] transition-transform duration-300`}>
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
    <div className="relative z-10">
      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
      <p className="text-4xl font-black text-white mb-0.5">
        {value}<span className="text-xl font-semibold ml-1 text-white/60">{unit}</span>
      </p>
      {sub && <p className="text-xs text-white/50 mt-1">{sub}</p>}
    </div>
    <div className="absolute bottom-4 right-5 text-4xl opacity-30 group-hover:opacity-50 transition-opacity">{icon}</div>
  </div>
);

const MealRow = ({ meal, onDelete }) => (
  <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group cursor-pointer active:scale-[0.98]">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-xl shadow-sm text-indigo-500">
        {meal.icon || <Utensils size={20} />}
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-white text-sm">{meal.name} {meal.quantity ? <span className="text-xs text-gray-500 font-normal">x{meal.quantity}</span> : null}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{meal.mealType} · {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{meal.calories} kcal</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</p>
      </div>
      <button onClick={() => onDelete(meal._id)}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all text-xs font-bold">
        <X size={14} />
      </button>
    </div>
  </div>
);

const Homepage = ({ onFoodMedia }) => {
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState('');
  const navigate = useNavigate();

  const TIPS = [
    "Drink a glass of water before each meal to naturally reduce your calorie intake by up to 13%.",
    "Eating more protein can boost your metabolism by up to 80-100 calories per day.",
    "Don't drink calories! Sugary sodas and fruit juices are the most fattening things you can put in your body.",
    "Try eating slowly and chewing your food well to increase fullness hormones.",
    "Lack of sleep is strongly linked to weight gain. Aim for 7-8 hours of quality sleep per night."
  ];

  useEffect(() => {
    setDailyTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const profileRes = await api.get('/user/profile');
      
      setUser(profileRes.data);
      localStorage.setItem('user', JSON.stringify(profileRes.data));
      
      if (profileRes.data.role === 'admin') {
        navigate('/admin');
        return;
      }
      
      const mealsRes = await api.get('/meals');
      setUser(profileRes.data);
      localStorage.setItem('user', JSON.stringify(profileRes.data));
      setMeals(Array.isArray(mealsRes.data) ? mealsRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    fetchData();
  }, [navigate, fetchData]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/meals/${id}`);
      setMeals(prev => prev.filter(m => m._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your data...</p>
      </div>
    </div>
  );

  const goal = user?.dailyGoal || 2000;
  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const remaining = Math.max(goal - totalCalories, 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat || 0), 0);
  const progressPct = Math.min((totalCalories / goal) * 100, 100);
  const overGoal = totalCalories > goal;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen mesh-bg transition-colors duration-300">
      <Navbar onFoodMedia={onFoodMedia} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              {greeting}, <span className="gradient-text">{user?.fullName?.split(' ')[0] || 'there'}</span> 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">Here's your nutrition overview for today.</p>
          </div>
          <button onClick={() => navigate('/log')}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
            <Plus size={18} /> Log Food
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Flame />} label="Calories Eaten" value={totalCalories} unit="kcal" gradient="bg-gradient-to-br from-orange-500 to-red-600" sub={`${((totalCalories / goal) * 100).toFixed(0)}% of goal`} />
          <StatCard icon={<Target />} label="Daily Goal" value={goal} unit="kcal" gradient="bg-gradient-to-br from-indigo-600 to-purple-700" sub={`Set in profile`} />
          <StatCard icon={<Sparkles />} label="Remaining" value={remaining} unit="kcal" gradient={overGoal ? 'bg-gradient-to-br from-red-500 to-rose-700' : 'bg-gradient-to-br from-emerald-500 to-teal-700'} sub={overGoal ? '⚠️ Over your goal!' : 'Keep it up!'} />
          <StatCard icon={<Flame />} label="Day Streak" value={user?.streak || 0} unit="days" gradient="bg-gradient-to-br from-amber-500 to-orange-600" sub={user?.streak >= 7 ? '🏆 On fire!' : user?.streak > 0 ? `Best: ${user?.longestStreak || 0}d` : 'Log today!'} />
        </div>

        {/* Streak Banner */}
        {(user?.streak || 0) > 0 && (
          <div className={`relative overflow-hidden rounded-3xl p-5 mb-6 ${
            (user?.streak || 0) >= 7
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
              : 'bg-gradient-to-r from-orange-400 to-amber-500'
          } shadow-xl`}>
            {/* Animated shimmer */}
            <div className="absolute inset-0 shimmer opacity-40" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`text-5xl ${ (user?.streak || 0) >= 7 ? 'animate-bounce' : ''}`}>
                  {(user?.streak || 0) >= 30 ? '🏆' : (user?.streak || 0) >= 14 ? '💎' : (user?.streak || 0) >= 7 ? '🔥' : '⚡'}
                </div>
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-0.5">Current Streak</p>
                  <p className="text-white font-black text-2xl">{user?.streak} {user?.streak === 1 ? 'day' : 'days'}</p>
                  <p className="text-white/70 text-xs mt-0.5">
                    {(user?.streak || 0) >= 30 ? '🏆 Legendary! You are unstoppable!' :
                     (user?.streak || 0) >= 14 ? '💎 Two weeks strong! Incredible discipline!' :
                     (user?.streak || 0) >= 7 ? '🔥 One whole week! You are on fire!' :
                     (user?.streak || 0) >= 3 ? '⚡ Great momentum! Keep going!' :
                     'Good start! Log again tomorrow to grow your streak.'}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Longest Streak</p>
                <p className="text-white font-black text-2xl">{user?.longestStreak || 0}d</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left column - Progress + Meals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calorie Ring + Progress */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800 dark:text-white text-lg">Daily Progress</h2>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${overGoal ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                  {overGoal ? '⚠️ Over limit' : '✅ On track'}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-5 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${overGoal ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`}
                    style={{ width: `${progressPct}%` }}>
                    <div className="absolute inset-0 shimmer" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                  <span>0 kcal</span>
                  <span className="font-bold text-gray-600 dark:text-gray-300">{totalCalories} / {goal} kcal ({progressPct.toFixed(0)}%)</span>
                  <span>{goal} kcal</span>
                </div>
              </div>
              {/* Macro summary pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { label: 'Protein', val: `${totalProtein.toFixed(0)}g`, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                  { label: 'Carbs', val: `${totalCarbs.toFixed(0)}g`, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
                  { label: 'Fat', val: `${totalFat.toFixed(0)}g`, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
                ].map(m => (
                  <div key={m.label} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${m.color}`}>{m.label}: {m.val}</div>
                ))}
              </div>
            </div>

            {/* Meals List */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 dark:text-white text-lg">Today's Meals</h2>
                <button onClick={() => navigate('/log')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                  <Plus size={14} /> Add Food
                </button>
              </div>
              {meals.length > 0 ? (
                <div className="space-y-1">
                  {meals.map(m => <MealRow key={m._id} meal={m} onDelete={handleDelete} />)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-3 float text-gray-400"><UtensilsCrossed size={48} /></div>
                  <p className="font-bold text-gray-700 dark:text-gray-300">No meals logged yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start tracking to see your progress</p>
                  <button onClick={() => navigate('/log')}
                    className="mt-4 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                    Log your first meal →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Macro Bars */}
            <div className="glass rounded-3xl p-6">
              <h2 className="font-bold text-gray-800 dark:text-white mb-5">Macros</h2>
              {[
                { label: 'Protein', val: totalProtein, max: user?.proteinGoal || 150, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: <Dumbbell size={16} /> },
                { label: 'Carbs', val: totalCarbs, max: user?.carbsGoal || 250, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/10', icon: <Wheat size={16} /> },
                { label: 'Fat', val: totalFat, max: user?.fatGoal || 70, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-900/10', icon: <Droplet size={16} /> },
              ].map(m => {
                const pct = Math.min((m.val / m.max) * 100, 100);
                return (
                  <div key={m.label} className={`${m.bg} rounded-2xl p-4 mb-3 last:mb-0`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">{m.icon} {m.label}</span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{m.val.toFixed(0)}g / {m.max.toFixed(0)}g</span>
                    </div>
                    <div className="w-full bg-white/60 dark:bg-black/20 rounded-full h-2.5">
                      <div className={`bg-gradient-to-r ${m.color} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick tips */}
            <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
              <p className="flex items-center gap-1.5 text-xs font-bold text-white/60 uppercase tracking-widest mb-2 relative z-10"><Lightbulb size={14} /> Daily Tip</p>
              <p className="text-sm font-medium text-white/90 leading-relaxed relative z-10">
                {dailyTip}
              </p>
            </div>

            {/* Quick Links */}
            <div className="glass rounded-3xl p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Log Food', path: '/log', icon: <Plus size={20} />, color: 'from-indigo-500 to-purple-600' },
                { label: 'History', path: '/history', icon: <BarChart3 size={20} />, color: 'from-emerald-500 to-teal-600' },
                { label: 'Profile', path: '/profile', icon: <Settings size={20} />, color: 'from-violet-500 to-fuchsia-600' },
                { label: 'Logout', path: null, icon: <LogOut size={20} />, color: 'from-red-500 to-rose-600', onClick: () => { localStorage.clear(); navigate('/login'); } },
              ].map(item => (
                <button key={item.label}
                  onClick={item.onClick || (() => navigate(item.path))}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200`}>
                  {item.icon}
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
