const express = require('express');
const {
  getLiveQueue,
  advanceNextPatient,
  markDone,
  markNoShow,
  toggleEmergencyBump
} = require('../controllers/queueController');
const { registerWalkIn } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.get('/:doctorId', getLiveQueue);

router.use(protect);

// Allow both PUT and POST for /:doctorId/next
router.put('/:doctorId/next', authorize('doctor', 'admin'), advanceNextPatient);
router.post('/:doctorId/next', authorize('doctor', 'admin'), advanceNextPatient);

// Support mark consultation as completed with or without appointmentId param
router.put('/:doctorId/done', authorize('doctor', 'admin'), markDone);
router.put('/:doctorId/done/:appointmentId', authorize('doctor', 'admin'), markDone);

// Support walk-in registration on /queue/walk-in alias as well
router.post('/walk-in', authorize('receptionist', 'admin'), registerWalkIn);

router.put('/:doctorId/no-show', authorize('doctor', 'receptionist', 'admin'), markNoShow);
router.put('/:doctorId/no-show/:appointmentId', authorize('doctor', 'receptionist', 'admin'), markNoShow);
router.put('/:doctorId/emergency/:appointmentId', authorize('receptionist', 'admin'), toggleEmergencyBump);

module.exports = router;
