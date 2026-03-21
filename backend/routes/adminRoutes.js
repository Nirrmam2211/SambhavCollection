// adminRoutes.js
const express = require('express');
const adminRouter = express.Router();
const { getDashboard, getAllUsers, updateUser, getRevenueAnalytics } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

adminRouter.use(protect, admin);
adminRouter.get('/dashboard',           getDashboard);
adminRouter.get('/users',               getAllUsers);
adminRouter.put('/users/:id',           updateUser);
adminRouter.get('/analytics/revenue',   getRevenueAnalytics);

module.exports = adminRouter;
