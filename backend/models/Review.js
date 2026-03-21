const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, maxlength: 100 },
  body:    { type: String, required: true, maxlength: 1000 },
  images:  [{ url: String, publicId: String }],
  fitRating:     { type: Number, min: 1, max: 5 },
  qualityRating: { type: Number, min: 1, max: 5 },
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved:         { type: Boolean, default: false },
  helpfulVotes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  adminReply: {
    text:      String,
    repliedAt: Date,
  },
}, {
  timestamps: true,
});

// One review per product per user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ─── Static: recalculate product ratings ─────────────────────────
reviewSchema.statics.recalcRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { 'ratings.average': 0, 'ratings.count': 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.recalcRatings(this.product);
});

reviewSchema.post('deleteOne', { document: true }, function () {
  this.constructor.recalcRatings(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
