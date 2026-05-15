import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

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
  role: user.role,
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

    // Send Welcome Email (Non-blocking)
    const welcomeHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w-md; margin: 0 auto; background-color: #f9fafb; padding: 40px 20px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 900;">Kcal<span style="color: #111827;">Counter</span></h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Your Personal Nutrition Tracker</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center;">
          <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
          <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${fullName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">We're thrilled to have you join KcalCounter. Start tracking your meals, hitting your daily goals, and taking control of your health today!</p>
          
          <div style="margin: 30px 0;">
            <a href="https://kcalcounter.com" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Log Your First Meal</a>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you have any questions, simply reply to this email. We're here to help!</p>
        </div>
      </div>
    `;
    sendEmail({
      email: user.email,
      subject: '🎉 Welcome to KcalCounter!',
      html: welcomeHtml
    }).catch(err => console.error('Welcome email failed to send:', err.message));

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with that email address' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w-md; margin: 0 auto; background-color: #f9fafb; padding: 40px 20px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 900;">Kcal<span style="color: #111827;">Counter</span></h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Your Personal Nutrition Tracker</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.6;">You recently requested to reset your password for your KcalCounter account. Use the verification code below to complete the process.</p>
          
          <div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); border-radius: 12px;">
            <p style="font-size: 12px; font-weight: bold; color: #4f46e5; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Your Verification Code</p>
            <p style="font-size: 36px; font-weight: 900; color: #4f46e5; letter-spacing: 8px; margin: 0;">${otp}</p>
          </div>
          
          <p style="color: #ef4444; font-size: 13px; font-weight: 600;">⚠️ This code will expire in 10 minutes.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: '🔒 Your Password Reset Code - KcalCounter',
        html
      });
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      user.resetOtp = null;
      user.resetOtpExpire = null;
      await user.save();
      console.error('Email error:', err);
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    // Send Success Email (Non-blocking)
    const resetHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w-md; margin: 0 auto; background-color: #f9fafb; padding: 40px 20px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 900;">Kcal<span style="color: #111827;">Counter</span></h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center;">
          <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Successful</h2>
          <p style="color: #4b5563; line-height: 1.6;">Your password has been successfully updated. You can now use your new password to log in to your account.</p>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you did not perform this action, please contact support immediately to secure your account.</p>
        </div>
      </div>
    `;
    sendEmail({
      email: user.email,
      subject: '✅ Password Reset Successful',
      html: resetHtml
    }).catch(err => console.error('Reset success email failed to send:', err.message));

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
