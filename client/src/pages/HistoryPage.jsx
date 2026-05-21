import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Loader2, ChevronUp, ChevronDown, Utensils } from 'lucide-react';

const HistoryPage = ({ onFoodMedia }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(2000);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    const fetchHistory = async () => {
      try {
        const [histRes, profileRes] = await Promise.all([
          api.get('/meals/history?days=7'),
          api.get('/user/profile'),
        ]);
        setHistory(histRes.data);
        setGoal(profileRes.data.dailyGoal || 2000);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [navigate]);

  // Build 7-day array
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData = days.map((date, i) => {
    const meals = history[date] || [];
    const calories = meals.reduce((s, m) => s + m.calories, 0);
    const d = new Date(date);
    return { date, calories, label: d.toLocaleDateString('en-US', { weekday: 'short' }), meals };
  });

  const maxCal = Math.max(...weekData.map(d => d.calories), goal);
  const avgCal = weekData.reduce((s, d) => s + d.calories, 0) / 7;
  const streak = weekData.filter(d => d.calories > 0 && d.calories <= goal).length;

  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <Loader2 size={48} className="animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg transition-colors duration-300">
      <Navbar onFoodMedia={onFoodMedia} />
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Analytics</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">History 📊</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Your calorie intake over the last 7 days</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            { label: 'Avg Daily', value: `${avgCal.toFixed(0)}`, unit: 'kcal', color: 'from-indigo-600 to-purple-700' },
            { label: 'Days on Track', value: streak, unit: `/ 7`, color: streak >= 5 ? 'from-emerald-500 to-teal-600' : streak >= 3 ? 'from-amber-500 to-orange-600' : 'from-red-500 to-rose-600' },
            { label: 'Best Day', value: Math.max(...weekData.map(d => d.calories)).toFixed(0), unit: 'kcal', color: 'from-violet-600 to-fuchsia-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-3xl p-5 bg-gradient-to-br ${s.color} shadow-xl text-white`}>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-black">{s.value} <span className="text-sm font-semibold text-white/60">{s.unit}</span></p>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="glass rounded-3xl p-6 mb-7">
          <div className="flex items-end justify-between mb-2">
            <h2 className="font-bold text-gray-800 dark:text-white">Weekly Overview</h2>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-r from-indigo-500 to-purple-500 inline-block"></span> Under goal</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-rose-500 inline-block"></span> Over goal</span>
            </div>
          </div>
          {/* Goal line label */}
          <div className="relative" style={{ height: '180px' }}>
            {/* Goal dashed line */}
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-indigo-400/40 dark:border-indigo-400/20 flex items-center justify-end pr-2"
              style={{ bottom: `${(goal / maxCal) * 160}px` }}>
              <span className="text-[10px] font-bold text-indigo-400 bg-white dark:bg-gray-900 px-1">Goal</span>
            </div>
            <div className="flex items-end gap-3 h-full pt-4">
              {weekData.map(({ date, calories, label }) => {
                const pct = maxCal > 0 ? (calories / maxCal) * 100 : 0;
                const over = calories > goal;
                const isToday = date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setExpanded(expanded === date ? null : date)}>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{calories > 0 ? calories : ''}</span>
                    <div className="w-full flex flex-col justify-end" style={{ height: '150px' }}>
                      <div
                        className={`w-full rounded-t-xl transition-all duration-700 group-hover:opacity-80 ${over ? 'bg-gradient-to-t from-red-500 to-rose-400' : calories > 0 ? 'bg-gradient-to-t from-indigo-600 to-purple-500' : 'bg-gray-100 dark:bg-white/5'}`}
                        style={{ height: `${Math.max(pct, calories > 0 ? 4 : 0)}%` }}>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isToday ? 'Today' : label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day-by-day breakdown */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg">Daily Breakdown</h2>
          {[...weekData].reverse().map(({ date, calories, label, meals }) => {
            const isToday = date === new Date().toISOString().slice(0, 10);
            const isOpen = expanded === date;
            return (
              <div key={date} className="glass rounded-3xl overflow-hidden">
                <button className="w-full p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-[0.99]" onClick={() => setExpanded(isOpen ? null : date)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${calories > goal ? 'bg-red-500' : calories > 0 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    <div className="text-left">
                      <p className="font-bold text-gray-800 dark:text-white text-sm">
                        {isToday ? 'Today' : new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{meals.length} meals logged</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-lg ${calories > goal ? 'text-red-500' : calories > 0 ? 'gradient-text' : 'text-gray-300 dark:text-gray-600'}`}>
                      {calories > 0 ? `${calories} kcal` : '—'}
                    </span>
                    <span className="text-gray-400 text-sm">{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </div>
                </button>
                {isOpen && meals.length > 0 && (
                  <div className="px-5 pb-5 space-y-2 border-t border-gray-100 dark:border-white/5 pt-4">
                    {meals.map(m => (
                      <div key={m._id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-indigo-500">{m.icon || <Utensils size={20} />}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{m.name} {m.quantity ? <span className="text-xs text-gray-500 font-normal">x{m.quantity}</span> : null}</p>
                            <p className="text-xs text-gray-400">{m.mealType}</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{m.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
                {isOpen && meals.length === 0 && (
                  <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-white/5 text-center text-sm text-gray-400">No meals logged this day</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
