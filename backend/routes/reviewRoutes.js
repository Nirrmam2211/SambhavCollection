// reviewRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const { protect, admin } = require('../middleware/auth');
const reviewRouter = express.Router();

reviewRouter.get('/product/:productId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar').sort({ createdAt: -1 });
  res.json({ success: true, reviews });
}));

reviewRouter.post('/', protect, asyncHandler(async (req, res) => {
  const exists = await Review.findOne({ product: req.body.product, user: req.user._id });
  if (exists) { res.status(400); throw new Error('You have already reviewed this product.'); }
  const review = await Review.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, review });
}));

reviewRouter.put('/:id/approve', protect, admin, asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json({ success: true, review });
}));

reviewRouter.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found.'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized.');
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted.' });
}));

module.exports = reviewRouter;
