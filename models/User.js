const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: String, // hash
  referralCode: String,
  referredBy: String,
  usdtBalance: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false } // <-- Added field
});
module.exports = mongoose.model('User', UserSchema);