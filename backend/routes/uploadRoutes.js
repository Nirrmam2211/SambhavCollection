// uploadRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const { uploadProduct, uploadProfile, cloudinary } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/auth');
const uploadRouter = express.Router();

uploadRouter.post('/product', protect, admin,
  uploadProduct.array('images', 10),
  asyncHandler(async (req, res) => {
    const urls = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    res.json({ success: true, images: urls });
  })
);

uploadRouter.post('/profile', protect,
  uploadProfile.single('avatar'),
  asyncHandler(async (req, res) => {
    res.json({ success: true, url: req.file.path, publicId: req.file.filename });
  })
);

uploadRouter.delete('/product/:publicId', protect, admin, asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(req.params.publicId);
  res.json({ success: true, message: 'Image deleted.' });
}));

module.exports = uploadRouter;
