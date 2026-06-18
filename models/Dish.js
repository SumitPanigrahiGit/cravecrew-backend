const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Sweets', 'Beverages', 'Thali'],
    required: true
  },
  cuisine: { type: String, default: 'Indian' },
  image: { type: String, default: '' },
  ingredients: [String],
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 30 }, // in minutes
  servings: { type: Number, default: 1 },
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    rating: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  ordersCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dish', dishSchema);
