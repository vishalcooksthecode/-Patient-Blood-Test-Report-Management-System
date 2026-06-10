const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true, default: () => 'RPT-' + uuidv4().slice(0, 8).toUpperCase() },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  testName: { type: String, required: true },
  testCategory: { type: String, required: true },
  doctorName: { type: String },
  testDate: { type: Date, required: true },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String },
  fileType: { type: String, enum: ['pdf', 'jpg', 'png'] },
  status: { type: String, enum: ['pending', 'completed', 'reviewed'], default: 'pending' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  downloadCount: { type: Number, default: 0 },
  version: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
