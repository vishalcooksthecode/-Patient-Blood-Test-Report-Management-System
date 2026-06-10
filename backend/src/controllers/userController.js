const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const { name, mobile } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, mobile }, { new: true }).select('-password -refreshToken -resetOtp');
  res.json(user);
};

exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const result = await uploadToCloudinary(req.file.buffer, 'medilab/avatars', 'image');
  const user = await User.findByIdAndUpdate(req.user._id, { profilePicture: result.secure_url }, { new: true }).select('-password');
  res.json({ profilePicture: user.profilePicture });
};

// Admin only
exports.getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const [users, total] = await Promise.all([
    User.find(query).select('-password -refreshToken').skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);
  res.json({ users, total, pages: Math.ceil(total / limit) });
};

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ id: user._id, name: user.name, role: user.role });
};

exports.updateUserStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).select('-password');
  res.json(user);
};

exports.resetUserPassword = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.password = req.body.newPassword || 'Medilab@123';
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.status = 'active';
  await user.save();
  res.json({ message: 'Password reset successfully' });
};
