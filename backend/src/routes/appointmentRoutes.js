const express = require('express');
const {
  bookAppointment,
  registerWalkIn,
  checkInAppointment,
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
  getDoctorAppointments
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(protect);

router.post('/book', authorize('patient', 'doctor', 'receptionist', 'admin'), bookAppointment);
router.post('/walk-in', authorize('receptionist', 'doctor', 'admin'), registerWalkIn);
router.put('/:id/check-in', authorize('patient', 'doctor', 'receptionist', 'admin'), checkInAppointment);
router.put('/:id/cancel', authorize('patient', 'doctor', 'receptionist', 'admin'), cancelAppointment);
router.put('/:id/reschedule', authorize('patient', 'doctor', 'receptionist', 'admin'), rescheduleAppointment);
router.get('/my', getMyAppointments);
router.get('/doctor/:doctorId', authorize('doctor', 'receptionist', 'admin'), getDoctorAppointments);

module.exports = router;

