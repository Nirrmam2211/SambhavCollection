const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route  POST /api/payments/razorpay/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found.'); }

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(order.pricing.total * 100), // paise
    currency: 'INR',
    receipt: order.orderNumber,
    notes: { orderId: order._id.toString() },
  });

  order.payment.razorpayOrderId = rzpOrder.id;
  await order.save();

  res.json({
    success: true,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @route  POST /api/payments/razorpay/verify
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const sign = razorpayOrderId + '|' + razorpayPaymentId;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expected !== razorpaySignature) {
    res.status(400); throw new Error('Payment verification failed. Invalid signature.');
  }

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found.'); }

  order.payment.status            = 'completed';
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.paidAt            = new Date();
  order.status                    = 'confirmed';
  await order.save();

  res.json({ success: true, message: 'Payment verified. Order confirmed!', order });
});

// @route  POST /api/payments/stripe/create-intent
const createStripeIntent = asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found.'); }

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(order.pricing.total * 100),
    currency: 'inr',
    metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
  });

  order.payment.stripePaymentIntentId = paymentIntent.id;
  await order.save();

  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

// @route  POST /api/payments/stripe/webhook
const stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400); throw new Error(`Webhook error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = await Order.findById(intent.metadata.orderId);
    if (order) {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();
    }
  }

  res.json({ received: true });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment, createStripeIntent, stripeWebhook };
