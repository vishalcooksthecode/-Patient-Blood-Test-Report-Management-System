require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@medilab.com' });
  if (existing) { console.log('Admin already exists'); process.exit(0); }

  await User.create({
    name: 'System Admin',
    email: 'admin@medilab.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  });

  await User.create({
    name: 'Lab Technician',
    email: 'lab@medilab.com',
    password: 'Lab@12345',
    role: 'lab_staff',
    status: 'active',
  });

  await User.create({
    name: 'John Patient',
    email: 'patient@medilab.com',
    mobile: '9876543210',
    password: 'Patient@123',
    role: 'patient',
    status: 'active',
  });

  console.log('✅ Seed complete');
  console.log('   Admin    → admin@medilab.com    / Admin@123');
  console.log('   Staff    → lab@medilab.com      / Lab@12345');
  console.log('   Patient  → patient@medilab.com  / Patient@123');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
