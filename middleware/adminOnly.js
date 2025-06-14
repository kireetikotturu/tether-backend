module.exports = function adminOnly(req, res, next) {
  // Ensure user is authenticated and has admin privileges
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    return res.status(403).json({ msg: "Forbidden: Admins only" });
  }
};