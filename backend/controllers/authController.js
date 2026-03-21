const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
};

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    res.status(400); throw new Error('Name, email and password are required.');
  }

  const existing = await User.findOne({ email });
  if (existing) { res.status(400); throw new Error('Email already registered.'); }

  const user = await User.create({ name, email, phone, password });

  // Send verification email
  const verifyToken = user.getEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Sambhav Collection — Verify Your Email',
    template: 'emailVerify',
    data: { name: user.name, verifyUrl },
  }).catch(() => {}); // Non-blocking

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'Account created successfully! Please verify your email.',
    token,
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, isVerified: user.isVerified,
    },
  });
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Email and password are required.'); }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid email or password.');
  }

  if (!user.isActive) { res.status(403); throw new Error('Account deactivated. Contact support.'); }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions);

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, isVerified: user.isVerified, avatar: user.avatar,
    },
  });
});

// @route  POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// @route  POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) { res.status(404); throw new Error('No account found with that email.'); }

  const token = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Sambhav Collection — Password Reset',
    template: 'passwordReset',
    data: { name: user.name, resetUrl, expiresIn: '30 minutes' },
  });

  res.json({ success: true, message: 'Password reset email sent.' });
});

// @route  PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) { res.status(400); throw new Error('Token is invalid or has expired.'); }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions);
  res.json({ success: true, message: 'Password reset successful.', token });
});

// @route  GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpire: { $gt: Date.now() },
  });
  if (!user) { res.status(400); throw new Error('Verification link is invalid or expired.'); }

  user.isVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpire = undefined;
  await user.save();
  res.json({ success: true, message: 'Email verified successfully!' });
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price slug');
  res.json({ success: true, user });
});

module.exports = { register, login, logout, forgotPassword, resetPassword, verifyEmail, getMe };
