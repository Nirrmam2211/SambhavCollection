const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/',           protect, createOrder);
router.get('/my',          protect, getMyOrders);
router.get('/:id',         protect, getOrder);
router.get('/',            protect, admin, getAllOrders);
router.put('/:id/status',  protect, admin, updateOrderStatus);

module.exports = router;
