const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');
const { protect, chefOnly } = require('../middleware/auth');

// Get all available dishes (public)
router.get('/', async (req, res) => {
  try {
    const { category, isVeg, search, chef } = req.query;
    const filter = { isAvailable: true };
    if (category) filter.category = category;
    if (isVeg !== undefined) filter.isVeg = isVeg === 'true';
    if (chef) filter.chef = chef;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const dishes = await Dish.find(filter).populate('chef', 'name kitchenName city rating avatar');
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single dish
router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('chef', 'name kitchenName city rating phone');
    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chef: Create dish
router.post('/', protect, chefOnly, async (req, res) => {
  try {
    const dish = await Dish.create({ ...req.body, chef: req.user._id });
    res.status(201).json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chef: Update dish
router.put('/:id', protect, chefOnly, async (req, res) => {
  try {
    const dish = await Dish.findOne({ _id: req.params.id, chef: req.user._id });
    if (!dish) return res.status(404).json({ message: 'Dish not found or unauthorized' });
    const updated = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chef: Delete dish
router.delete('/:id', protect, chefOnly, async (req, res) => {
  try {
    const dish = await Dish.findOne({ _id: req.params.id, chef: req.user._id });
    if (!dish) return res.status(404).json({ message: 'Dish not found or unauthorized' });
    await dish.deleteOne();
    res.json({ message: 'Dish removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chef: Get own dishes
router.get('/chef/my-dishes', protect, chefOnly, async (req, res) => {
  try {
    const dishes = await Dish.find({ chef: req.user._id });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    const { rating, comment } = req.body;
    dish.reviews.push({ user: req.user._id, rating, comment });
    dish.rating = dish.reviews.reduce((a, r) => a + r.rating, 0) / dish.reviews.length;
    await dish.save();
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
