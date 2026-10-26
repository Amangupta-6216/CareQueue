const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    urgencyLevel: {
      type: Number,
      enum: [1, 2, 3], // Level 1 (Critical), Level 2 (Urgent), Level 3 (Standard)
      default: 3,
      required: true
    },
    urgencyAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    urgencyAssignedAt: {
      type: Date,
      default: Date.now
    },
    isEmergency: {
      type: Boolean,
      default: false
    },
    isSeniorCitizen: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'done', 'no-show'],
      default: 'waiting'
    }
  },
  { timestamps: true }
);

queueEntrySchema.index({ doctorId: 1, status: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
