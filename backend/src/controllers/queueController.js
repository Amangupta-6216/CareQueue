const QueueEntry = require('../models/QueueEntry');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const queueManager = require('../dsa/QueueManager');
const {
  emitQueueUpdate,
  emitPatientStatusChange,
  emitDoctorNextPatient
} = require('../config/socket');

const AVG_CONSULTATION_MINS = 15;

/**
 * Calculates completed consultations for a specific doctor on a specific date.
 * Counts unique consultations that were scheduled for that date OR completed during that calendar day.
 */
const getSeenCountForDate = async (doctorId, requestedDate) => {
  try {
    const targetDate = requestedDate || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00');
    const endOfDay = new Date(targetDate + 'T23:59:59.999');

    // Count done appointments for this doctor on this date
    const doneApts = await Appointment.find({
      doctor: doctorId,
      status: 'done',
      $or: [
        { date: targetDate },
        { updatedAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    }).select('_id');

    const doneAptIds = doneApts.map(a => a._id.toString());

    // Also check QueueEntry
    const doneQEs = await QueueEntry.find({
      doctorId,
      status: 'done',
      updatedAt: { $gte: startOfDay, $lte: endOfDay }
    }).select('appointmentId');

    const doneQEIds = doneQEs.map(q => q.appointmentId ? q.appointmentId.toString() : null).filter(Boolean);

    const allSeenIds = new Set([...doneAptIds, ...doneQEIds]);
    return Math.max(allSeenIds.size, doneApts.length, doneQEs.length);
  } catch (error) {
    console.error('getSeenCountForDate error:', error);
    return 0;
  }
};

// @desc    Get live sorted queue snapshot for a doctor for a specific date
// @route   GET /api/queue/:doctorId
// @access  Public (Authenticated/Role-scoped)
const getLiveQueue = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const requestedDate = req.query.date || new Date().toISOString().split('T')[0];

    const sortedQueue = queueManager.toSortedList(doctorId);

    // Calculate estimated wait times for each patient in queue
    const queueWithEstimates = sortedQueue.map((item, index) => ({
      ...item,
      position: index + 1,
      estimatedWaitMinutes: index * AVG_CONSULTATION_MINS
    }));

    // Find currently in-progress patient if any
    const inProgressEntry = await QueueEntry.findOne({
      doctorId,
      status: 'in-progress'
    })
      .populate('patientId', 'name phone isSeniorCitizen')
      .populate('appointmentId')
      .lean();

    // Calculate patients seen for the specified date
    const seenTodayCount = await getSeenCountForDate(doctorId, requestedDate);

    // Fetch all scheduled appointments for this doctor on requestedDate
    const scheduledAppointments = await Appointment.find({
      doctor: doctorId,
      date: requestedDate
    })
      .populate('patient', 'name email phone isSeniorCitizen')
      .sort({ startTime: 1 })
      .lean();

    res.json({
      doctorId,
      date: requestedDate,
      count: queueWithEstimates.length,
      seenToday: seenTodayCount,
      inProgressPatient: inProgressEntry || null,
      queue: queueWithEstimates,
      appointments: scheduledAppointments
    });
  } catch (error) {
    console.error('getLiveQueue error:', error);
    res.status(500).json({ message: 'Error fetching live queue' });
  }
};

// @desc    Advance queue / Call next patient for consultation
// @route   PUT /api/queue/:doctorId/next or POST /api/queue/:doctorId/next
// @access  Doctor / Admin
const advanceNextPatient = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // 1. Mark existing in-progress patient as 'done'
    const currentInProgress = await QueueEntry.findOne({
      doctorId,
      status: 'in-progress'
    });

    if (currentInProgress) {
      currentInProgress.status = 'done';
      await currentInProgress.save();

      await Appointment.findByIdAndUpdate(currentInProgress.appointmentId, {
        status: 'done'
      });

      emitPatientStatusChange(currentInProgress.patientId, {
        appointmentId: currentInProgress.appointmentId,
        status: 'done'
      });
    }

    // 2. Extract next patient with lowest priorityScore (highest urgency) from MinHeap
    const nextPatientNode = queueManager.getNextPatient(doctorId);

    // Update seen count
    const seenCount = await getSeenCountForDate(doctorId);

    if (!nextPatientNode) {
      // Queue is now empty
      const updatedQueue = queueManager.toSortedList(doctorId);
      emitQueueUpdate(doctorId, updatedQueue, { seenToday: seenCount });
      return res.json({
        message: 'Queue is clear. No more waiting patients.',
        nextPatient: null,
        seenToday: seenCount,
        queue: updatedQueue
      });
    }

    // 3. Update status of next patient to 'in-progress'
    await QueueEntry.findByIdAndUpdate(nextPatientNode.queueEntryId, {
      status: 'in-progress'
    });

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      nextPatientNode.appointmentId,
      { status: 'in-progress' },
      { new: true }
    ).populate('patient', 'name email phone isSeniorCitizen');

    // 4. Emit real-time Socket updates with updated seenToday count
    const updatedQueue = queueManager.toSortedList(doctorId);
    emitQueueUpdate(doctorId, updatedQueue, { seenToday: seenCount });
    emitDoctorNextPatient(doctorId, {
      appointment: updatedAppointment,
      queueNode: nextPatientNode
    });
    emitPatientStatusChange(nextPatientNode.patientId, {
      appointmentId: nextPatientNode.appointmentId,
      status: 'in-progress'
    });

    res.json({
      message: 'Next patient called successfully',
      nextPatient: updatedAppointment,
      seenToday: seenCount,
      queue: updatedQueue
    });
  } catch (error) {
    console.error('advanceNextPatient error:', error);
    res.status(500).json({ message: 'Error advancing queue to next patient' });
  }
};

