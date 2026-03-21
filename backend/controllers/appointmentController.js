const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const { sendEmail } = require('../utils/email');

// Available time slots
const TIME_SLOTS = [
  '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM', '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

// @route  GET /api/appointments/slots?date=YYYY-MM-DD
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) { res.status(400); throw new Error('Date is required.'); }

  const startOfDay = new Date(date);
  const endOfDay   = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const booked = await Appointment.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] },
  }).select('timeSlot');

  const bookedSlots = booked.map(a => a.timeSlot);
  const available   = TIME_SLOTS.filter(s => !bookedSlots.includes(s));

  res.json({ success: true, date, allSlots: TIME_SLOTS, available, booked: bookedSlots });
});

// @route  POST /api/appointments
const bookAppointment = asyncHandler(async (req, res) => {
  const { name, email, phone, type, date, timeSlot, occasion, garmentType, notes } = req.body;

  // Check slot availability
  const conflict = await Appointment.findOne({
    date: new Date(date),
    timeSlot,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (conflict) { res.status(409); throw new Error('This time slot is already booked. Please choose another.'); }

  const appointment = await Appointment.create({
    user: req.user?._id,
    name, email, phone, type,
    date: new Date(date),
    timeSlot, occasion, garmentType, notes,
  });

  // Confirmation email
  await sendEmail({
    to: email,
    subject: 'Appointment Confirmed — Sambhav Collection',
    template: 'appointmentConfirm',
    data: { name, appointment },
  }).catch(() => {});

  // Notify admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Appointment: ${type} — ${name}`,
    template: 'appointmentAdmin',
    data: { appointment },
  }).catch(() => {});

  res.status(201).json({ success: true, appointment });
});

// @route  GET /api/appointments/my
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .sort({ date: -1 })
    .populate('assignedTailor', 'name');
  res.json({ success: true, appointments });
});

// @route  GET /api/appointments  [Admin]
const getAllAppointments = asyncHandler(async (req, res) => {
  const { date, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (date) {
    const d = new Date(date);
    query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .sort({ date: 1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('user', 'name email')
    .populate('assignedTailor', 'name');
  res.json({ success: true, total, appointments });
});

// @route  PUT /api/appointments/:id  [Admin]
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!appointment) { res.status(404); throw new Error('Appointment not found.'); }

  if (req.body.status === 'confirmed') {
    await sendEmail({
      to: appointment.email,
      subject: 'Your Appointment is Confirmed — Sambhav Collection',
      template: 'appointmentConfirm',
      data: { name: appointment.name, appointment },
    }).catch(() => {});
  }

  res.json({ success: true, appointment });
});

// @route  DELETE /api/appointments/:id
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) { res.status(404); throw new Error('Appointment not found.'); }

  const isOwner = appointment.user?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized.');
  }

  appointment.status = 'cancelled';
  await appointment.save();
  res.json({ success: true, message: 'Appointment cancelled.' });
});

module.exports = {
  getAvailableSlots, bookAppointment, getMyAppointments,
  getAllAppointments, updateAppointment, cancelAppointment,
};
