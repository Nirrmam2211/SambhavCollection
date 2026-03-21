const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @route  GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, sort = '-createdAt',
    category, occasion, minPrice, maxPrice,
    search, isFeatured, isBespoke,
  } = req.query;

  const query = {};
  if (!req.query.all || req.user?.role !== 'admin') {
    query.isPublished = true;
  }

  if (category)   query.category = category;
  if (occasion)   query.occasion = { $in: [occasion] };
  if (isFeatured) query.isFeatured = true;
  if (isBespoke !== undefined) query.isBespoke = isBespoke === 'true';
  if (minPrice || maxPrice) {
    query['price.base'] = {};
    if (minPrice) query['price.base'].$gte = Number(minPrice);
    if (maxPrice) query['price.base'].$lte = Number(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const sortMap = {
    'price-asc':  { 'price.base': 1 },
    'price-desc': { 'price.base': -1 },
    'newest':     { createdAt: -1 },
    'rating':     { 'ratings.average': -1 },
    'popular':    { soldCount: -1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .select('name slug images price ratings soldCount isBespoke category occasion isFeatured');

  res.json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    products,
  });
});

// @route  GET /api/products/:slug
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isPublished: true })
    .populate('styleWith', 'name slug images price');

  if (!product) { res.status(404); throw new Error('Product not found.'); }

  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });
  res.json({ success: true, product });
});

// @route  POST /api/products  [Admin]
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @route  PUT /api/products/:id  [Admin]
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) { res.status(404); throw new Error('Product not found.'); }
  res.json({ success: true, product });
});

// @route  DELETE /api/products/:id  [Admin]
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found.'); }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted.' });
});

// @route  GET /api/products/featured
const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isPublished: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('name slug images price ratings isBespoke category');
  res.json({ success: true, products });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeatured };
