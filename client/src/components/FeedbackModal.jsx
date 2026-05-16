import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const FeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', feedback: '' });
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem('user'));
      } catch (e) {
        user = null;
      }
      if (user && typeof user === 'object') {
        setFormData(prev => ({
          ...prev,
          name: user.fullName || '',
          email: user.email || ''
        }));
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/user/feedback', formData);
      toast.success('Feedback sent successfully!');
      setIsOpen(false);
      setFormData({ name: '', email: '', feedback: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  if (location.pathname === '/login' || !localStorage.getItem('token')) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110 active:scale-95"
        title="Send Feedback"
      >
        <MessageSquare size={24} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-full max-w-md glass rounded-3xl p-8 glow-indigo shadow-2xl animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Send Feedback</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We'd love to hear your thoughts!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Your Feedback</label>
                <textarea value={formData.feedback} onChange={(e) => setFormData({...formData, feedback: e.target.value})} required rows="4"
                  placeholder="Tell us what you think..."
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white text-sm resize-none"></textarea>
              </div>
              
              <button type="submit" disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Send Feedback</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;
