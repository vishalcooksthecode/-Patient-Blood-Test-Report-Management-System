const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  mobile: { type: String, unique: true, sparse: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'lab_staff', 'patient'], default: 'patient' },
  status: { type: String, enum: ['active', 'inactive', 'locked'], default: 'active' },
  profilePicture: { type: String, default: '' },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  refreshToken: { type: String },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
  lastLogin: { type: Date },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', userSchema);
