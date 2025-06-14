const mongoose = require('mongoose');
const DepositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  network: String,
  txHash: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Deposit', DepositSchema);