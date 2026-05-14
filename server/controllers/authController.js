import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signToken = (userId) =>
  new Promise((resolve, reject) => {
    jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });

const safeUser = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  avatar: user.avatar,
  age: user.age,
  weight: user.weight,
  height: user.height,
  dailyGoal: user.dailyGoal,
  activityLevel: user.activityLevel,
});

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists with this email' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({ fullName, email, password: hashedPassword });
    const token = await signToken(user._id);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = await signToken(user._id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};
