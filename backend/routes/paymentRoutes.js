const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, createStripeIntent, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify',       protect, verifyRazorpayPayment);
router.post('/stripe/create-intent',  protect, createStripeIntent);
router.post('/stripe/webhook',        express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
