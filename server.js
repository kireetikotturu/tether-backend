const cors = require("cors");
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Auth and Admin middleware
const auth = require('./middleware/auth');
const adminOnly = require('./middleware/adminOnly');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const depositRoutes = require('./routes/deposit');
const withdrawRoutes = require('./routes/withdraw');
const adminPanelRoutes = require('./routes/adminPanelRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/withdraw', withdrawRoutes);

// Admin panel: only for venombar122@gmail.com
app.use('/api/adminpanel', auth, adminOnly, adminPanelRoutes);

app.get('/', (req, res) => res.send('Tether2inr - API running'));

// --- BEGIN: Add in-memory user bank accounts API ---
const banksStore = {}; // userId: [ { _id, name, ifsc, account }, ... ]

function getUserId(req) {
  // Use authenticated user if available, otherwise demo
  return req.user?.id || 'demo';
}

// GET all banks for the current user
app.get('/api/user/banks', (req, res) => {
  const userId = getUserId(req);
  res.json(banksStore[userId] || []);
});

// POST add new bank for the current user
app.post('/api/user/banks', (req, res) => {
  const userId = getUserId(req);
  const { name, ifsc, account } = req.body;
  if (!name || !ifsc || !account) {
    return res.status(400).json({ msg: 'All fields required' });
  }
  const bank = { _id: Date.now().toString(), name, ifsc, account };
  if (!banksStore[userId]) banksStore[userId] = [];
  banksStore[userId].push(bank);
  res.json(bank);
});

// DELETE a bank by _id
app.delete('/api/user/banks/:id', (req, res) => {
  const userId = getUserId(req);
  const bankId = req.params.id;
  banksStore[userId] = (banksStore[userId] || []).filter(b => b._id !== bankId);
  res.json({ success: true });
});
// --- END: Add in-memory user bank accounts API ---

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.listen(process.env.PORT, () => {
    console.log('🚀 Backend running on port', process.env.PORT);
  });
}).catch(err => console.error('MongoDB connect error:', err));
