const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Order = require('../models/Order');

// Payment integration temporarily disabled. API endpoints will return 503.


// @route  POST /api/payments/razorpay/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  res.status(503).json({ success: false, message: 'Payment is temporarily disabled.' });
});

// @route  POST /api/payments/razorpay/verify
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  res.status(503).json({ success: false, message: 'Payment is temporarily disabled.' });
});

// @route  POST /api/payments/stripe/create-intent
const createStripeIntent = asyncHandler(async (req, res) => {
  res.status(503).json({ success: false, message: 'Payment is temporarily disabled.' });
});

// @route  POST /api/payments/stripe/webhook
const stripeWebhook = asyncHandler(async (req, res) => {
  res.status(503).json({ success: false, message: 'Payment is temporarily disabled.' });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment, createStripeIntent, stripeWebhook };
