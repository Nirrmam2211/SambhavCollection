// userRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const userRouter = express.Router();

userRouter.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price slug');
  res.json({ success: true, user });
}));

userRouter.put('/profile', protect, asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'emailNotifications', 'smsNotifications'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
}));

userRouter.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400); throw new Error('Current password is incorrect.');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully.' });
}));

userRouter.put('/measurements', protect, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { measurements: req.body },
    { new: true }
  );
  res.json({ success: true, measurements: user.measurements });
}));

userRouter.post('/addresses', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
}));

userRouter.put('/addresses/:id', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) { res.status(404); throw new Error('Address not found.'); }
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  Object.assign(addr, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
}));

userRouter.delete('/addresses/:id', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
}));

userRouter.post('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.indexOf(pid);
  if (idx > -1) { user.wishlist.splice(idx, 1); }
  else { user.wishlist.push(pid); }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
}));

module.exports = userRouter;
