const MinHeap = require('./MinHeap');

class QueueManager {
  constructor() {
    // Map of doctorId (string) -> MinHeap instance
    this.queues = new Map();
  }

  /**
   * Retrieves or initializes a MinHeap for a given doctor.
   * @param {string} doctorId 
   * @returns {MinHeap}
   */
  getOrCreateQueue(doctorId) {
    const docIdStr = doctorId.toString();
    if (!this.queues.has(docIdStr)) {
      this.queues.set(docIdStr, new MinHeap());
    }
    return this.queues.get(docIdStr);
  }

  /**
   * Adds an entry to a doctor's urgency-based priority queue.
   */
  addToQueue(doctorId, queueItem) {
    const heap = this.getOrCreateQueue(doctorId);
    const targetAptId = queueItem.appointmentId ? queueItem.appointmentId.toString() : null;
    const targetEntryId = queueItem.queueEntryId ? queueItem.queueEntryId.toString() : null;

    const existingIndex = heap.heap.findIndex(node => 
      (targetAptId && node.appointmentId && node.appointmentId.toString() === targetAptId) ||
      (targetEntryId && node.queueEntryId && node.queueEntryId.toString() === targetEntryId)
    );

    if (existingIndex !== -1) {
      // Patient already in queue - if urgency changed, update it
      if (queueItem.urgencyLevel && queueItem.urgencyLevel !== heap.heap[existingIndex].urgencyLevel) {
        heap.updateUrgency(targetAptId || targetEntryId, queueItem.urgencyLevel);
      }
      return heap.heap[existingIndex];
    }

    const itemToInsert = {
      ...queueItem,
      urgencyLevel: queueItem.urgencyLevel !== undefined ? Number(queueItem.urgencyLevel) : 3,
      joinedAt: queueItem.joinedAt ? new Date(queueItem.joinedAt) : new Date()
    };

    return heap.insert(itemToInsert);
  }

  /**
   * Updates urgency level of a waiting patient in a doctor's queue.
   */
  updatePatientUrgency(doctorId, appointmentIdOrEntryId, newUrgencyLevel) {
    const docIdStr = doctorId.toString();
    if (!this.queues.has(docIdStr)) return null;
    const heap = this.queues.get(docIdStr);
    return heap.updateUrgency(appointmentIdOrEntryId, newUrgencyLevel);
  }

  /**
   * Removes an entry from a doctor's queue by appointmentId or queueEntryId.
   */
  removeFromQueue(doctorId, appointmentIdOrEntryId) {
    const docIdStr = doctorId.toString();
    if (!this.queues.has(docIdStr)) return null;
    const heap = this.queues.get(docIdStr);
    return heap.removeByAppointmentId(appointmentIdOrEntryId);
  }

  /**
   * Pops and returns the next highest priority patient for a doctor.
   */
  getNextPatient(doctorId) {
    const docIdStr = doctorId.toString();
    if (!this.queues.has(docIdStr)) return null;
    const heap = this.queues.get(docIdStr);
    return heap.extractMin();
  }

  /**
   * Peeks at the next patient without advancing the queue.
   */
  peekNextPatient(doctorId) {
    const docIdStr = doctorId.toString();
    if (!this.queues.has(docIdStr)) return null;
    const heap = this.queues.get(docIdStr);
    return heap.peek();
  }

  /**
   * Returns a sorted array representing the live queue for UI rendering.
   * Based purely on Urgency Level -> Arrival Time -> Deterministic ID.
   */
  toSortedList(doctorId) {
    const docIdStr = doctorId.toString();
    if (!this.queues.has(docIdStr)) return [];
    const heap = this.queues.get(docIdStr);
    return heap.toSortedArray();
  }

  /**
   * Finds position (1-indexed) of a patient in a doctor's queue.
   */
  getPatientPosition(doctorId, appointmentIdOrEntryId) {
    const sortedList = this.toSortedList(doctorId);
    const targetStr = appointmentIdOrEntryId.toString();
    const index = sortedList.findIndex(item => 
      (item.appointmentId && item.appointmentId.toString() === targetStr) ||
      (item.queueEntryId && item.queueEntryId.toString() === targetStr)
    );
    return index !== -1 ? index + 1 : null;
  }

  /**
   * Hydrates in-memory queues from persistent DB QueueEntry documents on server start.
   */
  async hydrateFromDB(QueueEntryModel) {
    try {
      console.log('🔄 Hydrating Doctor Urgency Queue Heaps from MongoDB...');
      this.queues.clear();
      
      require('../models/User');
      require('../models/Appointment');
      const Model = QueueEntryModel || require('../models/QueueEntry');
      
      const waitingEntries = await Model.find({ status: 'waiting' })
        .populate('patientId', 'name email isSeniorCitizen phone')
        .populate('appointmentId')
        .populate('urgencyAssignedBy', 'name role')
        .lean();

      let hydratedCount = 0;
      for (const entry of waitingEntries) {
        const item = {
          queueEntryId: entry._id,
          appointmentId: entry.appointmentId ? entry.appointmentId._id : entry.appointmentId,
          doctorId: entry.doctorId,
          patientId: entry.patientId ? entry.patientId._id : entry.patientId,
          patientName: entry.patientId ? entry.patientId.name : 'Walk-In Patient',
          patientPhone: entry.patientId ? entry.patientId.phone : '',
          urgencyLevel: entry.urgencyLevel !== undefined ? entry.urgencyLevel : 3,
          urgencyAssignedBy: entry.urgencyAssignedBy ? entry.urgencyAssignedBy.name : null,
          urgencyAssignedAt: entry.urgencyAssignedAt || entry.createdAt,
          isEmergency: Boolean(entry.isEmergency),
          isSeniorCitizen: Boolean(entry.isSeniorCitizen || (entry.patientId ? entry.patientId.isSeniorCitizen : false)),
          joinedAt: entry.joinedAt || entry.createdAt || new Date(),
          status: entry.status
        };

        this.addToQueue(entry.doctorId, item);
        hydratedCount++;
      }
      console.log(`✅ QueueManager successfully hydrated ${hydratedCount} waiting queue entries into heaps.`);
    } catch (error) {
      console.error('⚠️ Failed to hydrate queue from DB:', error.message);
    }
  }
}

// Singleton QueueManager instance across application
const queueManager = new QueueManager();
module.exports = queueManager;
