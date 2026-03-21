// ─── productRoutes.js ─────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeatured } = require('../controllers/productController');
const { protect, admin, optionalAuth } = require('../middleware/auth');

router.get('/',            optionalAuth, getProducts);
router.get('/featured',    getFeatured);
router.get('/:slug',       getProduct);
router.post('/',           protect, admin, createProduct);
router.put('/:id',         protect, admin, updateProduct);
router.delete('/:id',      protect, admin, deleteProduct);

module.exports = router;
