import CustomFood from '../models/CustomFood.js';

export const getCustomFoods = async (req, res) => {
  try {
    const foods = await CustomFood.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCustomFood = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, icon } = req.body;
    
    if (!name || calories == null || protein == null || carbs == null || fat == null) {
      return res.status(400).json({ message: 'All nutritional fields are required' });
    }

    const newFood = new CustomFood({
      user: req.user.id,
      name,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      icon: icon || '🍽️'
    });

    const saved = await newFood.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
