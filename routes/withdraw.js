const express = require('express');
const auth = require('../middleware/auth');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let { amount, bank, method } = req.body;
    amount = parseFloat(amount);

    // Debug log to confirm code is running
    console.log("WITHDRAW: user:", user && user._id, "req.body:", req.body);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }
    if (amount > Number(user.usdtBalance)) {
      return res.status(400).json({ msg: `Insufficient balance. Your balance: ${user.usdtBalance}` });
    }
    if (!bank || !bank.name || !bank.ifsc || !bank.account) {
      return res.status(400).json({ msg: 'Bank details missing.' });
    }

    user.usdtBalance = Number((user.usdtBalance - amount).toFixed(8));
    await user.save();

    const withdrawal = new Withdrawal({
      user: user._id,
      amount,
      method: method || 'bank',
      bank
    });
    await withdrawal.save();

    res.json({ msg: 'Withdraw request submitted.', withdrawal, newBalance: user.usdtBalance });
  } catch (err) {
    console.error("Withdraw error:", err);
    res.status(500).json({ msg: 'Server error', error: err.toString() });
  }
});

module.exports = router;