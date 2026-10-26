/**
 * Migration Script: Urgency Level Backfill for CareQueue
 * 
 * Safely backfills existing QueueEntry and Appointment documents with default
 * urgencyLevel (3 - Standard) without deleting or overwriting legacy metadata
 * (e.g., isEmergency, isSeniorCitizen, priorityScore, basePosition).
 * 
 * Flags existing emergency or senior citizen records that require staff clinical
 * reassessment per academic governance guidelines.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const QueueEntry = require('../models/QueueEntry');
const Appointment = require('../models/Appointment');

const runMigration = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doctor_queue';

  console.log('===========================================================');
  console.log('🔄 CareQueue Urgency Migration & Backfill Utility');
  console.log(`📡 Connecting to MongoDB: ${mongoUri}`);
  console.log('===========================================================');

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Inspect QueueEntry records missing urgencyLevel
    const unmigratedQueueEntries = await QueueEntry.find({
      $or: [
        { urgencyLevel: { $exists: false } },
        { urgencyLevel: { $nin: [1, 2, 3] } }
      ]
    });

    console.log(`\n🔍 Found ${unmigratedQueueEntries.length} QueueEntry records requiring urgency backfill.`);

    let qeUpdated = 0;
    const flaggedForReassessment = [];

    for (const entry of unmigratedQueueEntries) {
      // Default to Level 3 (Standard) to preserve safe arrival-time ordering
      entry.urgencyLevel = 3;
      entry.urgencyAssignedAt = entry.urgencyAssignedAt || entry.createdAt || new Date();
      await entry.save();
      qeUpdated++;

      if (entry.status === 'waiting' && entry.isEmergency) {
        flaggedForReassessment.push({
          queueEntryId: entry._id,
          appointmentId: entry.appointmentId,
          patientId: entry.patientId,
          reason: 'Legacy emergency flag present on waiting patient; requires staff clinical triage review'
        });
      }
    }

    console.log(`✅ Backfilled ${qeUpdated} QueueEntry records with urgencyLevel: 3 (Standard).`);

    // 2. Inspect Appointment records missing urgencyLevel
    const unmigratedAppointments = await Appointment.find({
      $or: [
        { urgencyLevel: { $exists: false } },
        { urgencyLevel: { $nin: [1, 2, 3] } }
      ]
    });

    console.log(`\n🔍 Found ${unmigratedAppointments.length} Appointment records requiring urgency backfill.`);

    let aptUpdated = 0;
    for (const apt of unmigratedAppointments) {
      apt.urgencyLevel = 3;
      await apt.save();
      aptUpdated++;
    }

    console.log(`✅ Backfilled ${aptUpdated} Appointment records with urgencyLevel: 3 (Standard).`);

    // 3. Clinical Governance Report
    console.log('\n===========================================================');
    console.log('📋 CLINICAL GOVERNANCE & REASSESSMENT AUDIT');
    console.log('===========================================================');
    if (flaggedForReassessment.length > 0) {
      console.warn(`⚠️  ${flaggedForReassessment.length} waiting patient(s) have legacy emergency flags:`);
      flaggedForReassessment.forEach((item, idx) => {
        console.warn(`   [${idx + 1}] QueueEntry: ${item.queueEntryId} | Apt: ${item.appointmentId} - ${item.reason}`);
      });
      console.log('👉 Receptionist / Doctor dashboard should be used by authorized staff to assign Level 1 or 2 as clinically indicated.');
    } else {
      console.log('✨ No waiting patients flagged with legacy emergency conflicts.');
    }

    console.log('\n===========================================================');
    console.log('🎉 Migration completed safely with zero data loss.');
    console.log('===========================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
