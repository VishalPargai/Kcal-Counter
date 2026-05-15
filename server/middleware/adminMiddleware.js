import User from '../models/User.js';

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as an admin' });
    }
  } catch (error) {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export default adminMiddleware;