// @desc    Mark in-progress consultation as done
// @route   PUT /api/queue/:doctorId/done/:appointmentId
// @access  Doctor / Admin
const markDone = async (req, res) => {
  try {
    const { doctorId, appointmentId } = req.params;

    let targetAptId = (appointmentId && appointmentId !== '[object Object]') ? appointmentId : null;

    // Find in-progress entry for this doctor
    const currentInProgress = await QueueEntry.findOne({
      doctorId,
      status: 'in-progress'
    });

    if (currentInProgress) {
      currentInProgress.status = 'done';
      await currentInProgress.save();

      const aptIdToUpdate = currentInProgress.appointmentId || targetAptId;

      if (aptIdToUpdate) {
        await Appointment.findByIdAndUpdate(aptIdToUpdate, {
          status: 'done'
        });
        queueManager.removeFromQueue(doctorId, aptIdToUpdate);
      }

      emitPatientStatusChange(currentInProgress.patientId, {
        appointmentId: currentInProgress.appointmentId,
        status: 'done'
      });
    } else if (targetAptId) {
      await Appointment.findByIdAndUpdate(targetAptId, {
        status: 'done'
      });
      queueManager.removeFromQueue(doctorId, targetAptId);
    }

    const seenCount = await getSeenCountForDate(doctorId);
    const updatedQueue = queueManager.toSortedList(doctorId);
    emitQueueUpdate(doctorId, updatedQueue, { seenToday: seenCount });

    res.json({
      message: 'Consultation completed successfully!',
      seenToday: seenCount,
      queue: updatedQueue
    });
  } catch (error) {
    console.error('markDone error:', error);
    res.status(500).json({ message: 'Error marking consultation as done' });
  }
};

// @desc    Mark current or specified patient as No-Show
// @route   PUT /api/queue/:doctorId/no-show/:appointmentId
// @access  Doctor / Receptionist / Admin
const markNoShow = async (req, res) => {
  try {
    const { doctorId, appointmentId } = req.params;

    let targetAptId = (appointmentId && appointmentId !== '[object Object]') ? appointmentId : null;

    if (!targetAptId) {
      const inProg = await QueueEntry.findOne({ doctorId, status: 'in-progress' });
      if (inProg) targetAptId = inProg.appointmentId;
    }

    if (!targetAptId) {
      return res.status(400).json({ message: 'No appointment found to mark no-show' });
    }

    // Update appointment status
    const appointment = await Appointment.findByIdAndUpdate(
      targetAptId,
      { status: 'no-show' },
      { new: true }
    );

    // Update QueueEntry status
    await QueueEntry.findOneAndUpdate(
      { appointmentId: targetAptId },
      { status: 'no-show' }
    );

    // Remove from in-memory MinHeap
    queueManager.removeFromQueue(doctorId, targetAptId);

    const seenCount = await getSeenCountForDate(doctorId);
    const updatedQueue = queueManager.toSortedList(doctorId);
    emitQueueUpdate(doctorId, updatedQueue, { seenToday: seenCount });

    if (appointment) {
      emitPatientStatusChange(appointment.patient, {
        appointmentId: targetAptId,
        status: 'no-show'
      });
    }

    res.json({ message: 'Patient marked as no-show', seenToday: seenCount, appointment, queue: updatedQueue });
  } catch (error) {
    console.error('markNoShow error:', error);
    res.status(500).json({ message: 'Error marking patient as no-show' });
  }
};

// @desc    Toggle emergency status on a waiting patient (bumps priority score)
// @route   PUT /api/queue/:doctorId/emergency/:appointmentId
// @access  Receptionist / Admin
const toggleEmergencyBump = async (req, res) => {
  try {
    const { doctorId, appointmentId } = req.params;
    const { isEmergency } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.isEmergency = Boolean(isEmergency);
    await appointment.save();

    const queueEntry = await QueueEntry.findOne({ appointmentId });
    if (queueEntry) {
      queueEntry.isEmergency = Boolean(isEmergency);
      await queueEntry.save();
    }

    // Re-heap doctor queue with updated emergency node
    const heapNode = {
      queueEntryId: queueEntry?._id,
      appointmentId: appointment._id,
      doctorId,
      patientId: appointment.patient,
      isEmergency: Boolean(isEmergency),
      joinedAt: queueEntry ? queueEntry.joinedAt : new Date(),
      status: 'waiting'
    };

    queueManager.removeFromQueue(doctorId, appointmentId);
    queueManager.addToQueue(doctorId, heapNode);

    const updatedQueue = queueManager.toSortedList(doctorId);
    emitQueueUpdate(doctorId, updatedQueue);

    res.json({ message: 'Emergency status updated', queue: updatedQueue });
  } catch (error) {
    console.error('toggleEmergencyBump error:', error);
    res.status(500).json({ message: 'Error updating emergency status' });
  }
};

module.exports = {
  getLiveQueue,
  advanceNextPatient,
  markDone,
  markNoShow,
  toggleEmergencyBump,
  getSeenCountForDate
};
