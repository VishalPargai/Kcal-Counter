import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Search, CheckCircle2, UtensilsCrossed, Plus, Minus, Utensils, Loader2 } from 'lucide-react';
import { FOOD_DB } from '../data/foods';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const CATEGORIES = ['All', 'Protein', 'Carbs', 'Fruit', 'Dairy', 'Fats', 'Veggies', 'Custom', 'Recent'];

const LogFoodPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [mealType, setMealType] = useState('Breakfast');
  const [qty, setQty] = useState(1);
  
  const [loggedToday, setLoggedToday] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    
    // Fetch meals
    api.get('/meals').then(r => {
      // Assuming r.data returns meals. We filter for today.
      const todayMeals = r.data.filter(m => new Date(m.createdAt || m.loggedAt || new Date()).toDateString() === new Date().toDateString());
      setLoggedToday(todayMeals);

      const unique = [];
      const map = new Set();
      // Most recent first
      const sortedMeals = [...r.data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      for(let m of sortedMeals) {
        if(!map.has(m.name)) {
          map.add(m.name);
          unique.push({ ...m, category: 'Recent' });
        }
      }
      setRecentFoods(unique);
    }).catch(() => {});

    // Fetch custom foods
    api.get('/foods/custom').then(r => setCustomFoods(r.data)).catch(() => {});
  }, [navigate]);

  const combinedFoods = [...FOOD_DB, ...customFoods];
  let displayFoods = combinedFoods;
  
  if (category === 'Recent') {
    displayFoods = recentFoods;
  } else if (category !== 'All') {
    displayFoods = combinedFoods.filter(f => f.category === category);
  }
  
  const filtered = displayFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleLog = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        name: selected.name,
        icon: selected.icon || '🍽️',
        mealType,
        calories: Math.round(selected.calories * qty),
        protein: +(selected.protein * qty).toFixed(1),
        carbs: +(selected.carbs * qty).toFixed(1),
        fat: +(selected.fat * qty).toFixed(1),
        quantity: qty,
      };
      const res = await api.post('/meals', payload);
      setLoggedToday(prev => [res.data, ...prev]);
      
      // Add to recents if not present
      if (!recentFoods.some(f => f.name === res.data.name)) {
        setRecentFoods(prev => [{ ...res.data, category: 'Recent' }, ...prev]);
      }

      toast.success(`${selected.name} added to ${mealType}!`);
      setSelected(null);
      setQty(1);
    } catch (err) {
      toast.error('Failed to log food');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/foods/custom', customForm);
      setCustomFoods(prev => [res.data, ...prev]);
      toast.success('Custom food saved to your database!');
      setShowCustomForm(false);
      setCustomForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    } catch (err) { 
      toast.error('Failed to save custom food');
      console.error(err); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const totalToday = loggedToday.reduce((s, m) => s + m.calories, 0);

  return (
    <div className="min-h-screen mesh-bg transition-colors duration-300">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Nutrition Tracker</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Log Food 🍽️</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Search and add meals to your daily log</p>
          </div>
          <div className="glass rounded-2xl px-5 py-3 text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Today's Total</p>
            <p className="text-2xl font-black gradient-text">{totalToday} <span className="text-base text-gray-400">kcal</span></p>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Food Search */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {/* Search */}
            <div className="glass rounded-3xl p-5">
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></span>
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setShowCustomForm(false); }}
                  placeholder="Search for food..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-all" />
              </div>
              {/* Category filter */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setShowCustomForm(false); }}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${category === cat
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Food list */}
            {!showCustomForm ? (
              <div className="glass rounded-3xl p-4 max-h-[450px] overflow-y-auto space-y-1.5">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="flex justify-center mb-3"><Search size={32} /></div>
                    <p className="text-sm mb-4">No foods found for "{search}"</p>
                    <button onClick={() => { setShowCustomForm(true); setCustomForm(p => ({ ...p, name: search })); }}
                      className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-2 mx-auto">
                      <Plus size={16} /> Create Custom Food
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center px-2 py-1 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filtered.length} Results</p>
                      <button onClick={() => setShowCustomForm(true)} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:cursor-pointer">
                        + Add Custom Food
                      </button>
                    </div>
                    {filtered.map(food => (
                      <button key={food._id || food.name} onClick={() => {
                          setSelected(food);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all hover:cursor-pointer ${
                          selected?.name === food.name
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500 dark:ring-indigo-400'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-2xl shadow-sm text-indigo-500">
                            {food.icon || <Utensils size={20} />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-white">{food.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              <span className="text-blue-500 font-medium">P:{food.protein}g</span> ·
                              <span className="text-amber-500 font-medium"> C:{food.carbs}g</span> ·
                              <span className="text-pink-500 font-medium"> F:{food.fat}g</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{food.calories}</p>
                          <p className="text-xs text-gray-400">kcal</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            ) : (
              /* Custom Food Form */
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-800 dark:text-white">Create Custom Food</h2>
                  <button onClick={() => setShowCustomForm(false)} className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleCreateCustom} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">Food Name</label>
                    <input required type="text" value={customForm.name} onChange={e => setCustomForm({...customForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none text-sm text-gray-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1.5">Calories (kcal)</label>
                      <input required type="number" step="0.1" value={customForm.calories} onChange={e => setCustomForm({...customForm, calories: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none text-sm text-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1.5">Protein (g)</label>
                      <input required type="number" step="0.1" value={customForm.protein} onChange={e => setCustomForm({...customForm, protein: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none text-sm text-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1.5">Carbs (g)</label>
                      <input required type="number" step="0.1" value={customForm.carbs} onChange={e => setCustomForm({...customForm, carbs: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none text-sm text-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1.5">Fat (g)</label>
                      <input required type="number" step="0.1" value={customForm.fat} onChange={e => setCustomForm({...customForm, fat: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none text-sm text-gray-800 dark:text-white" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save Food
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className={`space-y-5 order-1 lg:order-2 ${!selected && !loggedToday.length ? 'hidden lg:block' : ''}`}>
            {/* Add Panel */}
            <div className={`glass rounded-3xl p-6 ${!selected ? 'hidden lg:block' : ''}`}>
              <h2 className="font-bold text-gray-800 dark:text-white mb-5">Add to Log</h2>
              {selected ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200/50 dark:border-indigo-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl text-indigo-500">{selected.icon || <Utensils size={18} />}</span>
                      <p className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">{selected.name}</p>
                    </div>
                    <p className="text-2xl font-black gradient-text">{Math.round(selected.calories * qty)} <span className="text-sm font-semibold text-gray-400">kcal</span></p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Meal Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {MEAL_TYPES.map(type => (
                        <button key={type} onClick={() => setMealType(type)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${mealType === type
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Quantity</label>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-2xl p-1">
                      <button onClick={() => setQty(q => Math.max(0.5, +(q - 0.5).toFixed(2)))} className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"><Minus size={16} /></button>
                      <span className="flex-1 text-center font-black text-gray-800 dark:text-white text-lg">{qty}</span>
                      <button onClick={() => setQty(q => +(q + 0.5).toFixed(2))} className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"><Plus size={16} /></button>
                    </div>
                  </div>

                  <button onClick={handleLog} disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Add to Log</>}
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 dark:text-gray-600">
                  <div className="flex justify-center mb-4 float"><UtensilsCrossed size={48} /></div>
                  <p className="text-sm font-medium">Select a food item from the list</p>
                </div>
              )}
            </div>

            {/* Today's log summary */}
            {loggedToday.length > 0 && (
              <div className="glass rounded-3xl p-5">
                <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-3">Logged Today</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {loggedToday.slice(0, 5).map(item => (
                    <div key={item._id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><span className="text-indigo-500">{item.icon || <Utensils size={14}/>}</span> {item.name}</span>
                      <span className="text-xs font-black text-indigo-500">{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-white/5 mt-3 pt-3 flex justify-between">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total</span>
                  <span className="text-sm font-black gradient-text">{totalToday} kcal</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogFoodPage;
