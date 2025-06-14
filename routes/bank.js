const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth'); // if you use JWT authentication
// const Bank = require('../models/Bank');     // your Mongoose model

// In-memory example store (replace with DB in production!)
let banks = {}; // { userId: [ { _id, name, ifsc, account }, ... ] }

// GET all banks for the current user
router.get('/user/banks', /*auth,*/ (req, res) => {
  const userId = req.user?.id || 'demo'; // Replace with real user id
  res.json(banks[userId] || []);
});

// POST add new bank for the current user
router.post('/user/banks', /*auth,*/ (req, res) => {
  const userId = req.user?.id || 'demo'; // Replace with real user id
  const { name, ifsc, account } = req.body;
  if (!name || !ifsc || !account) return res.status(400).json({ msg: 'All fields required' });
  const bank = { _id: Date.now().toString(), name, ifsc, account };
  banks[userId] = banks[userId] || [];
  banks[userId].push(bank);
  res.json(bank);
});

// DELETE a bank by _id
router.delete('/user/banks/:id', /*auth,*/ (req, res) => {
  const userId = req.user?.id || 'demo'; // Replace with real user id
  const bankId = req.params.id;
  banks[userId] = (banks[userId] || []).filter(b => b._id !== bankId);
  res.json({ success: true });
});

module.exports = router;