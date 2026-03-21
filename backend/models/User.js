const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const measurementSchema = new mongoose.Schema({
  chest:         { type: Number },
  shoulder:      { type: Number },
  waist:         { type: Number },
  hip:           { type: Number },
  sleeveLength:  { type: Number },
  neckCircum:    { type: Number },
  backLength:    { type: Number },
  bicep:         { type: Number },
  wrist:         { type: Number },
  frontLength:   { type: Number },
  inseam:        { type: Number },
  thigh:         { type: Number },
  height:        { type: Number },
  weight:        { type: Number },
  notes:         { type: String },
  takenBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  takenAt:       { type: Date, default: Date.now },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  label:      { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  name:       { type: String, required: true },
  phone:      { type: String, required: true },
  line1:      { type: String, required: true },
  line2:      { type: String },
  city:       { type: String, required: true },
  state:      { type: String, required: true },
  pincode:    { type: String, required: true },
  country:    { type: String, default: 'India' },
  isDefault:  { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'tailor'],
    default: 'customer',
  },
  isVerified:       { type: Boolean, default: false },
  isActive:         { type: Boolean, default: true },
  addresses:        [addressSchema],
  measurements:     measurementSchema,
  wishlist:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  emailNotifications: { type: Boolean, default: true },
  smsNotifications:   { type: Boolean, default: false },

  // Password reset
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,

  // Email verification
  emailVerifyToken:     String,
  emailVerifyExpire:    Date,

  lastLogin:  { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ───────────────────────────────────────────────────────
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

// ─── Virtual: Orders ──────────────────────────────────────────────
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
});

// ─── Pre-save: Hash Password ──────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  return token;
};

userSchema.methods.getEmailVerifyToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

module.exports = mongoose.model('User', userSchema);
