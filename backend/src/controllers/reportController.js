const Report = require('../models/Report');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../middleware/upload');
const { sendEmail, reportNotificationTemplate } = require('../utils/email');

exports.uploadReport = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const { patientId, testName, testCategory, doctorName, testDate, status } = req.body;

  const patient = await Patient.findById(patientId);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  const ext = req.file.mimetype.split('/')[1];
  const result = await uploadToCloudinary(req.file.buffer, 'medilab/reports');

  const report = await Report.create({
    patientId,
    testName,
    testCategory,
    doctorName,
    testDate,
    status: status || 'pending',
    fileUrl: result.secure_url,
    filePublicId: result.public_id,
    fileType: ext === 'jpeg' ? 'jpg' : ext,
    uploadedBy: req.user._id,
  });

  // Notify patient
  const patientUser = await User.findOne({ patientId: patient._id });
  if (patientUser) {
    await Notification.create({
      userId: patientUser._id,
      title: 'New Report Available',
      message: `Your ${testName} report has been uploaded.`,
      type: 'report',
    });
    if (patientUser.email) {
      await sendEmail({ to: patientUser.email, subject: 'New Report Available', html: reportNotificationTemplate(patient.name, testName) }).catch(() => {});
    }
  }

  res.status(201).json(await report.populate('patientId', 'name patientId'));
};

exports.getReports = async (req, res) => {
  const { patientId, search, status, category, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query = {};
  if (patientId) query.patientId = patientId;
  if (status) query.status = status;
  if (category) query.testCategory = category;
  if (startDate || endDate) {
    query.testDate = {};
    if (startDate) query.testDate.$gte = new Date(startDate);
    if (endDate) query.testDate.$lte = new Date(endDate);
  }
  if (search) {
    query.$or = [{ testName: new RegExp(search, 'i') }, { reportId: new RegExp(search, 'i') }];
  }

  // Patients can only see their own reports
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.json({ reports: [], total: 0 });
    query.patientId = patient._id;
  }

  const [reports, total] = await Promise.all([
    Report.find(query).populate('patientId', 'name patientId').populate('uploadedBy', 'name').skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 }),
    Report.countDocuments(query),
  ]);

  res.json({ reports, total, pages: Math.ceil(total / limit), page: +page });
};

exports.getReport = async (req, res) => {
  const report = await Report.findById(req.params.id).populate('patientId').populate('uploadedBy', 'name');
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
};

exports.downloadReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  report.downloadCount += 1;
  await report.save();
  res.json({ fileUrl: report.fileUrl, downloadCount: report.downloadCount });
};

exports.updateReportStatus = async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
};

exports.deleteReport = async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json({ message: 'Report deleted' });
};
