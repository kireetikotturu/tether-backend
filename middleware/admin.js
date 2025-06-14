const User = require('../models/User');

module.exports = async function (req, res, next) {
  const user = await User.findById(req.user.id);
  if (user && (user.isAdmin || user.email === process.env.EMAIL_USER)) {
    next();
  } else {
    res.status(403).json({ msg: 'Admin only' });
  }
};