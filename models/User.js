const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'chef'], required: true },
  phone: { type: String, trim: true },
  address: { type: String },
  city: { type: String },
  avatar: { type: String, default: '' },

  // Chef-specific fields
  kitchenName: { type: String },
  kitchenDescription: { type: String },
  specialties: [String],
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  isFirstOrder: { type: Boolean, default: true }, // for ₹100 off promo

  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
