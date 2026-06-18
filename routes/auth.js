const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'cravecrew_secret_key_2024', { expiresIn: '30d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, city, kitchenName, kitchenDescription, specialties } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const userData = { name, email, password, role, phone, address, city };
    if (role === 'chef') {
      userData.kitchenName = kitchenName;
      userData.kitchenDescription = kitchenDescription;
      userData.specialties = specialties ? specialties.split(',').map(s => s.trim()) : [];
    }

    const user = await User.create(userData);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kitchenName: user.kitchenName,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kitchenName: user.kitchenName,
      isFirstOrder: user.isFirstOrder,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.email;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
