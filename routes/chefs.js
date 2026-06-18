const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Dish = require('../models/Dish');

// Get all chefs (public)
router.get('/', async (req, res) => {
  try {
    const { city, search } = req.query;
    const filter = { role: 'chef' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (search) filter.kitchenName = { $regex: search, $options: 'i' };

    const chefs = await User.find(filter).select('-password').sort({ rating: -1 });
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chef profile with dishes
router.get('/:id', async (req, res) => {
  try {
    const chef = await User.findById(req.params.id).select('-password');
    if (!chef || chef.role !== 'chef') return res.status(404).json({ message: 'Chef not found' });
    const dishes = await Dish.find({ chef: req.params.id, isAvailable: true });
    res.json({ chef, dishes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
