const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found. Token may be invalid.');
    }

    if (!req.user.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated. Contact support.');
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized. Token is invalid or expired.');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  throw new Error('Access denied. Admin privileges required.');
};

const tailor = (req, res, next) => {
  if (req.user && ['admin', 'tailor'].includes(req.user.role)) return next();
  res.status(403);
  throw new Error('Access denied. Tailor/Admin privileges required.');
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_) {}
  }
  next();
});

module.exports = { protect, admin, tailor, optionalAuth };
