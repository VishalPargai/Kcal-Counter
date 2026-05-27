import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  avatar: { type: String, default: '' }, // base64 or file path
  age: { type: Number, default: null },
  weight: { type: Number, default: null }, // kg
  height: { type: Number, default: null }, // cm
  dailyGoal: { type: Number, default: 2000 },
  proteinGoal: { type: Number, default: 150 }, // g
  carbsGoal: { type: Number, default: 250 }, // g
  fatGoal: { type: Number, default: 70 }, // g
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'veryactive'],
    default: 'moderate'
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetOtp: { type: String, default: null },
  resetOtpExpire: { type: Date, default: null },
  // Gamification / Streaks
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastLogDate: { type: String, default: null }, // stored as 'YYYY-MM-DD'
}, { timestamps: true });

export default mongoose.model('User', userSchema);
