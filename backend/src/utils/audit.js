const AuditLog = require('../models/AuditLog');

const audit = async (userId, action, resource, ip, userAgent, status = 'success') => {
  try {
    await AuditLog.create({ userId, action, resource, ip, userAgent, status });
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
};

module.exports = audit;
