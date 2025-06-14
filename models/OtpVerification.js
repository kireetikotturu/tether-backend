const mongoose = require('mongoose');
const OtpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // hashed
  referralCode: String,
  referredBy: String,
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true }
});
module.exports = mongoose.model('OtpVerification', OtpVerificationSchema);