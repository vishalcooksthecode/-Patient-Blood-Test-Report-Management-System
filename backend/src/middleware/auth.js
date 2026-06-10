const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = verifyAccessToken(auth.split(' ')[1]);
    req.user = await User.findById(decoded.id).select('-password -refreshToken -resetOtp');
    if (!req.user || req.user.status === 'locked') return res.status(401).json({ message: 'Account locked or not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

module.exports = { protect, authorize };
