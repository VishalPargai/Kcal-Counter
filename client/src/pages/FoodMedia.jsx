import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { Heart, MessageCircle, Trash2, Send, X, ChevronDown, Loader2, Users, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

const FoodMedia = ({ onClose }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [visible, setVisible] = useState(false);

  const safeParseUser = () => {
    try {
      const p = JSON.parse(localStorage.getItem('user'));
      return p && typeof p === 'object' ? p : {};
    } catch { return {}; }
  };
  const me = safeParseUser();

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 500);
  };

  const handleLike = async (postId) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const alreadyLiked = p.likes.includes(me.id);
      return {
        ...p,
        likes: alreadyLiked ? p.likes.filter(id => id !== me.id) : [...p.likes, me.id],
        _liked: !alreadyLiked,
      };
    }));
    try {
      await api.post(`/posts/${postId}/like`);
    } catch {
      toast.error('Failed to like post');
      fetchPosts(); // revert
    }
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text });
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        return { ...p, comments: [...p.comments, res.data] };
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const getAvatar = (user) => {
    if (!user) return null;
    if (user.avatar) return <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40" />;
    const initial = user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {initial}
      </div>
    );
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div
      className={`fixed inset-0 z-[1000] transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'linear-gradient(135deg, #050510 0%, #0f0a20 50%, #0a0518 100%)' }}
    >
      {/* Animated Wave Entry */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-700 ${visible ? 'translate-y-full' : 'translate-y-0'}`}
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          borderRadius: visible ? '0 0 60% 60%' : '0',
        }}
      />

      {/* Glowing orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-60 right-10 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">FoodMedia</h1>
            <p className="text-xs text-purple-300 font-medium">{posts.length} posts in your community</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Feed */}
      <div className="relative z-10 h-[calc(100vh-80px)] overflow-y-auto pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 size={32} className="animate-spin text-purple-400" />
            <p className="text-purple-300 text-sm font-medium">Loading your food community...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-8">
            <div className="text-6xl">🍽️</div>
            <h3 className="text-white font-bold text-lg">No posts yet!</h3>
            <p className="text-purple-300 text-sm">Be the first to share a meal. Go log your food and check "Post to FoodMedia"!</p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
            {posts.map(post => {
              const isLiked = post.likes?.includes(me.id);
              const isOwner = post.user?._id === me.id || post.user?.email === me.email || me.role === 'admin';
              const showComments = expandedComments[post._id];

              return (
                <div key={post._id} className="rounded-3xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                  {/* User Header */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getAvatar(post.user)}
                      <div>
                        <p className="text-white font-bold text-sm">{post.user?.fullName || 'User'}</p>
                        <p className="text-purple-400 text-xs">{formatTime(post.createdAt)}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button onClick={() => handleDelete(post._id)} className="w-8 h-8 rounded-xl bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 hover:text-red-300 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Food Image */}
                  <div className="relative">
                    <img src={post.image} alt={post.foodName} className="w-full object-cover" style={{ maxHeight: '400px' }} />
                    {/* Gradient overlay for nutrition badge */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                    {/* Meal type badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                      {post.mealType}
                    </div>
                    {/* Nutrition overlay at bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">{post.foodIcon}</span>
                        <span className="text-white font-bold text-sm drop-shadow">{post.foodName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-xl px-3 py-1.5">
                        <Flame size={13} className="text-orange-400" />
                        <span className="text-white font-black text-sm">{post.calories}</span>
                        <span className="text-gray-300 text-xs">kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Pills */}
                  <div className="flex gap-2 px-4 pt-3 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/20">P: {post.protein}g</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/20">C: {post.carbs}g</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/20">F: {post.fat}g</span>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-gray-300 text-sm px-4 pt-2 leading-relaxed">{post.caption}</p>
                  )}

                  {/* Like & Comment actions */}
                  <div className="flex items-center gap-4 px-4 py-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 text-sm font-bold transition-all active:scale-90 ${isLiked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'}`}
                    >
                      <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} className={`transition-transform ${isLiked ? 'scale-110' : ''}`} />
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-purple-400 text-sm font-bold transition-all"
                    >
                      <MessageCircle size={20} />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  {/* Comments section */}
                  {showComments && (
                    <div className="px-4 pb-3 space-y-2 border-t border-white/5 pt-3">
                      {post.comments.length === 0 && (
                        <p className="text-gray-500 text-xs text-center py-2">No comments yet. Be first!</p>
                      )}
                      {post.comments.slice(-5).map((comment, idx) => (
                        <div key={comment._id || idx} className="flex items-start gap-2">
                          {getAvatar(comment.user)}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold">{comment.user?.fullName || 'User'}</p>
                            <p className="text-gray-300 text-xs mt-0.5 break-words">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                      {/* Comment input */}
                      <div className="flex items-center gap-2 mt-3">
                        {getAvatar(me)}
                        <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-2xl px-3 py-2 border border-white/10">
                          <input
                            type="text"
                            value={commentInputs[post._id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleComment(post._id)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent text-white text-xs outline-none placeholder-gray-500"
                          />
                          <button
                            onClick={() => handleComment(post._id)}
                            disabled={submittingComment[post._id]}
                            className="text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
                          >
                            {submittingComment[post._id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodMedia;
