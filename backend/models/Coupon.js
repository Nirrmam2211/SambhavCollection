const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  type:        { type: String, enum: ['percent', 'flat'], required: true },
  value:       { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   { type: Number },
  usageLimit:    { type: Number, default: null },
  usedCount:     { type: Number, default: 0 },
  usedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive:      { type: Boolean, default: true },
  validFrom:     { type: Date, default: Date.now },
  validUntil:    { type: Date, required: true },
  applicableCategories: [String],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
