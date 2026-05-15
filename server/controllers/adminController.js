import User from '../models/User.js';
import MealEntry from '../models/MealEntry.js';

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password -resetOtp -resetOtpExpire');
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users/:id
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get their meals
    const meals = await MealEntry.find({ user: req.params.id }).sort({ loggedAt: -1 });
    
    res.json({ user, meals });
  } catch (err) {
    console.error('Get user details error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await MealEntry.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User and their data deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
