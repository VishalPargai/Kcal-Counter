import MealEntry from '../models/MealEntry.js';
import User from '../models/User.js';

// GET /api/meals?date=YYYY-MM-DD  (defaults to today)
export const getMeals = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);

    const meals = await MealEntry.find({
      user: req.user.id,
      loggedAt: { $gte: start, $lte: end },
    }).sort({ loggedAt: 1 });

    res.json(meals);
  } catch (err) {
    console.error('getMeals error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/meals
export const addMeal = async (req, res) => {
  try {
    const { name, icon, mealType, calories, protein, carbs, fat, quantity } = req.body;
    if (!name || !mealType || calories === undefined) {
      return res.status(400).json({ message: 'name, mealType and calories are required' });
    }

    const meal = await MealEntry.create({
      user: req.user.id,
      name, icon, mealType, calories, protein, carbs, fat, quantity,
      loggedAt: new Date(),
    });

    // ── Streak Logic ──────────────────────────────────────────────
    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const user = await User.findById(req.user.id);
    if (user && user.lastLogDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      let newStreak;
      if (user.lastLogDate === yesterdayStr) {
        // Consecutive day → extend streak
        newStreak = (user.streak || 0) + 1;
      } else {
        // Gap in logging → reset to 1
        newStreak = 1;
      }

      user.streak = newStreak;
      user.longestStreak = Math.max(user.longestStreak || 0, newStreak);
      user.lastLogDate = todayStr;
      await user.save();
    }
    // ─────────────────────────────────────────────────────────────

    res.status(201).json(meal);
  } catch (err) {
    console.error('addMeal error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/meals/:id
export const deleteMeal = async (req, res) => {
  try {
    const meal = await MealEntry.findOne({ _id: req.params.id, user: req.user.id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    await meal.deleteOne();
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error('deleteMeal error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/meals/history?days=7
export const getMealHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const meals = await MealEntry.find({
      user: req.user.id,
      loggedAt: { $gte: start },
    }).sort({ loggedAt: 1 });

    // Group by date
    const grouped = {};
    meals.forEach(m => {
      const day = m.loggedAt.toISOString().slice(0, 10);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(m);
    });

    res.json(grouped);
  } catch (err) {
    console.error('getMealHistory error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
