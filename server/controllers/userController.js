import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

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
  role: user.role,
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

// POST /api/user/feedback
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, feedback } = req.body;
    
    if (!name || !email || !feedback) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5;">New Feedback Received</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p><strong>Feedback:</strong></p>
        <p style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f3f4f6;">${feedback}</p>
      </div>
    `;

    await sendEmail({
      email: 'vishal.pargai2017@gmail.com',
      subject: `🚀 KcalCounter Feedback from ${name}`,
      html
    });

    res.status(200).json({ message: 'Feedback sent successfully' });
  } catch (err) {
    console.error('Feedback error:', err.message);
    res.status(500).json({ message: 'Failed to send feedback' });
  }
};

