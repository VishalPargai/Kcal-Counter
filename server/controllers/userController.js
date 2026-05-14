import User from '../models/User.js';

const safeUser = (user) => ({
  id: user._id,
  email: user.email,
  phoneNumber: user.phoneNumber,
  fullName: user.fullName,
  avatar: user.avatar,
  age: user.age,
  weight: user.weight,
  height: user.height,
  dailyGoal: user.dailyGoal,
  activityLevel: user.activityLevel,
  createdAt: user.createdAt,
});

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safeUser(user));
  } catch (err) {
    console.error('getProfile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, age, weight, height, dailyGoal, activityLevel } = req.body;
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (age !== undefined) updates.age = age;
    if (weight !== undefined) updates.weight = weight;
    if (height !== undefined) updates.height = height;
    if (dailyGoal !== undefined) updates.dailyGoal = dailyGoal;
    if (activityLevel !== undefined) updates.activityLevel = activityLevel;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safeUser(user));
  } catch (err) {
    console.error('updateProfile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Store as base64 data URL
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: base64 }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ avatar: user.avatar, message: 'Avatar updated successfully' });
  } catch (err) {
    console.error('uploadAvatar error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
