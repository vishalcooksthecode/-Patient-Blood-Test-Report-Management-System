const Patient = require('../models/Patient');
const User = require('../models/User');

exports.createPatient = async (req, res) => {
  const { name, dob, gender, bloodGroup, address, mobile, email, emergencyContact } = req.body;

  let user = null;
  if (email || mobile) {
    const existingUser = await User.findOne({ $or: [email ? { email } : null, mobile ? { mobile } : null].filter(Boolean) });
    if (!existingUser) {
      user = await User.create({ name, email, mobile, password: mobile || 'Medilab@123', role: 'patient' });
    } else {
      user = existingUser;
    }
  }

  const patient = await Patient.create({ name, dob, gender, bloodGroup, address, mobile, email, emergencyContact, userId: user?._id });
  if (user) { user.patientId = patient._id; await user.save(); }

  res.status(201).json(patient);
};

exports.getPatients = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const query = search
    ? { $or: [{ name: new RegExp(search, 'i') }, { patientId: new RegExp(search, 'i') }, { mobile: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
    : {};
  const [patients, total] = await Promise.all([
    Patient.find(query).skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 }),
    Patient.countDocuments(query),
  ]);
  res.json({ patients, total, pages: Math.ceil(total / limit), page: +page });
};

exports.getPatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
};

exports.updatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
};

exports.deletePatient = async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json({ message: 'Patient deleted' });
};
