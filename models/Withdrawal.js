const mongoose = require('mongoose');
const WithdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'bank' },
  bank: {
    name: String,
    ifsc: String,
    account: String
  },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Withdrawal', WithdrawalSchema);