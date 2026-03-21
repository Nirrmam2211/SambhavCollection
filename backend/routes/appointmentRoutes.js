// appointmentRoutes.js
const express = require('express');
const apptRouter = express.Router();
const {
  getAvailableSlots, bookAppointment, getMyAppointments,
  getAllAppointments, updateAppointment, cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, admin, optionalAuth } = require('../middleware/auth');

apptRouter.get('/slots',    getAvailableSlots);
apptRouter.post('/',        optionalAuth, bookAppointment);
apptRouter.get('/my',       protect, getMyAppointments);
apptRouter.get('/',         protect, admin, getAllAppointments);
apptRouter.put('/:id',      protect, admin, updateAppointment);
apptRouter.delete('/:id',   protect, cancelAppointment);

module.exports = apptRouter;
