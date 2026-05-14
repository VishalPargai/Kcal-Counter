import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Camera, Scale, Ruler, Cake, Target, Sofa, PersonStanding, Activity, Dumbbell, Zap, Save, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', age: '', weight: '', height: '', dailyGoal: '2000', activityLevel: 'moderate' });
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    api.get('/user/profile').then(res => {
      const u = res.data;
      setUser(u);
      setAvatar(u.avatar || '');
      setAvatarPreview(u.avatar || '');
      setForm({
        fullName: u.fullName || '',
        phoneNumber: u.phoneNumber || '',
        age: u.age || '',
        weight: u.weight || '',
        height: u.height || '',
        dailyGoal: u.dailyGoal || 2000,
        activityLevel: u.activityLevel || 'moderate',
      });
    }).catch(() => navigate('/login'));
  }, [navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!fileRef.current?.files[0]) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', fileRef.current.files[0]);
      const res = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatar(res.data.avatar);
      setAvatarPreview(res.data.avatar);
      // Update localStorage user
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, avatar: res.data.avatar }));
      toast.success('Profile photo updated!');
    } catch (err) { 
      toast.error('Failed to update photo');
      console.error(err); 
    }
    finally { setUploadingAvatar(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/user/profile', {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        dailyGoal: Number(form.dailyGoal),
        activityLevel: form.activityLevel,
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify({ ...res.data, avatar: avatarPreview }));
      toast.success('Profile saved successfully!');
    } catch (err) { 
      toast.error('Failed to save profile');
      console.error(err); 
    }
    finally { setSaving(false); }
  };

  const bmi = form.weight && form.height
    ? (Number(form.weight) / ((Number(form.height) / 100) ** 2)).toFixed(1)
    : null;
  const bmiInfo = bmi
    ? bmi < 18.5 ? { label: 'Underweight', color: 'text-blue-500', bg: 'from-blue-500 to-cyan-500' }
    : bmi < 25 ? { label: 'Normal', color: 'text-emerald-500', bg: 'from-emerald-500 to-teal-500' }
    : bmi < 30 ? { label: 'Overweight', color: 'text-amber-500', bg: 'from-amber-500 to-orange-500' }
    : { label: 'Obese', color: 'text-red-500', bg: 'from-red-500 to-rose-500' }
    : null;

  const initial = user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  if (!user) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg transition-colors duration-300">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Profile ⚙️</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your personal details and goals</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Avatar & stats */}
          <div className="space-y-5">
            {/* Avatar card */}
            <div className="glass rounded-3xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-80" />
              <div className="relative z-10 pt-8">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar"
                      className="w-24 h-24 rounded-3xl object-cover mx-auto ring-4 ring-white dark:ring-gray-900 shadow-2xl" />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-4xl mx-auto ring-4 ring-white dark:ring-gray-900 shadow-2xl">
                      {initial}
                    </div>
                  )}
                  <button onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110">
                    <Camera size={16} />
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                <h2 className="font-extrabold text-xl text-gray-900 dark:text-white">{user.fullName || 'User'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{user.email}</p>
                {user.phoneNumber && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📞 {user.phoneNumber}</p>}
                {memberSince && <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold">Member since {memberSince}</p>}

                {/* Upload button */}
                {avatarPreview !== avatar && (
                  <button onClick={handleAvatarUpload} disabled={uploadingAvatar}
                    className="mt-4 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-2xl hover:shadow-indigo-500/30 hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploadingAvatar ? 'Uploading...' : 'Save Photo'}
                  </button>
                )}
              </div>
            </div>

            {/* BMI Card */}
            {bmi && (
              <div className={`rounded-3xl p-6 bg-gradient-to-br ${bmiInfo.bg} shadow-xl text-white`}>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Your BMI</p>
                <p className="text-5xl font-black mb-1">{bmi}</p>
                <p className="font-bold text-white/80">{bmiInfo.label}</p>
                <div className="mt-3 text-xs text-white/50 space-y-0.5">
                  <p>Underweight: &lt; 18.5</p>
                  <p>Normal: 18.5 – 24.9</p>
                  <p>Overweight: 25 – 29.9</p>
                </div>
              </div>
            )}

            {/* Stats */}
            {(form.weight || form.height || form.age) && (
              <div className="glass rounded-3xl p-5">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">Body Stats</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Weight', val: form.weight ? `${form.weight} kg` : '—', icon: <Scale size={16} /> },
                    { label: 'Height', val: form.height ? `${form.height} cm` : '—', icon: <Ruler size={16} /> },
                    { label: 'Age', val: form.age ? `${form.age} years` : '—', icon: <Cake size={16} /> },
                    { label: 'Daily Goal', val: `${form.dailyGoal} kcal`, icon: <Target size={16} /> },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-white/5">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">{s.icon} {s.label}</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Edit form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-6">Edit Information</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'John Doe' },
                    { label: 'Phone Number', key: 'phoneNumber', type: 'tel', placeholder: '+1 234 567 890' },
                    { label: 'Age', key: 'age', type: 'number', placeholder: '25' },
                    { label: 'Weight (kg)', key: 'weight', type: 'number', placeholder: '70' },
                    { label: 'Height (cm)', key: 'height', type: 'number', placeholder: '175' },
                    { label: 'Daily Calorie Goal (kcal)', key: 'dailyGoal', type: 'number', placeholder: '2000' },
                  ].map(field => (
                    <div key={field.key} className={field.key === 'dailyGoal' ? 'sm:col-span-2' : ''}>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">{field.label}</label>
                      <input type={field.type} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-800 dark:text-white transition-all" />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Email (read only)</label>
                    <input type="email" value={user.email} disabled
                      className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-400 text-sm cursor-not-allowed" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Activity Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { val: 'sedentary', label: 'Sedentary', icon: <Sofa size={24} />, sub: 'Little exercise' },
                        { val: 'light', label: 'Light', icon: <PersonStanding size={24} />, sub: '1-3 days/week' },
                        { val: 'moderate', label: 'Moderate', icon: <Activity size={24} />, sub: '3-5 days/week' },
                        { val: 'active', label: 'Active', icon: <Dumbbell size={24} />, sub: '6-7 days/week' },
                        { val: 'veryactive', label: 'Very Active', icon: <Zap size={24} />, sub: 'Daily intense' },
                      ].map(opt => (
                        <button key={opt.val} type="button" onClick={() => setForm({ ...form, activityLevel: opt.val })}
                          className={`p-3 rounded-2xl text-left transition-all ${form.activityLevel === opt.val
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}>
                          <div className="mb-2">{opt.icon}</div>
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className={`text-[10px] ${form.activityLevel === opt.val ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-sm rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
