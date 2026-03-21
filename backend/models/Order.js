const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:          { type: String, required: true },
  image:         { type: String },
  price:         { type: Number, required: true },
  quantity:      { type: Number, required: true, default: 1 },
  isBespoke:     { type: Boolean, default: false },
  customizations: {
    fabric:    String,
    color:     String,
    embroidery:String,
    notes:     String,
  },
  measurements: { type: mongoose.Schema.Types.Mixed },
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:       [orderItemSchema],

  shippingAddress: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    line1:   { type: String, required: true },
    line2:   String,
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },

  pricing: {
    subtotal:        { type: Number, required: true },
    shippingCharge:  { type: Number, default: 0 },
    discount:        { type: Number, default: 0 },
    couponCode:      String,
    tax:             { type: Number, default: 0 },
    taxPercent:      { type: Number, default: 18 },
    total:           { type: Number, required: true },
  },

  payment: {
    method:    { type: String, enum: ['razorpay', 'stripe', 'cod', 'upi'], required: true },
    status:    { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    stripePaymentIntentId: String,
    paidAt:    Date,
  },

  status: {
    type: String,
    enum: ['placed', 'confirmed', 'in_tailoring', 'quality_check', 'ready', 'dispatched', 'delivered', 'cancelled', 'refund_requested', 'refunded'],
    default: 'placed',
  },
  statusHistory: [statusHistorySchema],

  shipping: {
    courier:        String,
    trackingNumber: String,
    trackingUrl:    String,
    estimatedDelivery: Date,
    deliveredAt:    Date,
  },

  isGift:       { type: Boolean, default: false },
  giftMessage:  String,
  notes:        String,
  invoiceUrl:   String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ─── Indexes ──────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// ─── Pre-save: generate order number ─────────────────────────────
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  // Push to status history on status change
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
