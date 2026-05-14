import mongoose from 'mongoose';

const mealEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🍽️' },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    required: true
  },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  loggedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('MealEntry', mealEntrySchema);
