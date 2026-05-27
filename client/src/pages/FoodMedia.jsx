import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Heart, MessageCircle, Trash2, Send, X, ChevronDown,
  Loader2, Users, Flame, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Meal-type badge colours ─── */
const MEAL_COLORS = {
  Breakfast: { bg: 'rgba(59,130,246,0.25)', border: 'rgba(59,130,246,0.45)', text: '#93c5fd' },
  Lunch:     { bg: 'rgba(34,197,94,0.25)',  border: 'rgba(34,197,94,0.45)',  text: '#86efac' },
  Dinner:    { bg: 'rgba(249,115,22,0.25)', border: 'rgba(249,115,22,0.45)', text: '#fdba74' },
  Snack:     { bg: 'rgba(168,85,247,0.25)', border: 'rgba(168,85,247,0.45)', text: '#d8b4fe' },
};
const mealStyle = (type) => MEAL_COLORS[type] || MEAL_COLORS.Snack;

/* ─── Tiny animated counter ─── */
const AnimCounter = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (value !== display) {
      setBump(true);
      const t = setTimeout(() => { setDisplay(value); setBump(false); }, 150);
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <span
      style={{
        display: 'inline-block',
        transition: 'transform 0.15s ease, opacity 0.15s ease',
        transform: bump ? 'scale(1.5)' : 'scale(1)',
        opacity: bump ? 0.5 : 1,
      }}
    >
      {display}
    </span>
  );
};

/* ─── Mini avatar ─── */
const Avatar = ({ user, size = 36 }) => {
  if (!user) return null;
  const px = `${size}px`;
  if (user.avatar)
    return (
      <img
        src={user.avatar}
        alt="avatar"
        style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover',
          border: '2px solid rgba(139,92,246,0.5)', flexShrink: 0 }}
      />
    );
  const initial = user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  return (
    <div style={{
      width: px, height: px, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: `${Math.max(10, size * 0.38)}px`,
      border: '2px solid rgba(139,92,246,0.4)',
    }}>
      {initial}
    </div>
  );
};

/* ─── Global keyframe styles injected once ─── */
const STYLE_ID = 'foodmedia-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes fm-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} }
    @keyframes fm-orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,25px) scale(0.9)} }
    @keyframes fm-orb3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,15px) scale(1.05)} }
    @keyframes fm-spin  { to { transform: rotate(360deg); } }
    @keyframes fm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.06)} }
    @keyframes fm-emoji { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-14px) rotate(5deg)} }
    @keyframes fm-likepop { 0%{transform:scale(1)} 40%{transform:scale(1.45)} 70%{transform:scale(.88)} 100%{transform:scale(1)} }
    @keyframes fm-slidedown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
    .fm-scroll::-webkit-scrollbar { width: 5px; }
    .fm-scroll::-webkit-scrollbar-track { background: transparent; }
    .fm-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 99px; }
    .fm-like-pop { animation: fm-likepop .35s cubic-bezier(.36,.07,.19,.97); }
    .fm-comments-enter { animation: fm-slidedown .22s ease; }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════
   FoodMedia Component
