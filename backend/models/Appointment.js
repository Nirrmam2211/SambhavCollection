const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String, required: true },
  type: {
    type: String,
    enum: ['fitting', 'consultation', 'measurement', 'delivery_pickup', 'alteration'],
    required: true,
  },
  date:       { type: Date, required: true },
  timeSlot:   { type: String, required: true }, // e.g. "11:00 AM - 12:00 PM"
  occasion:   { type: String },
  garmentType:{ type: String },
  notes:      { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
  },
  assignedTailor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reminderSent:   { type: Boolean, default: false },
  confirmationToken: String,
}, {
  timestamps: true,
});

appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ user: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
