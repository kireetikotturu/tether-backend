const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.get('/history', auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id }).sort({ createdAt: -1 });
    const withdrawals = await Withdrawal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ deposits, withdrawals });
  } catch (e) {
    console.error("Error in /history:", e); // This will print error to your backend console!
    res.status(500).json({ msg: 'Server error', error: e.toString() });
  }
});

// Update Bank Details
router.post('/bank', auth, async (req, res) => {
  const { bankDetails } = req.body;
  await User.findByIdAndUpdate(req.user.id, { bankDetails });
  res.json({ msg: 'Bank details updated.' });
});

router.get('/history', auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id }).sort({ createdAt: -1 });
    const withdrawals = await Withdrawal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ deposits, withdrawals });
  } catch (e) {
    res.status(500).json({ msg: 'Server error', error: e.toString() });
  }
});

module.exports = router;