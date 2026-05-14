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
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'veryactive'],
    default: 'moderate'
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
