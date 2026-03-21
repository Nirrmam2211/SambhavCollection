const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Appointment = require('../models/Appointment');

// @route  GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders, monthOrders, lastMonthOrders,
    totalRevenue, monthRevenue,
    totalUsers, newUsersMonth,
    totalProducts, publishedProducts,
    pendingAppointments,
    recentOrders,
    ordersByStatus,
    topProducts,
    revenueByMonth,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),

    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),

    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),

    Product.countDocuments(),
    Product.countDocuments({ isPublished: true }),

    Appointment.countDocuments({ status: 'pending' }),

    Order.find().sort({ createdAt: -1 }).limit(10)
      .populate('user', 'name email')
      .select('orderNumber status pricing.total createdAt payment.status'),

    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', slug: '$product.slug', totalSold: 1, revenue: 1 } },
    ]),

    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders:  { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const orderGrowth = lastMonthOrders > 0
    ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
    : 100;

  res.json({
    success: true,
    stats: {
      orders:    { total: totalOrders, thisMonth: monthOrders, growth: orderGrowth },
      revenue:   { total: totalRevenue[0]?.total || 0, thisMonth: monthRevenue[0]?.total || 0 },
      users:     { total: totalUsers, newThisMonth: newUsersMonth },
      products:  { total: totalProducts, published: publishedProducts },
      appointments: { pending: pendingAppointments },
    },
    recentOrders,
    ordersByStatus,
    topProducts,
    revenueByMonth,
  });
});

// @route  GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('-password');
  res.json({ success: true, total, users });
});

// @route  PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['role', 'isActive', 'isVerified'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found.'); }
  res.json({ success: true, user });
});

// @route  GET /api/admin/analytics/revenue
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = '12months' } = req.query;
  const months = period === '6months' ? 6 : 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const data = await Order.aggregate([
    { $match: { 'payment.status': 'completed', createdAt: { $gte: startDate } } },
    { $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      revenue: { $sum: '$pricing.total' },
      orders:  { $sum: 1 },
      avgOrder:{ $avg: '$pricing.total' },
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const categoryRevenue = await Order.aggregate([
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
    { $unwind: '$prod' },
    { $group: { _id: '$prod.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, count: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
  ]);

  res.json({ success: true, monthlyRevenue: data, categoryRevenue });
});

module.exports = { getDashboard, getAllUsers, updateUser, getRevenueAnalytics };
