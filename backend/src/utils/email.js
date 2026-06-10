const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: `"MediLab Portal" <${process.env.EMAIL_USER}>`, to, subject, html });
};

const otpEmailTemplate = (otp) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
    <h2 style="color:#1976d2">MediLab Report Portal</h2>
    <p>Your password reset OTP is:</p>
    <h1 style="letter-spacing:8px;color:#1976d2">${otp}</h1>
    <p>This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
  </div>`;

const reportNotificationTemplate = (patientName, testName) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
    <h2 style="color:#1976d2">New Report Available</h2>
    <p>Dear ${patientName},</p>
    <p>Your <strong>${testName}</strong> report has been uploaded. Login to view and download it.</p>
  </div>`;

module.exports = { sendEmail, otpEmailTemplate, reportNotificationTemplate };
