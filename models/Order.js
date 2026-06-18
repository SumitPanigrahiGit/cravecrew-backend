const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  upiTransactionId: { type: String },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'placed'
  },
  deliveryAddress: { type: String, required: true },
  specialInstructions: { type: String },
  isFirstOrder: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
