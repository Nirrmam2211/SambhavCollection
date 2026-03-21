const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendEmail } = require('../utils/email');

// @route  POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, payment, couponCode, isGift, giftMessage, notes } = req.body;

  if (!items?.length) { res.status(400); throw new Error('No order items provided.'); }

  // Validate products & build items
  let subtotal = 0;
  const orderItems = await Promise.all(items.map(async (item) => {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product not found: ${item.product}`);
    const price = product.price.discounted || product.price.base;
    subtotal += price * item.quantity;
    return {
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price,
      quantity: item.quantity,
      isBespoke: item.isBespoke || product.isBespoke,
      customizations: item.customizations || {},
      measurements: item.measurements || {},
    };
  }));

  // Apply coupon
  let discount = 0;
  let couponUsed = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });
    if (coupon && subtotal >= coupon.minOrderValue) {
      if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
        if (!coupon.usedBy.includes(req.user._id)) {
          discount = coupon.type === 'percent'
            ? Math.min((coupon.value / 100) * subtotal, coupon.maxDiscount || Infinity)
            : coupon.value;
          couponUsed = coupon;
        }
      }
    }
  }

  const shippingCharge = subtotal >= 5000 ? 0 : 150;
  const taxPercent = 18; // GST
  const taxableAmount = subtotal - discount + shippingCharge;
  const tax = Math.round((taxableAmount * taxPercent) / (100 + taxPercent)); // GST inclusive
  const total = taxableAmount;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    pricing: { subtotal, shippingCharge, discount, couponCode, tax, taxPercent, total },
    payment: { method: payment.method },
    isGift, giftMessage, notes,
  });

  // Mark coupon as used
  if (couponUsed) {
    couponUsed.usedCount++;
    couponUsed.usedBy.push(req.user._id);
    await couponUsed.save();
  }

  // Update product sold counts
  await Promise.all(orderItems.map(item =>
    Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity } })
  ));

  // Send confirmation email
  sendEmail({
    to: req.user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    template: 'orderConfirm',
    data: { name: req.user.name, order },
  }).catch(() => {});

  res.status(201).json({ success: true, order });
});

// @route  GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('orderNumber status pricing.total items createdAt payment.status');
  res.json({ success: true, total, orders });
});

// @route  GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) { res.status(404); throw new Error('Order not found.'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Access denied.');
  }
  res.json({ success: true, order });
});

// @route  PUT /api/orders/:id/status  [Admin]
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found.'); }
  order.status = status;
  order.statusHistory.push({ status, message, updatedBy: req.user._id });
  if (status === 'dispatched' && req.body.tracking) {
    order.shipping = { ...order.shipping, ...req.body.tracking };
  }
  if (status === 'delivered') {
    order.shipping.deliveredAt = new Date();
  }
  await order.save();

  sendEmail({
    to: order.user.email,
    subject: `Order Update — ${order.orderNumber}`,
    template: 'orderStatus',
    data: { name: order.user.name, order, message },
  }).catch(() => {});

  res.json({ success: true, order });
});

// @route  GET /api/orders  [Admin]
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('user', 'name email phone');
  res.json({ success: true, total, orders });
});

module.exports = { createOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders };
