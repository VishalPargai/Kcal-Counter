import React, { useState, useEffect } from 'react';
import { Users, Activity, Trash2, ShieldAlert, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserDetails(null);
      return;
    }
    
    setExpandedUser(userId);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setUserDetails(res.data);
    } catch (err) {
      toast.error('Failed to load user details');
      setExpandedUser(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to completely delete ${name} and all their data? This cannot be undone.`)) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`${name} has been deleted`);
      setUsers(users.filter(u => u._id !== userId));
      if (expandedUser === userId) {
        setExpandedUser(null);
        setUserDetails(null);
      }
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg text-gray-900 dark:text-white pb-20 lg:pb-10">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
              <ShieldAlert size={14} /> Admin Access
            </div>
            <h1 className="text-3xl font-black gradient-text">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Oversee all users, their activity, and application data.</p>
          </div>
          
          <div className="glass px-6 py-3 rounded-2xl text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Total Users</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{users.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {users.map(user => (
            <div key={user._id} className="glass rounded-3xl overflow-hidden transition-all duration-300">
              {/* User Header Row */}
              <div 
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 dark:hover:bg-black/5"
                onClick={() => handleExpand(user._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">Goal</p>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{user.dailyGoal || 2000} kcal</p>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">Joined</p>
                    <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(user._id, user.fullName); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    title="Delete User"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  {expandedUser === user._id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedUser === user._id && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-white/10">
                  {loadingDetails ? (
                    <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
                  ) : userDetails ? (
                    <div className="grid md:grid-cols-2 gap-8 mt-4">
                      {/* Left: Info */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Users size={16} /> Personal Info
                        </h4>
                        <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 grid grid-cols-2 gap-4">
                          <div><p className="text-xs text-gray-500">Age</p><p className="font-semibold">{userDetails.user.age || 'Not set'}</p></div>
                          <div><p className="text-xs text-gray-500">Weight</p><p className="font-semibold">{userDetails.user.weight ? `${userDetails.user.weight} kg` : 'Not set'}</p></div>
                          <div><p className="text-xs text-gray-500">Height</p><p className="font-semibold">{userDetails.user.height ? `${userDetails.user.height} cm` : 'Not set'}</p></div>
                          <div><p className="text-xs text-gray-500">Activity</p><p className="font-semibold capitalize">{userDetails.user.activityLevel}</p></div>
                        </div>
                      </div>
                      
                      {/* Right: Activity/Meals */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={16} /> Recent Activity ({userDetails.meals.length} logs total)
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {userDetails.meals.length === 0 ? (
                            <p className="text-sm text-gray-500 italic p-4 text-center bg-white/50 dark:bg-black/20 rounded-2xl">No food logged yet.</p>
                          ) : (
                            userDetails.meals.slice(0, 10).map(meal => (
                              <div key={meal._id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                                <div>
                                  <p className="font-semibold text-sm">{meal.foodName} <span className="text-xs text-gray-500 font-normal">x{meal.quantity}</span></p>
                                  <p className="text-xs text-gray-500">{new Date(meal.date).toLocaleDateString()} • {meal.mealType}</p>
                                </div>
                                <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{meal.totalCalories} kcal</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl">
              <ShieldAlert size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
              <h3 className="text-xl font-bold">No users found</h3>
              <p className="text-gray-500">The platform currently has no registered users.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
