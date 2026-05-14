import mongoose from 'mongoose';

const customFoodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  icon: { type: String, default: '🍽️' },
  category: { type: String, default: 'Custom' }
}, { timestamps: true });

export default mongoose.model('CustomFood', customFoodSchema);
