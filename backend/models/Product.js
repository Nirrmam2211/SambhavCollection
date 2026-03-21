const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  publicId: { type: String },
  alt:      { type: String },
  isPrimary:{ type: Boolean, default: false },
}, { _id: false });

const variantSchema = new mongoose.Schema({
  color:     { type: String },
  colorHex:  { type: String },
  fabric:    { type: String },
  stock:     { type: Number, default: 0 },
  sku:       { type: String },
  images:    [imageSchema],
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [120, 'Name cannot exceed 120 characters'],
  },
  slug: { type: String, unique: true },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  shortDescription: { type: String, maxlength: [300] },
  category: {
    type: String,
    required: true,
    enum: ['ethnic-fusion', 'bandhgala', 'sherwani', 'blazer', 'shirt', 'tee', 'waistcoat', 'kurta', 'other'],
  },
  subcategory: { type: String },
  occasion: [{
    type: String,
    enum: ['wedding', 'festive', 'casual', 'corporate', 'party', 'daily'],
  }],
  price: {
    base:      { type: Number, required: true, min: 0 },
    discounted:{ type: Number, min: 0 },
    currency:  { type: String, default: 'INR' },
  },
  isBespoke:       { type: Boolean, default: true },
  isCustomizable:  { type: Boolean, default: true },
  isFeatured:      { type: Boolean, default: false },
  isPublished:     { type: Boolean, default: false },
  images:          [imageSchema],
  variants:        [variantSchema],
  fabricDetails: {
    primaryFabric:  { type: String },
    composition:    { type: String },
    weight:         { type: String },
    care:           [String],
  },
  craftsmanship: {
    embroideryType: { type: String },
    embroideryHours:{ type: Number },
    artisans:       { type: Number },
    origin:         { type: String, default: 'Mumbai, India' },
  },
  deliveryDays: {
    min: { type: Number, default: 10 },
    max: { type: Number, default: 15 },
  },
  tags:         [String],
  styleWith:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0 },
  },
  soldCount:    { type: Number, default: 0 },
  viewCount:    { type: Number, default: 0 },
  seoTitle:     { type: String, maxlength: 60 },
  seoDesc:      { type: String, maxlength: 160 },
  seoKeywords:  [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ──────────────────────────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ isPublished: 1, isFeatured: 1 });
productSchema.index({ 'price.base': 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ─── Virtual: discount percent ────────────────────────────────────
productSchema.virtual('discountPercent').get(function () {
  if (!this.price.discounted) return 0;
  return Math.round(((this.price.base - this.price.discounted) / this.price.base) * 100);
});

productSchema.virtual('effectivePrice').get(function () {
  return this.price.discounted || this.price.base;
});

// ─── Pre-save: generate slug ──────────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
