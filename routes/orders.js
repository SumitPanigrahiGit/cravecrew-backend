const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, chefOnly, customerOnly } = require('../middleware/auth');

// Customer: Place order
router.post('/', protect, async (req, res) => {
  try {
    const { items, chef, paymentMethod, deliveryAddress, specialInstructions, upiTransactionId } = req.body;
    const customer = await User.findById(req.user._id);

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isFirstOrder = customer.isFirstOrder;
    const discountApplied = isFirstOrder ? Math.min(100, totalAmount) : 0;
    const finalAmount = totalAmount - discountApplied;

    const order = await Order.create({
      customer: req.user._id,
      chef,
      items,
      totalAmount,
      discountApplied,
      finalAmount,
      paymentMethod,
      deliveryAddress,
      specialInstructions,
      upiTransactionId,
      isFirstOrder,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid'
    });

    if (isFirstOrder) {
      await User.findByIdAndUpdate(req.user._id, { isFirstOrder: false });
    }

    const populated = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('chef', 'name kitchenName phone')
      .populate('items.dish', 'name image');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer: Get own orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('chef', 'name kitchenName')
      .populate('items.dish', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chef: Get orders for their kitchen
router.get('/chef-orders', protect, chefOnly, async (req, res) => {
  try {
    const orders = await Order.find({ chef: req.user._id })
      .populate('customer', 'name phone address')
      .populate('items.dish', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chef: Update order status
router.put('/:id/status', protect, chefOnly, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, chef: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status;
    order.updatedAt = Date.now();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
