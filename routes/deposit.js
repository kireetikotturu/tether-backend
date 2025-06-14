const express = require('express');
const auth = require('../middleware/auth');
const Deposit = require('../models/Deposit');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { network, amount, txHash } = req.body;
  const deposit = new Deposit({
    user: req.user.id,      // Now matches model
    network,
    amount,
    txHash
  });
  await deposit.save();
  res.json({ msg: 'Deposit submitted. Awaiting admin approval.', deposit });
});

module.exports = router;