═══════════════════════════════════════════════════════════════ */
const FoodMedia = ({ onClose }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [visible, setVisible] = useState(false);
  const [likingIds, setLikingIds] = useState({});

  const safeParseUser = () => {
    try {
      const p = JSON.parse(localStorage.getItem('user'));
      return p && typeof p === 'object' ? p : {};
    } catch { return {}; }
  };
  const me = safeParseUser();

  /* Animate in */
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
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
    setLikingIds(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => setLikingIds(prev => ({ ...prev, [postId]: false })), 360);
    /* Optimistic update */
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
      fetchPosts();
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

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  /* ── RENDER ── */
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'linear-gradient(135deg, #03010d 0%, #0d0520 40%, #060118 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── Wave entry overlay ── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)',
          borderRadius: visible ? '0 0 60% 60%' : '0',
          transform: visible ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.7s cubic-bezier(.4,0,.2,1), border-radius 0.7s ease',
          zIndex: 1,
        }}
      />

      {/* ── Floating orbs ── */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        <div style={{
          position:'absolute', top:60, left:-40, width:340, height:340,
          background:'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)',
          borderRadius:'50%', animation:'fm-orb1 9s ease-in-out infinite',
        }} />
        <div style={{
          position:'absolute', top:'35%', right:-60, width:280, height:280,
          background:'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)',
          borderRadius:'50%', animation:'fm-orb2 12s ease-in-out infinite',
        }} />
        <div style={{
          position:'absolute', bottom:80, left:'45%', width:320, height:320,
          background:'radial-gradient(circle,rgba(236,72,153,0.10) 0%,transparent 70%)',
          borderRadius:'50%', animation:'fm-orb3 10s ease-in-out infinite',
        }} />
        <div style={{
          position:'absolute', bottom:'25%', left:20, width:180, height:180,
          background:'radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%)',
          borderRadius:'50%', animation:'fm-orb1 7s ease-in-out infinite reverse',
        }} />
      </div>

      {/* ═══════════════ HEADER ═══════════════ */}
      <div style={{
        position:'relative', zIndex:10, flexShrink:0,
        background:'rgba(3,1,13,0.85)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Title row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* App icon */}
            <div style={{
              width:44, height:44, borderRadius:14,
              background:'linear-gradient(135deg,#ec4899,#8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 20px rgba(236,72,153,0.4)',
            }}>
              <Users size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin:0, color:'#fff', fontWeight:900, fontSize:22, letterSpacing:'-0.5px', lineHeight:1 }}>
                FoodMedia
              </h1>
              <p style={{ margin:0, marginTop:3, color:'rgba(167,139,250,0.85)', fontSize:12, fontWeight:600 }}>
                {posts.length} {posts.length === 1 ? 'post' : 'posts'} in your community
              </p>
            </div>
          </div>
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              width:40, height:40, borderRadius:12, border:'1px solid rgba(255,255,255,0.12)',
              background:'rgba(255,255,255,0.07)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
              transition:'background .2s, transform .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ═══════════════ FEED ═══════════════ */}
      <div
        className="fm-scroll"
        style={{ flex:1, overflowY:'auto', position:'relative', zIndex:10 }}
      >
        {loading ? (
          /* ── Loading state ── */
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16 }}>
            <div style={{
              width:56, height:56, borderRadius:'50%',
              background:'linear-gradient(135deg,#8b5cf6,#ec4899)',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'fm-pulse 1.5s ease-in-out infinite',
              boxShadow:'0 0 30px rgba(139,92,246,0.5)',
            }}>
              <Loader2 size={28} color="#fff" style={{ animation:'fm-spin 1s linear infinite' }} />
            </div>
            <p style={{ color:'rgba(167,139,250,0.8)', fontSize:14, fontWeight:600, margin:0 }}>
              Loading your food community…
            </p>
          </div>

        ) : posts.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:20, padding:'0 32px', textAlign:'center' }}>
            <div style={{ fontSize:72, animation:'fm-emoji 2.5s ease-in-out infinite', filter:'drop-shadow(0 0 20px rgba(236,72,153,0.4))' }}>
              🍽️
            </div>
            <h3 style={{ margin:0, color:'#fff', fontWeight:900, fontSize:22 }}>
              Be the first to post!
            </h3>
            <p style={{ margin:0, color:'rgba(167,139,250,0.75)', fontSize:14, lineHeight:1.6, maxWidth:280 }}>
              Share your meals with the community. Log your food and check "Post to FoodMedia"!
            </p>
            <button
              onClick={() => {
                handleClose();
                navigate('/log');
              }}
              style={{
                marginTop:8, padding:'12px 28px', borderRadius:99, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#8b5cf6,#ec4899)',
                color:'#fff', fontWeight:800, fontSize:14,
                boxShadow:'0 4px 20px rgba(139,92,246,0.45)',
                transition:'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(139,92,246,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(139,92,246,0.45)'; }}
            >
              Log Food Now
            </button>
          </div>

        ) : (
          /* ── Post feed ── */
          <div style={{ maxWidth:520, margin:'0 auto', padding:'20px 16px 32px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {posts.map(post => {
                const isLiked = post.likes?.includes(me.id);
                const isOwner = post.user?._id === me.id || post.user?.email === me.email || me.role === 'admin';
                const isAdmin = me.role === 'admin' && post.user?._id !== me.id && post.user?.email !== me.email;
                const showComments = expandedComments[post._id];
                const ms = mealStyle(post.mealType);
                const totalComments = post.comments?.length || 0;
                const visibleComments = post.comments?.slice(-5) || [];

                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    isLiked={isLiked}
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                    showComments={showComments}
                    ms={ms}
                    totalComments={totalComments}
                    visibleComments={visibleComments}
                    commentInput={commentInputs[post._id] || ''}
                    submitting={submittingComment[post._id]}
                    liking={likingIds[post._id]}
                    me={me}
                    formatTime={formatTime}
                    onLike={() => handleLike(post._id)}
                    onDelete={() => handleDelete(post._id)}
                    onToggleComments={() => setExpandedComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                    onCommentChange={val => setCommentInputs(prev => ({ ...prev, [post._id]: val }))}
                    onCommentSubmit={() => handleComment(post._id)}
                    onViewAll={() => setExpandedComments(prev => ({ ...prev, [post._id]: true }))}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PostCard sub-component
═══════════════════════════════════════════════════════════════ */
const PostCard = ({
  post, isLiked, isOwner, isAdmin, showComments, ms,
  totalComments, visibleComments, commentInput, submitting, liking,
  me, formatTime,
  onLike, onDelete, onToggleComments, onCommentChange, onCommentSubmit, onViewAll,
}) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCommentSubmit();
    }
  };

  return (
    <div style={{
      borderRadius:28, overflow:'hidden',
      background:'rgba(255,255,255,0.04)',
      backdropFilter:'blur(24px)',
      border:'1px solid rgba(255,255,255,0.09)',
      boxShadow:'0 0 0 1px rgba(139,92,246,0.1), 0 8px 40px rgba(0,0,0,0.5)',
      transition:'transform .2s, box-shadow .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 0 1px rgba(139,92,246,0.22), 0 12px 48px rgba(0,0,0,0.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 0 1px rgba(139,92,246,0.1), 0 8px 40px rgba(0,0,0,0.5)'; }}
    >
      {/* ── User header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
          <Avatar user={post.user} size={38} />
          <div style={{ minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:14, whiteSpace:'nowrap' }}>
                {post.user?.fullName || 'User'}
              </span>
              {/* Meal badge */}
              <span style={{
                padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:700,
                background: ms.bg, border:`1px solid ${ms.border}`, color: ms.text,
                whiteSpace:'nowrap',
              }}>
                {post.mealType}
              </span>
            </div>
            <span style={{ color:'rgba(167,139,250,0.7)', fontSize:11, fontWeight:500 }}>
              {formatTime(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        {isOwner && (
          <button
            onClick={onDelete}
            title={isAdmin ? 'Delete (Admin)' : 'Delete'}
            style={{
              flexShrink:0, width:34, height:34, borderRadius:10, border:'none', cursor:'pointer',
              background: isAdmin ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color: isAdmin ? '#fbbf24' : '#f87171',
              transition:'background .2s, transform .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isAdmin ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = isAdmin ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)'}
          >
            {isAdmin ? <Shield size={14} /> : <Trash2 size={14} />}
          </button>
        )}
      </div>

      {/* ── Food image ── */}
      <div style={{ position:'relative', margin:'0 12px', borderRadius:22, overflow:'hidden' }}>
        <img
          src={post.image}
          alt={post.foodName}
          style={{ width:'100%', maxHeight:380, objectFit:'cover', display:'block' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          background:'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          padding:'40px 14px 14px',
        }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
            {/* Food name + icon */}
            <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
              {post.foodIcon && (
                <span style={{ fontSize:22, flexShrink:0, filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>
                  {post.foodIcon}
                </span>
              )}
              <span style={{
                color:'#fff', fontWeight:900, fontSize:16,
                textShadow:'0 2px 8px rgba(0,0,0,0.8)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>
                {post.foodName}
              </span>
            </div>
            {/* Calories chip */}
            <div style={{
              display:'flex', alignItems:'center', gap:5, flexShrink:0,
              background:'rgba(0,0,0,0.55)', backdropFilter:'blur(12px)',
              border:'1px solid rgba(251,146,60,0.35)',
              borderRadius:99, padding:'5px 11px',
            }}>
              <Flame size={13} color="#fb923c" />
              <span style={{ color:'#fff', fontWeight:900, fontSize:13 }}>{post.calories}</span>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:11 }}>kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Macro pills ── */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px 6px', flexWrap:'wrap' }}>
        <MacroPill label="Protein" value={post.protein} color="#60a5fa" glow="rgba(96,165,250,0.3)" />
        <MacroPill label="Carbs"   value={post.carbs}   color="#fbbf24" glow="rgba(251,191,36,0.3)" />
        <MacroPill label="Fat"     value={post.fat}     color="#f472b6" glow="rgba(244,114,182,0.3)" />
      </div>

      {/* ── Caption ── */}
      {post.caption && (
        <p style={{
          margin:0, padding:'6px 16px 8px',
          color:'rgba(255,255,255,0.75)', fontSize:13.5,
          fontStyle:'italic', lineHeight:1.55,
        }}>
          {post.caption}
        </p>
      )}

      {/* ── Action bar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:20, padding:'8px 16px 10px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        {/* Like */}
        <button
          onClick={onLike}
          className={liking ? 'fm-like-pop' : ''}
          style={{
            background:'none', border:'none', cursor:'pointer', padding:0,
            display:'flex', alignItems:'center', gap:6,
            color: isLiked ? '#f472b6' : 'rgba(255,255,255,0.4)',
            fontWeight:800, fontSize:14,
            transition:'color .2s',
          }}
          onMouseEnter={e => { if(!isLiked) e.currentTarget.style.color='rgba(244,114,182,0.7)'; }}
          onMouseLeave={e => { if(!isLiked) e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}
        >
          <Heart
            size={22}
            fill={isLiked ? 'url(#likeGrad)' : 'none'}
            color={isLiked ? '#f472b6' : 'currentColor'}
            style={{ filter: isLiked ? 'drop-shadow(0 0 6px rgba(244,114,182,0.6))' : 'none', transition:'filter .2s, transform .2s', transform: isLiked ? 'scale(1.12)' : 'scale(1)' }}
          />
          <AnimCounter value={post.likes?.length || 0} />
        </button>

        {/* Comment toggle */}
        <button
          onClick={onToggleComments}
          style={{
            background:'none', border:'none', cursor:'pointer', padding:0,
            display:'flex', alignItems:'center', gap:6,
            color: showComments ? 'rgba(167,139,250,0.95)' : 'rgba(255,255,255,0.4)',
            fontWeight:800, fontSize:14, transition:'color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(167,139,250,0.9)'}
          onMouseLeave={e => e.currentTarget.style.color = showComments ? 'rgba(167,139,250,0.95)' : 'rgba(255,255,255,0.4)'}
        >
          <MessageCircle
            size={22}
            fill={showComments ? 'rgba(139,92,246,0.2)' : 'none'}
            style={{ transition:'fill .2s' }}
          />
          <AnimCounter value={totalComments} />
        </button>
      </div>

      {/* ── Comments section ── */}
      {showComments && (
        <div
          className="fm-comments-enter"
          style={{ padding:'10px 16px 14px', borderTop:'1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Comment list */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:12 }}>
            {visibleComments.length === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, textAlign:'center', margin:'4px 0 8px' }}>
                No comments yet. Be the first! 🎉
              </p>
            ) : (
              visibleComments.map((comment, idx) => (
                <div key={comment._id || idx} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                  <Avatar user={comment.user} size={28} />
                  <div style={{
                    flex:1, minWidth:0,
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:12, padding:'7px 11px',
                  }}>
                    <span style={{ color:'rgba(167,139,250,0.9)', fontWeight:800, fontSize:12 }}>
                      {comment.user?.fullName || 'User'}
                    </span>
                    {' '}
                    <span style={{ color:'rgba(255,255,255,0.7)', fontSize:12.5, lineHeight:1.5, wordBreak:'break-word' }}>
                      {comment.text}
                    </span>
                  </div>
                </div>
              ))
            )}
            {/* View all link */}
            {totalComments > 5 && (
              <button
                onClick={onViewAll}
                style={{
                  background:'none', border:'none', cursor:'pointer', padding:0,
                  color:'rgba(139,92,246,0.85)', fontSize:12, fontWeight:700,
                  textAlign:'left', marginTop:2,
                }}
              >
                View all {totalComments} comments →
              </button>
            )}
          </div>

          {/* Comment input */}
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <Avatar user={me} size={30} />
            <div style={{
              flex:1, display:'flex', alignItems:'center', gap:8,
              background:'rgba(255,255,255,0.06)', borderRadius:99,
              border:'1px solid rgba(255,255,255,0.1)',
              padding:'8px 8px 8px 14px',
              boxShadow:'inset 0 1px 4px rgba(0,0,0,0.3)',
            }}>
              <input
                ref={inputRef}
                type="text"
                value={commentInput}
                onChange={e => onCommentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment…"
                style={{
                  flex:1, background:'transparent', border:'none', outline:'none',
                  color:'#fff', fontSize:13, '::placeholder': { color:'rgba(255,255,255,0.3)' },
                }}
              />
              <button
                onClick={onCommentSubmit}
                disabled={submitting || !commentInput?.trim()}
                style={{
                  flexShrink:0, width:32, height:32, borderRadius:99, border:'none', cursor:'pointer',
                  background: (submitting || !commentInput?.trim())
                    ? 'rgba(255,255,255,0.08)'
                    : 'linear-gradient(135deg,#8b5cf6,#ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'background .2s, transform .15s, box-shadow .2s',
                  boxShadow: (!submitting && commentInput?.trim()) ? '0 2px 12px rgba(139,92,246,0.5)' : 'none',
                }}
                onMouseEnter={e => { if(!submitting && commentInput?.trim()) e.currentTarget.style.transform='scale(1.08)'; }}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
              >
                {submitting
                  ? <Loader2 size={14} color="rgba(255,255,255,0.6)" style={{ animation:'fm-spin 1s linear infinite' }} />
                  : <Send size={14} color="#fff" />
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG gradient for heart icon */}
      <svg width="0" height="0" style={{ position:'absolute' }}>
        <defs>
          <linearGradient id="likeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/* Macro pill */
const MacroPill = ({ label, value, color, glow }) => (
  <div style={{
    display:'flex', alignItems:'center', gap:5,
    padding:'5px 11px', borderRadius:99,
    background:`rgba(${hexToRgb(color)},0.1)`,
    border:`1px solid rgba(${hexToRgb(color)},0.25)`,
    boxShadow:`0 0 8px ${glow}`,
  }}>
    <span style={{ width:6, height:6, borderRadius:'50%', background:color, boxShadow:`0 0 6px ${glow}`, flexShrink:0 }} />
    <span style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600 }}>{label}</span>
    <span style={{ color, fontWeight:800, fontSize:12 }}>{value ?? 0}g</span>
  </div>
);

/* Helper: hex → "r,g,b" for rgba() */
function hexToRgb(hex) {
  const clean = hex.replace('#','');
  const num = parseInt(clean, 16);
  return `${(num>>16)&255},${(num>>8)&255},${num&255}`;
}

export default FoodMedia;
