const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail, otpEmailTemplate } = require('../utils/email');
const audit = require('../utils/audit');

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 min

exports.login = async (req, res) => {
  const { identifier, password, role } = req.body;
  const ip = req.ip;
  const ua = req.headers['user-agent'];

  const user = await User.findOne({
    $or: [{ email: identifier?.toLowerCase() }, { mobile: identifier }],
    role,
  });

  if (!user) {
    await audit(null, 'LOGIN_FAILED', identifier, ip, ua, 'failure');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.isLocked()) {
    const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({ message: `Account locked. Try again in ${remaining} minutes.` });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION);
      user.status = 'locked';
    }
    await user.save();
    await audit(user._id, 'LOGIN_FAILED', 'auth', ip, ua, 'failure');
    return res.status(401).json({ message: 'Invalid credentials', attemptsLeft: MAX_ATTEMPTS - user.failedLoginAttempts });
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.status = 'active';
  user.lastLogin = new Date();

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  await user.save();

  await audit(user._id, 'LOGIN_SUCCESS', 'auth', ip, ua);

  res.json({
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
  });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(403).json({ message: 'Invalid refresh token' });
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) { user.refreshToken = null; await user.save(); }
  res.json({ message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  const { identifier } = req.body;
  const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = crypto.randomInt(100000, 999999).toString();
  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  if (user.email) {
    await sendEmail({ to: user.email, subject: 'Password Reset OTP', html: otpEmailTemplate(otp) });
  }

  res.json({ message: 'OTP sent successfully' });
};

exports.resetPassword = async (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
  if (!user || user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.status = 'active';
  await user.save();

  await Notification.create({ userId: user._id, title: 'Password Changed', message: 'Your password was reset successfully.', type: 'password' });
  res.json({ message: 'Password reset successful' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
  user.password = newPassword;
  await user.save();
  await Notification.create({ userId: user._id, title: 'Password Changed', message: 'Your password was updated.', type: 'password' });
  res.json({ message: 'Password changed successfully' });
};
