// newsletterRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/email');
const newsletterRouter = express.Router();

const Subscriber = mongoose.model('Subscriber', new mongoose.Schema({
  email:       { type: String, required: true, unique: true, lowercase: true },
  name:        String,
  isActive:    { type: Boolean, default: true },
  subscribedAt:{ type: Date, default: Date.now },
}));

newsletterRouter.post('/subscribe', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  const existing = await Subscriber.findOne({ email });
  if (existing) {
    if (!existing.isActive) { existing.isActive = true; await existing.save(); }
    return res.json({ success: true, message: 'Already subscribed! Welcome back.' });
  }
  await Subscriber.create({ email, name });
  await sendEmail({
    to: email,
    subject: 'Welcome to Sambhav Collection Newsletter',
    html: `<div style="font-family:Georgia,serif;padding:40px;background:#f7f2eb;max-width:600px;margin:0 auto;">
      <h2 style="color:#0a0a0a;">Welcome, ${name || 'Valued Customer'}!</h2>
      <p style="color:#6e665c;">You're now part of the Sambhav inner circle. Expect early access, new arrivals and exclusive offers.</p>
      <p style="color:#b8922a;font-style:italic;">Every stitch. Your story.</p>
    </div>`,
  }).catch(() => {});
  res.status(201).json({ success: true, message: 'Subscribed successfully! Welcome to the family.' });
}));

newsletterRouter.post('/unsubscribe', asyncHandler(async (req, res) => {
  await Subscriber.findOneAndUpdate({ email: req.body.email }, { isActive: false });
  res.json({ success: true, message: 'Unsubscribed successfully.' });
}));

module.exports = newsletterRouter;
