const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();

// Registration Step 1: Request OTP
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, referralCode } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email exists' });
    if (await User.findOne({ phone })) return res.status(400).json({ msg: 'Phone exists' });

    // Check if there's already a pending OTP for this email/phone, remove it
    await OtpVerification.deleteMany({ $or: [ { email }, { phone } ] });

    const hash = await bcrypt.hash(password, 10);
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referredByUser = referralCode ? await User.findOne({ referralCode }) : null;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP verification record
    await OtpVerification.create({
      email,
      phone,
      password: hash,
      referralCode: userReferralCode,
      referredBy: referredByUser ? referredByUser.referralCode : null,
      otp,
      otpExpiresAt
    });

    // Send OTP via email (for demo, you can switch to SMS)
    await sendEmail(email, 'Your OTP Code', `Your OTP code is: ${otp}`);

    res.json({ msg: 'OTP sent to your email. Please verify to complete registration.' });
  } catch (e) {
    res.status(500).json({ msg: 'Register error', error: e.message });
  }
});

// Registration Step 2: Verify OTP and create user
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OtpVerification.findOne({ email });

    if (!record) return res.status(400).json({ msg: 'No OTP request found for this email.' });
    if (record.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP.' });
    if (record.otpExpiresAt < new Date()) return res.status(400).json({ msg: 'OTP expired.' });

    // Check again to avoid race conditions
    if (await User.findOne({ email: record.email })) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ msg: 'Email already registered.' });
    }

    if (await User.findOne({ phone: record.phone })) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ msg: 'Phone already registered.' });
    }

    // Create user
    const user = new User({
      email: record.email,
      phone: record.phone,
      password: record.password,
      referralCode: record.referralCode,
      referredBy: record.referredBy
    });
    await user.save();
    await OtpVerification.deleteOne({ _id: record._id });

    const token = jwt.sign({ user: { id: user._id, isAdmin: user.isAdmin } }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        email: user.email,
        usdtBalance: user.usdtBalance,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin
      }
    });
  } catch (e) {
    res.status(500).json({ msg: 'OTP verification error', error: e.message });
  }
});

// Login - remains the same!
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ user: { id: user._id, isAdmin: user.isAdmin } }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        email: user.email,
        usdtBalance: user.usdtBalance,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin
      }
    });
  } catch (e) {
    res.status(500).json({ msg: 'Login error', error: e.message });
  }
});

module.exports = router;