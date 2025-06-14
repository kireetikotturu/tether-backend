const express = require('express');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const router = express.Router();

// List deposits for admin
router.get('/deposits', async (req, res) => {
  const { status, date } = req.query;
  let filter = {};
  if (status && status !== "all") filter.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }
  const deposits = await Deposit.find(filter).populate('user', 'email').sort({ createdAt: -1 });
  res.json(deposits.map(d => ({
    ...d.toObject(),
    userEmail: d.user?.email
  })));
});

// Update deposit status (Success/Rejected)
router.patch('/deposits/:id/status', async (req, res) => {
  const { status } = req.body;
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) return res.status(404).json({ msg: 'Deposit not found' });
  const oldStatus = deposit.status;
  deposit.status = status;
  await deposit.save();

  // Only credit user if marking as Success and it wasn't already
  if (status === "Success" && oldStatus !== "Success") {
    const user = await User.findById(deposit.user);
    if (user) {
      user.usdtBalance += deposit.amount;
      await user.save();
    }
  }
  // No action needed for Rejected (funds were never credited)
  res.json(deposit);
});

// List withdrawals for admin
router.get('/withdrawals', async (req, res) => {
  const { status, date } = req.query;
  let filter = {};
  if (status && status !== "all") filter.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }
  const withdrawals = await Withdrawal.find(filter).populate('user', 'email').sort({ createdAt: -1 });
  res.json(withdrawals.map(w => ({
    ...w.toObject(),
    userEmail: w.user?.email
  })));
});

// Update withdrawal status (Success/Rejected)
router.patch('/withdrawals/:id/status', async (req, res) => {
  const { status } = req.body;
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) return res.status(404).json({ msg: 'Withdrawal not found' });
  const oldStatus = withdrawal.status;
  withdrawal.status = status;
  await withdrawal.save();

  // If marking as Rejected and it wasn't already, refund user
  if (status === "Rejected" && oldStatus !== "Rejected") {
    const user = await User.findById(withdrawal.user);
    if (user) {
      user.usdtBalance += withdrawal.amount;
      await user.save();
    }
  }
  // Success: funds already removed at request time, do nothing
  res.json(withdrawal);
});

module.exports = router;