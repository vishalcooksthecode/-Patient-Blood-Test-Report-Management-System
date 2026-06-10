const Report = require('../models/Report');
const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

exports.getDashboardStats = async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [totalPatients, totalReports, todayReports, pendingReports, activeUsers] = await Promise.all([
    Patient.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ createdAt: { $gte: today } }),
    Report.countDocuments({ status: 'pending' }),
    User.countDocuments({ status: 'active' }),
  ]);

  res.json({ totalPatients, totalReports, todayReports, pendingReports, activeUsers });
};

exports.getMonthlyStats = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const [reports, patients] = await Promise.all([
    Report.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Patient.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  res.json({ reports, patients });
};

exports.getTopTests = async (req, res) => {
  const data = await Report.aggregate([
    { $group: { _id: '$testCategory', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);
  res.json(data);
};

exports.getRecentActivity = async (req, res) => {
  const logs = await AuditLog.find().populate('userId', 'name role').sort({ createdAt: -1 }).limit(20);
  res.json(logs);
};
